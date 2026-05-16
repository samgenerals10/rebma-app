'use client'
import { useEffect } from 'react'

export default function RootProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return <>{children}</>
}
