/**
 * MCP Bridge Client
 * 
 * Connects the browser/Office Add-in to the MCP Bridge Server via WebSocket.
 * Receives tool call requests from the server and executes them using Office.js.
 * 
 * Usage:
 *   1. Start the bridge server: npx tsx src/mcp/server/bridge-server.ts
 *   2. Open the Office Add-in
 *   3. The add-in automatically connects to the bridge server
 *   4. AI clients can now control PowerPoint through the bridge
 */

import * as pptOps from '../modules/ppt-bridge/operations'
import { parseMarkdown } from '../modules/markdown/parser'
import type { SlideContent } from '../types'

// Connection state
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

// Event types
export interface BridgeClientEvent {
  type: 'state_change' | 'request' | 'error' | 'connected' | 'disconnected'
  data?: unknown
}

type BridgeClientEventListener = (event: BridgeClientEvent) => void

/**
 * MCP Bridge Client
 */
export class MCPBridgeClient {
  private ws: WebSocket | null = null
  private serverUrl: string
  private state: ConnectionState = 'disconnected'
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 2000
  private listeners: BridgeClientEventListener[] = []
  private officeAvailable = false

  constructor(serverUrl = 'ws://localhost:3100/ws') {
    this.serverUrl = serverUrl
    this.officeAvailable = pptOps.isOfficeAvailable()
  }

