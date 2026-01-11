/**
 * PPT Bridge Operations - Code
 * 
 * Operations for adding code blocks with syntax highlighting.
 * Based on official Office.js PowerPoint API.
 */

import type { OperationResult, Position } from './types'
import { isOfficeAvailable, toShapeAddOptions } from './utils'
import { highlightCode } from '../../highlighter'

/**
 * Add code block to a slide with syntax highlighting
 */
export async function addCodeToSlide(
  slideIndex: number,
  code: string,
  language: string,
  position?: Position
): Promise<OperationResult<{ shapeId: string; lineCount: number }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    // Process highlighting (for metadata)
    highlightCode(code, language)
    const lineCount = code.split('\n').length
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      const rect = position || { x: 40, y: 140, width: 880, height: 400 }
      
      // Create a background shape for the code block using official API
      const bgShape = shapes.addGeometricShape(
        PowerPoint.GeometricShapeType.rectangle,
        {
          left: rect.x - 10,
          top: rect.y - 10,
          width: rect.width + 20,
          height: rect.height + 20
        }
      )
      bgShape.fill.setSolidColor('#1E1E1E')
      bgShape.lineFormat.visible = false
      bgShape.name = 'CodeBackground'
      
      // Add code as text box using official addTextBox API
      const codeBox = shapes.addTextBox(code, toShapeAddOptions(rect))
      codeBox.left = rect.x
      codeBox.top = rect.y
      codeBox.width = rect.width
      codeBox.height = rect.height
      
      // Style as code using official TextFrame API
      codeBox.textFrame.textRange.font.name = 'Consolas'
      codeBox.textFrame.textRange.font.size = 14
      codeBox.textFrame.textRange.font.color = '#D4D4D4'
      codeBox.name = 'CodeBlock'
      
      codeBox.load('id')
      await context.sync()
      
      shapeId = codeBox.id
    })

    return { success: true, data: { shapeId, lineCount } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Add inline code snippet
 */
export async function addInlineCode(
  slideIndex: number,
  code: string,
  position: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes

      // Add small background using official API
      const bgShape = shapes.addGeometricShape(
        PowerPoint.GeometricShapeType.roundRectangle,
        {
          left: position.x - 4,
          top: position.y - 2,
          width: position.width + 8,
          height: position.height + 4
        }
      )
      bgShape.fill.setSolidColor('#F0F0F0')
      bgShape.lineFormat.visible = false
      
      // Add code text using official addTextBox API
      const codeBox = shapes.addTextBox(code, toShapeAddOptions(position))
      codeBox.left = position.x
      codeBox.top = position.y
      codeBox.width = position.width
      codeBox.height = position.height
      
      codeBox.textFrame.textRange.font.name = 'Consolas'
      codeBox.textFrame.textRange.font.size = 14
      codeBox.textFrame.textRange.font.color = '#333333'
      
      codeBox.load('id')
      await context.sync()
      
      shapeId = codeBox.id
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
 * Supported programming languages for syntax highlighting
 */
export const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
  'html', 'css', 'scss', 'json', 'yaml', 'xml', 'markdown',
  'sql', 'bash', 'powershell', 'dockerfile', 'plaintext'
] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]
