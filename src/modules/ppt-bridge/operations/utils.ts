/**
 * PPT Bridge Operations - Utility Functions
 * 
 * Helper functions shared across operations.
 * Based on official Office.js PowerPoint API.
 */

import type { LayoutType } from './types'

// Slide dimensions (in points, 1 inch = 72 points)
// Standard 16:9 widescreen presentation
export const SLIDE_WIDTH = 960   // 13.33 inches
export const SLIDE_HEIGHT = 540  // 7.5 inches

// Check if Office.js PowerPoint API is available
export function isOfficeAvailable(): boolean {
  return typeof PowerPoint !== 'undefined'
}

// Check if running in Office environment
export function isOfficeEnvironment(): boolean {
  return typeof Office !== 'undefined'
}

/**
 * Get title rectangle based on layout type
 */
export function getTitleRect(
  layout: LayoutType
): { left: number; top: number; width: number; height: number } {
  switch (layout) {
    case 'title':
      return { left: 40, top: 200, width: SLIDE_WIDTH - 80, height: 120 }
    case 'code-focus':
      return { left: 40, top: 20, width: SLIDE_WIDTH - 80, height: 60 }
    default:
      return { left: 40, top: 40, width: SLIDE_WIDTH - 80, height: 80 }
  }
}

/**
 * Create error result
 */
export function errorResult(message: string): { success: false; error: string } {
  return { success: false, error: message }
}

/**
 * Create success result
 */
export function successResult<T>(data?: T): { success: true; data?: T } {
  return data !== undefined ? { success: true, data } : { success: true }
}

/**
 * Convert position to ShapeAddOptions format
 */
export function toShapeAddOptions(position: { x: number; y: number; width: number; height: number }) {
  return {
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height
  }
}
