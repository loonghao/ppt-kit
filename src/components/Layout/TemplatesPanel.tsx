import { useState, useCallback } from 'react'
import { 
  isOfficeAvailable, 
  showSuccess,
  showError,
  generateSlideFromTemplate
} from '../../modules/ppt-bridge'

// Template categories
type TemplateCategory = 'business' | 'education' | 'creative' | 'minimal' | 'pitch' | 'report'

interface TemplateItem {
  id: string
  name: string
  description: string
  category: TemplateCategory
  slides: number
  preview: string  // Preview image URL or gradient
  source: string   // Source website
  downloadUrl?: string
  tags: string[]
  // Template structure for applying
  structure?: {
    type: 'title' | 'content' | 'two-column' | 'image-focus' | 'comparison'
    titleStyle?: {
      fontSize: number
      color: string
      bold: boolean
    }
    contentStyle?: {
      fontSize: number
      color: string
    }
    backgroundColor?: string
    accentColor?: string
  }
}

// Free template sources (curated from open source and free resources)
const templateSources = [
  { id: 'slidesgo', name: 'Slidesgo', url: 'https://slidesgo.com', description: '免费 PPT 模板', icon: '🎨' },
  { id: 'slidescarnival', name: 'SlidesCarnival', url: 'https://www.slidescarnival.com', description: '免费精美模板', icon: '🎪' },
  { id: 'fppt', name: 'FPPT', url: 'https://www.free-power-point-templates.com', description: '免费 PPT 资源', icon: '📊' },
  { id: 'slidesmania', name: 'SlidesMania', url: 'https://slidesmania.com', description: '创意模板', icon: '✨' },
  { id: 'canva', name: 'Canva', url: 'https://www.canva.com/presentations/templates/', description: '在线设计工具', icon: '🖼️' },
  { id: 'builtin', name: '内置模板', url: '', description: '可直接应用', icon: '⚡' },
]

