/**
 * PPT Bridge Operations - Type Definitions
 * 
 * Based on official Office.js PowerPoint API documentation.
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint
 */

import type { LayoutType } from '../../../types'

// Slide info type
export interface SlideInfo {
  id: string
  index: number
  title: string
  layout: string
  shapeCount: number
}

// Presentation info type
export interface PresentationInfo {
  slideCount: number
  currentSlideIndex: number
  title: string
  author: string
  slides: SlideInfo[]
}

// Operation result type
export interface OperationResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Position type (in points, 1 inch = 72 points)
export interface Position {
  x: number      // left
  y: number      // top
  width: number
  height: number
}

// Shape add options (official API)
export interface ShapeAddOptions {
  left?: number
  top?: number
  width?: number
  height?: number
}

// Re-export LayoutType
export type { LayoutType }

// Official PowerPoint GeometricShapeType enum values
export type GeometricShapeType = 
  | 'rectangle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'parallelogram'
  | 'trapezoid'
  | 'pentagon'
  | 'hexagon'
  | 'heptagon'
  | 'octagon'
  | 'decagon'
  | 'dodecagon'
  | 'star4'
  | 'star5'
  | 'star6'
  | 'star7'
  | 'star8'
  | 'star10'
  | 'star12'
  | 'star16'
  | 'star24'
  | 'star32'
  | 'roundRectangle'
  | 'round1Rectangle'
  | 'round2SameRectangle'
  | 'round2DiagRectangle'
  | 'snipRoundRectangle'
  | 'snip1Rectangle'
  | 'snip2SameRectangle'
  | 'snip2DiagRectangle'
  | 'plaque'
  | 'donut'
  | 'noSmoking'
  | 'blockArc'
  | 'heart'
  | 'lightningBolt'
  | 'sun'
  | 'moon'
  | 'smileyFace'
  | 'irregularSeal1'
  | 'irregularSeal2'
  | 'foldedCorner'
  | 'bevel'
  | 'frame'
  | 'halfFrame'
  | 'corner'
  | 'diagStripe'
  | 'chord'
  | 'arc'
  | 'leftBracket'
  | 'rightBracket'
  | 'leftBrace'
  | 'rightBrace'
  | 'bracketPair'
  | 'bracePair'
  | 'cloud'
  | 'gear6'
  | 'gear9'
  | 'funnel'
  | 'mathPlus'
  | 'mathMinus'
  | 'mathMultiply'
  | 'mathDivide'
  | 'mathEqual'
  | 'mathNotEqual'

// Official PowerPoint ConnectorType enum values
export type ConnectorType = 
  | 'straight'
  | 'elbow'
  | 'curve'

// Official PowerPoint TextVerticalAlignment enum values
export type TextVerticalAlignment =
  | 'top'
  | 'middle'
  | 'bottom'
  | 'topCentered'
  | 'middleCentered'
  | 'bottomCentered'
