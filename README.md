# PPT-KIT

> **Note**: This is a technical proof-of-concept project. Contributions and ideas for iteration and maintenance are welcome!

A PowerPoint Office Add-in that integrates MCP (Model Context Protocol) to enable AI-assisted slide creation and manipulation.

![PPT-KIT Screenshot](ppt-kit.png)

## Overview

PPT-KIT bridges the gap between AI assistants (like Claude) and Microsoft PowerPoint through:

- **MCP Server**: Exposes PowerPoint operations as MCP tools
- **WebSocket Bridge**: Connects the MCP server to the Office Add-in running in PowerPoint
- **Office.js Integration**: Executes actual PowerPoint operations via Office.js API

### Architecture

```
AI Client (Claude) <--MCP--> Bridge Server <--WebSocket--> Office Add-in (Office.js API)
```

## Features

- Create and delete slides
- Add text, code blocks, and images to slides
- Generate slides from Markdown
- Add Mermaid diagrams
- Real-time synchronization with PowerPoint

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Fluent UI React
- **Styling**: Tailwind CSS
- **MCP**: @modelcontextprotocol/sdk
- **Office Integration**: Office.js

## Getting Started

### Prerequisites

- Node.js 18+
- Microsoft PowerPoint (desktop version)
- Office Add-in development environment

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start MCP server
npm run mcp:server
```

### Configuration

The MCP Bridge Server runs on port 3100 by default. Configure Claude Desktop with:

```json
{
  "mcpServers": {
    "ppt-kit": {
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `ppt_create_slide` | Create a new slide |
| `ppt_add_content` | Add content to a slide |
| `ppt_get_info` | Get presentation info |
| `ppt_from_markdown` | Generate slides from markdown |
| `ppt_add_code_block` | Add code block to slide |
| `ppt_add_mermaid_diagram` | Add mermaid diagram |
| `ppt_list_slides` | List all slides |
| `ppt_delete_slide` | Delete a slide |

## Project Structure

```
src/
├── components/          # React components
│   ├── Editor/         # Markdown editor
│   ├── Layout/         # Layout panels (images, shapes, templates, text)
│   ├── MCP/            # MCP panel
│   ├── Preview/        # Slide preview
│   ├── QuickToolbar/   # Quick access toolbar
│   ├── Settings/       # Settings panel
│   └── TaskPane/       # Main task pane
├── mcp/                # MCP integration
│   ├── client/         # MCP client
│   ├── server/         # MCP server & bridge
│   └── schemas/        # Zod schemas
├── modules/            # Core modules
│   ├── highlighter/    # Code highlighting
│   ├── layout/         # Layout engine
│   ├── markdown/       # Markdown parser
│   ├── mermaid/        # Mermaid renderer
│   └── ppt-bridge/     # PowerPoint bridge operations
├── store/              # Zustand store
└── types/              # TypeScript types
```

## Contributing

This project is a technical experiment. If you have ideas or want to help maintain it, feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
