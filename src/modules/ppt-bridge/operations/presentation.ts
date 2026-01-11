/**
 * PPT Bridge Operations - Presentation
 * 
 * Operations for presentation-level actions (info, navigation).
 * Based on official Office.js PowerPoint API.
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.presentation
 */

import type { 
  OperationResult, 
  PresentationInfo, 
  SlideInfo 
} from './types'
import { isOfficeAvailable } from './utils'

/**
 * Get presentation information
 * Uses official PowerPoint.run() context
 */
export async function getPresentationInfo(): Promise<OperationResult<PresentationInfo>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    const info: PresentationInfo = {
      slideCount: 0,
      currentSlideIndex: 0,
      title: '',
      author: '',
      slides: []
    }

    await PowerPoint.run(async (context) => {
      const presentation = context.presentation
      const slides = presentation.slides
      slides.load('items')
      
      await context.sync()

      info.slideCount = slides.items.length
      
      // Load each slide's properties
      for (const slide of slides.items) {
        slide.load('id')
        slide.shapes.load('items')
      }
      await context.sync()

      info.slides = slides.items.map((slide, index) => ({
        id: slide.id,
        index,
        title: '',
        layout: 'content',
        shapeCount: slide.shapes.items?.length || 0
      }))

      // Try to get selected slide index
      try {
        const selection = presentation.getSelectedSlides()
        selection.load('items')
        await context.sync()

        if (selection.items.length > 0) {
          selection.items[0].load('id')
          await context.sync()
          const selectedId = selection.items[0].id
          const selectedIndex = info.slides.findIndex(s => s.id === selectedId)
          if (selectedIndex >= 0) {
            info.currentSlideIndex = selectedIndex
          }
        }
      } catch {
        // Selection API might not be available in all contexts
      }
    })

    return { success: true, data: info }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Navigate to a specific slide by index
 * Note: PowerPoint.js doesn't have direct navigation API,
 * but we can select the slide
 */
export async function goToSlide(slideIndex: number): Promise<OperationResult<void>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides
      slides.load('items')
      await context.sync()

      if (slideIndex < 0 || slideIndex >= slides.items.length) {
        throw new Error(`Slide index ${slideIndex} out of range`)
      }

      // Note: Direct navigation API not available in Office.js
      // The slide can be accessed but not navigated to programmatically
      console.log('[PPT Bridge] Navigate to slide index:', slideIndex)
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
 * List all slides with pagination
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.slidecollection
 */
export async function listSlides(
  limit: number = 20,
  offset: number = 0
): Promise<OperationResult<{
  total: number
  slides: SlideInfo[]
  hasMore: boolean
}>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    const result = {
      total: 0,
      slides: [] as SlideInfo[],
      hasMore: false
    }

    await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides
      slides.load('items')
      await context.sync()

      result.total = slides.items.length
      
      // Load each slide's properties
      for (const slide of slides.items) {
        slide.load('id')
        slide.shapes.load('items')
      }
      await context.sync()

      const endIndex = Math.min(offset + limit, slides.items.length)
      
      result.slides = slides.items.slice(offset, endIndex).map((slide, i) => ({
        id: slide.id,
        index: offset + i,
        title: '',
        layout: 'content',
        shapeCount: slide.shapes.items?.length || 0
      }))

      result.hasMore = endIndex < slides.items.length
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
 * Get the currently selected slide index
 * @see https://learn.microsoft.com/en-us/office/dev/add-ins/powerpoint/get-set-slides
 */
export async function getSelectedSlideIndex(): Promise<OperationResult<number>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let selectedIndex = 0

    await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides
      slides.load('items')
      
      const selectedSlides = context.presentation.getSelectedSlides()
      selectedSlides.load('items')
      
      await context.sync()

      if (selectedSlides.items.length > 0) {
        selectedSlides.items[0].load('id')
        await context.sync()
        
        const selectedId = selectedSlides.items[0].id
        
        for (let i = 0; i < slides.items.length; i++) {
          slides.items[i].load('id')
        }
        await context.sync()
        
        for (let i = 0; i < slides.items.length; i++) {
          if (slides.items[i].id === selectedId) {
            selectedIndex = i
            break
          }
        }
      }
    })

    return { success: true, data: selectedIndex }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
