import { useState } from 'react'
import { TabList, Tab, SelectTabEvent, SelectTabData } from '@fluentui/react-components'
import { 
  DocumentBulletList24Regular, 
  Settings24Regular, 
  PlugConnected24Regular 
} from '@fluentui/react-icons'
import TaskPane from './components/TaskPane'
import SettingsPanel from './components/Settings/SettingsPanel'
import MCPPanel from './components/MCP/MCPPanel'

type TabValue = 'convert' | 'settings' | 'mcp'

function App() {
  const [selectedTab, setSelectedTab] = useState<TabValue>('convert')

  const handleTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value as TabValue)
  }

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-surface-tertiary">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-pressed flex items-center justify-center">
            <span className="text-white font-semibold text-sm">P</span>
          </div>
          <h1 className="text-heading text-text-primary">PPT-KIT</h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="px-4 pt-2 bg-white border-b border-surface-tertiary">
        <TabList 
          selectedValue={selectedTab} 
          onTabSelect={handleTabSelect}
          size="medium"
        >
          <Tab value="convert" icon={<DocumentBulletList24Regular />}>
            转换
          </Tab>
          <Tab value="settings" icon={<Settings24Regular />}>
            设置
          </Tab>
          <Tab value="mcp" icon={<PlugConnected24Regular />}>
            MCP
          </Tab>
        </TabList>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {selectedTab === 'convert' && <TaskPane />}
        {selectedTab === 'settings' && <SettingsPanel />}
        {selectedTab === 'mcp' && <MCPPanel />}
      </main>
    </div>
  )
}

export default App
