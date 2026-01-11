import { ReactNode, createContext, useContext, useEffect } from 'react'
import { FluentProvider } from '@fluentui/react-components'
import { useOfficeTheme, OfficeThemeInfo } from '../hooks/useOfficeTheme'

interface ThemeContextValue {
  isDark: boolean
  themeInfo: OfficeThemeInfo
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  themeInfo: {
    isDark: false,
    bodyBackgroundColor: '#ffffff',
    bodyForegroundColor: '#000000',
    controlBackgroundColor: '#ffffff',
    controlForegroundColor: '#000000',
  },
})

export function useTheme() {
  return useContext(ThemeContext)
}

interface ThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, themeInfo } = useOfficeTheme()

  // Sync dark mode class and CSS variables with document root
  useEffect(() => {
    const root = document.documentElement
    
    // Toggle dark mode class for Tailwind
    if (themeInfo.isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Sync Office theme colors to CSS variables for seamless integration
    root.style.setProperty('--office-bg', themeInfo.bodyBackgroundColor)
    root.style.setProperty('--office-fg', themeInfo.bodyForegroundColor)
    root.style.setProperty('--office-control-bg', themeInfo.controlBackgroundColor)
    root.style.setProperty('--office-control-fg', themeInfo.controlForegroundColor)

    console.log('[ThemeProvider] Theme synced:', themeInfo.isDark ? 'dark' : 'light')
  }, [themeInfo])

  return (
    <ThemeContext.Provider value={{ isDark: themeInfo.isDark, themeInfo }}>
      <FluentProvider theme={theme}>
        {children}
      </FluentProvider>
    </ThemeContext.Provider>
  )
}
