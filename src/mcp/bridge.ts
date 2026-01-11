/**
 * MCP Bridge
 * 
 * Connects the MCP server with the Office.js PPT operations.
 * Provides event bridging between MCP tools and the frontend.
 * 
 * This module manages the lifecycle of the browser-based MCP server
 * and bridges it with the Office.js PowerPoint API.
 */

import type { PPTOperations } from './server'
import { getBrowserMCPServer, createMockOperations, type MCPServerEvent } from './server/browser'
import * as pptOps from '../modules/ppt-bridge/operations'
import { parseMarkdown } from '../modules/markdown/parser'

// Event types
export interface MCPEvent {
  type: 'tool_call' | 'tool_result' | 'error' | 'status_change' | 'server_started' | 'server_stopped'
  timestamp: Date
  data: unknown
}

export interface ToolCallEvent {
  toolName: string
  params: unknown
  result: unknown
  success: boolean
  duration: number
}

// Event listeners
type MCPEventListener = (event: MCPEvent) => void
const eventListeners: MCPEventListener[] = []

export function addEventListener(listener: MCPEventListener): () => void {
  eventListeners.push(listener)
  return () => {
    const index = eventListeners.indexOf(listener)
    if (index >= 0) eventListeners.splice(index, 1)
  }
}

function emitEvent(event: MCPEvent): void {
  for (const listener of eventListeners) {
    try {
      listener(event)
    } catch (e) {
      console.error('[MCP Bridge] Event listener error:', e)
    }
  }
}

/**
 * Create Office.js PPT operations adapter
 */
function createOfficePPTOperations(): PPTOperations {
  return {
    async getPresentationInfo() {
      const result = await pptOps.getPresentationInfo()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get presentation info')
      }
      return {
        slideCount: result.data.slideCount,
        currentSlideIndex: result.data.currentSlideIndex,
        title: result.data.title,
        author: result.data.author,
        slides: result.data.slides
      }
    },

    async createSlide(title: string, layout = 'content') {
      const result = await pptOps.createSlide(title, layout as pptOps.LayoutType)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create slide')
      }
      return { slideId: result.data.slideId, index: result.data.index }
    },

    async deleteSlide(slideId: string) {
      const result = await pptOps.deleteSlide(slideId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete slide')
      }
    },

    async addText(slideId: string, content: string, position?) {
      const result = await pptOps.addTextToSlide(slideId, content, position)
      if (!result.success) {
        throw new Error(result.error || 'Failed to add text')
      }
    },

    async addCode(slideId: string, code: string, language: string, position?) {
      const result = await pptOps.addCodeToSlide(slideId, code, language, position)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to add code')
      }
      return { lineCount: result.data.lineCount }
    },

    async addMermaid(slideId: string, mermaidCode: string, position?) {
      const result = await pptOps.addMermaidToSlide(slideId, mermaidCode, position)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to add mermaid diagram')
      }
      return { diagramType: result.data.diagramType }
    },

    async addImage(slideId: string, imageData: string, position?) {
      const result = await pptOps.addImageToSlide(slideId, imageData, position)
      if (!result.success) {
        throw new Error(result.error || 'Failed to add image')
      }
    },

    async listSlides(limit: number, offset: number) {
      const result = await pptOps.listSlides(limit, offset)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to list slides')
      }
      return {
        total: result.data.total,
        slides: result.data.slides,
        hasMore: result.data.hasMore
      }
    },

    async generateFromMarkdown(markdown: string) {
      const slides = parseMarkdown(markdown)
      const result = await pptOps.generateSlides(slides)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate slides')
      }
      return {
        slideCount: result.data.createdCount,
        slides: slides.map((s, i) => ({
          id: result.data!.slideIds[i] || `slide-${i}`,
          title: s.title,
          layout: s.layout,
          blockCount: s.blocks.length
        }))
      }
    }
  }
}

// Bridge state
let bridgeInitialized = false
let officeAvailable = false

/**
 * Initialize the MCP bridge
 * Sets up the browser MCP server with appropriate operations
 */
export function initializeMCPBridge(): void {
  if (bridgeInitialized) return
  bridgeInitialized = true

  // Check if Office.js is available
  officeAvailable = pptOps.isOfficeAvailable()
  
  // Get the server instance with appropriate operations
  const operations = officeAvailable 
    ? createOfficePPTOperations() 
    : createMockOperations()
  
  const server = getBrowserMCPServer(operations)

  // Forward server events to bridge events
  server.addEventListener((event: MCPServerEvent) => {
    switch (event.type) {
      case 'started':
        emitEvent({ type: 'server_started', timestamp: event.timestamp, data: null })
        break
      case 'stopped':
        emitEvent({ type: 'server_stopped', timestamp: event.timestamp, data: null })
        break
      case 'tool_call':
        emitEvent({ type: 'tool_call', timestamp: event.timestamp, data: event.data })
        break
      case 'error':
        emitEvent({ type: 'error', timestamp: event.timestamp, data: event.data })
        break
    }
  })

  console.log(`[MCP Bridge] Initialized (Office.js: ${officeAvailable ? 'available' : 'not available'})`)
}

/**
 * Start the MCP server
 */
export function startMCPServer(): void {
  const server = getBrowserMCPServer()
  server.start()
}

/**
 * Stop the MCP server
 */
export function stopMCPServer(): void {
  const server = getBrowserMCPServer()
  server.stop()
}

/**
 * Check if MCP server is running
 */
export function isMCPServerRunning(): boolean {
  const server = getBrowserMCPServer()
  return server.isRunning()
}

/**
 * Handle MCP request (for external clients)
 */
export async function handleMCPRequest(request: {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: Record<string, unknown>
}): Promise<{
  jsonrpc: '2.0'
  id: string | number
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}> {
  const server = getBrowserMCPServer()
  return server.handleRequest(request)
}

/**
 * Get current tool statistics
 */
export function getMCPStats() {
  const server = getBrowserMCPServer()
  return {
    tools: server.getToolStats(),
    officeAvailable,
    running: server.isRunning()
  }
}

/**
 * Get available tools
 */
export function getMCPTools() {
  const server = getBrowserMCPServer()
  return server.getTools()
}

/**
 * Update PPT operations (e.g., when Office.js becomes available)
 */
export function updatePPTOperations(): void {
  officeAvailable = pptOps.isOfficeAvailable()
  const operations = officeAvailable 
    ? createOfficePPTOperations() 
    : createMockOperations()
  
  const server = getBrowserMCPServer()
  server.setOperations(operations)
  
  console.log(`[MCP Bridge] Operations updated (Office.js: ${officeAvailable ? 'available' : 'not available'})`)
}

/**
 * Check if Office.js is available
 */
export function isOfficeAvailable(): boolean {
  return officeAvailable
}
