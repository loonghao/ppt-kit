/**
 * PPT Bridge Operations - Content
 * 
 * Operations for adding content to slides (text, lists, shapes).
 * Based on official Office.js PowerPoint API.
 * @see https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/shapes
 */

import type { 
  OperationResult, 
  Position,
  GeometricShapeType
} from './types'
import type { ContentBlock } from '../../../types'
import { isOfficeAvailable, toShapeAddOptions } from './utils'

/**
 * Add text box to a slide
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.shapecollection#powerpoint-powerpoint-shapecollection-addtextbox-member(1)
 */
export async function addTextToSlide(
  slideIndex: number,
  text: string,
  position?: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      // Use official addTextBox API
      const textbox = shapes.addTextBox(text, position ? toShapeAddOptions(position) : undefined)
      
      // Set position and size if provided
      if (position) {
        textbox.left = position.x
        textbox.top = position.y
        textbox.width = position.width
        textbox.height = position.height
      } else {
        // Default position
        textbox.left = 40
        textbox.top = 140
        textbox.width = 880
        textbox.height = 360
      }
      
      // Style the text
      textbox.textFrame.textRange.font.size = 18
      textbox.textFrame.textRange.font.name = 'Segoe UI'
      
      textbox.load('id')
      await context.sync()
      
      shapeId = textbox.id
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
 * Add bullet list to a slide
 */
export async function addListToSlide(
  slideIndex: number,
  items: string[],
  position?: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''
    const bulletText = items.map(item => `• ${item.trim()}`).join('\n')

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      const listBox = shapes.addTextBox(bulletText)
      
      if (position) {
        listBox.left = position.x
        listBox.top = position.y
        listBox.width = position.width
        listBox.height = position.height
      } else {
        listBox.left = 40
        listBox.top = 140
        listBox.width = 880
        listBox.height = 360
      }
      
      listBox.textFrame.textRange.font.size = 16
      listBox.textFrame.textRange.font.name = 'Segoe UI'
      
      listBox.load('id')
      await context.sync()
      
      shapeId = listBox.id
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
 * Add geometric shape to a slide
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.shapecollection#powerpoint-powerpoint-shapecollection-addgeometricshape-member(1)
 */
export async function addShapeToSlide(
  slideIndex: number,
  shapeType: GeometricShapeType,
  position: Position,
  options?: {
    fillColor?: string
    name?: string
  }
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      // Use official addGeometricShape API with GeometricShapeType
      const shape = shapes.addGeometricShape(
        shapeType as unknown as PowerPoint.GeometricShapeType,
        toShapeAddOptions(position)
      )

      // Set position and size
      shape.left = position.x
      shape.top = position.y
      shape.width = position.width
      shape.height = position.height

      // Apply fill color if provided
      if (options?.fillColor) {
        shape.fill.setSolidColor(options.fillColor)
      }

      // Set name if provided
      if (options?.name) {
        shape.name = options.name
      }

      shape.load('id')
      await context.sync()

      shapeId = shape.id
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
 * Add a line to a slide
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.shapecollection#powerpoint-powerpoint-shapecollection-addline-member(1)
 */
export async function addLineToSlide(
  slideIndex: number,
  connectorType: 'straight' | 'elbow' | 'curve',
  position: Position,
  options?: {
    name?: string
  }
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      // Use official addLine API
      const line = shapes.addLine(
        connectorType as unknown as PowerPoint.ConnectorType,
        toShapeAddOptions(position)
      )

      if (options?.name) {
        line.name = options.name
      }

      line.load('id')
      await context.sync()

      shapeId = line.id
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
 * Add a content block to a slide (internal helper)
 */
export async function addContentBlockToSlide(
  slideIndex: number,
  block: ContentBlock,
  rect: Position
): Promise<OperationResult<void>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes

      switch (block.type) {
        case 'text': {
          const textBox = shapes.addTextBox(block.content)
          textBox.left = rect.x
          textBox.top = rect.y
          textBox.width = rect.width
          textBox.height = rect.height
          textBox.textFrame.textRange.font.size = 18
          break
        }

        case 'list': {
          const bulletText = block.content
            .split('\n')
            .map(item => `• ${item.trim()}`)
            .join('\n')
          const listBox = shapes.addTextBox(bulletText)
          listBox.left = rect.x
          listBox.top = rect.y
          listBox.width = rect.width
          listBox.height = rect.height
          listBox.textFrame.textRange.font.size = 16
          break
        }

        case 'code': {
          // Add background rectangle
          const bgShape = shapes.addGeometricShape(PowerPoint.GeometricShapeType.rectangle, {
            left: rect.x - 5,
            top: rect.y - 5,
            width: rect.width + 10,
            height: rect.height + 10
          })
          bgShape.fill.setSolidColor('#1E1E1E')
          bgShape.lineFormat.visible = false
          
          // Add code text
          const codeBox = shapes.addTextBox(block.content)
          codeBox.left = rect.x
          codeBox.top = rect.y
          codeBox.width = rect.width
          codeBox.height = rect.height
          codeBox.textFrame.textRange.font.name = 'Consolas'
          codeBox.textFrame.textRange.font.size = 12
          codeBox.textFrame.textRange.font.color = '#D4D4D4'
          break
        }

        case 'mermaid': {
          const mermaidBox = shapes.addTextBox(
            `[Mermaid Diagram]\n${block.content.substring(0, 200)}...`
          )
          mermaidBox.left = rect.x
          mermaidBox.top = rect.y
          mermaidBox.width = rect.width
          mermaidBox.height = rect.height
          mermaidBox.fill.setSolidColor('#F5F5F5')
          mermaidBox.textFrame.textRange.font.size = 12
          mermaidBox.textFrame.textRange.font.name = 'Consolas'
          break
        }

        case 'image': {
          const imageBox = shapes.addTextBox('[Image Placeholder]')
          imageBox.left = rect.x
          imageBox.top = rect.y
          imageBox.width = rect.width
          imageBox.height = rect.height
          imageBox.fill.setSolidColor('#E8E8E8')
          imageBox.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
          break
        }
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
