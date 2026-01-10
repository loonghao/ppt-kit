import { marked } from 'marked'
import type { SlideContent, ContentBlock, LayoutType } from '../../types'

interface ParsedToken {
  type: string
  text?: string
  depth?: number
  lang?: string
  items?: { text: string }[]
  raw?: string
}

/**
 * Parse Markdown content into slide structures
 */
export async function parseMarkdown(markdown: string): Promise<SlideContent[]> {
  const tokens = marked.lexer(markdown)
  const slides: SlideContent[] = []
  let currentSlide: SlideContent | null = null
  let slideIndex = 0

  for (const token of tokens as ParsedToken[]) {
    // Heading level 1 or 2 starts a new slide
    if (token.type === 'heading' && (token.depth === 1 || token.depth === 2)) {
      if (currentSlide) {
        currentSlide.layout = determineLayout(currentSlide)
        slides.push(currentSlide)
      }
      
      currentSlide = {
        id: `slide-${slideIndex++}`,
        title: token.text || '',
        blocks: [],
        layout: 'content',
      }
      continue
    }

    // If no slide started yet, create one
    if (!currentSlide) {
      currentSlide = {
        id: `slide-${slideIndex++}`,
        title: '',
        blocks: [],
        layout: 'content',
      }
    }

    // Process different token types
    const block = tokenToBlock(token)
    if (block) {
      currentSlide.blocks.push(block)
    }
  }

  // Don't forget the last slide
  if (currentSlide) {
    currentSlide.layout = determineLayout(currentSlide)
    slides.push(currentSlide)
  }

  return slides
}

/**
 * Convert a markdown token to a content block
 */
function tokenToBlock(token: ParsedToken): ContentBlock | null {
  switch (token.type) {
    case 'paragraph':
      return {
        type: 'text',
        content: token.text || '',
      }

    case 'code':
      // Check if it's a mermaid diagram
      if (token.lang === 'mermaid') {
        return {
          type: 'mermaid',
          content: token.text || '',
        }
      }
      return {
        type: 'code',
        content: token.text || '',
        language: token.lang || 'plaintext',
      }

    case 'list':
      const items = token.items?.map(item => item.text) || []
      return {
        type: 'list',
        content: items.join('\n'),
      }

    case 'blockquote':
      return {
        type: 'text',
        content: token.text || '',
        style: {
          backgroundColor: '#f3f2f1',
        },
      }

    case 'heading':
      // Sub-headings within a slide
      if (token.depth && token.depth > 2) {
        return {
          type: 'text',
          content: token.text || '',
          style: {
            fontWeight: 'bold',
            fontSize: 18 - (token.depth - 3) * 2,
          },
        }
      }
      return null

    default:
      return null
  }
}

/**
 * Determine the best layout for a slide based on its content
 */
function determineLayout(slide: SlideContent): LayoutType {
  const hasCode = slide.blocks.some(b => b.type === 'code')
  const hasMermaid = slide.blocks.some(b => b.type === 'mermaid')
  const hasImage = slide.blocks.some(b => b.type === 'image')
  const blockCount = slide.blocks.length

  // Title slide: only title, no content
  if (blockCount === 0) {
    return 'title'
  }

  // Code focus: primarily code content
  if (hasCode && blockCount <= 2) {
    return 'code-focus'
  }

  // Image focus: has image content
  if (hasImage) {
    return 'image-focus'
  }

  // Mermaid diagrams get their own focus
  if (hasMermaid) {
    return 'image-focus'
  }

  // Two column: multiple blocks that could be split
  if (blockCount >= 4) {
    return 'two-column'
  }

  // Default content layout
  return 'content'
}

/**
 * Extract slide notes from markdown comments
 */
export function extractNotes(markdown: string): Map<number, string> {
  const notes = new Map<number, string>()
  const notePattern = /<!--\s*notes:\s*([\s\S]*?)\s*-->/gi
  let match
  let slideIndex = 0

  const lines = markdown.split('\n')
  for (const line of lines) {
    if (line.match(/^#{1,2}\s/)) {
      slideIndex++
    }
    
    while ((match = notePattern.exec(line)) !== null) {
      notes.set(slideIndex, match[1].trim())
    }
  }

  return notes
}
