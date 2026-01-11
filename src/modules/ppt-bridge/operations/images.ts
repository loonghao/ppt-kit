/**
 * PPT Bridge Operations - Images
 * 
 * Operations for working with actual images (not shapes).
 * Uses Office.js PowerPoint API for image manipulation.
 * 
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.shapecollection#powerpoint-powerpoint-shapecollection-addimage-member(1)
 */

import type { OperationResult, Position } from './types'
import { isOfficeAvailable, toShapeAddOptions, SLIDE_WIDTH, SLIDE_HEIGHT } from './utils'

/**
 * Image layout types - Extended with professional layouts
 */
export type ImageLayoutType = 
  // Basic Grid Layouts
  | 'single'           // 1 image - centered
  | 'side-by-side'     // 2 images - horizontal
  | 'stacked'          // 2+ images - vertical stack
  | 'grid-2x2'         // 4 images - 2x2 grid
  | 'grid-3x3'         // 9 images - 3x3 grid
  | 'grid-2x3'         // 6 images - 2 rows x 3 cols
  | 'grid-1x3'         // 3 images - 1 row x 3 cols
  | 'grid-1x4'         // 4 images - 1 row x 4 cols
  // Featured Layouts (one large + smaller)
  | 'featured-left'    // 1 large left + 2 small right
  | 'featured-right'   // 2 small left + 1 large right
  | 'featured-top'     // 1 large top + 3 small bottom
  | 'featured-center'  // 1 large center + 4 corners
  // Magazine/Editorial Layouts
  | 'magazine-1'       // 1 large + 2 medium stacked
  | 'magazine-2'       // L-shaped layout
  | 'pinterest'        // Masonry/Pinterest style
  | 'mosaic'           // Asymmetric mosaic
  // Creative Layouts
  | 'diagonal'         // Diagonal arrangement
  | 'staircase'        // Staircase pattern
  | 'pyramid'          // Pyramid arrangement
  | 'scattered'        // Random scattered
  | 'circular'         // Circular arrangement
  | 'spiral'           // Spiral pattern
  // Special Effects
  | 'polaroid'         // Polaroid photo style
  | 'filmstrip'        // Film strip style
  | 'gallery-wall'     // Gallery wall style
  | 'collage'          // Overlapping collage
  | 'timeline'         // Timeline horizontal
  | 'fullscreen'       // Single fullscreen

/**
 * Image filter types
 */
export type ImageFilterType = 
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'brightness'
  | 'contrast'
  | 'blur'
  | 'shadow'

/**
 * Add an image to slide using the official addImage API
 * This creates an actual image shape, not a shape with image fill
 */
