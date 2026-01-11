import { useState, useEffect, useCallback } from 'react'
import { webLightTheme, webDarkTheme, Theme } from '@fluentui/react-components'

export interface OfficeThemeInfo {
  isDark: boolean
  bodyBackgroundColor: string
  bodyForegroundColor: string
  controlBackgroundColor: string
  controlForegroundColor: string
}

// Polling interval for theme detection (ms)
const THEME_POLL_INTERVAL = 1000

/**
 * Hook to detect and sync with Office application theme
 * Automatically switches between light and dark mode based on Office theme
 * Uses polling as fallback when OfficeThemeChanged event is not available
 */
export function useOfficeTheme() {
  const [theme, setTheme] = useState<Theme>(webLightTheme)
  const [themeInfo, setThemeInfo] = useState<OfficeThemeInfo>({
    isDark: false,
    bodyBackgroundColor: '#ffffff',
    bodyForegroundColor: '#000000',
    controlBackgroundColor: '#ffffff',
    controlForegroundColor: '#000000',
  })

  const updateTheme = useCallback(() => {
    try {
      const officeTheme = Office.context?.officeTheme
      if (!officeTheme) {
        // Fallback: check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setThemeInfo(prev => {
          if (prev.isDark !== prefersDark) {
            console.log('[Theme] Using system preference:', prefersDark ? 'dark' : 'light')
            return {
              ...prev,
              isDark: prefersDark,
              bodyBackgroundColor: prefersDark ? '#1e1e1e' : '#ffffff',
              bodyForegroundColor: prefersDark ? '#ffffff' : '#000000',
              controlBackgroundColor: prefersDark ? '#2d2d2d' : '#f3f3f3',
              controlForegroundColor: prefersDark ? '#ffffff' : '#000000',
            }
          }
          return prev
        })
        setTheme(prefersDark ? webDarkTheme : webLightTheme)
        return
      }

      // Get theme colors from Office API
      const newIsDark = officeTheme.isDarkTheme ?? isDarkColor(officeTheme.bodyBackgroundColor ?? '#ffffff')
      const newInfo: OfficeThemeInfo = {
        isDark: newIsDark,
        bodyBackgroundColor: officeTheme.bodyBackgroundColor ?? '#ffffff',
        bodyForegroundColor: officeTheme.bodyForegroundColor ?? '#000000',
        controlBackgroundColor: officeTheme.controlBackgroundColor ?? '#ffffff',
        controlForegroundColor: officeTheme.controlForegroundColor ?? '#000000',
      }

      // Only update if theme actually changed
      setThemeInfo(prev => {
        if (prev.isDark !== newInfo.isDark || 
            prev.bodyBackgroundColor !== newInfo.bodyBackgroundColor) {
          console.log('[Theme] Office theme changed:', newInfo.isDark ? 'dark' : 'light', newInfo)
          return newInfo
        }
        return prev
      })
      setTheme(newInfo.isDark ? webDarkTheme : webLightTheme)
    } catch (error) {
      console.warn('[Theme] Failed to detect Office theme:', error)
    }
  }, [])

  useEffect(() => {
    // Initial theme detection
    updateTheme()

    let eventSupported = false

    // Try to listen for theme changes via Office API
    try {
      if (Office.context?.officeTheme) {
        Office.context.document?.addHandlerAsync?.(
          Office.EventType.OfficeThemeChanged as never,
          updateTheme,
          (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
              eventSupported = true
              console.log('[Theme] OfficeThemeChanged event registered')
            }
          }
        )
      }
    } catch {
      console.log('[Theme] OfficeThemeChanged event not supported')
    }

    // Fallback: poll for theme changes
    const pollInterval = setInterval(() => {
      if (!eventSupported) {
        updateTheme()
      }
    }, THEME_POLL_INTERVAL)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (!Office.context?.officeTheme) {
        updateTheme()
      }
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      clearInterval(pollInterval)
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      try {
        Office.context?.document?.removeHandlerAsync?.(
          Office.EventType.OfficeThemeChanged as never,
          { handler: updateTheme }
        )
      } catch {
        // Ignore cleanup errors
      }
    }
  }, [updateTheme])

  return { theme, themeInfo }
}

/**
 * Check if a hex color is dark
 */
function isDarkColor(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Calculate relative luminance
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // If luminance is less than 0.5, it's a dark color
  return luminance < 0.5
}

export default useOfficeTheme
