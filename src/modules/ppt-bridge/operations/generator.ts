/**
 * PPT Bridge Operations - Generator
 * 
 * Operations for generating multiple slides from content.
 * Based on official Office.js PowerPoint API.
 */

import type { SlideContent } from '../../../types'
import type { OperationResult, Position } from './types'
import { isOfficeAvailable } from './utils'
import { calculateLayout } from '../../layout/engine'

/**
 * Generate multiple slides from parsed content
 * Uses official PowerPoint API for slide and shape creation
 */
export async function generateSlides(
  slides: SlideContent[]
): Promise<OperationResult<{ createdCount: number; slideIds: string[] }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    const slideIds: string[] = []

    await PowerPoint.run(async (context) => {
      const presentation = context.presentation

      for (const slideContent of slides) {
        // Add new slide using official API
        presentation.slides.add()
        presentation.slides.load('items')
        await context.sync()
        
        // Get the newly added slide
        const newSlideIndex = presentation.slides.items.length - 1
        const newSlide = presentation.slides.getItemAt(newSlideIndex)
        newSlide.load('id')
        await context.sync()
        
        slideIds.push(newSlide.id)
        
        const layout = calculateLayout(slideContent)
        const shapes = newSlide.shapes

        // Add title using official addTextBox API
        if (slideContent.title) {
          const titleShape = shapes.addTextBox(slideContent.title, {
            left: layout.title.x,
            top: layout.title.y,
            width: layout.title.width,
            height: layout.title.height
          })
          titleShape.textFrame.textRange.font.size = 32
          titleShape.textFrame.textRange.font.bold = true
          titleShape.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
        }

        // Add content blocks
        for (let i = 0; i < slideContent.blocks.length; i++) {
          const block = slideContent.blocks[i]
          const rect = layout.blocks[i] as Position
          if (!rect) continue

          await addBlockToSlide(shapes, block, rect)
        }

        await context.sync()
      }
    })

    return { 
      success: true, 
      data: { createdCount: slideIds.length, slideIds } 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Add a content block to shapes collection (internal helper)
 */
async function addBlockToSlide(
  shapes: PowerPoint.ShapeCollection,
  block: SlideContent['blocks'][0],
  rect: Position
): Promise<void> {
  switch (block.type) {
    case 'text': {
      const textBox = shapes.addTextBox(block.content, {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height
      })
      textBox.textFrame.textRange.font.size = 18
      break
    }

    case 'list': {
      const bulletText = block.content
        .split('\n')
        .map(item => `• ${item.trim()}`)
        .join('\n')
      const listBox = shapes.addTextBox(bulletText, {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height
      })
      listBox.textFrame.textRange.font.size = 16
      break
    }

    case 'code': {
      // Add background using official addGeometricShape
      const bgShape = shapes.addGeometricShape(
        PowerPoint.GeometricShapeType.rectangle,
        {
          left: rect.x - 5,
          top: rect.y - 5,
          width: rect.width + 10,
          height: rect.height + 10
        }
      )
      bgShape.fill.setSolidColor('#1E1E1E')
      bgShape.lineFormat.visible = false
      
      // Add code text
      const codeBox = shapes.addTextBox(block.content, {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height
      })
      codeBox.textFrame.textRange.font.name = 'Consolas'
      codeBox.textFrame.textRange.font.size = 12
      codeBox.textFrame.textRange.font.color = '#D4D4D4'
      break
    }

    case 'mermaid': {
      const mermaidBox = shapes.addTextBox(
        `[Mermaid Diagram]\n${block.content.substring(0, 200)}...`,
        {
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height
        }
      )
      mermaidBox.fill.setSolidColor('#F5F5F5')
      mermaidBox.textFrame.textRange.font.size = 12
      mermaidBox.textFrame.textRange.font.name = 'Consolas'
      break
    }

    case 'image': {
      const imageBox = shapes.addTextBox('[Image Placeholder]', {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height
      })
      imageBox.fill.setSolidColor('#E8E8E8')
      imageBox.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
      break
    }
  }
}

/**
 * Generate a single slide from template
 */
export async function generateSlideFromTemplate(
  templateId: string,
  data: Record<string, string>
): Promise<OperationResult<{ slideId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let slideId = ''

    await PowerPoint.run(async (context) => {
      const presentation = context.presentation
      
      // Add new slide using official API
      presentation.slides.add()
      presentation.slides.load('items')
      await context.sync()
      
      const newSlideIndex = presentation.slides.items.length - 1
      const newSlide = presentation.slides.getItemAt(newSlideIndex)
      newSlide.load('id')
      await context.sync()
      
      slideId = newSlide.id
      const shapes = newSlide.shapes

      // Apply template based on templateId
      switch (templateId) {
        case 'title':
          if (data.title) {
            const titleShape = shapes.addTextBox(data.title, {
              left: 40, top: 200, width: 880, height: 120
            })
            titleShape.textFrame.textRange.font.size = 44
            titleShape.textFrame.textRange.font.bold = true
            titleShape.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
          }
          if (data.subtitle) {
            const subtitleShape = shapes.addTextBox(data.subtitle, {
              left: 40, top: 340, width: 880, height: 60
            })
            subtitleShape.textFrame.textRange.font.size = 24
            subtitleShape.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
          }
          break

        case 'content':
          if (data.title) {
            const titleShape = shapes.addTextBox(data.title, {
              left: 40, top: 40, width: 880, height: 80
            })
            titleShape.textFrame.textRange.font.size = 32
            titleShape.textFrame.textRange.font.bold = true
          }
          if (data.content) {
            const contentShape = shapes.addTextBox(data.content, {
              left: 40, top: 140, width: 880, height: 360
            })
            contentShape.textFrame.textRange.font.size = 18
          }
          break

        case 'two-column':
          if (data.title) {
            const titleShape = shapes.addTextBox(data.title, {
              left: 40, top: 40, width: 880, height: 80
            })
            titleShape.textFrame.textRange.font.size = 32
            titleShape.textFrame.textRange.font.bold = true
          }
          if (data.left) {
            const leftShape = shapes.addTextBox(data.left, {
              left: 40, top: 140, width: 420, height: 360
            })
            leftShape.textFrame.textRange.font.size = 16
          }
          if (data.right) {
            const rightShape = shapes.addTextBox(data.right, {
              left: 500, top: 140, width: 420, height: 360
            })
            rightShape.textFrame.textRange.font.size = 16
          }
          break

        case 'image-focus':
          if (data.title) {
            const titleShape = shapes.addTextBox(data.title, {
              left: 40, top: 40, width: 880, height: 60
            })
            titleShape.textFrame.textRange.font.size = 28
            titleShape.textFrame.textRange.font.bold = true
          }
          // Add image placeholder area
          const imagePlaceholder = shapes.addGeometricShape(
            PowerPoint.GeometricShapeType.rectangle,
            { left: 40, top: 120, width: 880, height: 320 }
          )
          imagePlaceholder.fill.setSolidColor('#F0F0F0')
          imagePlaceholder.lineFormat.color = '#CCCCCC'
          // Add placeholder text
          const placeholderText = shapes.addTextBox('[ 图片区域 - 请插入图片 ]', {
            left: 40, top: 250, width: 880, height: 60
          })
          placeholderText.textFrame.textRange.font.size = 16
          placeholderText.textFrame.textRange.font.color = '#888888'
          placeholderText.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
          
          if (data.content) {
            const captionShape = shapes.addTextBox(data.content, {
              left: 40, top: 460, width: 880, height: 60
            })
            captionShape.textFrame.textRange.font.size = 14
            captionShape.textFrame.textRange.font.color = '#666666'
          }
          break

        case 'comparison':
          if (data.title) {
            const titleShape = shapes.addTextBox(data.title, {
              left: 40, top: 40, width: 880, height: 80
            })
            titleShape.textFrame.textRange.font.size = 32
            titleShape.textFrame.textRange.font.bold = true
          }
          // Left comparison box
          const leftBg = shapes.addGeometricShape(
            PowerPoint.GeometricShapeType.rectangle,
            { left: 40, top: 140, width: 420, height: 360 }
          )
          leftBg.fill.setSolidColor('#E8F5E9')
          leftBg.lineFormat.color = '#4CAF50'
          if (data.left) {
            const leftText = shapes.addTextBox(data.left, {
              left: 50, top: 150, width: 400, height: 340
            })
            leftText.textFrame.textRange.font.size = 16
          }
          // Right comparison box
          const rightBg = shapes.addGeometricShape(
            PowerPoint.GeometricShapeType.rectangle,
            { left: 500, top: 140, width: 420, height: 360 }
          )
          rightBg.fill.setSolidColor('#FFEBEE')
          rightBg.lineFormat.color = '#F44336'
          if (data.right) {
            const rightText = shapes.addTextBox(data.right, {
              left: 510, top: 150, width: 400, height: 340
            })
            rightText.textFrame.textRange.font.size = 16
          }
          break

        default:
          // Default to content layout
          console.log('[PPT Bridge] Unknown template, using content layout:', templateId)
          if (data.title) {
            const titleShape = shapes.addTextBox(data.title, {
              left: 40, top: 40, width: 880, height: 80
            })
            titleShape.textFrame.textRange.font.size = 32
            titleShape.textFrame.textRange.font.bold = true
          }
          if (data.content) {
            const contentShape = shapes.addTextBox(data.content, {
              left: 40, top: 140, width: 880, height: 360
            })
            contentShape.textFrame.textRange.font.size = 18
          }
      }

      await context.sync()
    })

    return { success: true, data: { slideId } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Available slide templates
 */
export const SLIDE_TEMPLATES = [
  { id: 'title', name: 'Title Slide', fields: ['title', 'subtitle'] },
  { id: 'content', name: 'Content Slide', fields: ['title', 'content'] },
  { id: 'two-column', name: 'Two Column', fields: ['title', 'left', 'right'] },
  { id: 'code-focus', name: 'Code Focus', fields: ['title', 'code', 'language'] },
  { id: 'image-focus', name: 'Image Focus', fields: ['title', 'image', 'caption'] },
  { id: 'comparison', name: 'Comparison', fields: ['title', 'before', 'after'] },
] as const

export type SlideTemplateId = typeof SLIDE_TEMPLATES[number]['id']
