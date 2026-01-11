import { useState, useCallback } from 'react'
import { 
  isOfficeAvailable, 
  getSelectedSlideIndex,
  addShapeToSlide,
  addLineToSlide,
  showSuccess,
  showError,
  showInfo,
  SLIDE_WIDTH,
  SLIDE_HEIGHT
} from '../../modules/ppt-bridge'

// Shape categories
type ShapeCategory = 'basic' | 'arrows' | 'flowchart' | 'callouts' | 'stars' | 'math' | 'symbols'

interface ShapeItem {
  id: string
  name: string
  type: string  // PowerPoint GeometricShapeType
  icon: React.ReactNode
  category: ShapeCategory
}

// Basic shape icons
const RectangleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="1" />
  </svg>
)

const RoundedRectIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="4" />
  </svg>
)

const EllipseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="12" rx="9" ry="7" />
  </svg>
)

const CircleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
  </svg>
)

const TriangleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3L22 21H2L12 3Z" />
  </svg>
)

const DiamondIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="14" height="14" transform="rotate(45 12 12)" />
  </svg>
)

const PentagonIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L22 9L18 21H6L2 9L12 2Z" />
  </svg>
)

const HexagonIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
  </svg>
)

const OctagonIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 2H17L22 7V17L17 22H7L2 17V7L7 2Z" />
  </svg>
)

const ParallelogramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 18L10 6H20L16 18H6Z" />
  </svg>
)

const TrapezoidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 18L8 6H16L20 18H4Z" />
  </svg>
)

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 2V9H2V15H9V22H15V15H22V9H15V2H9Z" />
  </svg>
)

// Arrow icons
const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M5 12L12 5M5 12L12 19" />
  </svg>
)

const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19V5M12 5L5 12M12 5L19 12" />
  </svg>
)

const ArrowDownIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5V19M12 19L5 12M12 19L19 12" />
  </svg>
)

const DoubleArrowIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12H19M5 12L9 8M5 12L9 16M19 12L15 8M19 12L15 16" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4L14 12L4 20V4Z" fill="currentColor" fillOpacity="0.1" />
  </svg>
)

const BlockArrowIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 10H14V6L22 12L14 18V14H4V10Z" />
  </svg>
)

// Flowchart icons
const ProcessIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="6" width="18" height="12" rx="1" />
  </svg>
)

const DecisionIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3L22 12L12 21L2 12L12 3Z" />
  </svg>
)

const TerminatorIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="6" width="18" height="12" rx="6" />
  </svg>
)

const DataIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 18L10 6H20L16 18H6Z" />
  </svg>
)

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4H20V18C20 18 16 22 12 18C8 22 4 18 4 18V4Z" />
  </svg>
)

// Star icons
const Star4Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" />
  </svg>
)

const Star5Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L15 9L22 9L16 14L18 21L12 17L6 21L8 14L2 9L9 9L12 2Z" />
  </svg>
)

const Star6Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L14 8L20 6L16 12L20 18L14 16L12 22L10 16L4 18L8 12L4 6L10 8L12 2Z" />
  </svg>
)

// Callout icons
const CalloutRectIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 4H21V16H9L5 20V16H3V4Z" />
  </svg>
)

const CalloutRoundIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11C21 15.97 16.97 20 12 20C10.5 20 9.1 19.67 7.84 19.1L3 20L4.3 16.1C3.47 14.84 3 13.37 3 11.8C3 6.83 7.03 2.8 12 2.8C16.97 2.8 21 6.03 21 11Z" />
  </svg>
)

// Math icons
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5V19M5 12H19" />
  </svg>
)

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12H19" />
  </svg>
)

const MultiplyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
)

const DivideIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="6" r="1.5" fill="currentColor" />
    <path d="M5 12H19" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" />
  </svg>
)

const EqualsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 9H19M5 15H19" />
  </svg>
)

// Symbol icons
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const LightningIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
  </svg>
)

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
)

