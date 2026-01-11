import { memo } from 'react'

// Tool button icons using SVG
const ImageIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
)

const TextIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </svg>
)

const TemplateIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
)

const ShapeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <circle cx="17" cy="7" r="4" />
    <path d="M7 13l-4 8h8l-4-8z" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
)

const ConvertIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const MCPIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)

// Align icons
const AlignLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="4" y1="6" x2="4" y2="18" />
    <rect x="7" y="6" width="10" height="4" rx="1" />
    <rect x="7" y="14" width="6" height="4" rx="1" />
  </svg>
)

const AlignCenterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="12" y1="4" x2="12" y2="20" />
    <rect x="5" y="6" width="14" height="4" rx="1" />
    <rect x="7" y="14" width="10" height="4" rx="1" />
  </svg>
)

const AlignRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="20" y1="6" x2="20" y2="18" />
    <rect x="7" y="6" width="10" height="4" rx="1" />
    <rect x="11" y="14" width="6" height="4" rx="1" />
  </svg>
)

const DistributeHIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="8" width="4" height="8" rx="1" />
    <rect x="10" y="8" width="4" height="8" rx="1" />
    <rect x="16" y="8" width="4" height="8" rx="1" />
  </svg>
)

const DistributeVIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="8" y="4" width="8" height="4" rx="1" />
    <rect x="8" y="10" width="8" height="4" rx="1" />
    <rect x="8" y="16" width="8" height="4" rx="1" />
  </svg>
)

export type TabValue = 'images' | 'text' | 'templates' | 'shapes' | 'convert' | 'settings' | 'mcp'

interface ToolButton {
  id: string
  icon: React.ReactNode
  label: string
  tab?: TabValue
  action?: () => void
}

interface ToolGroup {
  name: string
  tools: ToolButton[]
}

interface RibbonToolbarProps {
  onTabChange: (tab: TabValue) => void
  onAction?: (action: string, params?: unknown) => void
}

function RibbonToolbar({ onTabChange, onAction }: RibbonToolbarProps) {
  const toolGroups: ToolGroup[] = [
    {
      name: '布局',
      tools: [
        { id: 'images', icon: <ImageIcon />, label: '图片', tab: 'images' },
        { id: 'text', icon: <TextIcon />, label: '文字', tab: 'text' },
        { id: 'templates', icon: <TemplateIcon />, label: '模板', tab: 'templates' },
        { id: 'shapes', icon: <ShapeIcon />, label: '形状', tab: 'shapes' },
      ],
    },
    {
      name: '对齐',
      tools: [
        { id: 'align-left', icon: <AlignLeftIcon />, label: '左对齐', action: () => onAction?.('align', { type: 'left' }) },
        { id: 'align-center', icon: <AlignCenterIcon />, label: '居中', action: () => onAction?.('align', { type: 'center' }) },
        { id: 'align-right', icon: <AlignRightIcon />, label: '右对齐', action: () => onAction?.('align', { type: 'right' }) },
        { id: 'distribute-h', icon: <DistributeHIcon />, label: '水平分布', action: () => onAction?.('distribute', { type: 'horizontal' }) },
        { id: 'distribute-v', icon: <DistributeVIcon />, label: '垂直分布', action: () => onAction?.('distribute', { type: 'vertical' }) },
      ],
    },
    {
      name: '工具',
      tools: [
        { id: 'convert', icon: <ConvertIcon />, label: '转换', tab: 'convert' },
        { id: 'settings', icon: <SettingsIcon />, label: '设置', tab: 'settings' },
        { id: 'mcp', icon: <MCPIcon />, label: 'MCP', tab: 'mcp' },
      ],
    },
  ]

  const handleToolClick = (tool: ToolButton) => {
    if (tool.tab) {
      onTabChange(tool.tab)
    } else if (tool.action) {
      tool.action()
    }
  }

  return (
    <div className="ribbon-toolbar">
      {toolGroups.map((group) => (
        <div key={group.name} className="ribbon-group">
          <div className="ribbon-group-tools">
            {group.tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="ribbon-tool-btn"
                title={tool.label}
              >
                <span className="ribbon-tool-icon">{tool.icon}</span>
                <span className="ribbon-tool-label">{tool.label}</span>
              </button>
            ))}
          </div>
          <div className="ribbon-group-name">{group.name}</div>
        </div>
      ))}
    </div>
  )
}

export default memo(RibbonToolbar)
