'use client'

import { useState, useEffect } from 'react'

let themeApplied = false

export default function ThemeScript() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
      themeApplied = true
    }
  }, [])

  return null
}