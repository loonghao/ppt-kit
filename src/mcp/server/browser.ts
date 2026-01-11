/**
 * Browser-based MCP Server
 * 
 * Runs MCP server directly in the browser/Office Add-in context.
 * Uses SSE (Server-Sent Events) simulation for communication.
 * 
 * This allows the MCP server to start when the plugin loads,
 * without requiring a separate Node.js process.
 */

import type { PPTOperations } from './index'
import { parseMarkdown } from '../../modules/markdown/parser'
import type { SlideContent } from '../../types'

// MCP Protocol types
interface MCPRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: Record<string, unknown>
}

interface MCPResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

interface MCPNotification {
  jsonrpc: '2.0'
  method: string
  params?: Record<string, unknown>
}

// Tool definition
interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

// Event types
export interface MCPServerEvent {
  type: 'started' | 'stopped' | 'tool_call' | 'error' | 'client_connected' | 'client_disconnected'
  timestamp: Date
  data?: unknown
}

type MCPServerEventListener = (event: MCPServerEvent) => void

/**
 * Browser MCP Server
 * 
 * Implements MCP protocol in the browser context.
 */
export class BrowserMCPServer {
  private running = false
  private operations: PPTOperations
  private tools: Map<string, ToolDefinition> = new Map()
  private toolHandlers: Map<string, (params: Record<string, unknown>) => Promise<unknown>> = new Map()
  private eventListeners: MCPServerEventListener[] = []
  private toolStats: Map<string, { calls: number; errors: number; lastCalled?: Date }> = new Map()
  
  // Connected clients (for SSE simulation)
  private clients: Map<string, { send: (data: string) => void }> = new Map()

  constructor(operations: PPTOperations) {
    this.operations = operations
    this.registerTools()
  }

  /**
   * Register all PPT tools
   */
  private registerTools(): void {
    // ppt_create_slide
    this.registerTool(
      'ppt_create_slide',
      'Create a new slide in the PowerPoint presentation',
      {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title text for the slide' },
          layout: { 
            type: 'string', 
            enum: ['title', 'content', 'two-column', 'comparison', 'image-focus', 'code-focus'],
            description: 'Slide layout type'
          }
        },
        required: ['title']
      },
      async (params) => {
        const result = await this.operations.createSlide(
          params.title as string,
          params.layout as string
        )
        return {
          slide_id: result.slideId,
          title: params.title,
          layout: params.layout || 'content',
          index: result.index,
          success: true
        }
      }
    )