// Shape data
const shapes: ShapeItem[] = [
  // Basic shapes
  { id: 'rectangle', name: '矩形', type: 'rectangle', icon: <RectangleIcon />, category: 'basic' },
  { id: 'roundedRectangle', name: '圆角矩形', type: 'roundedRectangle', icon: <RoundedRectIcon />, category: 'basic' },
  { id: 'ellipse', name: '椭圆', type: 'ellipse', icon: <EllipseIcon />, category: 'basic' },
  { id: 'oval', name: '圆形', type: 'oval', icon: <CircleIcon />, category: 'basic' },
  { id: 'isoscelesTriangle', name: '三角形', type: 'isoscelesTriangle', icon: <TriangleIcon />, category: 'basic' },
  { id: 'diamond', name: '菱形', type: 'diamond', icon: <DiamondIcon />, category: 'basic' },
  { id: 'pentagon', name: '五边形', type: 'pentagon', icon: <PentagonIcon />, category: 'basic' },
  { id: 'hexagon', name: '六边形', type: 'hexagon', icon: <HexagonIcon />, category: 'basic' },
  { id: 'octagon', name: '八边形', type: 'octagon', icon: <OctagonIcon />, category: 'basic' },
  { id: 'parallelogram', name: '平行四边形', type: 'parallelogram', icon: <ParallelogramIcon />, category: 'basic' },
  { id: 'trapezoid', name: '梯形', type: 'trapezoid', icon: <TrapezoidIcon />, category: 'basic' },
  { id: 'cross', name: '十字形', type: 'cross', icon: <CrossIcon />, category: 'basic' },
  
  // Arrows
  { id: 'rightArrow', name: '右箭头', type: 'rightArrow', icon: <ArrowRightIcon />, category: 'arrows' },
  { id: 'leftArrow', name: '左箭头', type: 'leftArrow', icon: <ArrowLeftIcon />, category: 'arrows' },
  { id: 'upArrow', name: '上箭头', type: 'upArrow', icon: <ArrowUpIcon />, category: 'arrows' },
  { id: 'downArrow', name: '下箭头', type: 'downArrow', icon: <ArrowDownIcon />, category: 'arrows' },
  { id: 'leftRightArrow', name: '双向箭头', type: 'leftRightArrow', icon: <DoubleArrowIcon />, category: 'arrows' },
  { id: 'chevron', name: '燕尾形', type: 'chevron', icon: <ChevronRightIcon />, category: 'arrows' },
  { id: 'notchedRightArrow', name: '块状箭头', type: 'notchedRightArrow', icon: <BlockArrowIcon />, category: 'arrows' },
  
  // Flowchart
  { id: 'flowchartProcess', name: '流程', type: 'flowchartProcess', icon: <ProcessIcon />, category: 'flowchart' },
  { id: 'flowchartDecision', name: '判断', type: 'flowchartDecision', icon: <DecisionIcon />, category: 'flowchart' },
  { id: 'flowchartTerminator', name: '终止', type: 'flowchartTerminator', icon: <TerminatorIcon />, category: 'flowchart' },
  { id: 'flowchartData', name: '数据', type: 'flowchartData', icon: <DataIcon />, category: 'flowchart' },
  { id: 'flowchartDocument', name: '文档', type: 'flowchartDocument', icon: <DocumentIcon />, category: 'flowchart' },
  
  // Stars
  { id: 'star4', name: '四角星', type: 'star4', icon: <Star4Icon />, category: 'stars' },
  { id: 'star5', name: '五角星', type: 'star5', icon: <Star5Icon />, category: 'stars' },
  { id: 'star6', name: '六角星', type: 'star6', icon: <Star6Icon />, category: 'stars' },
  
  // Callouts
  { id: 'callout1', name: '矩形标注', type: 'rectangularCallout', icon: <CalloutRectIcon />, category: 'callouts' },
  { id: 'callout2', name: '圆形标注', type: 'cloudCallout', icon: <CalloutRoundIcon />, category: 'callouts' },
  
  // Math
  { id: 'mathPlus', name: '加号', type: 'mathPlus', icon: <PlusIcon />, category: 'math' },
  { id: 'mathMinus', name: '减号', type: 'mathMinus', icon: <MinusIcon />, category: 'math' },
  { id: 'mathMultiply', name: '乘号', type: 'mathMultiply', icon: <MultiplyIcon />, category: 'math' },
  { id: 'mathDivide', name: '除号', type: 'mathDivide', icon: <DivideIcon />, category: 'math' },
  { id: 'mathEqual', name: '等号', type: 'mathEqual', icon: <EqualsIcon />, category: 'math' },
  
  // Symbols
  { id: 'heart', name: '心形', type: 'heart', icon: <HeartIcon />, category: 'symbols' },
  { id: 'lightningBolt', name: '闪电', type: 'lightningBolt', icon: <LightningIcon />, category: 'symbols' },
  { id: 'sun', name: '太阳', type: 'sun', icon: <SunIcon />, category: 'symbols' },
  { id: 'moon', name: '月亮', type: 'moon', icon: <MoonIcon />, category: 'symbols' },
  { id: 'cloud', name: '云朵', type: 'cloud', icon: <CloudIcon />, category: 'symbols' },
]

const categories: { id: ShapeCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'basic', name: '基本形状', icon: <RectangleIcon /> },
  { id: 'arrows', name: '箭头', icon: <ArrowRightIcon /> },
  { id: 'flowchart', name: '流程图', icon: <ProcessIcon /> },
  { id: 'stars', name: '星形', icon: <Star5Icon /> },
  { id: 'callouts', name: '标注', icon: <CalloutRectIcon /> },
  { id: 'math', name: '数学符号', icon: <PlusIcon /> },
  { id: 'symbols', name: '符号', icon: <HeartIcon /> },
]

