/**
 * PPT-KIT MCP Client
 * 
 * Connects to external MCP services to extend PPT-KIT capabilities.
 * Supports WebSocket and HTTP transports.
 */

import type { MCPClientEndpoint, MCPToolDefinition, MCPToolResult } from '../../types'

export interface MCPClientConfig {
  endpoint: MCPClientEndpoint
  timeout?: number
}

export interface MCPRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: unknown
}

export interface MCPResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

/**
 * MCP Client for connecting to external services
 */
export class MCPClient {
  private endpoint: MCPClientEndpoint
  private timeout: number
  private requestId: number = 0
  private tools: MCPToolDefinition[] = []
  private connected: boolean = false

  constructor(config: MCPClientConfig) {
    this.endpoint = config.endpoint
    this.timeout = config.timeout || 30000
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<boolean> {
    const response = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'ppt-kit',
        version: '1.0.0'
      }
    })

    if (response.error) {
      console.error('Failed to connect:', response.error)
      return false
    }

    await this.refreshTools()
    this.connected = true
    return true
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    this.connected = false
    this.tools = []
  }

  /**
   * Refresh the list of available tools
   */
  async refreshTools(): Promise<MCPToolDefinition[]> {
    const response = await this.sendRequest('tools/list', {})
    
    if (response.result) {
      const result = response.result as { tools: MCPToolDefinition[] }
      this.tools = result.tools || []
    }
    
    return this.tools
  }

  /**
   * Get available tools
   */
  getTools(): MCPToolDefinition[] {
    return this.tools
  }

  /**
   * Call a tool on the remote MCP server
   */
  async callTool(name: string, args: unknown): Promise<MCPToolResult> {
    if (!this.connected) {
      return {
        success: false,
        error: 'Not connected to MCP server'
      }
    }

    const response = await this.sendRequest('tools/call', {
      name,
      arguments: args
    })

    if (response.error) {
      return {
        success: false,
        error: response.error.message
      }
    }

    const result = response.result as {
      content: Array<{ type: string; text?: string }>
    }

    const textContent = result.content?.find(c => c.type === 'text')
    let data: unknown = undefined
    
    if (textContent?.text) {
      try {
        data = JSON.parse(textContent.text)
      } catch {
        data = textContent.text
      }
    }

    return {
      success: true,
      data
    }
  }

  /**
   * Send a JSON-RPC request to the MCP server
   */
  private async sendRequest(method: string, params?: unknown): Promise<MCPResponse> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      params
    }

    if (this.endpoint.url.startsWith('ws://') || this.endpoint.url.startsWith('wss://')) {
      return this.sendWebSocketRequest(request)
    } else {
      return this.sendHttpRequest(request)
    }
  }

  /**
   * Send request via WebSocket
   */
  private async sendWebSocketRequest(request: MCPRequest): Promise<MCPResponse> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.endpoint.url)
      const timeoutId = setTimeout(() => {
        ws.close()
        reject(new Error('Request timeout'))
      }, this.timeout)

      ws.onopen = () => {
        ws.send(JSON.stringify(request))
      }

      ws.onmessage = (event) => {
        clearTimeout(timeoutId)
        try {
          const response = JSON.parse(event.data) as MCPResponse
          ws.close()
          resolve(response)
        } catch {
          ws.close()
          reject(new Error('Invalid response format'))
        }
      }

      ws.onerror = (error) => {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  /**
   * Send request via HTTP
   */
  private async sendHttpRequest(request: MCPRequest): Promise<MCPResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    const response = await fetch(this.endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: response.status,
          message: `HTTP error: ${response.statusText}`
        }
      }
    }

    return response.json()
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected
  }

  /**
   * Get endpoint info
   */
  getEndpoint(): MCPClientEndpoint {
    return this.endpoint
  }
}

/**
 * MCP Client Manager for handling multiple connections
 */
export class MCPClientManager {
  private clients: Map<string, MCPClient> = new Map()

  /**
   * Add and connect to a new endpoint
   */
  async addEndpoint(endpoint: MCPClientEndpoint): Promise<boolean> {
    const client = new MCPClient({ endpoint })
    const connected = await client.connect()
    
    if (connected) {
      this.clients.set(endpoint.id, client)
    }
    
    return connected
  }

  /**
   * Remove an endpoint
   */
  async removeEndpoint(id: string): Promise<void> {
    const client = this.clients.get(id)
    if (client) {
      await client.disconnect()
      this.clients.delete(id)
    }
  }

  /**
   * Get a client by endpoint ID
   */
  getClient(id: string): MCPClient | undefined {
    return this.clients.get(id)
  }

  /**
   * Get all connected clients
   */
  getAllClients(): MCPClient[] {
    return Array.from(this.clients.values())
  }

  /**
   * Get all available tools from all connected clients
   */
  getAllTools(): Array<{ endpoint: string; tool: MCPToolDefinition }> {
    const tools: Array<{ endpoint: string; tool: MCPToolDefinition }> = []
    
    for (const [id, client] of this.clients) {
      for (const tool of client.getTools()) {
        tools.push({ endpoint: id, tool })
      }
    }
    
    return tools
  }

  /**
   * Call a tool on a specific endpoint
   */
  async callTool(endpointId: string, toolName: string, args: unknown): Promise<MCPToolResult> {
    const client = this.clients.get(endpointId)
    
    if (!client) {
      return {
        success: false,
        error: `Endpoint ${endpointId} not found`
      }
    }
    
    return client.callTool(toolName, args)
  }

  /**
   * Disconnect all clients
   */
  async disconnectAll(): Promise<void> {
    for (const client of this.clients.values()) {
      await client.disconnect()
    }
    this.clients.clear()
  }
}

// Export singleton manager
export const mcpClientManager = new MCPClientManager()
