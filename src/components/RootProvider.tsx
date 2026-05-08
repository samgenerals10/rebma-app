'use client'

import { ThemeProvider as ClientThemeProvider } from '@/components/ThemeProvider'
import { useTheme } from '@/components/ThemeProvider'
import { useEffect, useState } from 'react'

export default function RootProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ClientThemeProvider>
      {children}
    </ClientThemeProvider>
  )
}