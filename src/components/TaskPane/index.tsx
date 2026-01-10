import { useState, useCallback } from 'react'
import { Button, Spinner, Tooltip } from '@fluentui/react-components'
import { 
  Play24Regular, 
  Delete24Regular, 
  DocumentAdd24Regular,
  Info24Regular 
} from '@fluentui/react-icons'
import { useAppStore } from '../../store/useAppStore'
import { parseMarkdown } from '../../modules/markdown/parser'
import { generatePPT } from '../../modules/ppt-bridge/generator'
import MarkdownEditor from '../Editor/MarkdownEditor'
import SlidePreview from '../Preview/SlidePreview'

export default function TaskPane() {
  const { 
    markdown, 
    setMarkdown, 
    slides, 
    setSlides, 
    isProcessing, 
    setProcessing,
    setError 
  } = useAppStore()
  
  const [showPreview, setShowPreview] = useState(true)

  const handleConvert = useCallback(async () => {
    if (!markdown.trim()) {
      setError('请输入 Markdown 内容')
      return
    }

    setProcessing(true)
    setError(null)

    const parsedSlides = await parseMarkdown(markdown)
    setSlides(parsedSlides)

    await generatePPT(parsedSlides)
    setProcessing(false)
  }, [markdown, setSlides, setProcessing, setError])

  const handleClear = useCallback(() => {
    setMarkdown('')
    setSlides([])
    setError(null)
  }, [setMarkdown, setSlides, setError])

  const handleImportFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        setMarkdown(text)
      }
    }
    input.click()
  }, [setMarkdown])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-secondary border-b border-surface-tertiary">
        <div className="flex items-center gap-2">
          <Tooltip content="导入 Markdown 文件" relationship="label">
            <Button 
              icon={<DocumentAdd24Regular />} 
              appearance="subtle"
              onClick={handleImportFile}
            />
          </Tooltip>
          <Tooltip content="清空内容" relationship="label">
            <Button 
              icon={<Delete24Regular />} 
              appearance="subtle"
              onClick={handleClear}
              disabled={!markdown}
            />
          </Tooltip>
        </div>
        
        <Button
          appearance="primary"
          icon={isProcessing ? <Spinner size="tiny" /> : <Play24Regular />}
          onClick={handleConvert}
          disabled={isProcessing || !markdown.trim()}
        >
          {isProcessing ? '生成中...' : '生成 PPT'}
        </Button>
      </div>

      {/* Editor & Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Section */}
        <div className={`${showPreview ? 'h-1/2' : 'flex-1'} border-b border-surface-tertiary`}>
          <MarkdownEditor 
            value={markdown} 
            onChange={setMarkdown} 
          />
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="h-1/2 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-secondary">
              <div className="flex items-center gap-2">
                <span className="text-subheading text-text-primary">预览</span>
                <span className="text-caption text-text-secondary">
                  {slides.length} 张幻灯片
                </span>
              </div>
              <Tooltip content="预览说明" relationship="label">
                <Button icon={<Info24Regular />} appearance="subtle" size="small" />
              </Tooltip>
            </div>
            <SlidePreview slides={slides} />
          </div>
        )}
      </div>

      {/* Toggle Preview Button */}
      <button
        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover transition-colors flex items-center justify-center"
        onClick={() => setShowPreview(!showPreview)}
      >
        {showPreview ? '▼' : '▲'}
      </button>
    </div>
  )
}