  /**
   * Connect to the bridge server
   */
  connect(): void {
    if (this.state === 'connecting' || this.state === 'connected') {
      return
    }

    this.setState('connecting')
    console.log('[BridgeClient] Connecting to', this.serverUrl)

    try {
      this.ws = new WebSocket(this.serverUrl)

      this.ws.onopen = () => {
        console.log('[BridgeClient] Connected to bridge server')
        this.setState('connected')
        this.reconnectAttempts = 0
        this.emitEvent({ type: 'connected' })
      }

      this.ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data)
          await this.handleMessage(message)
        } catch (e) {
          console.error('[BridgeClient] Failed to handle message:', e)
        }
      }

      this.ws.onclose = (event) => {
        console.log('[BridgeClient] Disconnected:', event.code, event.reason)
        this.ws = null
        this.setState('disconnected')
        this.emitEvent({ type: 'disconnected' })
        this.scheduleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('[BridgeClient] WebSocket error:', error)
        this.setState('error')
        this.emitEvent({ type: 'error', data: error })
      }
    } catch (e) {
      console.error('[BridgeClient] Failed to create WebSocket:', e)
      this.setState('error')
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from the bridge server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.setState('disconnected')
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Add event listener
   */
  addEventListener(listener: BridgeClientEventListener): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index >= 0) this.listeners.splice(index, 1)
    }
  }

  /**
   * Update server URL
   */
  setServerUrl(url: string): void {
    this.serverUrl = url
    if (this.isConnected()) {
      this.disconnect()
      this.connect()
    }
  }

  /**
   * Handle incoming message from server
   */
  private async handleMessage(message: { type: string; id?: string; method?: string; params?: unknown }): Promise<void> {
    if (message.type === 'connected') {
      console.log('[BridgeClient] Server acknowledged connection')
      return
    }

    if (message.type === 'request' && message.id && message.method) {
      this.emitEvent({ type: 'request', data: { method: message.method, params: message.params } })
      
      try {
        const result = await this.executeMethod(message.method, message.params as Record<string, unknown>)
        this.sendResponse(message.id, result)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.sendError(message.id, errorMsg)
      }
    }
  }

  /**
   * Find slide index by ID
   */
  private async findSlideIndexById(slideId: string): Promise<number> {
    const result = await pptOps.listSlides(100, 0)
    if (!result.success || !result.data) {
      throw new Error('Failed to list slides')
    }
    const slide = result.data.slides.find(s => s.id === slideId)
    if (!slide) {
      throw new Error(`Slide not found: ${slideId}`)
    }
    return slide.index
  }

  /**
   * Execute a method using Office.js
   */
  private async executeMethod(method: string, params: Record<string, unknown>): Promise<unknown> {
    // Check if Office.js is available
    if (!this.officeAvailable && method !== 'generateFromMarkdown') {
      throw new Error('Office.js not available. Please open this in PowerPoint.')
    }

    switch (method) {
      case 'getPresentationInfo': {
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
      }

      case 'createSlide': {
        const { title, layout } = params as { title: string; layout?: string }
        const result = await pptOps.createSlide(title, layout as pptOps.LayoutType)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to create slide')
        }
        return { slideId: result.data.slideId, index: result.data.index }
      }

      case 'deleteSlide': {
        const { slideId } = params as { slideId: string }
        // Use deleteSlideById which accepts string ID
        const result = await pptOps.deleteSlideById(slideId)
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete slide')
        }
        return { success: true }
      }

      case 'addText': {
        const { slideId, content, position } = params as { 
          slideId: string
          content: string
          position?: { x: number; y: number; width: number; height: number }
        }
        // Find slide index by ID
        const slideIndex = await this.findSlideIndexById(slideId)
        const result = await pptOps.addTextToSlide(slideIndex, content, position)
        if (!result.success) {
          throw new Error(result.error || 'Failed to add text')
        }
        return { success: true }
      }

      case 'addCode': {
        const { slideId, code, language, position } = params as {
          slideId: string
          code: string
          language: string
          position?: { x: number; y: number; width: number; height: number }
        }
        const slideIndex = await this.findSlideIndexById(slideId)
        const result = await pptOps.addCodeToSlide(slideIndex, code, language, position)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to add code')
        }
        return { lineCount: result.data.lineCount }
      }

      case 'addMermaid': {
        const { slideId, mermaidCode, position } = params as {
          slideId: string
          mermaidCode: string
          position?: { x: number; y: number; width: number; height: number }
        }
        const slideIndex = await this.findSlideIndexById(slideId)
        const result = await pptOps.addMermaidToSlide(slideIndex, mermaidCode, position)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to add mermaid diagram')
        }
        return { diagramType: result.data.diagramType }
      }

      case 'addImage': {
        const { slideId, imageData, position } = params as {
          slideId: string
          imageData: string
          position?: { x: number; y: number; width: number; height: number }
        }
        const slideIndex = await this.findSlideIndexById(slideId)
        const result = await pptOps.addImageToSlide(slideIndex, imageData, position)
        if (!result.success) {
          throw new Error(result.error || 'Failed to add image')
        }
        return { success: true }
      }

      case 'listSlides': {
        const { limit, offset } = params as { limit: number; offset: number }
        const result = await pptOps.listSlides(limit, offset)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to list slides')
        }
        return {
          total: result.data.total,
          slides: result.data.slides,
          hasMore: result.data.hasMore
        }
      }

      case 'generateFromMarkdown': {
        const { markdown } = params as { markdown: string }
        const slides: SlideContent[] = await parseMarkdown(markdown)
        
        if (this.officeAvailable) {
          const result = await pptOps.generateSlides(slides)
          if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to generate slides')
          }
          return {
            slideCount: result.data.createdCount,
            slides: slides.map((s: SlideContent, i: number) => ({
              id: result.data!.slideIds[i] || `slide-${i}`,
              title: s.title,
              layout: s.layout,
              blockCount: s.blocks.length
            }))
          }
        } else {
          // Return parsed result without creating slides
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

      default:
        throw new Error(`Unknown method: ${method}`)
    }
  }

  /**
   * Send response to server
   */
  private sendResponse(id: string, result: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'response',
        id,
        result
      }))
    }
  }

  /**
   * Send error to server
   */
  private sendError(id: string, error: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'response',
        id,
        error
      }))
    }
  }

  /**
   * Send event to server
   */
  sendEvent(event: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'event',
        event,
        data
      }))
    }
  }

  /**
   * Set connection state
   */
  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      this.state = state
      this.emitEvent({ type: 'state_change', data: state })
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: BridgeClientEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch (e) {
        console.error('[BridgeClient] Event listener error:', e)
      }
    }
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[BridgeClient] Max reconnect attempts reached')
      return
    }

    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts)
    console.log(`[BridgeClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }
}

// Singleton instance
let bridgeClientInstance: MCPBridgeClient | null = null

/**
 * Get or create the bridge client instance
 */
export function getBridgeClient(serverUrl?: string): MCPBridgeClient {
  if (!bridgeClientInstance) {
    bridgeClientInstance = new MCPBridgeClient(serverUrl)
  } else if (serverUrl) {
    bridgeClientInstance.setServerUrl(serverUrl)
  }
  return bridgeClientInstance
}

/**
 * Connect to the bridge server
 */
export function connectToBridge(serverUrl?: string): void {
  const client = getBridgeClient(serverUrl)
  client.connect()
}

/**
 * Disconnect from the bridge server
 */
export function disconnectFromBridge(): void {
  if (bridgeClientInstance) {
    bridgeClientInstance.disconnect()
  }
}

/**
 * Check if connected to bridge
 */
export function isBridgeConnected(): boolean {
  return bridgeClientInstance?.isConnected() ?? false
}

/**
 * Get bridge connection state
 */
export function getBridgeState(): ConnectionState {
  return bridgeClientInstance?.getState() ?? 'disconnected'
}

/**
 * Add bridge event listener
 */
export function addBridgeEventListener(listener: BridgeClientEventListener): () => void {
  const client = getBridgeClient()
  return client.addEventListener(listener)
}
