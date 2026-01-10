import type { SlideContent, ContentBlock } from '../../types'
import { calculateLayout } from '../layout/engine'
import { highlightCode } from '../highlighter'
import { renderMermaid, svgToPng } from '../mermaid/renderer'

/**
 * Generate PowerPoint slides from parsed content
 */
export async function generatePPT(slides: SlideContent[]): Promise<void> {
  await PowerPoint.run(async (context) => {
    const presentation = context.presentation
    
    for (const slide of slides) {
      await addSlide(context, presentation, slide)
    }
    
    await context.sync()
  })
}

/**
 * Add a single slide to the presentation
 */
async function addSlide(
  context: PowerPoint.RequestContext,
  presentation: PowerPoint.Presentation,
  slide: SlideContent
): Promise<void> {
  // Add new slide
  const newSlide = presentation.slides.add()
  await context.sync()
  
  // Calculate layout
  const layout = calculateLayout(slide)
  
  // Add title
  if (slide.title) {
    await addTextShape(
      newSlide,
      slide.title,
      layout.title,
      { fontSize: 32, bold: true }
    )
  }
  
  // Add content blocks
  for (let i = 0; i < slide.blocks.length; i++) {
    const block = slide.blocks[i]
    const rect = layout.blocks[i]
    
    if (!rect) continue
    
    await addContentBlock(newSlide, block, rect)
  }
}

/**
 * Add a content block to a slide
 */
async function addContentBlock(
  slide: PowerPoint.Slide,
  block: ContentBlock,
  rect: { x: number; y: number; width: number; height: number }
): Promise<void> {
  switch (block.type) {
    case 'text':
      await addTextShape(slide, block.content, rect, { fontSize: 18 })
      break
      
    case 'list':
      await addListShape(slide, block.content, rect)
      break
      
    case 'code':
      await addCodeShape(slide, block.content, block.language || 'plaintext', rect)
      break
      
    case 'mermaid':
      await addMermaidShape(slide, block.content, rect)
      break
      
    case 'image':
      await addImageShape(slide, block.content, rect)
      break
  }
}

/**
 * Add a text shape to a slide
 */
async function addTextShape(
  slide: PowerPoint.Slide,
  text: string,
  rect: { x: number; y: number; width: number; height: number },
  options: { fontSize?: number; bold?: boolean } = {}
): Promise<void> {
  const shape = slide.shapes.addTextBox(text, {
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
  })
  
  // Note: Font formatting requires additional API calls
  // This is a simplified implementation
}

/**
 * Add a list shape to a slide
 */
async function addListShape(
  slide: PowerPoint.Slide,
  content: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<void> {
  const items = content.split('\n')
  const bulletText = items.map(item => `• ${item}`).join('\n')
  
  await addTextShape(slide, bulletText, rect, { fontSize: 16 })
}

/**
 * Add a code block shape to a slide
 */
async function addCodeShape(
  slide: PowerPoint.Slide,
  code: string,
  language: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<void> {
  // Highlight code
  const highlighted = highlightCode(code, language)
  
  // For now, add as plain text with monospace indication
  // Full rich text formatting would require more complex implementation
  const shape = slide.shapes.addTextBox(code, {
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
  })
  
  // Store highlighted data for potential future use
  console.log('Code highlighted:', highlighted.language)
}

/**
 * Add a mermaid diagram shape to a slide
 */
async function addMermaidShape(
  slide: PowerPoint.Slide,
  mermaidCode: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<void> {
  // Render mermaid to SVG then PNG
  const result = await renderMermaid(mermaidCode)
  const pngDataUrl = await svgToPng(result.svg)
  
  // Add as image
  await addImageShape(slide, pngDataUrl, rect)
}

/**
 * Add an image shape to a slide
 */
async function addImageShape(
  slide: PowerPoint.Slide,
  imageUrl: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<void> {
  // Extract base64 data if it's a data URL
  let base64Data = imageUrl
  if (imageUrl.startsWith('data:')) {
    base64Data = imageUrl.split(',')[1]
  }
  
  slide.shapes.addImage(base64Data, {
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
  })
}

/**
 * Create a new slide with specific layout
 */
export async function createSlide(title: string, layoutType?: string): Promise<string> {
  let slideId = ''
  
  await PowerPoint.run(async (context) => {
    const slide = context.presentation.slides.add()
    slide.load('id')
    await context.sync()
    
    slideId = slide.id
    
    if (title) {
      slide.shapes.addTextBox(title, {
        left: 40,
        top: 40,
        width: 880,
        height: 80,
      })
    }
    
    await context.sync()
  })
  
  return slideId
}

/**
 * Add content to an existing slide
 */
export async function addContent(
  slideId: string,
  content: string,
  contentType: 'text' | 'code' | 'image',
  position?: { x: number; y: number; width: number; height: number }
): Promise<void> {
  await PowerPoint.run(async (context) => {
    const slides = context.presentation.slides
    slides.load('items/id')
    await context.sync()
    
    const slide = slides.items.find(s => s.id === slideId)
    if (!slide) {
      console.error(`Slide ${slideId} not found`)
      return
    }
    
    const rect = position || { x: 40, y: 140, width: 880, height: 360 }
    
    switch (contentType) {
      case 'text':
        slide.shapes.addTextBox(content, rect)
        break
      case 'code':
        slide.shapes.addTextBox(content, rect)
        break
      case 'image':
        slide.shapes.addImage(content, rect)
        break
    }
    
    await context.sync()
  })
}

/**
 * Get current presentation info
 */
export async function getPresentationInfo(): Promise<{
  slideCount: number
  currentSlideIndex: number
}> {
  let info = { slideCount: 0, currentSlideIndex: 0 }
  
  await PowerPoint.run(async (context) => {
    const presentation = context.presentation
    presentation.load('slides')
    await context.sync()
    
    info.slideCount = presentation.slides.items.length
    // Note: Getting current slide index requires additional API
  })
  
  return info
}