// Color palette
const colorPalette = [
  '#E85A3C', '#FF6B4A', '#FF8A65', '#FFB347',
  '#4A90D9', '#5BA3E0', '#7EC8E3', '#9ED5E8',
  '#50C878', '#6BD48B', '#8BE09E', '#ABEAB1',
  '#9B59B6', '#A569BD', '#BB8FCE', '#D2B4DE',
  '#F1C40F', '#F4D03F', '#F7DC6F', '#FAE99F',
  '#1E1E1E', '#333333', '#666666', '#999999',
]

export default function ShapesPanel() {
  const [selectedCategory, setSelectedCategory] = useState<ShapeCategory>('basic')
  const [selectedColor, setSelectedColor] = useState('#E85A3C')
  const [isLoading, setIsLoading] = useState(false)

  const filteredShapes = shapes.filter(s => s.category === selectedCategory)

  const handleShapeClick = useCallback(async (shape: ShapeItem) => {
    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      return
    }

    setIsLoading(true)
    try {
      const slideResult = await getSelectedSlideIndex()
      const slideIndex = slideResult.success ? slideResult.data! : 0

      // Default position in center
      const position = {
        x: SLIDE_WIDTH / 2 - 100,
        y: SLIDE_HEIGHT / 2 - 75,
        width: 200,
        height: 150
      }

      const result = await addShapeToSlide(
        slideIndex,
        shape.type as any,
        position,
        { fillColor: selectedColor, name: shape.name }
      )

      if (result.success) {
        showSuccess(`${shape.name} 已添加`)
      } else {
        showError(result.error || '添加失败')
      }
    } catch (err) {
      showError(`操作失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [selectedColor])

  const handleAddLine = useCallback(async (type: 'straight' | 'elbow' | 'curve') => {
    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      return
    }

    setIsLoading(true)
    try {
      const slideResult = await getSelectedSlideIndex()
      const slideIndex = slideResult.success ? slideResult.data! : 0

      const result = await addLineToSlide(
        slideIndex,
        type,
        { x: 100, y: SLIDE_HEIGHT / 2, width: SLIDE_WIDTH - 200, height: 0 }
      )

      if (result.success) {
        showSuccess(`${type === 'straight' ? '直线' : type === 'elbow' ? '折线' : '曲线'} 已添加`)
      } else {
        showError(result.error || '添加失败')
      }
    } catch (err) {
      showError(`操作失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

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

      {/* Category Tabs */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span>形状分类</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Color Palette */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" fill={selectedColor} />
          </svg>
          <span>填充颜色</span>
        </div>
        
        <div className="grid grid-cols-8 gap-1.5">
          {colorPalette.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${
                selectedColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </section>

      {/* Shapes Grid */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
          <span className="text-xs text-text-muted ml-auto">{filteredShapes.length} 个</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {filteredShapes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => handleShapeClick(shape)}
              disabled={isLoading}
              className="layout-item group disabled:opacity-50"
              title={shape.name}
            >
              <div className="icon-box group-hover:icon-box-primary transition-colors" style={{ color: selectedColor }}>
                {shape.icon}
              </div>
              <span className="text-xs text-center leading-tight truncate w-full">{shape.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Lines Section */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12H19" />
          </svg>
          <span>线条</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAddLine('straight')}
            disabled={isLoading}
            className="layout-item group disabled:opacity-50"
          >
            <div className="icon-box group-hover:icon-box-primary">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12H19" />
              </svg>
            </div>
            <span className="text-xs">直线</span>
          </button>
          
          <button
            onClick={() => handleAddLine('elbow')}
            disabled={isLoading}
            className="layout-item group disabled:opacity-50"
          >
            <div className="icon-box group-hover:icon-box-primary">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5V12H19" />
              </svg>
            </div>
            <span className="text-xs">折线</span>
          </button>
          
          <button
            onClick={() => handleAddLine('curve')}
            disabled={isLoading}
            className="layout-item group disabled:opacity-50"
          >
            <div className="icon-box group-hover:icon-box-primary">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 19C5 19 9 5 19 5" />
              </svg>
            </div>
            <span className="text-xs">曲线</span>
          </button>
        </div>
      </section>

      {/* Quick Combinations */}
      <section>
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
          </svg>
          <span>快速组合</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => showInfo('流程图模板开发中...')}
            className="card hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center">
                <ProcessIcon />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-text-primary">流程图</div>
                <div className="text-xs text-text-muted">快速创建</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => showInfo('组织结构图开发中...')}
            className="card hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="2" width="6" height="4" rx="1" />
                  <rect x="2" y="14" width="6" height="4" rx="1" />
                  <rect x="9" y="14" width="6" height="4" rx="1" />
                  <rect x="16" y="14" width="6" height="4" rx="1" />
                  <path d="M12 6V10M12 10H5M12 10H19M5 10V14M19 10V14M12 10V14" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-text-primary">组织图</div>
                <div className="text-xs text-text-muted">层级结构</div>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  )
}