export async function addImage(
  slideIndex: number,
  base64Data: string,
  position?: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    // Remove data URL prefix if present
    let base64 = base64Data
    if (base64Data.startsWith('data:')) {
      base64 = base64Data.split(',')[1]
    }

    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      const rect = position || { x: 100, y: 100, width: 400, height: 300 }
      
      // Use official addImage API (available in PowerPoint API 1.8+)
      // Falls back to shape.fill.setImage if addImage is not available
      try {
        const image = (shapes as any).addImage(base64, toShapeAddOptions(rect))
        image.load('id')
        await context.sync()
        shapeId = image.id
      } catch {
        // Fallback: create rectangle and fill with image
        const imageShape = shapes.addGeometricShape(
          PowerPoint.GeometricShapeType.rectangle,
          toShapeAddOptions(rect)
        )
        imageShape.left = rect.x
        imageShape.top = rect.y
        imageShape.width = rect.width
        imageShape.height = rect.height
        imageShape.fill.setImage(base64)
        imageShape.lineFormat.visible = false
        imageShape.name = 'Image'
        
        imageShape.load('id')
        await context.sync()
        shapeId = imageShape.id
      }
      
      console.log('[PPT Bridge] Image added, shape ID:', shapeId)
    })

    return { success: true, data: { shapeId } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Add multiple images with a specific layout
 */
export async function addImagesWithLayout(
  slideIndex: number,
  images: string[],  // base64 data array
  layout: ImageLayoutType
): Promise<OperationResult<{ shapeIds: string[] }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  if (images.length === 0) {
    return { success: false, error: 'No images provided' }
  }

  try {
    const shapeIds: string[] = []
    const positions = calculateImagePositions(layout, images.length)

    for (let i = 0; i < images.length && i < positions.length; i++) {
      const result = await addImage(slideIndex, images[i], positions[i])
      if (result.success && result.data) {
        shapeIds.push(result.data.shapeId)
      }
    }

    return { success: true, data: { shapeIds } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Calculate positions for images based on layout type
 */
function calculateImagePositions(layout: ImageLayoutType, count: number): Position[] {
  const margin = 20
  const contentWidth = SLIDE_WIDTH - margin * 2
  const contentHeight = SLIDE_HEIGHT - margin * 2 - 60
  const startY = 80

  switch (layout) {
    // === Single Image ===
    case 'single': {
      const size = Math.min(contentWidth * 0.7, contentHeight * 0.8)
      return [{
        x: (SLIDE_WIDTH - size) / 2,
        y: startY + (contentHeight - size) / 2,
        width: size,
        height: size * 0.75
      }]
    }

    // === Basic Grid Layouts ===
    case 'grid-2x2': {
      const cols = 2
      const rows = Math.ceil(Math.min(count, 4) / cols)
      const cellWidth = (contentWidth - margin * (cols - 1)) / cols
      const cellHeight = (contentHeight - margin * (rows - 1)) / rows
      const positions: Position[] = []
      for (let i = 0; i < Math.min(count, 4); i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        positions.push({
          x: margin + col * (cellWidth + margin),
          y: startY + row * (cellHeight + margin),
          width: cellWidth,
          height: cellHeight
        })
      }
      return positions
    }

    case 'grid-3x3': {
      const cols = 3
      const rows = Math.ceil(Math.min(count, 9) / cols)
      const cellWidth = (contentWidth - margin * (cols - 1)) / cols
      const cellHeight = (contentHeight - margin * (rows - 1)) / rows
      const positions: Position[] = []
      for (let i = 0; i < Math.min(count, 9); i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        positions.push({
          x: margin + col * (cellWidth + margin),
          y: startY + row * (cellHeight + margin),
          width: cellWidth,
          height: cellHeight
        })
      }
      return positions
    }

    case 'grid-2x3': {
      const cols = 3
      const rows = 2
      const cellWidth = (contentWidth - margin * (cols - 1)) / cols
      const cellHeight = (contentHeight - margin * (rows - 1)) / rows
      const positions: Position[] = []
      for (let i = 0; i < Math.min(count, 6); i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        positions.push({
          x: margin + col * (cellWidth + margin),
          y: startY + row * (cellHeight + margin),
          width: cellWidth,
          height: cellHeight
        })
      }
      return positions
    }

    case 'grid-1x3': {
      const cellWidth = (contentWidth - margin * 2) / 3
      const cellHeight = contentHeight * 0.7
      const offsetY = startY + (contentHeight - cellHeight) / 2
      return Array.from({ length: Math.min(count, 3) }, (_, i) => ({
        x: margin + i * (cellWidth + margin),
        y: offsetY,
        width: cellWidth,
        height: cellHeight
      }))
    }

    case 'grid-1x4': {
      const cellWidth = (contentWidth - margin * 3) / 4
      const cellHeight = contentHeight * 0.6
      const offsetY = startY + (contentHeight - cellHeight) / 2
      return Array.from({ length: Math.min(count, 4) }, (_, i) => ({
        x: margin + i * (cellWidth + margin),
        y: offsetY,
        width: cellWidth,
        height: cellHeight
      }))
    }

    case 'side-by-side': {
      const cellWidth = (contentWidth - margin) / 2
      return [
        { x: margin, y: startY, width: cellWidth, height: contentHeight },
        { x: margin + cellWidth + margin, y: startY, width: cellWidth, height: contentHeight }
      ].slice(0, count)
    }

    case 'stacked': {
      const maxItems = Math.min(count, 4)
      const cellHeight = (contentHeight - margin * (maxItems - 1)) / maxItems
      return Array.from({ length: maxItems }, (_, i) => ({
        x: margin,
        y: startY + i * (cellHeight + margin),
        width: contentWidth,
        height: cellHeight
      }))
    }

    // === Featured Layouts ===
    case 'featured-left': {
      // 1 large on left (60%), 2 small stacked on right (40%)
      const leftWidth = contentWidth * 0.6 - margin / 2
      const rightWidth = contentWidth * 0.4 - margin / 2
      const rightHeight = (contentHeight - margin) / 2
      return [
        { x: margin, y: startY, width: leftWidth, height: contentHeight },
        { x: margin + leftWidth + margin, y: startY, width: rightWidth, height: rightHeight },
        { x: margin + leftWidth + margin, y: startY + rightHeight + margin, width: rightWidth, height: rightHeight }
      ].slice(0, count)
    }

    case 'featured-right': {
      // 2 small stacked on left (40%), 1 large on right (60%)
      const leftWidth = contentWidth * 0.4 - margin / 2
      const rightWidth = contentWidth * 0.6 - margin / 2
      const leftHeight = (contentHeight - margin) / 2
      return [
        { x: margin, y: startY, width: leftWidth, height: leftHeight },
        { x: margin, y: startY + leftHeight + margin, width: leftWidth, height: leftHeight },
        { x: margin + leftWidth + margin, y: startY, width: rightWidth, height: contentHeight }
      ].slice(0, count)
    }

    case 'featured-top': {
      // 1 large on top (60%), 3 small on bottom (40%)
      const topHeight = contentHeight * 0.6 - margin / 2
      const bottomHeight = contentHeight * 0.4 - margin / 2
      const bottomWidth = (contentWidth - margin * 2) / 3
      return [
        { x: margin, y: startY, width: contentWidth, height: topHeight },
        { x: margin, y: startY + topHeight + margin, width: bottomWidth, height: bottomHeight },
        { x: margin + bottomWidth + margin, y: startY + topHeight + margin, width: bottomWidth, height: bottomHeight },
        { x: margin + (bottomWidth + margin) * 2, y: startY + topHeight + margin, width: bottomWidth, height: bottomHeight }
      ].slice(0, count)
    }

    case 'featured-center': {
      // 1 large center + 4 corners
      const centerSize = Math.min(contentWidth, contentHeight) * 0.5
      const cornerSize = (Math.min(contentWidth, contentHeight) - centerSize) / 2 - margin
      const centerX = (SLIDE_WIDTH - centerSize) / 2
      const centerY = startY + (contentHeight - centerSize) / 2
      return [
        { x: centerX, y: centerY, width: centerSize, height: centerSize },
        { x: margin, y: startY, width: cornerSize, height: cornerSize },
        { x: SLIDE_WIDTH - margin - cornerSize, y: startY, width: cornerSize, height: cornerSize },
        { x: margin, y: startY + contentHeight - cornerSize, width: cornerSize, height: cornerSize },
        { x: SLIDE_WIDTH - margin - cornerSize, y: startY + contentHeight - cornerSize, width: cornerSize, height: cornerSize }
      ].slice(0, count)
    }

    // === Magazine/Editorial Layouts ===
    case 'magazine-1': {
      // 1 large left + 2 medium stacked right (classic magazine)
      const leftWidth = contentWidth * 0.55
      const rightWidth = contentWidth * 0.45 - margin
      const rightHeight = (contentHeight - margin) / 2
      return [
        { x: margin, y: startY, width: leftWidth, height: contentHeight },
        { x: margin + leftWidth + margin, y: startY, width: rightWidth, height: rightHeight },
        { x: margin + leftWidth + margin, y: startY + rightHeight + margin, width: rightWidth, height: rightHeight }
      ].slice(0, count)
    }

    case 'magazine-2': {
      // L-shaped layout: 1 large top-left, 1 tall right, 2 small bottom-left
      const largeWidth = contentWidth * 0.65
      const largeHeight = contentHeight * 0.6
      const rightWidth = contentWidth * 0.35 - margin
      const smallWidth = (largeWidth - margin) / 2
      const smallHeight = contentHeight * 0.4 - margin
      return [
        { x: margin, y: startY, width: largeWidth, height: largeHeight },
        { x: margin + largeWidth + margin, y: startY, width: rightWidth, height: contentHeight },
        { x: margin, y: startY + largeHeight + margin, width: smallWidth, height: smallHeight },
        { x: margin + smallWidth + margin, y: startY + largeHeight + margin, width: smallWidth, height: smallHeight }
      ].slice(0, count)
    }

    case 'pinterest': {
      // Masonry/Pinterest style - varying heights
      const cols = 3
      const colWidth = (contentWidth - margin * (cols - 1)) / cols
      const heights = [0.5, 0.65, 0.45, 0.55, 0.7, 0.5]
      const positions: Position[] = []
      const colHeights = [0, 0, 0]
      
      for (let i = 0; i < Math.min(count, 6); i++) {
        const col = i % cols
        const h = contentHeight * heights[i]
        positions.push({
          x: margin + col * (colWidth + margin),
          y: startY + colHeights[col],
          width: colWidth,
          height: h
        })
        colHeights[col] += h + margin
      }
      return positions
    }

    case 'mosaic': {
      // Asymmetric mosaic - 5 images
      const unit = contentWidth / 4
      return [
        { x: margin, y: startY, width: unit * 2 - margin / 2, height: contentHeight * 0.6 },
        { x: margin + unit * 2 + margin / 2, y: startY, width: unit * 2 - margin / 2, height: contentHeight * 0.4 - margin / 2 },
        { x: margin + unit * 2 + margin / 2, y: startY + contentHeight * 0.4 + margin / 2, width: unit - margin / 2, height: contentHeight * 0.6 - margin / 2 },
        { x: margin + unit * 3 + margin, y: startY + contentHeight * 0.4 + margin / 2, width: unit - margin / 2, height: contentHeight * 0.6 - margin / 2 },
        { x: margin, y: startY + contentHeight * 0.6 + margin, width: unit * 2 - margin / 2, height: contentHeight * 0.4 - margin }
      ].slice(0, count)
    }

    // === Creative Layouts ===
    case 'diagonal': {
      // Diagonal arrangement from top-left to bottom-right
      const size = Math.min(contentWidth, contentHeight) * 0.35
      const step = (contentWidth - size) / (Math.min(count, 4) - 1 || 1)
      const stepY = (contentHeight - size) / (Math.min(count, 4) - 1 || 1)
      return Array.from({ length: Math.min(count, 4) }, (_, i) => ({
        x: margin + i * step,
        y: startY + i * stepY,
        width: size,
        height: size * 0.75
      }))
    }

    case 'staircase': {
      // Staircase pattern
      const itemWidth = contentWidth * 0.35
      const itemHeight = contentHeight * 0.35
      const stepX = (contentWidth - itemWidth) / (Math.min(count, 5) - 1 || 1)
      const stepY = itemHeight * 0.3
      return Array.from({ length: Math.min(count, 5) }, (_, i) => ({
        x: margin + i * stepX,
        y: startY + i * stepY,
        width: itemWidth,
        height: itemHeight
      }))
    }

    case 'pyramid': {
      // Pyramid arrangement: 1 top, 2 middle, 3 bottom
      const positions: Position[] = []
      const rows = [[1], [2], [3]]
      let currentY = startY
      const rowHeight = (contentHeight - margin * 2) / 3
      
      for (let row = 0; row < Math.min(3, Math.ceil(count / 2)); row++) {
        const itemsInRow = rows[row][0]
        const itemWidth = (contentWidth - margin * (itemsInRow - 1)) / itemsInRow
        const startX = margin + (contentWidth - (itemWidth * itemsInRow + margin * (itemsInRow - 1))) / 2
        
        for (let col = 0; col < itemsInRow && positions.length < count; col++) {
          positions.push({
            x: startX + col * (itemWidth + margin),
            y: currentY,
            width: itemWidth,
            height: rowHeight
          })
        }
        currentY += rowHeight + margin
      }
      return positions
    }

    case 'scattered': {
      // Random scattered with controlled randomness
      const basePositions = [
        { x: 0.1, y: 0.1 }, { x: 0.5, y: 0.05 }, { x: 0.75, y: 0.15 },
        { x: 0.05, y: 0.5 }, { x: 0.6, y: 0.45 }, { x: 0.35, y: 0.65 }
      ]
      return Array.from({ length: Math.min(count, 6) }, (_, i) => {
        const base = basePositions[i]
        const size = 150 + (i % 3) * 30
        return {
          x: margin + base.x * (contentWidth - size),
          y: startY + base.y * (contentHeight - size * 0.75),
          width: size,
          height: size * 0.75
        }
      })
    }

    case 'circular': {
      const centerX = SLIDE_WIDTH / 2
      const centerY = startY + contentHeight / 2
      const radius = Math.min(contentWidth, contentHeight) / 3
      const imageSize = 120
      return Array.from({ length: Math.min(count, 8) }, (_, i) => {
        const angle = (i / Math.min(count, 8)) * Math.PI * 2 - Math.PI / 2
        return {
          x: centerX + Math.cos(angle) * radius - imageSize / 2,
          y: centerY + Math.sin(angle) * radius - imageSize / 2,
          width: imageSize,
          height: imageSize
        }
      })
    }

    case 'spiral': {
      const centerX = SLIDE_WIDTH / 2
      const centerY = startY + contentHeight / 2
      const baseRadius = 60
      const radiusStep = 40
      const imageSize = 100
      return Array.from({ length: Math.min(count, 8) }, (_, i) => {
        const angle = i * 0.8 - Math.PI / 2
        const radius = baseRadius + i * radiusStep
        return {
          x: centerX + Math.cos(angle) * radius - imageSize / 2,
          y: centerY + Math.sin(angle) * radius - imageSize / 2,
          width: imageSize - i * 5,
          height: imageSize - i * 5
        }
      })
    }

    // === Special Effects ===
    case 'polaroid': {
      const polaroidWidth = 160
      const polaroidHeight = 200
      const spacing = 25
      const maxItems = Math.min(count, 5)
      const totalWidth = maxItems * polaroidWidth + (maxItems - 1) * spacing
      const startX = (SLIDE_WIDTH - totalWidth) / 2
      return Array.from({ length: maxItems }, (_, i) => ({
        x: startX + i * (polaroidWidth + spacing),
        y: startY + 40 + Math.sin(i * 0.8) * 20,
        width: polaroidWidth,
        height: polaroidHeight
      }))
    }

    case 'filmstrip': {
      const maxItems = Math.min(count, 5)
      const frameWidth = (contentWidth - margin * (maxItems - 1)) / maxItems
      const frameHeight = contentHeight * 0.6
      const offsetY = startY + (contentHeight - frameHeight) / 2
      return Array.from({ length: maxItems }, (_, i) => ({
        x: margin + i * (frameWidth + margin),
        y: offsetY,
        width: frameWidth,
        height: frameHeight
      }))
    }

    case 'gallery-wall': {
      // Gallery wall with frames of different sizes
      const positions: Position[] = []
      const layouts = [
        { x: 0, y: 0, w: 0.4, h: 0.55 },
        { x: 0.42, y: 0, w: 0.28, h: 0.35 },
        { x: 0.72, y: 0, w: 0.28, h: 0.45 },
        { x: 0, y: 0.58, w: 0.25, h: 0.42 },
        { x: 0.27, y: 0.38, w: 0.35, h: 0.62 },
        { x: 0.64, y: 0.48, w: 0.36, h: 0.52 }
      ]
      for (let i = 0; i < Math.min(count, 6); i++) {
        const l = layouts[i]
        positions.push({
          x: margin + l.x * contentWidth,
          y: startY + l.y * contentHeight,
          width: l.w * contentWidth - margin,
          height: l.h * contentHeight - margin
        })
      }
      return positions
    }

    case 'collage': {
      // Overlapping collage effect
      const baseSize = Math.min(contentWidth, contentHeight) * 0.4
      const positions: Position[] = []
      const offsets = [
        { x: 0.15, y: 0.1, scale: 1.1 },
        { x: 0.45, y: 0.05, scale: 0.9 },
        { x: 0.6, y: 0.25, scale: 1.0 },
        { x: 0.1, y: 0.45, scale: 0.95 },
        { x: 0.4, y: 0.5, scale: 1.05 }
      ]
      for (let i = 0; i < Math.min(count, 5); i++) {
        const o = offsets[i]
        const size = baseSize * o.scale
        positions.push({
          x: margin + o.x * (contentWidth - size),
          y: startY + o.y * (contentHeight - size * 0.75),
          width: size,
          height: size * 0.75
        })
      }
      return positions
    }

    case 'timeline': {
      // Horizontal timeline with images
      const maxItems = Math.min(count, 6)
      const itemWidth = (contentWidth - margin * (maxItems - 1)) / maxItems
      const itemHeight = contentHeight * 0.65
      const baseY = startY + (contentHeight - itemHeight) / 2
      return Array.from({ length: maxItems }, (_, i) => ({
        x: margin + i * (itemWidth + margin),
        y: baseY + (i % 2 === 0 ? -20 : 20),
        width: itemWidth,
        height: itemHeight
      }))
    }

    case 'fullscreen':
      return [{ x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT }]

    default:
      return calculateImagePositions('grid-2x2', count)
  }
}

/**
 * Crop image to shape
 */
export async function cropImageToShape(
  slideIndex: number,
  shapeId: string,
  cropShape: 'circle' | 'rounded' | 'hexagon' | 'star'
): Promise<OperationResult<void>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    await PowerPoint.run(async (context) => {
      const shape = context.presentation.slides.getItemAt(slideIndex).shapes.getItem(shapeId)
      
      // Note: Office.js doesn't have direct crop-to-shape API
      // This is a placeholder for future implementation
      shape.load('id')
      await context.sync()
      
      console.log('[PPT Bridge] Crop to shape:', cropShape, 'for shape:', shapeId)
    })

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Apply filter effect to image
 */
export async function applyImageFilter(
  slideIndex: number,
  shapeId: string,
  filter: ImageFilterType,
  intensity?: number
): Promise<OperationResult<void>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    await PowerPoint.run(async (context) => {
      const shape = context.presentation.slides.getItemAt(slideIndex).shapes.getItem(shapeId)
      
      // Note: Office.js has limited image filter support
      // We can use fill.transparency for some effects
      shape.load(['fill/transparency'])
      await context.sync()
      
      const value = intensity ?? 50
      
      switch (filter) {
        case 'brightness':
          // Simulate brightness with transparency
          shape.fill.transparency = Math.max(0, Math.min(100, 100 - value)) / 100
          break
        case 'none':
          shape.fill.transparency = 0
          break
        default:
          console.log('[PPT Bridge] Filter not directly supported:', filter)
      }
      
      await context.sync()
    })

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Align selected images
 */
export async function alignImages(
  slideIndex: number,
  shapeIds: string[],
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): Promise<OperationResult<void>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  if (shapeIds.length < 2) {
    return { success: false, error: 'Need at least 2 shapes to align' }
  }

  try {
    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      const shapeRefs = shapeIds.map(id => shapes.getItem(id))
      
      // Load positions
      shapeRefs.forEach(shape => shape.load(['left', 'top', 'width', 'height']))
      await context.sync()
      
      // Calculate alignment target
      const positions = shapeRefs.map(shape => ({
        left: shape.left,
        top: shape.top,
        width: shape.width,
        height: shape.height
      }))
      
      let targetValue: number
      
      switch (alignment) {
        case 'left':
          targetValue = Math.min(...positions.map(p => p.left))
          shapeRefs.forEach(shape => { shape.left = targetValue })
          break
        case 'right':
          targetValue = Math.max(...positions.map(p => p.left + p.width))
          shapeRefs.forEach((shape, i) => { shape.left = targetValue - positions[i].width })
          break
        case 'center':
          targetValue = positions.reduce((sum, p) => sum + p.left + p.width / 2, 0) / positions.length
          shapeRefs.forEach((shape, i) => { shape.left = targetValue - positions[i].width / 2 })
          break
        case 'top':
          targetValue = Math.min(...positions.map(p => p.top))
          shapeRefs.forEach(shape => { shape.top = targetValue })
          break
        case 'bottom':
          targetValue = Math.max(...positions.map(p => p.top + p.height))
          shapeRefs.forEach((shape, i) => { shape.top = targetValue - positions[i].height })
          break
        case 'middle':
          targetValue = positions.reduce((sum, p) => sum + p.top + p.height / 2, 0) / positions.length
          shapeRefs.forEach((shape, i) => { shape.top = targetValue - positions[i].height / 2 })
          break
      }
      
      await context.sync()
    })

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Distribute images evenly
 */
export async function distributeImages(
  slideIndex: number,
  shapeIds: string[],
  direction: 'horizontal' | 'vertical'
): Promise<OperationResult<void>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  if (shapeIds.length < 3) {
    return { success: false, error: 'Need at least 3 shapes to distribute' }
  }

  try {
    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      const shapeRefs = shapeIds.map(id => shapes.getItem(id))
      
      shapeRefs.forEach(shape => shape.load(['left', 'top', 'width', 'height']))
      await context.sync()
      
      const positions = shapeRefs.map(shape => ({
        left: shape.left,
        top: shape.top,
        width: shape.width,
        height: shape.height
      }))
      
      if (direction === 'horizontal') {
        // Sort by left position
        const sorted = positions.map((p, i) => ({ ...p, index: i })).sort((a, b) => a.left - b.left)
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        const totalWidth = (last.left + last.width) - first.left
        const spacing = (totalWidth - positions.reduce((sum, p) => sum + p.width, 0)) / (positions.length - 1)
        
        let currentX = first.left
        sorted.forEach((item, i) => {
          if (i > 0) {
            currentX += sorted[i - 1].width + spacing
          }
          shapeRefs[item.index].left = currentX
        })
      } else {
        // Sort by top position
        const sorted = positions.map((p, i) => ({ ...p, index: i })).sort((a, b) => a.top - b.top)
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        const totalHeight = (last.top + last.height) - first.top
        const spacing = (totalHeight - positions.reduce((sum, p) => sum + p.height, 0)) / (positions.length - 1)
        
        let currentY = first.top
        sorted.forEach((item, i) => {
          if (i > 0) {
            currentY += sorted[i - 1].height + spacing
          }
          shapeRefs[item.index].top = currentY
        })
      }
      
      await context.sync()
    })

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get all images on a slide
 * Uses PowerPoint.ShapeType.image to identify image shapes
 */
export async function getSlideImages(
  slideIndex: number
): Promise<OperationResult<{ images: Array<{ id: string; name: string; position: Position }> }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    const images: Array<{ id: string; name: string; position: Position }> = []

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      shapes.load(['items/id', 'items/name', 'items/left', 'items/top', 'items/width', 'items/height', 'items/type'])
      await context.sync()
      
      for (const shape of shapes.items) {
        // Check if shape is an image using PowerPoint.ShapeType.image (API 1.4+)
        // Also check for shapes with image fill (created via addGeometricShape + fill.setImage)
        const isImage = shape.type === PowerPoint.ShapeType.image || 
                        shape.type === 'Image' ||
                        shape.name?.toLowerCase().includes('image') ||
                        shape.name?.toLowerCase().includes('picture')
        
        if (isImage) {
          images.push({
            id: shape.id,
            name: shape.name || `图片 ${images.length + 1}`,
            position: {
              x: shape.left,
              y: shape.top,
              width: shape.width,
              height: shape.height
            }
          })
        }
      }
    })

    return { success: true, data: { images } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get selected shapes on a slide (for re-layout)
 * Note: Office.js doesn't have direct selection API for shapes
 * This returns all shapes that could be images
 */
export async function getSelectedImages(
  slideIndex: number
): Promise<OperationResult<{ images: Array<{ id: string; name: string; position: Position }> }>> {
  // Currently, Office.js PowerPoint API doesn't support getting selected shapes directly
  // We return all images on the slide as a workaround
  return getSlideImages(slideIndex)
}

// Export layout options for UI - Extended with professional layouts
export const IMAGE_LAYOUT_OPTIONS: Array<{
  id: ImageLayoutType
  name: string
  description: string
  minImages: number
  maxImages: number
  category: 'basic' | 'featured' | 'magazine' | 'creative' | 'special'
}> = [
  // Basic Grid Layouts
  { id: 'single', name: '单图居中', description: '单张图片居中显示', minImages: 1, maxImages: 1, category: 'basic' },
  { id: 'side-by-side', name: '左右并排', description: '两张图片并排显示', minImages: 2, maxImages: 2, category: 'basic' },
  { id: 'stacked', name: '上下堆叠', description: '图片垂直堆叠', minImages: 2, maxImages: 4, category: 'basic' },
  { id: 'grid-1x3', name: '横排三图', description: '三张图片横向排列', minImages: 3, maxImages: 3, category: 'basic' },
  { id: 'grid-1x4', name: '横排四图', description: '四张图片横向排列', minImages: 4, maxImages: 4, category: 'basic' },
  { id: 'grid-2x2', name: '2x2 网格', description: '四宫格布局', minImages: 2, maxImages: 4, category: 'basic' },
  { id: 'grid-2x3', name: '2x3 网格', description: '六宫格布局', minImages: 3, maxImages: 6, category: 'basic' },
  { id: 'grid-3x3', name: '3x3 网格', description: '九宫格布局', minImages: 4, maxImages: 9, category: 'basic' },
  
  // Featured Layouts
  { id: 'featured-left', name: '左侧突出', description: '左大右小布局', minImages: 2, maxImages: 3, category: 'featured' },
  { id: 'featured-right', name: '右侧突出', description: '左小右大布局', minImages: 2, maxImages: 3, category: 'featured' },
  { id: 'featured-top', name: '顶部突出', description: '上大下小布局', minImages: 2, maxImages: 4, category: 'featured' },
  { id: 'featured-center', name: '中心突出', description: '中心大四角小', minImages: 2, maxImages: 5, category: 'featured' },
  
  // Magazine/Editorial Layouts
  { id: 'magazine-1', name: '杂志风格1', description: '经典杂志排版', minImages: 2, maxImages: 3, category: 'magazine' },
  { id: 'magazine-2', name: '杂志风格2', description: 'L型杂志排版', minImages: 3, maxImages: 4, category: 'magazine' },
  { id: 'pinterest', name: '瀑布流', description: 'Pinterest风格', minImages: 3, maxImages: 6, category: 'magazine' },
  { id: 'mosaic', name: '马赛克', description: '不规则拼贴', minImages: 3, maxImages: 5, category: 'magazine' },
  { id: 'gallery-wall', name: '画廊墙', description: '艺术画廊风格', minImages: 3, maxImages: 6, category: 'magazine' },
  
  // Creative Layouts
  { id: 'diagonal', name: '对角线', description: '斜向排列', minImages: 2, maxImages: 4, category: 'creative' },
  { id: 'staircase', name: '阶梯式', description: '楼梯状排列', minImages: 3, maxImages: 5, category: 'creative' },
  { id: 'pyramid', name: '金字塔', description: '金字塔形排列', minImages: 3, maxImages: 6, category: 'creative' },
  { id: 'scattered', name: '随机散布', description: '自然散落效果', minImages: 2, maxImages: 6, category: 'creative' },
  { id: 'circular', name: '环形排列', description: '圆形环绕排列', minImages: 3, maxImages: 8, category: 'creative' },
  { id: 'spiral', name: '螺旋排列', description: '螺旋状排列', minImages: 3, maxImages: 8, category: 'creative' },
  
  // Special Effects
  { id: 'polaroid', name: '拍立得', description: '复古拍立得风格', minImages: 2, maxImages: 5, category: 'special' },
  { id: 'filmstrip', name: '胶片条', description: '电影胶片风格', minImages: 3, maxImages: 5, category: 'special' },
  { id: 'collage', name: '拼贴画', description: '重叠拼贴效果', minImages: 2, maxImages: 5, category: 'special' },
  { id: 'timeline', name: '时间线', description: '时间轴展示', minImages: 3, maxImages: 6, category: 'special' },
  { id: 'fullscreen', name: '全屏展示', description: '单张全屏显示', minImages: 1, maxImages: 1, category: 'special' },
]
