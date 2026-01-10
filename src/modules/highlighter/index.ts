import hljs from 'highlight.js'

// Import common languages
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import csharp from 'highlight.js/lib/languages/csharp'
import cpp from 'highlight.js/lib/languages/cpp'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import bash from 'highlight.js/lib/languages/bash'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'

// Register languages
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('cs', csharp)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c++', cpp)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)

export interface HighlightResult {
  html: string
  language: string
  tokens: HighlightToken[]
}

export interface HighlightToken {
  type: string
  value: string
  color: string
}

// VS Dark theme colors
const tokenColors: Record<string, string> = {
  keyword: '#569CD6',
  string: '#CE9178',
  number: '#B5CEA8',
  comment: '#6A9955',
  function: '#DCDCAA',
  class: '#4EC9B0',
  variable: '#9CDCFE',
  operator: '#D4D4D4',
  punctuation: '#D4D4D4',
  type: '#4EC9B0',
  property: '#9CDCFE',
  default: '#D4D4D4',
}

/**
 * Highlight code with syntax coloring
 */
export function highlightCode(code: string, language: string): HighlightResult {
  const result = hljs.highlight(code, { 
    language: language || 'plaintext',
    ignoreIllegals: true 
  })

  const tokens = parseHighlightTokens(result.value)

  return {
    html: result.value,
    language: result.language || language,
    tokens,
  }
}

/**
 * Auto-detect language and highlight
 */
export function highlightAuto(code: string): HighlightResult {
  const result = hljs.highlightAuto(code)
  const tokens = parseHighlightTokens(result.value)

  return {
    html: result.value,
    language: result.language || 'plaintext',
    tokens,
  }
}

/**
 * Parse highlighted HTML into tokens for PPT rendering
 */
function parseHighlightTokens(html: string): HighlightToken[] {
  const tokens: HighlightToken[] = []
  const regex = /<span class="hljs-(\w+)">([^<]*)<\/span>|([^<]+)/g
  let match

  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      // Token with class
      tokens.push({
        type: match[1],
        value: decodeHtmlEntities(match[2]),
        color: tokenColors[match[1]] || tokenColors.default,
      })
    } else if (match[3]) {
      // Plain text
      tokens.push({
        type: 'default',
        value: decodeHtmlEntities(match[3]),
        color: tokenColors.default,
      })
    }
  }

  return tokens
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
  }
  
  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity)
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): string[] {
  return hljs.listLanguages()
}
