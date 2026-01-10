import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  AppStore, 
  SlideContent, 
  AppSettings, 
  MCPServerConfig, 
  MCPClientEndpoint 
} from '../types'

const defaultSettings: AppSettings = {
  theme: {
    name: 'Office Blue',
    primaryColor: '#0078D4',
    backgroundColor: '#FFFFFF',
    textColor: '#323130',
    accentColor: '#106EBE',
  },
  codeTheme: 'vs-dark',
  defaultLayout: 'content',
  contentDensity: 'normal',
  autoPreview: true,
}

const defaultMCPServer: MCPServerConfig = {
  enabled: false,
  port: 3100,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      markdown: '',
      slides: [],
      settings: defaultSettings,
      mcpServer: defaultMCPServer,
      mcpClients: [],
      isProcessing: false,
      error: null,

      setMarkdown: (markdown: string) => set({ markdown }),
      
      setSlides: (slides: SlideContent[]) => set({ slides }),
      
      updateSettings: (updates: Partial<AppSettings>) => 
        set((state) => ({ 
          settings: { ...state.settings, ...updates } 
        })),
      
      setMCPServer: (config: Partial<MCPServerConfig>) =>
        set((state) => ({
          mcpServer: { ...state.mcpServer, ...config }
        })),
      
      addMCPClient: (endpoint: MCPClientEndpoint) =>
        set((state) => ({
          mcpClients: [...state.mcpClients, endpoint]
        })),
      
      removeMCPClient: (id: string) =>
        set((state) => ({
          mcpClients: state.mcpClients.filter((c) => c.id !== id)
        })),
      
      updateMCPClient: (id: string, updates: Partial<MCPClientEndpoint>) =>
        set((state) => ({
          mcpClients: state.mcpClients.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          )
        })),
      
      setProcessing: (isProcessing: boolean) => set({ isProcessing }),
      
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'ppt-kit-storage',
      partialize: (state) => ({
        settings: state.settings,
        mcpServer: state.mcpServer,
        mcpClients: state.mcpClients,
      }),
    }
  )
)
