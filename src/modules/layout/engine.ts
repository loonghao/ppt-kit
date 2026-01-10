import type { SlideContent, ContentBlock, LayoutType } from '../../types'

export interface LayoutConfig {
  slideWidth: number
  slideHeight: number
  margin: number
  titleHeight: number
  contentGap: number
}

export interface LayoutResult {
  title: LayoutRect
  blocks: LayoutRect[]
}

export interface LayoutRect {
  x: number
  y: number
  width: number
  height: number
}

const defaultConfig: LayoutConfig = {
  slideWidth: 960,
  slideHeight: 540,
  margin: 40,
  titleHeight: 80,
  contentGap: 20,
}

/**
 * Calculate layout positions for slide content
 */
export function calculateLayout(
  slide: SlideContent,
  config: LayoutConfig = defaultConfig
): LayoutResult {
  const layoutFn = layoutStrategies[slide.layout] || layoutStrategies.content
  return layoutFn(slide, config)
}

/**
 * Layout strategy functions for different layout types
 */
const layoutStrategies: Record<LayoutType, (slide: SlideContent, config: LayoutConfig) => LayoutResult> = {
  title: layoutTitle,
  content: layoutContent,
  'two-column': layoutTwoColumn,
  comparison: layoutComparison,
  'image-focus': layoutImageFocus,
  'code-focus': layoutCodeFocus,
}

/**
 * Title slide layout - centered title
 */
function layoutTitle(slide: SlideContent, config: LayoutConfig): LayoutResult {
  const { slideWidth, slideHeight, margin } = config
  
  return {
    title: {
      x: margin,
      y: slideHeight / 2 - 40,
      width: slideWidth - margin * 2,
      height: 80,
    },
    blocks: [],
  }
}

/**
 * Standard content layout - title on top, content below
 */
function layoutContent(slide: SlideContent, config: LayoutConfig): LayoutResult {
  const { slideWidth, slideHeight, margin, titleHeight, contentGap } = config
  
  const contentTop = margin + titleHeight + contentGap
  const contentHeight = slideHeight - contentTop - margin
  const contentWidth = slideWidth - margin * 2
  
  const blockCount = slide.blocks.length
  const blockHeight = blockCount > 0 
    ? (contentHeight - (blockCount - 1) * contentGap) / blockCount 
    : 0
  
  const blocks: LayoutRect[] = slide.blocks.map((_, index) => ({
    x: margin,
    y: contentTop + index * (blockHeight + contentGap),
    width: contentWidth,
    height: blockHeight,
  }))
  
  return {
    title: {
      x: margin,
      y: margin,
      width: contentWidth,
      height: titleHeight,
    },
    blocks,
  }
}

/**
 * Two-column layout - content split into two columns
 */
function layoutTwoColumn(slide: SlideContent, config: LayoutConfig): LayoutResult {
  const { slideWidth, slideHeight, margin, titleHeight, contentGap } = config
  
  const contentTop = margin + titleHeight + contentGap
  const contentHeight = slideHeight - contentTop - margin
  const columnWidth = (slideWidth - margin * 2 - contentGap) / 2
  
  const leftBlocks = slide.blocks.filter((_, i) => i % 2 === 0)
  const rightBlocks = slide.blocks.filter((_, i) => i % 2 === 1)
  
  const leftBlockHeight = leftBlocks.length > 0
    ? (contentHeight - (leftBlocks.length - 1) * contentGap) / leftBlocks.length
    : 0
  const rightBlockHeight = rightBlocks.length > 0
    ? (contentHeight - (rightBlocks.length - 1) * contentGap) / rightBlocks.length
    : 0
  
  const blocks: LayoutRect[] = []
  
  leftBlocks.forEach((_, index) => {
    blocks.push({
      x: margin,
      y: contentTop + index * (leftBlockHeight + contentGap),
      width: columnWidth,
      height: leftBlockHeight,
    })
  })
  
  rightBlocks.forEach((_, index) => {
    blocks.push({
      x: margin + columnWidth + contentGap,
      y: contentTop + index * (rightBlockHeight + contentGap),
      width: columnWidth,
      height: rightBlockHeight,
    })
  })
  
  return {
    title: {
      x: margin,
      y: margin,
      width: slideWidth - margin * 2,
      height: titleHeight,
    },
    blocks,
  }
}

/**
 * Comparison layout - two columns with headers
 */
function layoutComparison(slide: SlideContent, config: LayoutConfig): LayoutResult {
  // Similar to two-column but with more emphasis on comparison
  return layoutTwoColumn(slide, config)
}

/**
 * Image focus layout - large image area with small text
 */
function layoutImageFocus(slide: SlideContent, config: LayoutConfig): LayoutResult {
  const { slideWidth, slideHeight, margin, titleHeight, contentGap } = config
  
  const contentTop = margin + titleHeight + contentGap
  const contentHeight = slideHeight - contentTop - margin
  const contentWidth = slideWidth - margin * 2
  
  // Find image/mermaid block
  const imageIndex = slide.blocks.findIndex(b => b.type === 'image' || b.type === 'mermaid')
  
  const blocks: LayoutRect[] = slide.blocks.map((block, index) => {
    if (index === imageIndex || block.type === 'image' || block.type === 'mermaid') {
      // Large area for image/diagram
      return {
        x: margin,
        y: contentTop,
        width: contentWidth,
        height: contentHeight * 0.7,
      }
    }
    // Small area for text
    return {
      x: margin,
      y: contentTop + contentHeight * 0.7 + contentGap,
      width: contentWidth,
      height: contentHeight * 0.3 - contentGap,
    }
  })
  
  return {
    title: {
      x: margin,
      y: margin,
      width: contentWidth,
      height: titleHeight,
    },
    blocks,
  }
}

/**
 * Code focus layout - large code area
 */
function layoutCodeFocus(slide: SlideContent, config: LayoutConfig): LayoutResult {
  const { slideWidth, slideHeight, margin, titleHeight, contentGap } = config
  
  const contentTop = margin + titleHeight + contentGap
  const contentHeight = slideHeight - contentTop - margin
  const contentWidth = slideWidth - margin * 2
  
  // Find code block
  const codeIndex = slide.blocks.findIndex(b => b.type === 'code')
  
  const blocks: LayoutRect[] = slide.blocks.map((block, index) => {
    if (index === codeIndex || block.type === 'code') {
      // Large area for code
      return {
        x: margin,
        y: contentTop,
        width: contentWidth,
        height: contentHeight * 0.8,
      }
    }
    // Small area for description
    return {
      x: margin,
      y: contentTop + contentHeight * 0.8 + contentGap,
      width: contentWidth,
      height: contentHeight * 0.2 - contentGap,
    }
  })
  
  return {
    title: {
      x: margin,
      y: margin,
      width: contentWidth,
      height: titleHeight,
    },
    blocks,
  }
}

/**
 * Auto-select best layout based on content analysis
 */
export function autoSelectLayout(blocks: ContentBlock[]): LayoutType {
  const hasCode = blocks.some(b => b.type === 'code')
  const hasMermaid = blocks.some(b => b.type === 'mermaid')
  const hasImage = blocks.some(b => b.type === 'image')
  const blockCount = blocks.length
  
  if (blockCount === 0) return 'title'
  if (hasCode && blockCount <= 2) return 'code-focus'
  if (hasImage || hasMermaid) return 'image-focus'
  if (blockCount >= 4) return 'two-column'
  
  return 'content'
}
