/**
 * PPT Bridge Operations - Media
 * 
 * Operations for adding images and media content.
 * Based on official Office.js PowerPoint API.
 * @see https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/bind-shapes-in-presentation
 */

import type { OperationResult, Position } from './types'
import { isOfficeAvailable, toShapeAddOptions } from './utils'

/**
 * Add image to a slide using Shape.fill.setImage()
 * @see https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/bind-shapes-in-presentation
 * 
 * Note: This creates a rectangle shape and fills it with the image.
 * The image data should be a Base64-encoded string.
 */
export async function addImageToSlide(
  slideIndex: number,
  base64ImageData: string,
  position?: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    // Remove data URL prefix if present
    let base64 = base64ImageData
    if (base64ImageData.startsWith('data:')) {
      base64 = base64ImageData.split(',')[1]
    }

    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      const rect = position || { x: 100, y: 100, width: 760, height: 400 }
      
      // Create a rectangle shape using official API
      const imageShape = shapes.addGeometricShape(
        PowerPoint.GeometricShapeType.rectangle,
        toShapeAddOptions(rect)
      )
      
      imageShape.left = rect.x
      imageShape.top = rect.y
      imageShape.width = rect.width
      imageShape.height = rect.height
      
      // Fill shape with Base64-encoded image using official setImage API
      imageShape.fill.setImage(base64)
      imageShape.lineFormat.visible = false
      imageShape.name = 'Image'
      
      imageShape.load('id')
      await context.sync()
      
      shapeId = imageShape.id
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
 * Add image from URL (fetches and converts to base64)
 */
export async function addImageFromUrl(
  slideIndex: number,
  imageUrl: string,
  position?: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    // Fetch image and convert to base64
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // Remove data URL prefix
        const base64Data = result.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    return addImageToSlide(slideIndex, base64, position)
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Add video placeholder to a slide
 * Note: Office.js doesn't support direct video insertion,
 * so we create a placeholder shape
 */
export async function addVideoPlaceholder(
  slideIndex: number,
  videoUrl: string,
  position?: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      const rect = position || { x: 100, y: 100, width: 760, height: 400 }
      
      // Create placeholder for video
      const placeholder = shapes.addTextBox(
        `[VIDEO]\n${videoUrl}\n\nVideo will be embedded here`
      )
      
      placeholder.left = rect.x
      placeholder.top = rect.y
      placeholder.width = rect.width
      placeholder.height = rect.height
      placeholder.fill.setSolidColor('#2D2D2D')
      placeholder.textFrame.textRange.font.size = 14
      placeholder.textFrame.textRange.font.color = '#FFFFFF'
      placeholder.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
      placeholder.name = 'VideoPlaceholder'
      
      placeholder.load('id')
      await context.sync()
      
      shapeId = placeholder.id
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
 * Add icon/emoji to a slide
 */
export async function addIconToSlide(
  slideIndex: number,
  icon: string,
  position: Position,
  size: number = 48
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes

      const iconBox = shapes.addTextBox(icon, toShapeAddOptions(position))
      iconBox.left = position.x
      iconBox.top = position.y
      iconBox.width = position.width
      iconBox.height = position.height
      
      iconBox.textFrame.textRange.font.size = size
      iconBox.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
      iconBox.name = 'Icon'
      
      iconBox.load('id')
      await context.sync()
      
      shapeId = iconBox.id
    })

    return { success: true, data: { shapeId } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
