import { useState, useEffect, useCallback, useRef } from 'react'
import type { ElementType } from '../components/QuickToolbar'
import { isOfficeAvailable } from '../modules/ppt-bridge'

interface SelectionState {
  visible: boolean
  position: { x: number; y: number }
  elementType: ElementType
  selectedIds: string[]
  slideIndex: number
}

const initialState: SelectionState = {
  visible: false,
  position: { x: 0, y: 0 },
  elementType: 'mixed',
  selectedIds: [],
  slideIndex: 0
}

export function useSelectionToolbar() {
  const [state, setState] = useState<SelectionState>(initialState)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSelectionRef = useRef<string[]>([])

  // Check selection periodically
  useEffect(() => {
    if (!isOfficeAvailable()) return

    const checkSelection = async () => {
      try {
        await PowerPoint.run(async (context) => {
          const selection = context.presentation.getSelectedShapes()
          selection.load(['items/id', 'items/type', 'items/name'])
          
          // Get current slide index
          const slides = context.presentation.slides
          slides.load('items/id')
          
          await context.sync()
          
          const selectedIds = selection.items.map(shape => shape.id)
          const selectedTypes = selection.items.map(shape => shape.type)
          
          // Determine element type
          let elementType: ElementType = 'mixed'
          if (selectedTypes.length > 0) {
            const uniqueTypes = [...new Set(selectedTypes)]
            if (uniqueTypes.length === 1) {
              const type = uniqueTypes[0]
              if (type === 'Picture') {
                elementType = 'image'
              } else if (type === 'TextBox' || type === 'Label') {
                elementType = 'text'
              } else {
                elementType = 'shape'
              }
            }
          }
          
          // Check if selection changed
          const selectionChanged = 
            selectedIds.length !== lastSelectionRef.current.length ||
            selectedIds.some((id, i) => id !== lastSelectionRef.current[i])
          
          lastSelectionRef.current = selectedIds
          
          if (selectedIds.length > 0 && selectionChanged) {
            // Clear any existing timeout
            if (showTimeoutRef.current) {
              clearTimeout(showTimeoutRef.current)
            }
            
            // Show toolbar after delay (1-2 seconds)
            showTimeoutRef.current = setTimeout(() => {
              // Calculate position based on selection
              // For now, use a fixed offset from cursor position
              const mouseX = window.innerWidth - 80
              const mouseY = 150
              
              setState({
                visible: true,
                position: { x: mouseX, y: mouseY },
                elementType,
                selectedIds,
                slideIndex: 0 // Current slide
              })
            }, 1200) // 1.2 second delay
          } else if (selectedIds.length === 0) {
            // Hide toolbar when nothing selected
            if (showTimeoutRef.current) {
              clearTimeout(showTimeoutRef.current)
            }
            setState(prev => ({ ...prev, visible: false }))
          }
        })
      } catch {
        // Ignore errors during selection check
      }
    }

    // Check selection every 500ms
    const interval = setInterval(checkSelection, 500)
    
    return () => {
      clearInterval(interval)
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current)
      }
    }
  }, [])

  const hideToolbar = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }))
  }, [])

  const handleAction = useCallback((action: string, params?: any) => {
    console.log('[Selection Toolbar] Action:', action, params)
    // Additional action handling can be added here
  }, [])

  return {
    ...state,
    hideToolbar,
    handleAction
  }
}

// Declare PowerPoint global
declare const PowerPoint: any
