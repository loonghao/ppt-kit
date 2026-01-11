import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  alignImages, 
  distributeImages, 
  isOfficeAvailable,
  showSuccess,
  showError
} from '../../modules/ppt-bridge'

export type ElementType = 'text' | 'image' | 'shape' | 'mixed'

interface QuickToolbarProps {
  visible: boolean
  position: { x: number; y: number }
  elementType: ElementType
  selectedIds: string[]
  slideIndex: number
  onClose: () => void
  onAction?: (action: string, params?: any) => void
}

// Alignment icons
const AlignLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="6" x2="4" y2="18" />
    <rect x="7" y="6" width="10" height="4" rx="1" />
    <rect x="7" y="14" width="6" height="4" rx="1" />
  </svg>
)

const AlignCenterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="4" x2="12" y2="20" />
    <rect x="5" y="6" width="14" height="4" rx="1" />
    <rect x="7" y="14" width="10" height="4" rx="1" />
  </svg>
)

const AlignRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="20" y1="6" x2="20" y2="18" />
    <rect x="7" y="6" width="10" height="4" rx="1" />
    <rect x="11" y="14" width="6" height="4" rx="1" />
  </svg>
)

const AlignTopIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="6" y1="4" x2="18" y2="4" />
    <rect x="6" y="7" width="4" height="10" rx="1" />
    <rect x="14" y="7" width="4" height="6" rx="1" />
  </svg>
)

const AlignMiddleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="12" x2="20" y2="12" />
    <rect x="6" y="6" width="4" height="12" rx="1" />
    <rect x="14" y="8" width="4" height="8" rx="1" />
  </svg>
)

const AlignBottomIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="6" y1="20" x2="18" y2="20" />
    <rect x="6" y="7" width="4" height="10" rx="1" />
    <rect x="14" y="11" width="4" height="6" rx="1" />
  </svg>
)

const DistributeHorizontalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="8" width="4" height="8" rx="1" />
    <rect x="10" y="8" width="4" height="8" rx="1" />
    <rect x="16" y="8" width="4" height="8" rx="1" />
  </svg>
)

const DistributeVerticalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="8" y="4" width="8" height="4" rx="1" />
    <rect x="8" y="10" width="8" height="4" rx="1" />
    <rect x="8" y="16" width="8" height="4" rx="1" />
  </svg>
)

const ColorPaletteIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="8" r="2" fill="#FF6B6B" stroke="none" />
    <circle cx="8" cy="14" r="2" fill="#4ECDC4" stroke="none" />
    <circle cx="16" cy="14" r="2" fill="#FFE66D" stroke="none" />
  </svg>
)

const TextFormatIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </svg>
)

const BoldIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
)

const ItalicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
)

const UnderlineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 4v6a6 6 0 0 0 12 0V4" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
)

// Color presets
const colorPresets = [
  '#E85A3C', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#FFFFFF', '#000000', '#808080', '#C0C0C0', '#333333'
]

