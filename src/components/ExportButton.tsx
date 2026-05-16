'use client'

import { useState, useRef, useEffect } from 'react'
import { Printer, Download, FileText, FileSpreadsheet, File } from 'lucide-react'

export default function ExportButton({ type = 'print', label = 'Print', data = [], filename = 'export' }: { type?: 'print' | 'export', label?: string, data?: any[], filename?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAction = (format?: string) => {
    if (type === 'print' || format === 'pdf') {
      window.print()
      setIsOpen(false)
      return
    }

    if (!data || data.length === 0) {
      alert('No data available to export.')
      setIsOpen(false)
      return
    }

    // Convert data to CSV
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : String(row[header])
        return `"${val.replace(/"/g, '""')}"`
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'csv' : 'csv'}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsOpen(false)
  }

  if (type === 'print') {
    return (
      <button
        onClick={() => handleAction()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 border border-gray-200 print:hidden"
        style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}
      >
        <Printer className="w-4 h-4" />
        {label}
      </button>
    )
  }

  return (
    <div className="relative print:hidden" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 border border-gray-200"
        style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}
      >
        <Download className="w-4 h-4" />
        {label}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <button onClick={() => handleAction('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-500" /> Export as PDF
          </button>
          <button onClick={() => handleAction('csv')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <File className="w-4 h-4 text-blue-500" /> Export as CSV
          </button>
          <button onClick={() => handleAction('excel')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export as Excel
          </button>
        </div>
      )}
    </div>
  )
}
