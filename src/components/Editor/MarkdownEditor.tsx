import { useRef, useEffect, useCallback } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const updateLineNumbers = useCallback(() => {
    if (!textareaRef.current || !lineNumbersRef.current) return
    
    const lines = value.split('\n').length
    const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1)
    lineNumbersRef.current.innerHTML = lineNumbers
      .map(n => `<div class="leading-6 text-right pr-2">${n}</div>`)
      .join('')
  }, [value])

  useEffect(() => {
    updateLineNumbers()
  }, [updateLineNumbers])

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      const text = await file.text()
      onChange(text)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
  }

  return (
    <div className="flex h-full bg-white">
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="w-12 bg-surface-secondary text-text-disabled text-caption overflow-hidden select-none border-r border-surface-tertiary"
        style={{ fontFamily: 'Consolas, Monaco, monospace' }}
      />
      
      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        placeholder={`# 幻灯片标题

在这里输入 Markdown 内容...

## 第一页
- 要点 1
- 要点 2

## 第二页
\`\`\`javascript
console.log('代码高亮示例');
\`\`\`

## 第三页
\`\`\`mermaid
graph LR
    A[开始] --> B[结束]
\`\`\``}
        className="flex-1 p-4 resize-none outline-none text-body text-text-primary leading-6 bg-transparent"
        style={{ fontFamily: 'Consolas, Monaco, monospace' }}
        spellCheck={false}
      />
    </div>
  )
}
