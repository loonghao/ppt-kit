import { useState, useCallback } from 'react'
import {
  isOfficeAvailable,
  getSelectedSlideIndex,
  addTextToSlide,
  addListToSlide,
  SLIDE_WIDTH
} from '../../modules/ppt-bridge'

// Text formatting icons
const BoldIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
)

const ItalicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
)

const UnderlineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
)

const StrikeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2" />
    <path d="M4 12h16" />
    <path d="M6.7 19.1c2.3.6 4.4 1 6.2.9 2.7 0 5.3-.7 5.3-3.6 0-1.5-1.8-3.3-3.6-3.9h-.2" />
  </svg>
)

const HighlightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l-6 6v3h9l3-3" />
    <path d="M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
  </svg>
)

const TextColorIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 20h16" strokeWidth="4" stroke="#E85A3C" />
    <path d="M9.5 4h5l4.5 12h-2l-1-3h-8l-1 3H5L9.5 4z" />
    <path d="M10 11h4" />
  </svg>
)

// Text layout icons
const TextLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="3" y="4" width="18" height="2" />
    <rect x="3" y="9" width="12" height="2" />
    <rect x="3" y="14" width="16" height="2" />
    <rect x="3" y="19" width="10" height="2" />
  </svg>
)

const TextCenterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="3" y="4" width="18" height="2" />
    <rect x="6" y="9" width="12" height="2" />
    <rect x="4" y="14" width="16" height="2" />
    <rect x="7" y="19" width="10" height="2" />
  </svg>
)

const TextRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="3" y="4" width="18" height="2" />
    <rect x="9" y="9" width="12" height="2" />
    <rect x="5" y="14" width="16" height="2" />
    <rect x="11" y="19" width="10" height="2" />
  </svg>
)

const TextJustifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="3" y="4" width="18" height="2" />
    <rect x="3" y="9" width="18" height="2" />
    <rect x="3" y="14" width="18" height="2" />
    <rect x="3" y="19" width="18" height="2" />
  </svg>
)

// List icons
const ListBulletIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <circle cx="4" cy="6" r="2" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="4" cy="18" r="2" />
    <rect x="9" y="5" width="12" height="2" />
    <rect x="9" y="11" width="12" height="2" />
    <rect x="9" y="17" width="12" height="2" />
  </svg>
)

const ListNumberIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <text x="2" y="8" fontSize="8" fontWeight="bold">1</text>
    <text x="2" y="14" fontSize="8" fontWeight="bold">2</text>
    <text x="2" y="20" fontSize="8" fontWeight="bold">3</text>
    <rect x="9" y="5" width="12" height="2" />
    <rect x="9" y="11" width="12" height="2" />
    <rect x="9" y="17" width="12" height="2" />
  </svg>
)

const IndentIncIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 8L7 12L3 16" />
    <path d="M11 6H21" />
    <path d="M11 12H21" />
    <path d="M11 18H21" />
  </svg>
)

const IndentDecIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 8L3 12L7 16" />
    <path d="M11 6H21" />
    <path d="M11 12H21" />
    <path d="M11 18H21" />
  </svg>
)

interface TextTool {
  id: string
  name: string
  icon: React.ReactNode
  group: 'format' | 'align' | 'list' | 'spacing'
}

const textTools: TextTool[] = [
  { id: 'bold', name: '加粗', icon: <BoldIcon />, group: 'format' },
  { id: 'italic', name: '斜体', icon: <ItalicIcon />, group: 'format' },
  { id: 'underline', name: '下划线', icon: <UnderlineIcon />, group: 'format' },
  { id: 'strike', name: '删除线', icon: <StrikeIcon />, group: 'format' },
  { id: 'highlight', name: '高亮', icon: <HighlightIcon />, group: 'format' },
  { id: 'text-color', name: '文字颜色', icon: <TextColorIcon />, group: 'format' },
  { id: 'align-left', name: '左对齐', icon: <TextLeftIcon />, group: 'align' },
  { id: 'align-center', name: '居中', icon: <TextCenterIcon />, group: 'align' },
  { id: 'align-right', name: '右对齐', icon: <TextRightIcon />, group: 'align' },
  { id: 'align-justify', name: '两端对齐', icon: <TextJustifyIcon />, group: 'align' },
  { id: 'list-bullet', name: '项目符号', icon: <ListBulletIcon />, group: 'list' },
  { id: 'list-number', name: '编号列表', icon: <ListNumberIcon />, group: 'list' },
  { id: 'indent-inc', name: '增加缩进', icon: <IndentIncIcon />, group: 'spacing' },
  { id: 'indent-dec', name: '减少缩进', icon: <IndentDecIcon />, group: 'spacing' },
]

