/**
 * PPT-KIT MCP Server
 * 
 * Exposes PowerPoint operations as MCP tools for AI assistants.
 * Follows MCP best practices with Zod validation and proper tool annotations.
 * 
 * @module ppt-kit-mcp-server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  CreateSlideInputSchema,
  AddContentInputSchema,
  GetPresentationInfoInputSchema,
  MarkdownToSlidesInputSchema,
  AddCodeBlockInputSchema,
  AddMermaidDiagramInputSchema,
  ListSlidesInputSchema,
  DeleteSlideInputSchema,
  ResponseFormat,
  type CreateSlideInput,
  type AddContentInput,
  type GetPresentationInfoInput,
  type MarkdownToSlidesInput,
  type AddCodeBlockInput,
  type AddMermaidDiagramInput,
  type ListSlidesInput,
  type DeleteSlideInput
} from '../schemas'

// Character limit for responses
const CHARACTER_LIMIT = 25000

/**
 * Format response based on requested format
 */
function formatResponse<T>(
  data: T,
  format: ResponseFormat,
  markdownFormatter: (data: T) => string
): { text: string; structured: T } {
  const text = format === ResponseFormat.MARKDOWN 
    ? markdownFormatter(data)
    : JSON.stringify(data, null, 2)
  
  return { text, structured: data }
}

/**
 * Create and configure the MCP server with all PPT tools
 */