    // ppt_add_content
    this.registerTool(
      'ppt_add_content',
      'Add content (text, code, or image) to an existing slide',
      {
        type: 'object',
        properties: {
          slide_id: { type: 'string', description: 'ID of the target slide' },
          content: { type: 'string', description: 'Content to add' },
          content_type: { 
            type: 'string', 
            enum: ['text', 'code', 'image'],
            description: 'Type of content'
          },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' }
            }
          }
        },
        required: ['slide_id', 'content', 'content_type']
      },
      async (params) => {
        const slideId = params.slide_id as string
        const content = params.content as string
        const contentType = params.content_type as string
        const position = params.position as { x: number; y: number; width: number; height: number } | undefined

        switch (contentType) {
          case 'text':
            await this.operations.addText(slideId, content, position)
            break
          case 'code':
            await this.operations.addCode(slideId, content, 'plaintext', position)
            break
          case 'image':
            await this.operations.addImage(slideId, content, position)
            break
        }

        return {
          slide_id: slideId,
          content_type: contentType,
          success: true,
          message: `${contentType} content added successfully`
        }
      }
    )

    // ppt_get_info
    this.registerTool(
      'ppt_get_info',
      'Get information about the current PowerPoint presentation',
      {
        type: 'object',
        properties: {}
      },
      async () => {
        const info = await this.operations.getPresentationInfo()
        return {
          slide_count: info.slideCount,
          current_slide_index: info.currentSlideIndex,
          title: info.title,
          author: info.author,
          slides: info.slides
        }
      }
    )

    // ppt_from_markdown
    this.registerTool(
      'ppt_from_markdown',
      'Generate PowerPoint slides from Markdown content',
      {
        type: 'object',
        properties: {
          markdown: { type: 'string', description: 'Markdown content to convert' }
        },
        required: ['markdown']
      },
      async (params) => {
        const result = await this.operations.generateFromMarkdown(params.markdown as string)
        return {
          slide_count: result.slideCount,
          slides: result.slides,
          success: true
        }
      }
    )

    // ppt_add_code_block
    this.registerTool(
      'ppt_add_code_block',
      'Add a syntax-highlighted code block to a slide',
      {
        type: 'object',
        properties: {
          slide_id: { type: 'string', description: 'ID of the target slide' },
          code: { type: 'string', description: 'Source code to display' },
          language: { type: 'string', description: 'Programming language' },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' }
            }
          }
        },
        required: ['slide_id', 'code', 'language']
      },
      async (params) => {
        const result = await this.operations.addCode(
          params.slide_id as string,
          params.code as string,
          params.language as string,
          params.position as { x: number; y: number; width: number; height: number } | undefined
        )
        return {
          slide_id: params.slide_id,
          language: params.language,
          line_count: result.lineCount,
          success: true
        }
      }
    )

    // ppt_add_mermaid_diagram
    this.registerTool(
      'ppt_add_mermaid_diagram',
      'Add a Mermaid diagram to a slide',
      {
        type: 'object',
        properties: {
          slide_id: { type: 'string', description: 'ID of the target slide' },
          mermaid_code: { type: 'string', description: 'Mermaid diagram syntax' },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' }
            }
          }
        },
        required: ['slide_id', 'mermaid_code']
      },
      async (params) => {
        const result = await this.operations.addMermaid(
          params.slide_id as string,
          params.mermaid_code as string,
          params.position as { x: number; y: number; width: number; height: number } | undefined
        )
        return {
          slide_id: params.slide_id,
          diagram_type: result.diagramType,
          success: true
        }
      }
    )

    // ppt_list_slides
    this.registerTool(
      'ppt_list_slides',
      'List all slides in the current presentation',
      {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum slides to return (default: 20)' },
          offset: { type: 'number', description: 'Number of slides to skip (default: 0)' }
        }
      },
      async (params) => {
        const limit = (params.limit as number) || 20
        const offset = (params.offset as number) || 0
        const result = await this.operations.listSlides(limit, offset)
        return {
          total: result.total,
          count: result.slides.length,
          offset,
          slides: result.slides,
          has_more: result.hasMore,
          ...(result.hasMore ? { next_offset: offset + result.slides.length } : {})
        }
      }
    )

    // ppt_delete_slide
    this.registerTool(
      'ppt_delete_slide',
      'Delete a slide from the presentation',
      {
        type: 'object',
        properties: {
          slide_id: { type: 'string', description: 'ID of the slide to delete' }
        },
        required: ['slide_id']
      },
      async (params) => {
        await this.operations.deleteSlide(params.slide_id as string)
        return {
          slide_id: params.slide_id,
          success: true,
          message: 'Slide deleted successfully'
        }
      }
    )
  }

  /**
   * Register a tool
   */
  private registerTool(
    name: string,
    description: string,
    inputSchema: ToolDefinition['inputSchema'],
    handler: (params: Record<string, unknown>) => Promise<unknown>
  ): void {
    this.tools.set(name, { name, description, inputSchema })
    this.toolHandlers.set(name, handler)
    this.toolStats.set(name, { calls: 0, errors: 0 })
  }

  /**
   * Start the server
   */
  start(): void {
    if (this.running) return
    this.running = true
    this.emitEvent({ type: 'started', timestamp: new Date() })
    console.log('[BrowserMCPServer] Server started')
  }

  /**
   * Stop the server
   */
  stop(): void {
    if (!this.running) return
    this.running = false
    
    // Disconnect all clients
    for (const [clientId] of this.clients) {
      this.disconnectClient(clientId)
    }
    
    this.emitEvent({ type: 'stopped', timestamp: new Date() })
    console.log('[BrowserMCPServer] Server stopped')
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.running
  }

  /**
   * Handle incoming MCP request
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.running) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32000, message: 'Server not running' }
      }
    }

    try {
      switch (request.method) {
        case 'initialize':
          return this.handleInitialize(request)
        
        case 'tools/list':
          return this.handleToolsList(request)
        
        case 'tools/call':
          return await this.handleToolCall(request)
        
        case 'ping':
          return { jsonrpc: '2.0', id: request.id, result: { pong: true } }
        
        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: `Method not found: ${request.method}` }
          }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32603, message: errorMsg }
      }
    }
  }

  /**
   * Handle initialize request
   */
  private handleInitialize(request: MCPRequest): MCPResponse {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: { listChanged: true }
        },
        serverInfo: {
          name: 'ppt-kit-mcp-server',
          version: '1.0.0'
        }
      }
    }
  }

  /**
   * Handle tools/list request
   */
  private handleToolsList(request: MCPRequest): MCPResponse {
    const tools = Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: { tools }
    }
  }

  /**
   * Handle tools/call request
   */
  private async handleToolCall(request: MCPRequest): Promise<MCPResponse> {
    const params = request.params as { name: string; arguments?: Record<string, unknown> }
    const toolName = params.name
    const toolArgs = params.arguments || {}

    const handler = this.toolHandlers.get(toolName)
    if (!handler) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32602, message: `Unknown tool: ${toolName}` }
      }
    }

    const stats = this.toolStats.get(toolName)!
    stats.calls++
    stats.lastCalled = new Date()

    try {
      const startTime = Date.now()
      const result = await handler(toolArgs)
      const duration = Date.now() - startTime

      this.emitEvent({
        type: 'tool_call',
        timestamp: new Date(),
        data: {
          toolName,
          params: toolArgs,
          result,
          success: true,
          duration
        }
      })

      // Broadcast to connected clients
      this.broadcastNotification({
        jsonrpc: '2.0',
        method: 'notifications/tools/call_result',
        params: { toolName, result, success: true }
      })

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }
    } catch (error) {
      stats.errors++
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'

      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        data: { toolName, error: errorMsg }
      })

      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32000, message: errorMsg }
      }
    }
  }

  /**
   * Connect a client (for SSE simulation)
   */
  connectClient(clientId: string, sendFn: (data: string) => void): void {
    this.clients.set(clientId, { send: sendFn })
    this.emitEvent({
      type: 'client_connected',
      timestamp: new Date(),
      data: { clientId }
    })
  }

  /**
   * Disconnect a client
   */
  disconnectClient(clientId: string): void {
    this.clients.delete(clientId)
    this.emitEvent({
      type: 'client_disconnected',
      timestamp: new Date(),
      data: { clientId }
    })
  }

  /**
   * Broadcast notification to all clients
   */
  private broadcastNotification(notification: MCPNotification): void {
    const data = JSON.stringify(notification)
    for (const [, client] of this.clients) {
      try {
        client.send(data)
      } catch (e) {
        console.error('[BrowserMCPServer] Failed to send to client:', e)
      }
    }
  }

  /**
   * Get tool statistics
   */
  getToolStats(): Array<{ name: string; calls: number; errors: number; lastCalled?: Date }> {
    return Array.from(this.toolStats.entries()).map(([name, stats]) => ({
      name,
      ...stats
    }))
  }

  /**
   * Get tool definitions
   */
  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  /**
   * Add event listener
   */
  addEventListener(listener: MCPServerEventListener): () => void {
    this.eventListeners.push(listener)
    return () => {
      const index = this.eventListeners.indexOf(listener)
      if (index >= 0) this.eventListeners.splice(index, 1)
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: MCPServerEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event)
      } catch (e) {
        console.error('[BrowserMCPServer] Event listener error:', e)
      }
    }
  }

  /**
   * Update operations implementation
   */
  setOperations(operations: PPTOperations): void {
    this.operations = operations
  }
}

