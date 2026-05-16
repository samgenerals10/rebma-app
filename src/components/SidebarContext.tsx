'use client'
import { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Always start as `true` to match server render
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // After first paint, read localStorage and apply saved state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_open')
    if (saved !== null) setIsOpen(saved === 'true')
    setMounted(true)
  }, [])

  const toggle = () => {
    setIsOpen(prev => {
      const next = !prev
      localStorage.setItem('sidebar_open', String(next))
      return next
    })
  }

  return (
    <SidebarContext.Provider value={{ isOpen: mounted ? isOpen : true, toggle }}>{children}</SidebarContext.Provider>
  )
}