// Font presets
const fontPresets = [
  { id: 'title', name: '标题', size: '32px', weight: 'bold', family: 'Microsoft YaHei' },
  { id: 'subtitle', name: '副标题', size: '24px', weight: '600', family: 'Microsoft YaHei' },
  { id: 'heading', name: '大标题', size: '20px', weight: '600', family: 'Microsoft YaHei' },
  { id: 'body', name: '正文', size: '14px', weight: 'normal', family: 'Microsoft YaHei' },
  { id: 'caption', name: '注释', size: '12px', weight: 'normal', family: 'Microsoft YaHei' },
]

// Text effects
const textEffects = [
  { id: 'shadow', name: '文字阴影', description: '添加立体感' },
  { id: 'outline', name: '文字描边', description: '突出显示' },
  { id: 'gradient', name: '渐变填充', description: '彩色效果' },
  { id: 'glow', name: '发光效果', description: '柔和光晕' },
  { id: '3d', name: '3D效果', description: '立体文字' },
  { id: 'reflection', name: '倒影效果', description: '镜像反射' },
]

export default function TextToolsPanel() {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [lineHeight, setLineHeight] = useState(1.5)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const showStatus = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 3000)
  }, [])

  const handleToolClick = useCallback((id: string) => {
    setActiveTool(activeTool === id ? null : id)
    
    if (!isOfficeAvailable()) {
      showStatus('error', 'PowerPoint 未连接')
      return
    }
    
    // Text formatting tools require selected text
    showStatus('info', `请先在 PPT 中选中文本，然后应用 "${id}" 格式`)
  }, [activeTool, showStatus])

  const handlePresetClick = useCallback(async (preset: typeof fontPresets[0]) => {
    setSelectedPreset(preset.id)
    
    if (!isOfficeAvailable()) {
      showStatus('error', 'PowerPoint 未连接')
      return
    }

    setIsLoading(true)
    try {
      const slideResult = await getSelectedSlideIndex()
      const slideIndex = slideResult.success ? slideResult.data! : 0

      // Add text with preset style
      const sampleText = preset.id === 'title' ? '标题文本' :
                         preset.id === 'subtitle' ? '副标题文本' :
                         preset.id === 'heading' ? '大标题文本' :
                         preset.id === 'body' ? '正文内容示例文本' :
                         '注释文本'

      const result = await addTextToSlide(slideIndex, sampleText, {
        x: 40,
        y: preset.id === 'title' ? 200 : preset.id === 'subtitle' ? 280 : 140,
        width: SLIDE_WIDTH - 80,
        height: parseInt(preset.size) * 2
      })

      if (result.success) {
        showStatus('success', `${preset.name}样式文本已添加`)
      } else {
        showStatus('error', result.error || '添加失败')
      }
    } catch (err) {
      showStatus('error', `操作失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [showStatus])

  const handleAddList = useCallback(async () => {
    if (!isOfficeAvailable()) {
      showStatus('error', 'PowerPoint 未连接')
      return
    }

    setIsLoading(true)
    try {
      const slideResult = await getSelectedSlideIndex()
      const slideIndex = slideResult.success ? slideResult.data! : 0

      const result = await addListToSlide(slideIndex, [
        '第一项内容',
        '第二项内容', 
        '第三项内容',
        '第四项内容'
      ], {
        x: 40,
        y: 140,
        width: SLIDE_WIDTH - 80,
        height: 300
      })

      if (result.success) {
        showStatus('success', '项目符号列表已添加')
      } else {
        showStatus('error', result.error || '添加失败')
      }
    } catch (err) {
      showStatus('error', `操作失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [showStatus])

  const handleQuickAction = useCallback(async (action: string) => {
    if (!isOfficeAvailable()) {
      showStatus('error', 'PowerPoint 未连接')
      return
    }

    setIsLoading(true)
    try {
      const slideResult = await getSelectedSlideIndex()
      const slideIndex = slideResult.success ? slideResult.data! : 0

      switch (action) {
        case 'unify-font': {
          // Add sample unified text
          await addTextToSlide(slideIndex, '统一字体示例文本\n这是第二行\n这是第三行', {
            x: 40, y: 140, width: SLIDE_WIDTH - 80, height: 200
          })
          showStatus('success', '统一字体文本已添加')
          break
        }
        case 'batch-replace': {
          showStatus('info', '批量替换功能开发中...')
          break
        }
        case 'clear-format': {
          showStatus('info', '请先选中文本，然后清除格式')
          break
        }
        default:
          showStatus('info', `功能 "${action}" 开发中...`)
      }
    } catch (err) {
      showStatus('error', `操作失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [showStatus])

  const formatTools = textTools.filter(t => t.group === 'format')
  const alignTools = textTools.filter(t => t.group === 'align')
  const spacingTools = textTools.filter(t => t.group === 'spacing')

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Status Message */}
      {statusMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-sm z-50 animate-fade-in ${
          statusMessage.type === 'success' ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' :
          statusMessage.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-surface-secondary px-4 py-2 rounded-lg text-sm text-text-primary">
            处理中...
          </div>
        </div>
      )}

      {/* Text Formatting */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V4h16v3" />
            <path d="M9 20h6" />
            <path d="M12 4v16" />
          </svg>
          <span>文字格式</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {formatTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`tool-btn ${activeTool === tool.id ? 'tool-btn-active' : ''}`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </section>

      {/* Text Alignment */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="15" y1="12" x2="3" y2="12" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
          <span>段落对齐</span>
        </div>
        
        <div className="flex gap-1">
          {alignTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`tool-btn flex-1 ${activeTool === tool.id ? 'tool-btn-active' : ''}`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </section>

      {/* Lists & Indentation */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
            <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
            <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
          </svg>
          <span>列表与缩进</span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={handleAddList}
            disabled={isLoading}
            className={`tool-btn flex-1 ${activeTool === 'list-bullet' ? 'tool-btn-active' : ''} disabled:opacity-50`}
            title="项目符号"
          >
            <ListBulletIcon />
          </button>
          <button
            onClick={() => handleToolClick('list-number')}
            disabled={isLoading}
            className={`tool-btn flex-1 ${activeTool === 'list-number' ? 'tool-btn-active' : ''} disabled:opacity-50`}
            title="编号列表"
          >
            <ListNumberIcon />
          </button>
          {spacingTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              disabled={isLoading}
              className={`tool-btn flex-1 ${activeTool === tool.id ? 'tool-btn-active' : ''} disabled:opacity-50`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </section>

      {/* Font Presets */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>字体预设</span>
          <span className="text-xs text-text-muted ml-auto">点击添加到幻灯片</span>
        </div>
        
        <div className="space-y-2">
          {fontPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              disabled={isLoading}
              className={`w-full p-3 rounded-md text-left transition-all disabled:opacity-50 ${
                selectedPreset === preset.id 
                  ? 'bg-primary/20 border border-primary' 
                  : 'bg-surface-secondary border border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span 
                  className="text-text-primary"
                  style={{ 
                    fontSize: preset.size, 
                    fontWeight: preset.weight as any,
                    lineHeight: '1.2'
                  }}
                >
                  {preset.name}
                </span>
                <span className="text-xs text-text-muted">{preset.size}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Line Height & Letter Spacing */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10H3" />
            <path d="M21 6H3" />
            <path d="M21 14H3" />
            <path d="M21 18H3" />
          </svg>
          <span>间距调整</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-text-secondary">行高</label>
              <span className="text-sm text-text-muted">{lineHeight.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-text-secondary">字间距</label>
              <span className="text-sm text-text-muted">{letterSpacing}px</span>
            </div>
            <input
              type="range"
              min="-2"
              max="10"
              step="0.5"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className="w-full h-2 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </section>

      {/* Text Effects */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>文字效果</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {textEffects.map((effect) => (
            <button
              key={effect.id}
              className="p-3 rounded-md bg-surface-secondary border border-border hover:border-primary/50 text-left transition-all group cursor-pointer"
            >
              <div className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                {effect.name}
              </div>
              <div className="text-xs text-text-muted">{effect.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Text Actions */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
          </svg>
          <span>快捷操作</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleQuickAction('unify-font')}
            disabled={isLoading}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            统一字体
          </button>
          <button 
            onClick={() => handleQuickAction('batch-replace')}
            disabled={isLoading}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
            批量替换
          </button>
          <button 
            onClick={() => handleQuickAction('clear-format')}
            disabled={isLoading}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            清除格式
          </button>
        </div>
      </section>
    </div>
  )
}
