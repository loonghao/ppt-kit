#!/usr/bin/env node
/**
 * PPT-KIT MCP Server - Standalone Entry Point
 * 
 * Runs the MCP server as a standalone process.
 * Supports both stdio and HTTP transports.
 * 
 * Usage:
 *   stdio mode (default): npx tsx src/mcp/server/standalone.ts
 *   HTTP mode: TRANSPORT=http PORT=3100 npx tsx src/mcp/server/standalone.ts
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express from 'express'
import { createPPTKitMCPServer } from './index.js'

const TRANSPORT = process.env.TRANSPORT || 'stdio'
const PORT = parseInt(process.env.PORT || '3100', 10)

/**
 * Run server with stdio transport (for local integrations)
 */
async function runStdio(): Promise<void> {
  const server = createPPTKitMCPServer()
  const transport = new StdioServerTransport()
  
  await server.connect(transport)
  console.error('PPT-KIT MCP Server running via stdio')
}

/**
 * Run server with HTTP transport (for remote access)
 */
async function runHTTP(): Promise<void> {
  const app = express()
  app.use(express.json())

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'ppt-kit-mcp-server', version: '1.0.0' })
  })

  // MCP endpoint
  app.post('/mcp', async (req, res) => {
    const server = createPPTKitMCPServer()
    
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    })

    res.on('close', () => transport.close())

    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  })

  app.listen(PORT, () => {
    console.error(`PPT-KIT MCP Server running on http://localhost:${PORT}/mcp`)
    console.error(`Health check: http://localhost:${PORT}/health`)
  })
}

// Main entry point
async function main(): Promise<void> {
  console.error('Starting PPT-KIT MCP Server...')
  console.error(`Transport: ${TRANSPORT}`)

  if (TRANSPORT === 'http') {
    await runHTTP()
  } else {
    await runStdio()
  }
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
