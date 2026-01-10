import type { SlideContent } from '../../types'

interface SlideCardProps {
  slide: SlideContent
  index: number
  onClick: () => void
}

export default function SlideCard({ slide, index, onClick }: SlideCardProps) {
  const getLayoutIcon = () => {
    switch (slide.layout) {
      case 'title':
        return '📄'
      case 'two-column':
        return '📊'
      case 'code-focus':
        return '💻'
      case 'image-focus':
        return '🖼️'
      default:
        return '📝'
    }
  }

  return (
    <button
      onClick={onClick}
      className="group relative aspect-video bg-white rounded-lg shadow-sm border border-surface-tertiary hover:border-primary hover:shadow-md transition-all duration-200 overflow-hidden text-left"
    >
      {/* Slide Number Badge */}
      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
        {index + 1}
      </div>

      {/* Layout Icon */}
      <div className="absolute top-2 right-2 text-sm opacity-60">
        {getLayoutIcon()}
      </div>

      {/* Content Preview */}
      <div className="p-4 pt-10 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-1 mb-2">
          {slide.title || '无标题'}
        </h3>
        
        <div className="flex-1 overflow-hidden">
          {slide.blocks.slice(0, 2).map((block, idx) => (
            <div key={idx} className="text-xs text-text-secondary line-clamp-2 mb-1">
              {block.type === 'code' && (
                <span className="inline-block px-1 py-0.5 bg-surface-secondary rounded text-xs font-mono">
                  {block.language || 'code'}
                </span>
              )}
              {block.type === 'mermaid' && (
                <span className="inline-block px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  图表
                </span>
              )}
              {(block.type === 'text' || block.type === 'list') && (
                <span>{block.content.substring(0, 50)}...</span>
              )}
            </div>
          ))}
        </div>

        {/* Block Count */}
        <div className="text-xs text-text-disabled mt-2">
          {slide.blocks.length} 个内容块
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