/**
 * Create mock operations for standalone/development mode
 */
export function createMockOperations(): PPTOperations {
  return {
    async getPresentationInfo() {
      return {
        slideCount: 3,
        currentSlideIndex: 0,
        title: 'Demo Presentation',
        author: 'PPT-Kit',
        slides: [
          { id: 'slide-1', index: 0, title: 'Introduction', layout: 'title' },
          { id: 'slide-2', index: 1, title: 'Content', layout: 'content' },
          { id: 'slide-3', index: 2, title: 'Summary', layout: 'content' }
        ]
      }
    },
    async createSlide(title: string, layout = 'content') {
      console.log('[Mock] Creating slide:', title, layout)
      return { slideId: `slide-${Date.now()}`, index: 3 }
    },
    async deleteSlide(slideId: string) {
      console.log('[Mock] Deleting slide:', slideId)
    },
    async addText(slideId: string, content: string) {
      console.log('[Mock] Adding text to slide:', slideId, content.substring(0, 50))
    },
    async addCode(slideId: string, code: string, language: string) {
      console.log('[Mock] Adding code to slide:', slideId, language)
      return { lineCount: code.split('\n').length }
    },
    async addMermaid(slideId: string, mermaidCode: string) {
      console.log('[Mock] Adding mermaid to slide:', slideId)
      const typeMatch = mermaidCode.match(/^(flowchart|graph|sequenceDiagram|gantt|classDiagram|stateDiagram|erDiagram|journey|pie|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline)/m)
      return { diagramType: typeMatch ? typeMatch[1] : 'unknown' }
    },
    async addImage(slideId: string, imageData: string) {
      console.log('[Mock] Adding image to slide:', slideId, 'data length:', imageData.length)
    },
    async listSlides(limit: number, offset: number) {
      const allSlides = [
        { id: 'slide-1', index: 0, title: 'Introduction', layout: 'title' },
        { id: 'slide-2', index: 1, title: 'Content', layout: 'content' },
        { id: 'slide-3', index: 2, title: 'Summary', layout: 'content' }
      ]
      const slides = allSlides.slice(offset, offset + limit)
      return {
        total: allSlides.length,
        slides,
        hasMore: offset + limit < allSlides.length
      }
    },
    async generateFromMarkdown(markdown: string) {
      const slides = parseMarkdown(markdown)
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

// Singleton instance
let serverInstance: BrowserMCPServer | null = null

/**
 * Get or create the browser MCP server instance
 */
export function getBrowserMCPServer(operations?: PPTOperations): BrowserMCPServer {
  if (!serverInstance) {
    serverInstance = new BrowserMCPServer(operations || createMockOperations())
  } else if (operations) {
    serverInstance.setOperations(operations)
  }
  return serverInstance
}
