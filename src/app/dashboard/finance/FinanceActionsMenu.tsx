'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MoreVertical, BarChart2, DollarSign } from 'lucide-react'

export default function FinanceActionsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center rounded-lg"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          color: 'var(--text-primary)',
          width: 44,
          height: 44,
        }}
        aria-label="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 200,
          }}
        >
          <Link
            href="/dashboard/finance/reports"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            <BarChart2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            Reports
          </Link>
          <Link
            href="/dashboard/finance/reconciliation"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm"
            style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--card-border)' }}
          >
            <DollarSign className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            Reconciliation
          </Link>
        </div>
      )}
    </div>
  )
}