// Sample templates (these would be fetched from APIs in production)
const templates: TemplateItem[] = [
  // Business - Built-in templates that can be applied directly
  {
    id: 'business-modern-1',
    name: '现代商务报告',
    description: '简洁现代的商务报告模板，适合年度总结、项目汇报',
    category: 'business',
    slides: 25,
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    source: 'builtin',
    tags: ['商务', '报告', '现代'],
    structure: {
      type: 'content',
      titleStyle: { fontSize: 36, color: '#667eea', bold: true },
      contentStyle: { fontSize: 18, color: '#333333' },
      backgroundColor: '#FFFFFF',
      accentColor: '#667eea'
    }
  },
  {
    id: 'business-corporate-1',
    name: '企业介绍',
    description: '专业的企业介绍模板，展示公司文化和业务',
    category: 'business',
    slides: 30,
    preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    source: 'builtin',
    tags: ['企业', '介绍', '专业'],
    structure: {
      type: 'two-column',
      titleStyle: { fontSize: 32, color: '#11998e', bold: true },
      contentStyle: { fontSize: 16, color: '#444444' },
      backgroundColor: '#F8F9FA',
      accentColor: '#11998e'
    }
  },
  {
    id: 'business-finance-1',
    name: '财务报表',
    description: '数据可视化财务报表模板，图表丰富',
    category: 'business',
    slides: 20,
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    source: 'slidesgo',
    tags: ['财务', '数据', '图表']
  },
  
  // Education - Built-in
  {
    id: 'edu-classroom-1',
    name: '课堂教学',
    description: '活泼的课堂教学模板，适合各学科',
    category: 'education',
    slides: 20,
    preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    source: 'builtin',
    tags: ['教育', '课堂', '教学'],
    structure: {
      type: 'content',
      titleStyle: { fontSize: 40, color: '#fa709a', bold: true },
      contentStyle: { fontSize: 20, color: '#333333' },
      backgroundColor: '#FFFBF0',
      accentColor: '#fa709a'
    }
  },
  {
    id: 'edu-thesis-1',
    name: '论文答辩',
    description: '学术风格论文答辩模板',
    category: 'education',
    slides: 15,
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    source: 'builtin',
    tags: ['论文', '答辩', '学术'],
    structure: {
      type: 'content',
      titleStyle: { fontSize: 34, color: '#2C3E50', bold: true },
      contentStyle: { fontSize: 18, color: '#34495E' },
      backgroundColor: '#FFFFFF',
      accentColor: '#3498DB'
    }
  },
  {
    id: 'edu-science-1',
    name: '科学实验',
    description: '科学主题模板，适合实验报告',
    category: 'education',
    slides: 18,
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    source: 'slidescarnival',
    tags: ['科学', '实验', '研究']
  },
  
  // Creative - Built-in
  {
    id: 'creative-portfolio-1',
    name: '作品集展示',
    description: '创意作品集模板，展示设计作品',
    category: 'creative',
    slides: 22,
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    source: 'builtin',
    tags: ['作品集', '设计', '创意'],
    structure: {
      type: 'image-focus',
      titleStyle: { fontSize: 28, color: '#f5576c', bold: true },
      contentStyle: { fontSize: 16, color: '#666666' },
      backgroundColor: '#1A1A1A',
      accentColor: '#f5576c'
    }
  },
  {
    id: 'creative-art-1',
    name: '艺术展览',
    description: '艺术风格模板，适合展览介绍',
    category: 'creative',
    slides: 16,
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    source: 'slidesgo',
    tags: ['艺术', '展览', '文化']
  },
  {
    id: 'creative-brand-1',
    name: '品牌设计',
    description: '品牌视觉设计模板',
    category: 'creative',
    slides: 24,
    preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    source: 'fppt',
    tags: ['品牌', '设计', '视觉']
  },
  
  // Minimal - Built-in
  {
    id: 'minimal-clean-1',
    name: '极简白色',
    description: '极简风格白色主题模板',
    category: 'minimal',
    slides: 20,
    preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    source: 'builtin',
    tags: ['极简', '白色', '简约'],
    structure: {
      type: 'content',
      titleStyle: { fontSize: 36, color: '#333333', bold: true },
      contentStyle: { fontSize: 18, color: '#666666' },
      backgroundColor: '#FFFFFF',
      accentColor: '#333333'
    }
  },
  {
    id: 'minimal-dark-1',
    name: '暗黑极简',
    description: '深色极简风格模板',
    category: 'minimal',
    slides: 18,
    preview: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    source: 'builtin',
    tags: ['极简', '暗黑', '简约'],
    structure: {
      type: 'content',
      titleStyle: { fontSize: 36, color: '#FFFFFF', bold: true },
      contentStyle: { fontSize: 18, color: '#CCCCCC' },
      backgroundColor: '#1A1A1A',
      accentColor: '#E85A3C'
    }
  },
  {
    id: 'minimal-mono-1',
    name: '单色简约',
    description: '单色调简约设计',
    category: 'minimal',
    slides: 15,
    preview: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
    source: 'slidesmania',
    tags: ['单色', '简约', '专业']
  },
  
  // Pitch - Built-in
  {
    id: 'pitch-startup-1',
    name: '创业路演',
    description: '创业公司融资路演模板',
    category: 'pitch',
    slides: 12,
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    source: 'builtin',
    tags: ['创业', '路演', '融资'],
    structure: {
      type: 'title',
      titleStyle: { fontSize: 48, color: '#FFFFFF', bold: true },
      contentStyle: { fontSize: 24, color: '#FFFFFF' },
      backgroundColor: '#667eea',
      accentColor: '#FFFFFF'
    }
  },
  {
    id: 'pitch-product-1',
    name: '产品发布',
    description: '新产品发布会模板',
    category: 'pitch',
    slides: 15,
    preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    source: 'builtin',
    tags: ['产品', '发布', '营销'],
    structure: {
      type: 'image-focus',
      titleStyle: { fontSize: 42, color: '#11998e', bold: true },
      contentStyle: { fontSize: 20, color: '#333333' },
      backgroundColor: '#FFFFFF',
      accentColor: '#11998e'
    }
  },
  {
    id: 'pitch-investor-1',
    name: '投资者会议',
    description: '投资者关系会议模板',
    category: 'pitch',
    slides: 20,
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    source: 'slidescarnival',
    tags: ['投资', '会议', '商务']
  },
  
  // Report - Built-in
  {
    id: 'report-annual-1',
    name: '年度报告',
    description: '企业年度报告模板',
    category: 'report',
    slides: 30,
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    source: 'builtin',
    tags: ['年报', '企业', '数据'],
    structure: {
      type: 'two-column',
      titleStyle: { fontSize: 32, color: '#667eea', bold: true },
      contentStyle: { fontSize: 16, color: '#444444' },
      backgroundColor: '#FFFFFF',
      accentColor: '#667eea'
    }
  },
  {
    id: 'report-project-1',
    name: '项目汇报',
    description: '项目进度汇报模板',
    category: 'report',
    slides: 18,
    preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    source: 'builtin',
    tags: ['项目', '汇报', '进度'],
    structure: {
      type: 'content',
      titleStyle: { fontSize: 34, color: '#fa709a', bold: true },
      contentStyle: { fontSize: 18, color: '#333333' },
      backgroundColor: '#FFFFFF',
      accentColor: '#fa709a'
    }
  },
  {
    id: 'report-market-1',
    name: '市场分析',
    description: '市场研究分析报告模板',
    category: 'report',
    slides: 25,
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    source: 'fppt',
    tags: ['市场', '分析', '研究']
  },
]

