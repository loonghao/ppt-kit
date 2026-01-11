/**
 * MCP Bridge Server
 * 
 * A unified server that:
 * 1. Exposes MCP protocol via stdio/SSE for AI clients (Claude Desktop, etc.)
 * 2. Provides WebSocket endpoint for browser/Office Add-in to connect
 * 3. Bridges MCP tool calls to the browser for actual Office.js execution
 * 
 * Architecture:
 *   AI Client (Claude) <--MCP--> Bridge Server <--WebSocket--> Office Add-in
 *                                                              (Office.js API)
 */

import { WebSocketServer, WebSocket, type RawData } from 'ws'
import type { IncomingMessage } from 'http'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { createPPTKitMCPServer, setPPTOperations, type PPTOperations } from './index.js'
import { parseMarkdown } from '../../modules/markdown/parser.js'
import type { SlideContent } from '../../types/index.js'

const PORT = parseInt(process.env.PORT || '3100', 10)
const HOST = process.env.HOST || '0.0.0.0'
const TRANSPORT = process.env.TRANSPORT || 'sse'

// Request/Response tracking
interface PendingRequest {
  resolve: (result: unknown) => void
  reject: (error: Error) => void
  timeout: NodeJS.Timeout
}

// Bridge state
let browserConnection: WebSocket | null = null
const pendingRequests = new Map<string, PendingRequest>()
let requestId = 0

/**
 * Send request to browser and wait for response
 */
function sendToBrowser<T>(method: string, params: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!browserConnection || browserConnection.readyState !== WebSocket.OPEN) {
      reject(new Error('Browser not connected. Please open the Office Add-in.'))
      return
    }

    const id = `req-${++requestId}-${Date.now()}`
    const timeout = setTimeout(() => {
      pendingRequests.delete(id)
      reject(new Error('Request timeout: Browser did not respond in time'))
    }, 30000)

    pendingRequests.set(id, {
      resolve: resolve as (result: unknown) => void,
      reject,
      timeout
    })

    browserConnection.send(JSON.stringify({
      type: 'request',
      id,
      method,
      params
    }))
  })
}

/**
 * Create browser-bridged PPT operations
 * These operations forward calls to the browser via WebSocket
 */
function createBridgedOperations(): PPTOperations {
  return {
    async getPresentationInfo() {
      return sendToBrowser('getPresentationInfo', {})
    },

    async createSlide(title: string, layout = 'content') {
      return sendToBrowser('createSlide', { title, layout })
    },

    async deleteSlide(slideId: string) {
      return sendToBrowser('deleteSlide', { slideId })
    },

    async addText(slideId: string, content: string, position?) {
      return sendToBrowser('addText', { slideId, content, position })
    },

    async addCode(slideId: string, code: string, language: string, position?) {
      return sendToBrowser('addCode', { slideId, code, language, position })
    },

    async addMermaid(slideId: string, mermaidCode: string, position?) {
      return sendToBrowser('addMermaid', { slideId, mermaidCode, position })
    },

    async addImage(slideId: string, imageData: string, position?) {
      return sendToBrowser('addImage', { slideId, imageData, position })
    },

    async listSlides(limit: number, offset: number) {
      return sendToBrowser('listSlides', { limit, offset })
    },

    async generateFromMarkdown(markdown: string) {
      return sendToBrowser('generateFromMarkdown', { markdown })
    }
  }
}

/**
 * Create mock operations for when browser is not connected
 */
async function createMockOperations(): Promise<PPTOperations> {
  return {
    async getPresentationInfo() {
      return {
        slideCount: 0,
        currentSlideIndex: 0,
        title: 'No Presentation (Browser not connected)',
        author: '',
        slides: []
      }
    },
    async createSlide(_title: string, _layout = 'content') {
      throw new Error('Browser not connected. Please open the Office Add-in.')
    },
    async deleteSlide(_slideId: string) {
      throw new Error('Browser not connected. Please open the Office Add-in.')
    },
    async addText(_slideId: string, _content: string) {
      throw new Error('Browser not connected. Please open the Office Add-in.')
    },
    async addCode(_slideId: string, _code: string, _language: string) {
      throw new Error('Browser not connected. Please open the Office Add-in.')
    },
    async addMermaid(_slideId: string, _mermaidCode: string) {
      throw new Error('Browser not connected. Please open the Office Add-in.')
    },
    async addImage(_slideId: string, _imageData: string) {
      throw new Error('Browser not connected. Please open the Office Add-in.')
    },
    async listSlides(_limit: number, _offset: number) {
      return { total: 0, slides: [], hasMore: false }
    },
    async generateFromMarkdown(markdown: string) {
      // Can still parse markdown without browser
      const slides: SlideContent[] = await parseMarkdown(markdown)
      return {
        slideCount: slides.length,
        slides: slides.map((s: SlideContent, i: number) => ({
          id: `slide-${i}`,
          title: s.title,
          layout: s.layout,
          blockCount: s.blocks.length
        }))
      }
    }
  }
}

/**
 * Start the bridge server
 */
