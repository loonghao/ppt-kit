/**
 * PPT Bridge Operations - Slides
 * 
 * Operations for slide management (create, delete).
 * Based on official Office.js PowerPoint API.
 * @see https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/add-slides
 */

import type { 
  OperationResult, 
  LayoutType
} from './types'
import { isOfficeAvailable, getTitleRect } from './utils'

/**
 * Create a new slide
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.slidecollection#powerpoint-powerpoint-slidecollection-add-member(1)
 */
export async function createSlide(
  title: string,
  layout: LayoutType = 'content'
): Promise<OperationResult<{ slideId: string; index: number }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    const result = { slideId: '', index: 0 }

    await PowerPoint.run(async (context) => {
      const presentation = context.presentation
      const slides = presentation.slides
      
      // Add new slide using official API
      // SlideCollection.add() adds to the end of presentation
      slides.add()
      slides.load('items')
      
      await context.sync()

      // Get the newly added slide (last one)
      const newSlideIndex = slides.items.length - 1
      const newSlide = slides.getItemAt(newSlideIndex)
      newSlide.load('id')
      await context.sync()

      result.slideId = newSlide.id
      result.index = newSlideIndex

      // Add title text box if provided
      if (title) {
        const titleRect = getTitleRect(layout)
        const shapes = newSlide.shapes
        
        // Use official addTextBox API
        const titleShape = shapes.addTextBox(title, {
          left: titleRect.left,
          top: titleRect.top,
          width: titleRect.width,
          height: titleRect.height
        })
        
        // Style the title using official TextFrame API
        titleShape.textFrame.textRange.font.size = layout === 'title' ? 44 : 32
        titleShape.textFrame.textRange.font.bold = true
        titleShape.textFrame.verticalAlignment = PowerPoint.TextVerticalAlignment.middleCentered
        
        await context.sync()
      }
    })

    return { success: true, data: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Create a slide with matching master and layout from selected slide
 * @see https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/add-slides
 */
export async function createSlideWithMatchingLayout(): Promise<OperationResult<{ slideId: string; index: number }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    const result = { slideId: '', index: 0 }

    await PowerPoint.run(async (context) => {
      const selectedSlides = context.presentation.getSelectedSlides()
      selectedSlides.load('items')
      await context.sync()

      if (selectedSlides.items.length === 0) {
        throw new Error('No slide selected')
      }

      // Get the selected slide's master and layout
      const selectedSlide = selectedSlides.items[0]
      selectedSlide.load('slideMaster/id, layout/id')
      await context.sync()

      // Add new slide with matching master and layout
      context.presentation.slides.add({
        slideMasterId: selectedSlide.slideMaster.id,
        layoutId: selectedSlide.layout.id
      })

      const slides = context.presentation.slides
      slides.load('items')
      await context.sync()

      const newSlideIndex = slides.items.length - 1
      const newSlide = slides.getItemAt(newSlideIndex)
      newSlide.load('id')
      await context.sync()

      result.slideId = newSlide.id
      result.index = newSlideIndex
    })

    return { success: true, data: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete a slide by index
 * @see https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/add-slides#delete-slides
 */
export async function deleteSlide(slideIndex: number): Promise<OperationResult<void>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides
      slides.load('items')
      await context.sync()

      if (slides.items.length <= 1) {
        throw new Error('Cannot delete the only slide')
      }

      if (slideIndex < 0 || slideIndex >= slides.items.length) {
        throw new Error(`Slide index ${slideIndex} out of range`)
      }

      // Use official Slide.delete() API
      const slide = slides.getItemAt(slideIndex)
      slide.delete()
      
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
 * Delete a slide by ID
 */
export async function deleteSlideById(slideId: string): Promise<OperationResult<void>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides
      slides.load('items')
      await context.sync()

      if (slides.items.length <= 1) {
        throw new Error('Cannot delete the only slide')
      }

      // Find slide by ID
      const slide = slides.getItem(slideId)
      slide.delete()
      
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
 * Get slide count
 */
export async function getSlideCount(): Promise<OperationResult<number>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let count = 0

    await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides
      slides.load('items')
      await context.sync()
      count = slides.items.length
    })

    return { success: true, data: count }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