const categories: { id: TemplateCategory; name: string; icon: React.ReactNode }[] = [
  { 
    id: 'business', 
    name: '商务', 
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    )
  },
  { 
    id: 'education', 
    name: '教育', 
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    )
  },
  { 
    id: 'creative', 
    name: '创意', 
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    )
  },
  { 
    id: 'minimal', 
    name: '极简', 
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    )
  },
  { 
    id: 'pitch', 
    name: '路演', 
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
      </svg>
    )
  },
  { 
    id: 'report', 
    name: '报告', 
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    )
  },
]

export default function TemplatesPanel() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [templateData, setTemplateData] = useState<Record<string, string>>({
    title: '',
    subtitle: '',
    content: '',
    left: '',
    right: ''
  })

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleTemplateClick = useCallback((template: TemplateItem) => {
    setSelectedTemplate(template)
  }, [])

  const handleOpenSource = useCallback((sourceId: string) => {
    const source = templateSources.find(s => s.id === sourceId)
    if (source && source.url) {
      // Open in a new popup window
      const width = 1200
      const height = 800
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2
      window.open(
        source.url,
        `template_browser_${source.id}`,
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=yes,scrollbars=yes,resizable=yes`
      )
    }
  }, [])

  const handleApplyTemplate = useCallback(async () => {
    if (!selectedTemplate) return
    
    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      return
    }

    // Check if this is a built-in template that can be applied
    if (selectedTemplate.source === 'builtin' && selectedTemplate.structure) {
      setApplyDialogOpen(true)
      return
    }

    // For external templates, open the source website
    handleOpenSource(selectedTemplate.source)
    setSelectedTemplate(null)
  }, [selectedTemplate, handleOpenSource])

  const handleApplyBuiltinTemplate = useCallback(async () => {
    if (!selectedTemplate || !selectedTemplate.structure) return

    setIsLoading(true)
    try {
      const result = await generateSlideFromTemplate(
        selectedTemplate.structure.type,
        templateData
      )

      if (result.success) {
        showSuccess(`已应用模板: ${selectedTemplate.name}`)
        setApplyDialogOpen(false)
        setSelectedTemplate(null)
        setTemplateData({ title: '', subtitle: '', content: '', left: '', right: '' })
      } else {
        showError(result.error || '应用模板失败')
      }
    } catch (err) {
      showError(`操作失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTemplate, templateData])

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-surface-secondary px-4 py-2 rounded-lg text-sm text-text-primary">
            处理中...
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && !applyDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{selectedTemplate.name}</h3>
                <p className="text-sm text-text-muted">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-1 hover:bg-surface-secondary rounded"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div 
              className="aspect-video rounded-lg"
              style={{ background: selectedTemplate.preview }}
            />
            
            <div className="flex flex-wrap gap-1.5">
              {selectedTemplate.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-surface-secondary rounded text-xs text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>{selectedTemplate.slides} 页幻灯片</span>
              <span className={selectedTemplate.source === 'builtin' ? 'text-success' : 'text-primary'}>
                {templateSources.find(s => s.id === selectedTemplate.source)?.name}
                {selectedTemplate.source === 'builtin' && ' (可直接应用)'}
              </span>
            </div>
            
            <div className="flex gap-2">
              {selectedTemplate.source !== 'builtin' && (
                <button
                  onClick={() => handleOpenSource(selectedTemplate.source)}
                  className="flex-1 btn-secondary"
                >
                  访问来源
                </button>
              )}
              <button
                onClick={handleApplyTemplate}
                className="flex-1 btn-primary"
                disabled={isLoading}
              >
                {selectedTemplate.source === 'builtin' ? '应用模板' : '查看详情'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Template Dialog */}
      {applyDialogOpen && selectedTemplate && selectedTemplate.structure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl max-w-lg w-full p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">应用模板: {selectedTemplate.name}</h3>
                <p className="text-sm text-text-muted">填写内容后将创建新幻灯片</p>
              </div>
              <button
                onClick={() => {
                  setApplyDialogOpen(false)
                  setSelectedTemplate(null)
                }}
                className="p-1 hover:bg-surface-secondary rounded"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview */}
            <div 
              className="aspect-video rounded-lg relative overflow-hidden"
              style={{ background: selectedTemplate.preview }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                <div className="text-lg font-bold text-center" style={{ color: selectedTemplate.structure.titleStyle?.color }}>
                  {templateData.title || '标题预览'}
                </div>
                {selectedTemplate.structure.type === 'title' && (
                  <div className="text-sm mt-2 opacity-80">
                    {templateData.subtitle || '副标题预览'}
                  </div>
                )}
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">标题</label>
                <input
                  type="text"
                  value={templateData.title}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入幻灯片标题"
                  className="input-dark"
                />
              </div>

              {selectedTemplate.structure.type === 'title' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">副标题</label>
                  <input
                    type="text"
                    value={templateData.subtitle}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="输入副标题"
                    className="input-dark"
                  />
                </div>
              )}

              {selectedTemplate.structure.type === 'content' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">内容</label>
                  <textarea
                    value={templateData.content}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="输入幻灯片内容"
                    rows={4}
                    className="input-dark resize-none"
                  />
                </div>
              )}

              {selectedTemplate.structure.type === 'two-column' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">左侧内容</label>
                    <textarea
                      value={templateData.left}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, left: e.target.value }))}
                      placeholder="输入左侧内容"
                      rows={3}
                      className="input-dark resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">右侧内容</label>
                    <textarea
                      value={templateData.right}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, right: e.target.value }))}
                      placeholder="输入右侧内容"
                      rows={3}
                      className="input-dark resize-none"
                    />
                  </div>
                </>
              )}

              {selectedTemplate.structure.type === 'image-focus' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">描述/说明</label>
                  <textarea
                    value={templateData.content}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="输入图片说明或描述"
                    rows={3}
                    className="input-dark resize-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setApplyDialogOpen(false)
                  setSelectedTemplate(null)
                }}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleApplyBuiltinTemplate}
                className="flex-1 btn-primary"
                disabled={isLoading || !templateData.title}
              >
                {isLoading ? '创建中...' : '创建幻灯片'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <svg 
          viewBox="0 0 24 24" 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="搜索模板..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-secondary rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Category Tabs */}
      <section>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Templates Grid */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>模板库</span>
          <span className="text-xs text-text-muted ml-auto">{filteredTemplates.length} 个模板</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="card hover:border-primary/50 transition-all cursor-pointer group text-left relative"
            >
              {/* Built-in badge */}
              {template.source === 'builtin' && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="px-1.5 py-0.5 bg-success/20 text-success text-xs rounded font-medium">
                    可应用
                  </span>
                </div>
              )}
              <div 
                className="aspect-video rounded-lg mb-2 group-hover:scale-[1.02] transition-transform"
                style={{ background: template.preview }}
              />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors truncate">
                  {template.name}
                </h4>
                <p className="text-xs text-text-muted line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>{template.slides} 页</span>
                  <span className={template.source === 'builtin' ? 'text-success' : 'text-primary'}>
                    {templateSources.find(s => s.id === template.source)?.name}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Template Sources - Now opens embedded browser */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>在线模板网站</span>
          <span className="text-xs text-text-muted ml-auto">点击浏览</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {templateSources.filter(s => s.url).map((source) => (
            <button
              key={source.id}
              onClick={() => handleOpenSource(source.id)}
              className="card hover:border-primary/50 transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl">
                  {source.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                    {source.name}
                  </div>
                  <div className="text-xs text-text-muted truncate">{source.description}</div>
                </div>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="card bg-surface-secondary/50">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <div className="text-xs text-text-muted">
            <p className="font-medium text-text-secondary mb-1">使用提示</p>
            <ul className="space-y-1">
              <li>• <span className="text-success">绿色标签</span>的模板可直接应用到 PPT</li>
              <li>• 点击在线网站可在内嵌浏览器中浏览和下载模板</li>
              <li>• 下载的 .pptx 文件可直接在 PowerPoint 中打开使用</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
