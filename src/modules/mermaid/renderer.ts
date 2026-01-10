import mermaid from 'mermaid'

// Initialize mermaid with default config
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
  sequence: {
    useMaxWidth: true,
    diagramMarginX: 50,
    diagramMarginY: 10,
  },
  gantt: {
    useMaxWidth: true,
  },
})

export interface MermaidRenderResult {
  svg: string
  width: number
  height: number
  type: MermaidDiagramType
}

export type MermaidDiagramType = 
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'state'
  | 'er'
  | 'gantt'
  | 'pie'
  | 'mindmap'
  | 'unknown'

/**
 * Render mermaid diagram to SVG
 */
export async function renderMermaid(code: string): Promise<MermaidRenderResult> {
  const id = `mermaid-${Date.now()}`
  
  const { svg } = await mermaid.render(id, code)
  
  // Extract dimensions from SVG
  const dimensions = extractSvgDimensions(svg)
  const type = detectDiagramType(code)

  return {
    svg,
    width: dimensions.width,
    height: dimensions.height,
    type,
  }
}

/**
 * Validate mermaid syntax
 */
export async function validateMermaid(code: string): Promise<{ valid: boolean; error?: string }> {
  const result = await mermaid.parse(code)
  if (result) {
    return { valid: true }
  }
  return { valid: false, error: 'Invalid mermaid syntax' }
}

/**
 * Detect the type of mermaid diagram
 */
function detectDiagramType(code: string): MermaidDiagramType {
  const firstLine = code.trim().split('\n')[0].toLowerCase()
  
  if (firstLine.startsWith('graph') || firstLine.startsWith('flowchart')) {
    return 'flowchart'
  }
  if (firstLine.startsWith('sequencediagram') || firstLine.startsWith('sequence')) {
    return 'sequence'
  }
  if (firstLine.startsWith('classdiagram') || firstLine.startsWith('class')) {
    return 'class'
  }
  if (firstLine.startsWith('statediagram') || firstLine.startsWith('state')) {
    return 'state'
  }
  if (firstLine.startsWith('erdiagram') || firstLine.startsWith('er')) {
    return 'er'
  }
  if (firstLine.startsWith('gantt')) {
    return 'gantt'
  }
  if (firstLine.startsWith('pie')) {
    return 'pie'
  }
  if (firstLine.startsWith('mindmap')) {
    return 'mindmap'
  }
  
  return 'unknown'
}

/**
 * Extract width and height from SVG string
 */
function extractSvgDimensions(svg: string): { width: number; height: number } {
  const widthMatch = svg.match(/width="(\d+(?:\.\d+)?)"/)
  const heightMatch = svg.match(/height="(\d+(?:\.\d+)?)"/)
  
  // Also try viewBox
  const viewBoxMatch = svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/)
  
  let width = 400
  let height = 300
  
  if (widthMatch) {
    width = parseFloat(widthMatch[1])
  } else if (viewBoxMatch) {
    width = parseFloat(viewBoxMatch[1])
  }
  
  if (heightMatch) {
    height = parseFloat(heightMatch[1])
  } else if (viewBoxMatch) {
    height = parseFloat(viewBoxMatch[2])
  }
  
  return { width, height }
}

/**
 * Convert SVG to PNG data URL for embedding in PPT
 */
export async function svgToPng(svg: string, scale: number = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    const img = new Image()
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG'))
    }

    img.src = url
  })
}
