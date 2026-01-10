import { useState } from 'react'
import { Button, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent } from '@fluentui/react-components'
import { Dismiss24Regular } from '@fluentui/react-icons'
import type { SlideContent } from '../../types'
import SlideCard from './SlideCard'

interface SlidePreviewProps {
  slides: SlideContent[]
}

export default function SlidePreview({ slides }: SlidePreviewProps) {
  const [selectedSlide, setSelectedSlide] = useState<SlideContent | null>(null)

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary">
        <div className="w-16 h-16 mb-4 rounded-lg bg-surface-secondary flex items-center justify-center">
          <svg className="w-8 h-8 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 9h16" />
          </svg>
        </div>
        <p className="text-body">输入 Markdown 内容后预览幻灯片</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 p-4 overflow-y-auto h-full">
        {slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={index}
            onClick={() => setSelectedSlide(slide)}
          />
        ))}
      </div>

      {/* Full Preview Dialog */}
      <Dialog open={!!selectedSlide} onOpenChange={() => setSelectedSlide(null)}>
        <DialogSurface style={{ maxWidth: '80vw', maxHeight: '80vh' }}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setSelectedSlide(null)}
                />
              }
            >
              {selectedSlide?.title || '幻灯片预览'}
            </DialogTitle>
            <DialogContent>
              {selectedSlide && (
                <div className="aspect-video bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-semibold text-text-primary mb-6">
                    {selectedSlide.title}
                  </h2>
                  <div className="space-y-4">
                    {selectedSlide.blocks.map((block, idx) => (
                      <div key={idx} className="text-text-primary">
                        {block.type === 'text' && <p>{block.content}</p>}
                        {block.type === 'list' && (
                          <ul className="list-disc list-inside space-y-1">
                            {block.content.split('\n').map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        )}
                        {block.type === 'code' && (
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code>{block.content}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}