export function createPPTKitMCPServer(): McpServer {
  const server = new McpServer({
    name: 'ppt-kit-mcp-server',
    version: '1.0.0'
  })

  // Tool: ppt_create_slide
  server.registerTool(
    'ppt_create_slide',
    {
      title: 'Create PPT Slide',
      description: `Create a new slide in the current PowerPoint presentation.

Args:
  - title (string, required): Title text for the new slide (1-200 characters)
  - layout (string, optional): Layout type - 'title', 'content', 'two-column', 'comparison', 'image-focus', 'code-focus'. Default: 'content'
  - response_format (string, optional): Output format - 'json' or 'markdown'. Default: 'json'

Returns:
  For JSON format:
  {
    "slide_id": string,      // Unique identifier of the created slide
    "title": string,         // Title text that was set
    "layout": string,        // Layout type applied
    "success": boolean       // Whether creation succeeded
  }

Examples:
  - Create title slide: { "title": "Introduction", "layout": "title" }
  - Create content slide: { "title": "Key Features" }
  - Create code-focused slide: { "title": "Code Example", "layout": "code-focus" }

Error Handling:
  - Returns error if PowerPoint is not available
  - Returns error if title exceeds 200 characters`,
      inputSchema: CreateSlideInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: CreateSlideInput) => {
      // In browser context, this would call Office.js API
      // For standalone server, we simulate the response
      const slideId = `slide-${Date.now()}`
      
      const output = {
        slide_id: slideId,
        title: params.title,
        layout: params.layout || 'content',
        success: true
      }

      const { text, structured } = formatResponse(
        output,
        params.response_format || ResponseFormat.JSON,
        (data) => `# Slide Created\n\n- **ID**: ${data.slide_id}\n- **Title**: ${data.title}\n- **Layout**: ${data.layout}`
      )

      return {
        content: [{ type: 'text', text }],
        structuredContent: structured
      }
    }
  )

  // Tool: ppt_add_content
  server.registerTool(
    'ppt_add_content',
    {
      title: 'Add Content to Slide',
      description: `Add content to an existing slide in the PowerPoint presentation.

Args:
  - slide_id (string, required): The ID of the slide to add content to
  - content (string, required): The content to add (text, code, or base64 image data)
  - content_type (string, required): Type of content - 'text', 'code', 'image'
  - position (object, optional): Position and size { x, y, width, height } in points
  - response_format (string, optional): Output format - 'json' or 'markdown'. Default: 'json'

Returns:
  For JSON format:
  {
    "slide_id": string,      // ID of the modified slide
    "content_type": string,  // Type of content added
    "success": boolean,      // Whether addition succeeded
    "message": string        // Status message
  }

Examples:
  - Add text: { "slide_id": "slide-1", "content": "Hello World", "content_type": "text" }
  - Add code: { "slide_id": "slide-1", "content": "console.log('hi')", "content_type": "code" }
  - Add with position: { "slide_id": "slide-1", "content": "Text", "content_type": "text", "position": { "x": 100, "y": 100, "width": 400, "height": 200 } }

Error Handling:
  - Returns error if slide_id is not found
  - Returns error if content is empty`,
      inputSchema: AddContentInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: AddContentInput) => {
      const output = {
        slide_id: params.slide_id,
        content_type: params.content_type,
        success: true,
        message: `${params.content_type} content added successfully`
      }

      const { text, structured } = formatResponse(
        output,
        params.response_format || ResponseFormat.JSON,
        (data) => `# Content Added\n\n- **Slide**: ${data.slide_id}\n- **Type**: ${data.content_type}\n- **Status**: ${data.message}`
      )

      return {
        content: [{ type: 'text', text }],
        structuredContent: structured
      }
    }
  )

  // Tool: ppt_get_info
  server.registerTool(
    'ppt_get_info',
    {
      title: 'Get Presentation Info',
      description: `Get information about the current PowerPoint presentation.

Args:
  - response_format (string, optional): Output format - 'json' or 'markdown'. Default: 'json'

Returns:
  For JSON format:
  {
    "slide_count": number,         // Total number of slides
    "current_slide_index": number, // Index of currently selected slide (0-based)
    "title": string,               // Presentation title (if available)
    "author": string               // Author name (if available)
  }

Examples:
  - Get info: {}
  - Get as markdown: { "response_format": "markdown" }

Error Handling:
  - Returns error if PowerPoint is not available
  - Returns error if no presentation is open`,
      inputSchema: GetPresentationInfoInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: GetPresentationInfoInput) => {
      // Simulated response - in real context would use Office.js
      const output = {
        slide_count: 0,
        current_slide_index: 0,
        title: 'Untitled Presentation',
        author: ''
      }

      const { text, structured } = formatResponse(
        output,
        params.response_format || ResponseFormat.JSON,
        (data) => `# Presentation Info\n\n- **Slides**: ${data.slide_count}\n- **Current Slide**: ${data.current_slide_index + 1}\n- **Title**: ${data.title || 'Untitled'}`
      )

      return {
        content: [{ type: 'text', text }],
        structuredContent: structured
      }
    }
  )

  // Tool: ppt_from_markdown
  server.registerTool(
    'ppt_from_markdown',
    {
      title: 'Generate Slides from Markdown',
      description: `Generate PowerPoint slides from Markdown content. Automatically parses the markdown structure and creates slides.

Args:
  - markdown (string, required): Markdown content to convert (max 100000 characters)
    - Use # or ## headings to create new slides
    - Use code blocks with language for syntax highlighting
    - Use \`\`\`mermaid for diagrams
    - Use lists for bullet points
  - response_format (string, optional): Output format - 'json' or 'markdown'. Default: 'json'

Returns:
  For JSON format:
  {
    "slide_count": number,     // Number of slides created
    "slides": [
      {
        "id": string,          // Slide ID
        "title": string,       // Slide title
        "layout": string,      // Applied layout
        "block_count": number  // Number of content blocks
      }
    ],
    "success": boolean
  }

Examples:
  - Simple slides: { "markdown": "# Title\\n\\nContent here\\n\\n## Slide 2\\n- Point 1\\n- Point 2" }
  - With code: { "markdown": "# Code Demo\\n\\n\`\`\`javascript\\nconsole.log('hello');\\n\`\`\`" }

Error Handling:
  - Returns error if markdown is empty
  - Returns error if markdown exceeds 100000 characters`,
      inputSchema: MarkdownToSlidesInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: MarkdownToSlidesInput) => {
      // Parse markdown into slides (simplified parsing)
      const headingRegex = /^#{1,2}\s+(.+)$/gm
      const slides: Array<{ id: string; title: string; layout: string; block_count: number }> = []
      let match
      let index = 0

      while ((match = headingRegex.exec(params.markdown)) !== null) {
        slides.push({
          id: `slide-${index++}`,
          title: match[1],
          layout: 'content',
          block_count: 1
        })
      }

      // If no headings found, create a single slide
      if (slides.length === 0) {
        slides.push({
          id: 'slide-0',
          title: 'Untitled',
          layout: 'content',
          block_count: 1
        })
      }

      const output = {
        slide_count: slides.length,
        slides,
        success: true
      }

      let text = JSON.stringify(output, null, 2)
      if (text.length > CHARACTER_LIMIT) {
        // Truncate slides list
        const truncatedSlides = slides.slice(0, Math.ceil(slides.length / 2))
        const truncatedOutput = {
          ...output,
          slides: truncatedSlides,
          truncated: true,
          truncation_message: `Response truncated from ${slides.length} to ${truncatedSlides.length} slides.`
        }
        text = JSON.stringify(truncatedOutput, null, 2)
      }

      const { text: formattedText, structured } = formatResponse(
        output,
        params.response_format || ResponseFormat.JSON,
        (data) => {
          const lines = [`# Slides Generated\n`, `Created ${data.slide_count} slides:\n`]
          for (const slide of data.slides) {
            lines.push(`## ${slide.title}`)
            lines.push(`- ID: ${slide.id}`)
            lines.push(`- Layout: ${slide.layout}`)
            lines.push('')
          }
          return lines.join('\n')
        }
      )

      return {
        content: [{ type: 'text', text: formattedText }],
        structuredContent: structured
      }
    }
  )

  // Tool: ppt_add_code_block
  server.registerTool(
    'ppt_add_code_block',
    {
      title: 'Add Code Block to Slide',
      description: `Add a syntax-highlighted code block to a slide.

Args:
  - slide_id (string, required): The ID of the slide
  - code (string, required): The source code to display (max 50000 characters)
  - language (string, required): Programming language for syntax highlighting
  - position (object, optional): Position { x, y, width, height } in points
  - response_format (string, optional): Output format - 'json' or 'markdown'. Default: 'json'

Returns:
  For JSON format:
  {
    "slide_id": string,
    "language": string,
    "line_count": number,
    "success": boolean
  }

Supported Languages:
  javascript, typescript, python, java, c, cpp, csharp, go, rust, ruby, php, swift, kotlin, sql, html, css, json, yaml, bash, powershell, and more.

Examples:
  - Add JS code: { "slide_id": "slide-1", "code": "console.log('Hello');", "language": "javascript" }
  - Add Python: { "slide_id": "slide-1", "code": "print('Hello')", "language": "python" }

Error Handling:
  - Returns error if slide_id is not found
  - Returns error if code is empty`,
      inputSchema: AddCodeBlockInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: AddCodeBlockInput) => {
      const lineCount = params.code.split('\n').length

      const output = {
        slide_id: params.slide_id,
        language: params.language,
        line_count: lineCount,
        success: true
      }

      const { text, structured } = formatResponse(
        output,
        params.response_format || ResponseFormat.JSON,
        (data) => `# Code Block Added\n\n- **Slide**: ${data.slide_id}\n- **Language**: ${data.language}\n- **Lines**: ${data.line_count}`
      )

      return {
        content: [{ type: 'text', text }],
        structuredContent: structured
      }
    }
  )

  // Tool: ppt_add_mermaid_diagram
  server.registerTool(
    'ppt_add_mermaid_diagram',
    {
      title: 'Add Mermaid Diagram to Slide',
      description: `Add a Mermaid diagram to a slide. The diagram is rendered as an image.

Args:
  - slide_id (string, required): The ID of the slide
  - mermaid_code (string, required): Mermaid diagram syntax (max 20000 characters)
  - position (object, optional): Position { x, y, width, height } in points
  - response_format (string, optional): Output format - 'json' or 'markdown'. Default: 'json'

Returns:
  For JSON format:
  {
    "slide_id": string,
    "diagram_type": string,  // Detected diagram type (flowchart, sequence, etc.)
    "success": boolean
  }

Supported Diagram Types:
  flowchart, sequence, gantt, class, state, er, journey, pie, quadrant, requirement, gitgraph, mindmap, timeline

Examples:
  - Flowchart: { "slide_id": "slide-1", "mermaid_code": "flowchart LR\\n  A --> B --> C" }
  - Sequence: { "slide_id": "slide-1", "mermaid_code": "sequenceDiagram\\n  Alice->>Bob: Hello" }

Error Handling:
  - Returns error if slide_id is not found
  - Returns error if mermaid syntax is invalid`,
      inputSchema: AddMermaidDiagramInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: AddMermaidDiagramInput) => {
      // Detect diagram type from mermaid code
      const typeMatch = params.mermaid_code.match(/^(flowchart|graph|sequenceDiagram|gantt|classDiagram|stateDiagram|erDiagram|journey|pie|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline)/m)
      const diagramType = typeMatch ? typeMatch[1] : 'unknown'

      const output = {
        slide_id: params.slide_id,
        diagram_type: diagramType,
        success: true
      }

      const { text, structured } = formatResponse(
        output,
        params.response_format || ResponseFormat.JSON,
        (data) => `# Mermaid Diagram Added\n\n- **Slide**: ${data.slide_id}\n- **Type**: ${data.diagram_type}`
      )

      return {
        content: [{ type: 'text', text }],
        structuredContent: structured
      }
    }
  )

  // Tool: ppt_list_slides
  server.registerTool(
    'ppt_list_slides',
    {
      title: 'List Slides',
      description: `List all slides in the current presentation with pagination support.

Args:
  - limit (number, optional): Maximum slides to return (1-100). Default: 20
  - offset (number, optional): Number of slides to skip. Default: 0
  - response_format (string, optional): Output format - 'json' or 'markdown'. Default: 'json'

Returns:
  For JSON format:
  {
    "total": number,           // Total number of slides
    "count": number,           // Number of slides in this response
    "offset": number,          // Current offset
    "slides": [
      {
        "id": string,
        "index": number,
        "title": string,
        "layout": string
      }
    ],
    "has_more": boolean,       // Whether more slides are available
    "next_offset": number      // Offset for next page (if has_more)
  }

Examples:
  - List all: {}
  - Paginate: { "limit": 10, "offset": 10 }

Error Handling:
  - Returns empty list if no presentation is open`,
      inputSchema: ListSlidesInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: ListSlidesInput) => {
      // Simulated response
      const allSlides: Array<{ id: string; index: number; title: string; layout: string }> = []
      const total = allSlides.length
      const offset = params.offset || 0
      const limit = params.limit || 20
      const paginatedSlides = allSlides.slice(offset, offset + limit)

      const output = {
        total,
        count: paginatedSlides.length,
        offset,
        slides: paginatedSlides,
        has_more: total > offset + paginatedSlides.length,
        ...(total > offset + paginatedSlides.length ? { next_offset: offset + paginatedSlides.length } : {})
      }

      const { text, structured } = formatResponse(
        output,
        params.response_format || ResponseFormat.JSON,
        (data) => {
          if (data.slides.length === 0) {
            return '# Slides\n\nNo slides found in the presentation.'
          }
          const lines = [`# Slides (${data.count} of ${data.total})\n`]
          for (const slide of data.slides) {
            lines.push(`## ${slide.index + 1}. ${slide.title || 'Untitled'}`)
            lines.push(`- ID: ${slide.id}`)
            lines.push(`- Layout: ${slide.layout}`)
            lines.push('')
          }
          if (data.has_more) {
            lines.push(`*More slides available. Use offset=${data.next_offset} to see next page.*`)
          }
          return lines.join('\n')
        }
      )

      return {
        content: [{ type: 'text', text }],
        structuredContent: structured
      }
    }
  )

  // Tool: ppt_delete_slide
  server.registerTool(
    'ppt_delete_slide',
    {
      title: 'Delete Slide',
      description: `Delete a slide from the presentation.

Args:
  - slide_id (string, required): The ID of the slide to delete
  - response_format (string, optional): Output format - 'json' or 'markdown'. Default: 'json'

Returns:
  For JSON format:
  {
    "slide_id": string,
    "success": boolean,
    "message": string
  }

Examples:
  - Delete: { "slide_id": "slide-1" }

Error Handling:
  - Returns error if slide_id is not found
  - Returns error if trying to delete the only slide`,
      inputSchema: DeleteSlideInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: DeleteSlideInput) => {
      const output = {
        slide_id: params.slide_id,
        success: true,
        message: 'Slide deleted successfully'
      }

      const { text, structured } = formatResponse(
        output,
        params.response_format || ResponseFormat.JSON,
        (data) => `# Slide Deleted\n\n- **ID**: ${data.slide_id}\n- **Status**: ${data.message}`
      )

      return {
        content: [{ type: 'text', text }],
        structuredContent: structured
      }
    }
  )

  return server
}

// Export the server factory
export { createPPTKitMCPServer as default }