export default function QuickToolbar({
  visible,
  position,
  elementType,
  selectedIds,
  slideIndex,
  onClose,
  onAction
}: QuickToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorTarget, setColorTarget] = useState<'fill' | 'text'>('fill')
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  // Adjust position to stay within viewport
  useEffect(() => {
    if (visible && toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let newX = position.x
      let newY = position.y
      
      // Adjust horizontal position
      if (position.x + rect.width > viewportWidth - 20) {
        newX = viewportWidth - rect.width - 20
      }
      if (newX < 20) newX = 20
      
      // Adjust vertical position
      if (position.y + rect.height > viewportHeight - 20) {
        newY = position.y - rect.height - 10
      }
      if (newY < 20) newY = 20
      
      setAdjustedPosition({ x: newX, y: newY })
    }
  }, [visible, position])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [visible, onClose])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (visible) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [visible, onClose])

  const handleAlign = useCallback(async (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      return
    }

    if (selectedIds.length < 2) {
      showError('请选择至少2个对象')
      return
    }

    const result = await alignImages(slideIndex, selectedIds, alignment)
    if (result.success) {
      showSuccess(`已${alignment === 'left' ? '左' : alignment === 'center' ? '居中' : alignment === 'right' ? '右' : alignment === 'top' ? '顶部' : alignment === 'middle' ? '垂直居中' : '底部'}对齐`)
      onAction?.('align', { alignment })
    } else {
      showError(result.error || '对齐失败')
    }
  }, [slideIndex, selectedIds, onAction])

  const handleDistribute = useCallback(async (direction: 'horizontal' | 'vertical') => {
    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      return
    }

    if (selectedIds.length < 3) {
      showError('请选择至少3个对象')
      return
    }

    const result = await distributeImages(slideIndex, selectedIds, direction)
    if (result.success) {
      showSuccess(`已${direction === 'horizontal' ? '水平' : '垂直'}分布`)
      onAction?.('distribute', { direction })
    } else {
      showError(result.error || '分布失败')
    }
  }, [slideIndex, selectedIds, onAction])

  const handleColorSelect = useCallback((color: string) => {
    onAction?.('color', { color, target: colorTarget })
    setShowColorPicker(false)
    showSuccess(`已应用颜色 ${color}`)
  }, [colorTarget, onAction])

  const handleTextFormat = useCallback((format: 'bold' | 'italic' | 'underline') => {
    onAction?.('textFormat', { format })
    showSuccess(`已应用${format === 'bold' ? '粗体' : format === 'italic' ? '斜体' : '下划线'}`)
  }, [onAction])

  if (!visible) return null

  const showAlignTools = selectedIds.length >= 2
  const showDistributeTools = selectedIds.length >= 3
  const showTextTools = elementType === 'text' || elementType === 'mixed'

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 animate-fade-in"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="bg-surface-elevated rounded-xl shadow-2xl border border-border overflow-hidden">
        {/* Main toolbar */}
        <div className="flex flex-col p-1.5 gap-1">
          {/* Text formatting tools */}
          {showTextTools && (
            <>
              <div className="flex items-center gap-0.5 p-0.5">
                <button
                  onClick={() => handleTextFormat('bold')}
                  className="quick-tool-btn"
                  title="粗体"
                >
                  <BoldIcon />
                </button>
                <button
                  onClick={() => handleTextFormat('italic')}
                  className="quick-tool-btn"
                  title="斜体"
                >
                  <ItalicIcon />
                </button>
                <button
                  onClick={() => handleTextFormat('underline')}
                  className="quick-tool-btn"
                  title="下划线"
                >
                  <UnderlineIcon />
                </button>
              </div>
              <div className="h-px bg-border mx-1" />
            </>
          )}

          {/* Alignment tools */}
          {showAlignTools && (
            <>
              <div className="flex items-center gap-0.5 p-0.5">
                <button
                  onClick={() => handleAlign('left')}
                  className="quick-tool-btn"
                  title="左对齐"
                >
                  <AlignLeftIcon />
                </button>
                <button
                  onClick={() => handleAlign('center')}
                  className="quick-tool-btn"
                  title="水平居中"
                >
                  <AlignCenterIcon />
                </button>
                <button
                  onClick={() => handleAlign('right')}
                  className="quick-tool-btn"
                  title="右对齐"
                >
                  <AlignRightIcon />
                </button>
              </div>
              <div className="flex items-center gap-0.5 p-0.5">
                <button
                  onClick={() => handleAlign('top')}
                  className="quick-tool-btn"
                  title="顶部对齐"
                >
                  <AlignTopIcon />
                </button>
                <button
                  onClick={() => handleAlign('middle')}
                  className="quick-tool-btn"
                  title="垂直居中"
                >
                  <AlignMiddleIcon />
                </button>
                <button
                  onClick={() => handleAlign('bottom')}
                  className="quick-tool-btn"
                  title="底部对齐"
                >
                  <AlignBottomIcon />
                </button>
              </div>
              <div className="h-px bg-border mx-1" />
            </>
          )}

          {/* Distribute tools */}
          {showDistributeTools && (
            <>
              <div className="flex items-center gap-0.5 p-0.5">
                <button
                  onClick={() => handleDistribute('horizontal')}
                  className="quick-tool-btn"
                  title="水平分布"
                >
                  <DistributeHorizontalIcon />
                </button>
                <button
                  onClick={() => handleDistribute('vertical')}
                  className="quick-tool-btn"
                  title="垂直分布"
                >
                  <DistributeVerticalIcon />
                </button>
              </div>
              <div className="h-px bg-border mx-1" />
            </>
          )}

          {/* Color picker */}
          <div className="flex items-center gap-0.5 p-0.5 relative">
            <button
              onClick={() => {
                setColorTarget('fill')
                setShowColorPicker(!showColorPicker)
              }}
              className="quick-tool-btn"
              title="填充颜色"
            >
              <ColorPaletteIcon />
            </button>
            {showTextTools && (
              <button
                onClick={() => {
                  setColorTarget('text')
                  setShowColorPicker(!showColorPicker)
                }}
                className="quick-tool-btn"
                title="文字颜色"
              >
                <TextFormatIcon />
              </button>
            )}
          </div>
        </div>

        {/* Color picker panel */}
        {showColorPicker && (
          <div className="border-t border-border p-2 bg-surface-secondary">
            <div className="text-xs text-text-muted mb-2">
              {colorTarget === 'fill' ? '填充颜色' : '文字颜色'}
            </div>
            <div className="grid grid-cols-5 gap-1">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
