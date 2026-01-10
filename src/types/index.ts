// Slide content types
export interface SlideContent {
  id: string
  title: string
  blocks: ContentBlock[]
  layout: LayoutType
  notes?: string
}

export interface ContentBlock {
  type: 'text' | 'code' | 'mermaid' | 'image' | 'list'
  content: string
  language?: string
  style?: BlockStyle
}

export interface BlockStyle {
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  color?: string
  backgroundColor?: string
  alignment?: 'left' | 'center' | 'right'
}

export type LayoutType = 
  | 'title' 
  | 'content' 
  | 'two-column' 
  | 'comparison' 
  | 'image-focus'
  | 'code-focus'

// Theme types
export interface ThemeConfig {
  name: string
  primaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
}

// Code highlight themes
export type CodeTheme = 'vs-dark' | 'github-light' | 'monokai' | 'dracula'

// Settings types
export interface AppSettings {
  theme: ThemeConfig
  codeTheme: CodeTheme
  defaultLayout: LayoutType
  contentDensity: 'compact' | 'normal' | 'spacious'
  autoPreview: boolean
}

// MCP types
export interface MCPServerConfig {
  enabled: boolean
  port: number
  authToken?: string
}

export interface MCPClientEndpoint {
  id: string
  name: string
  url: string
  enabled: boolean
  lastConnected?: Date
}

export interface MCPToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface MCPToolResult {
  success: boolean
  data?: unknown
  error?: string
}

// Store types
export interface AppStore {
  markdown: string
  slides: SlideContent[]
  settings: AppSettings
  mcpServer: MCPServerConfig
  mcpClients: MCPClientEndpoint[]
  isProcessing: boolean
  error: string | null
  
  // Actions
  setMarkdown: (markdown: string) => void
  setSlides: (slides: SlideContent[]) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  setMCPServer: (config: Partial<MCPServerConfig>) => void
  addMCPClient: (endpoint: MCPClientEndpoint) => void
  removeMCPClient: (id: string) => void
  updateMCPClient: (id: string, updates: Partial<MCPClientEndpoint>) => void
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
}
