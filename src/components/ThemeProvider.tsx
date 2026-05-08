'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SidebarProvider } from '@/components/SidebarContext'

interface ThemeConfig {
  theme: string
  palette: string
  animation: string
  darkMode: boolean
  buttonStyle: string
}

interface ThemeContextType {
  config: ThemeConfig
  setTheme: (theme: string) => void
  setPalette: (palette: string) => void
  setAnimation: (animation: string) => void
  setButtonStyle: (style: string) => void
  toggleDarkMode: () => void
}

const defaultConfig: ThemeConfig = {
  theme: 'google-drive',
  palette: 'rebma',
  animation: 'smooth',
  darkMode: false,
  buttonStyle: 'filled',
}

const ThemeContext = createContext<ThemeContextType>({
  config: defaultConfig,
  setTheme: () => {},
  setPalette: () => {},
  setAnimation: () => {},
  setButtonStyle: () => {},
  toggleDarkMode: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(config: ThemeConfig) {
  const root = document.documentElement
  root.setAttribute('data-theme', config.theme)
  root.setAttribute('data-palette', config.palette)
  root.setAttribute('data-animation', config.animation)
  root.setAttribute('data-button-style', config.buttonStyle)
  if (config.darkMode) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children, initialConfig }: {
  children: React.ReactNode
  initialConfig?: Partial<ThemeConfig>
}) {
  const [config, setConfig] = useState<ThemeConfig>({
    ...defaultConfig,
    ...initialConfig,
  })

  useEffect(() => {
    applyTheme(config)
  }, [config])

  const saveToSupabase = useCallback(async (newConfig: ThemeConfig) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('users').update({
          theme: newConfig.theme,
          color_palette: newConfig.palette,
          animation_style: newConfig.animation,
          dark_mode: newConfig.darkMode,
          button_style: newConfig.buttonStyle,
        }).eq('id', user.id)
      }
    } catch (e) {
      console.error('Failed to save theme:', e)
    }
  }, [])

  const setTheme = useCallback((theme: string) => {
    setConfig(prev => { const next = { ...prev, theme }; saveToSupabase(next); return next })
  }, [saveToSupabase])

  const setPalette = useCallback((palette: string) => {
    setConfig(prev => { const next = { ...prev, palette }; saveToSupabase(next); return next })
  }, [saveToSupabase])

  const setAnimation = useCallback((animation: string) => {
    setConfig(prev => { const next = { ...prev, animation }; saveToSupabase(next); return next })
  }, [saveToSupabase])

  const setButtonStyle = useCallback((buttonStyle: string) => {
    setConfig(prev => { const next = { ...prev, buttonStyle }; saveToSupabase(next); return next })
  }, [saveToSupabase])

  const toggleDarkMode = useCallback(() => {
    setConfig(prev => { const next = { ...prev, darkMode: !prev.darkMode }; saveToSupabase(next); return next })
  }, [saveToSupabase])

  return (
    <ThemeContext.Provider value={{ config, setTheme, setPalette, setAnimation, setButtonStyle, toggleDarkMode }}>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </ThemeContext.Provider>
  )
}
