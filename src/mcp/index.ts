/**
 * PPT-KIT MCP Integration
 * 
 * Provides both server and client capabilities for MCP protocol.
 * 
 * Server: Exposes PPT operations for AI assistants to call
 * Client: Connects to external MCP services for enhanced capabilities
 */

export { createPPTKitMCPServer } from './server'
export { MCPClient, MCPClientManager, mcpClientManager } from './client'
export type { MCPClientConfig, MCPRequest, MCPResponse } from './client'
export * from './schemas'
