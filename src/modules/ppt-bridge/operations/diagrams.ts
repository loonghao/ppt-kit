/**
 * PPT Bridge Operations - Diagrams
 * 
 * Operations for adding Mermaid diagrams and charts.
 * Based on official Office.js PowerPoint API.
 */

import type { OperationResult, Position } from './types'
import { isOfficeAvailable, toShapeAddOptions } from './utils'
import { renderMermaid, svgToPng } from '../../mermaid/renderer'

/**
 * Supported Mermaid diagram types
 */
export const MERMAID_DIAGRAM_TYPES = [
  'flowchart', 'graph', 'sequenceDiagram', 'gantt', 'classDiagram',
  'stateDiagram', 'erDiagram', 'journey', 'pie', 'quadrantChart',
  'requirementDiagram', 'gitGraph', 'mindmap', 'timeline'
] as const

export type MermaidDiagramType = typeof MERMAID_DIAGRAM_TYPES[number]

/**
 * Detect Mermaid diagram type from code
 */
export function detectDiagramType(mermaidCode: string): MermaidDiagramType | 'unknown' {
  const typeMatch = mermaidCode.match(
    /^(flowchart|graph|sequenceDiagram|gantt|classDiagram|stateDiagram|erDiagram|journey|pie|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline)/m
  )
  return typeMatch ? (typeMatch[1] as MermaidDiagramType) : 'unknown'
}

/**
 * Add Mermaid diagram to a slide
 * Renders the diagram to PNG and inserts as image using official setImage API
 */
export async function addMermaidToSlide(
  slideIndex: number,
  mermaidCode: string,
  position?: Position
): Promise<OperationResult<{ shapeId: string; diagramType: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    // Render mermaid to SVG then PNG
    const renderResult = await renderMermaid(mermaidCode)
    const pngDataUrl = await svgToPng(renderResult.svg)
    const base64Data = pngDataUrl.split(',')[1]

    // Detect diagram type
    const diagramType = detectDiagramType(mermaidCode)

    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      const rect = position || { x: 100, y: 140, width: 760, height: 400 }
      
      // Create a rectangle shape and fill with the rendered diagram image
      // Using official addGeometricShape and setImage APIs
      const diagramShape = shapes.addGeometricShape(
        PowerPoint.GeometricShapeType.rectangle,
        toShapeAddOptions(rect)
      )
      
      diagramShape.left = rect.x
      diagramShape.top = rect.y
      diagramShape.width = rect.width
      diagramShape.height = rect.height
      
      // Fill with rendered PNG using official setImage API
      diagramShape.fill.setImage(base64Data)
      diagramShape.lineFormat.visible = false
      diagramShape.name = `MermaidDiagram_${diagramType}`
      
      diagramShape.load('id')
      await context.sync()
      
      shapeId = diagramShape.id
      console.log('[PPT Bridge] Mermaid diagram rendered and inserted, type:', diagramType)
    })

    return { success: true, data: { shapeId, diagramType } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Add a simple chart placeholder
 * Note: Office.js PowerPoint API doesn't have native chart support,
 * so we create a styled text representation
 */
export async function addChartToSlide(
  slideIndex: number,
  chartType: 'bar' | 'line' | 'pie' | 'area',
  data: { labels: string[]; values: number[] },
  position?: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      const rect = position || { x: 100, y: 140, width: 760, height: 400 }
      
      // Create chart data summary
      const dataSummary = data.labels
        .map((label, i) => `${label}: ${data.values[i]}`)
        .join('\n')
      
      const placeholder = shapes.addTextBox(
        `[CHART: ${chartType.toUpperCase()}]\n\nData:\n${dataSummary}`
      )
      
      placeholder.left = rect.x
      placeholder.top = rect.y
      placeholder.width = rect.width
      placeholder.height = rect.height
      placeholder.fill.setSolidColor('#F0F8FF')
      placeholder.textFrame.textRange.font.size = 12
      placeholder.textFrame.textRange.font.name = 'Consolas'
      placeholder.name = `Chart_${chartType}`
      
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
 * Add a table to a slide
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint/powerpoint.shapecollection#powerpoint-powerpoint-shapecollection-addtable-member(1)
 */
export async function addTableToSlide(
  slideIndex: number,
  headers: string[],
  rows: string[][],
  position?: Position
): Promise<OperationResult<{ shapeId: string }>> {
  if (!isOfficeAvailable()) {
    return { success: false, error: 'PowerPoint is not available' }
  }

  try {
    let shapeId = ''

    await PowerPoint.run(async (context) => {
      const shapes = context.presentation.slides.getItemAt(slideIndex).shapes
      
      const rect = position || { x: 40, y: 140, width: 880, height: 360 }
      
      // Try to use official addTable API if available (PowerPoint API 1.8+)
      try {
        const rowCount = rows.length + 1 // +1 for header
        const columnCount = headers.length
        
        const table = shapes.addTable(rowCount, columnCount, {
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height
        })
        
        table.load('id')
        await context.sync()
        
        shapeId = table.id
      } catch {
        // Fallback: Format as text table if addTable not available
        const headerLine = '| ' + headers.join(' | ') + ' |'
        const separator = '| ' + headers.map(() => '---').join(' | ') + ' |'
        const dataLines = rows.map(row => '| ' + row.join(' | ') + ' |')
        
        const tableText = [headerLine, separator, ...dataLines].join('\n')
        
        const tableBox = shapes.addTextBox(tableText)
        tableBox.left = rect.x
        tableBox.top = rect.y
        tableBox.width = rect.width
        tableBox.height = rect.height
        tableBox.textFrame.textRange.font.size = 14
        tableBox.textFrame.textRange.font.name = 'Consolas'
        tableBox.name = 'Table'
        
        tableBox.load('id')
        await context.sync()
        
        shapeId = tableBox.id
      }
    })

    return { success: true, data: { shapeId } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