export async function startBridgeServer(): Promise<void> {
  const app = express()
  const httpServer = createServer(app)

  // Enable CORS
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  app.use(express.json({ limit: '10mb' }))

  // WebSocket server for browser connection
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  })

  // Initialize with mock operations
  let currentOperations = await createMockOperations()
  setPPTOperations(currentOperations)

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientIp = req.socket.remoteAddress
    console.error(`[Bridge] Browser connected from ${clientIp}`)
    
    // Only allow one browser connection
    if (browserConnection) {
      browserConnection.close(1000, 'Replaced by new connection')
    }
    browserConnection = ws

    // Switch to bridged operations
    currentOperations = createBridgedOperations()
    setPPTOperations(currentOperations)

    ws.on('message', (data: RawData) => {
      try {
        const message = JSON.parse(data.toString())
        
        if (message.type === 'response') {
          const pending = pendingRequests.get(message.id)
          if (pending) {
            clearTimeout(pending.timeout)
            pendingRequests.delete(message.id)
            
            if (message.error) {
              pending.reject(new Error(message.error))
            } else {
              pending.resolve(message.result)
            }
          }
        } else if (message.type === 'event') {
          // Handle browser events (e.g., slide changed)
          console.error(`[Bridge] Browser event: ${message.event}`, message.data)
        }
      } catch (e) {
        console.error('[Bridge] Failed to parse message:', e)
      }
    })

    ws.on('close', async (code: number, reason: Buffer) => {
      console.error(`[Bridge] Browser disconnected: ${code} ${reason.toString()}`)
      if (browserConnection === ws) {
        browserConnection = null
        // Switch back to mock operations
        currentOperations = await createMockOperations()
        setPPTOperations(currentOperations)
      }
    })

    ws.on('error', (error: Error) => {
      console.error('[Bridge] WebSocket error:', error)
    })

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to MCP Bridge Server'
    }))
  })

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      server: 'ppt-kit-mcp-bridge',
      version: '1.0.0',
      browserConnected: browserConnection !== null && browserConnection.readyState === WebSocket.OPEN,
      transport: TRANSPORT
    })
  })

  // SSE endpoint for MCP clients (supports both /sse and /mcp paths)
  const sseTransports = new Map<string, SSEServerTransport>()

  const handleSSEConnection = async (_req: Request, res: Response) => {
    console.error('[Bridge] New MCP SSE connection')
    
    const server = createPPTKitMCPServer()
    const transport = new SSEServerTransport('/messages', res)
    
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    sseTransports.set(sessionId, transport)

    res.on('close', () => {
      console.error(`[Bridge] MCP SSE disconnected: ${sessionId}`)
      sseTransports.delete(sessionId)
    })

    await server.connect(transport)
  }

  // Both /sse and /mcp endpoints for MCP clients
  app.get('/sse', handleSSEConnection)
  app.get('/mcp', handleSSEConnection)

  app.post('/messages', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string
    
    if (!sessionId) {
      const server = createPPTKitMCPServer()
      const transport = new SSEServerTransport('/messages', res)
      await server.connect(transport)
      await transport.handlePostMessage(req, res)
      return
    }

    const transport = sseTransports.get(sessionId)
    if (!transport) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    await transport.handlePostMessage(req, res)
  })

  // Tools list endpoint
  app.get('/tools', (_req: Request, res: Response) => {
    res.json({
      tools: [
        { name: 'ppt_create_slide', description: 'Create a new slide' },
        { name: 'ppt_add_content', description: 'Add content to a slide' },
        { name: 'ppt_get_info', description: 'Get presentation info' },
        { name: 'ppt_from_markdown', description: 'Generate slides from markdown' },
        { name: 'ppt_add_code_block', description: 'Add code block to slide' },
        { name: 'ppt_add_mermaid_diagram', description: 'Add mermaid diagram' },
        { name: 'ppt_list_slides', description: 'List all slides' },
        { name: 'ppt_delete_slide', description: 'Delete a slide' }
      ],
      browserConnected: browserConnection !== null && browserConnection.readyState === WebSocket.OPEN
    })
  })

  // Start server
  httpServer.listen(PORT, HOST, () => {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║              PPT-KIT MCP Bridge Server                       ║
╠══════════════════════════════════════════════════════════════╣
║  Status: Running                                             ║
║  Port: ${PORT}                                                   ║
║                                                              ║
║  Endpoints:                                                  ║
║    MCP:         http://${HOST}:${PORT}/mcp                           ║
║    MCP (SSE):   http://${HOST}:${PORT}/sse                           ║
║    WebSocket:   ws://${HOST}:${PORT}/ws                              ║
║    Health:      http://${HOST}:${PORT}/health                        ║
║                                                              ║
║  Browser Status: Waiting for connection...                   ║
║                                                              ║
║  Usage:                                                      ║
║    1. Open Office Add-in (connects via WebSocket)            ║
║    2. Configure Claude Desktop with MCP URL:                 ║
║       http://localhost:${PORT}/mcp                               ║
╚══════════════════════════════════════════════════════════════╝
`)
  })
}

/**
 * Run with stdio transport (for Claude Desktop direct integration)
 */
export async function runStdio(): Promise<void> {
  const server = createPPTKitMCPServer()
  const transport = new StdioServerTransport()
  
  // Note: stdio mode doesn't support browser bridging
  // It uses mock operations
  console.error('[Bridge] Running in stdio mode (mock operations only)')
  console.error('[Bridge] For browser integration, use SSE mode with TRANSPORT=sse')
  
  await server.connect(transport)
}

// Main entry point
async function main(): Promise<void> {
  console.error('Starting PPT-KIT MCP Bridge Server...')
  console.error(`Transport: ${TRANSPORT}`)

  if (TRANSPORT === 'stdio') {
    await runStdio()
  } else {
    await startBridgeServer()
  }
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
