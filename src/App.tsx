import { useState, useCallback } from 'react'
import ImageLayoutPanel from './components/Layout/ImageLayoutPanel'
import TextToolsPanel from './components/Layout/TextToolsPanel'
import TemplatesPanel from './components/Layout/TemplatesPanel'
import ShapesPanel from './components/Layout/ShapesPanel'
import TaskPane from './components/TaskPane'
import SettingsPanel from './components/Settings/SettingsPanel'
import MCPPanel from './components/MCP/MCPPanel'
import RibbonToolbar, { TabValue } from './components/RibbonToolbar/RibbonToolbar'

function App() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('images')

  const handleTabChange = useCallback((tab: TabValue) => {
    setSelectedTab(tab)
  }, [])

  const handleAction = useCallback((action: string, params?: unknown) => {
    console.log('Action:', action, params)
    // TODO: Implement alignment and distribution actions
  }, [])

  return (
    <div className="flex flex-col h-screen bg-theme">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <span>P</span>
          </div>
          <h1 className="app-title">
            PPT<span className="app-title-accent">-KIT</span>
          </h1>
        </div>
      </header>

      {/* Ribbon Toolbar */}
      <RibbonToolbar onTabChange={handleTabChange} onAction={handleAction} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-theme-secondary">
        {selectedTab === 'images' && <ImageLayoutPanel />}
        {selectedTab === 'text' && <TextToolsPanel />}
        {selectedTab === 'templates' && <TemplatesPanel />}
        {selectedTab === 'shapes' && <ShapesPanel />}
        {selectedTab === 'convert' && <TaskPane />}
        {selectedTab === 'settings' && <SettingsPanel />}
        {selectedTab === 'mcp' && <MCPPanel />}
      </main>
    </div>
  )
}

export default App
