'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  title: string
  data: any[]
  columns: Column[]
  pageSize?: number
  actions?: (row: any) => React.ReactNode
}

function Pagination({
  current,
  total,
  dataLength,
  pageSize,
  onChange,
}: {
  current: number
  total: number
  dataLength: number
  pageSize: number
  onChange: (p: number) => void
}) {
  if (total <= 1) return null

  const getPages = () => {
    const pages: (number | '...')[] = []
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }

  // Fix: calculate the correct item range, not total * pageSize
  const startItem = (current - 1) * pageSize + 1
  const endItem = Math.min(current * pageSize, dataLength)

  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--card-border)' }}>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Showing {startItem}–{endItem} of {dataLength} results
      </p>
      <div
        className="flex items-center gap-1 px-3 py-1.5 rounded-2xl"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
      >
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="w-7 h-7 flex items-center justify-center rounded-full transition disabled:opacity-30"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={`d${i}`} className="w-7 h-7 flex items-center justify-center text-xs" style={{ color: 'var(--text-secondary)' }}>...</span>
          ) : (
            <button
              key={page}
              onClick={() => onChange(page as number)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition"
              style={{
                background: current === page ? 'var(--accent)' : 'transparent',
                color: current === page ? 'white' : 'var(--text-secondary)',
                fontWeight: current === page ? 700 : 500,
              }}
              aria-label={`Page ${page}`}
              aria-current={current === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === total}
          className="w-7 h-7 flex items-center justify-center rounded-full transition disabled:opacity-30"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function DataTable({ title, data, columns, pageSize = 10, actions }: DataTableProps) {
  const [page, setPage] = useState(1)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const totalPages = Math.ceil(data.length / pageSize)
  const paged = data.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
      {/* Table Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{data.length} records found</p>
        </div>
      </div>

      {/* Table — horizontally scrollable on mobile */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full" style={{ minWidth: 480 }}>
          <thead>
            <tr style={{ background: 'var(--table-header-bg)' }}>
              {columns.map(col => (
                <th key={col.key} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={row.id || i}
                onMouseEnter={() => setHoveredRow(row.id || String(i))}
                onMouseLeave={() => setHoveredRow(null)}
                className="transition-colors duration-150"
                style={{
                  borderTop: '1px solid var(--card-border)',
                  background: hoveredRow === (row.id || String(i)) ? 'color-mix(in srgb, var(--accent) 4%, var(--card-bg))' : 'var(--card-bg)',
                }}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                  </td>
                ))}
                {actions && (
                  <td className="px-5 py-3.5">
                    <div
                      className="flex items-center gap-2 transition-opacity duration-200"
                      style={{ opacity: hoveredRow === (row.id || String(i)) ? 1 : 0.4 }}
                    >
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        current={page}
        total={totalPages}
        dataLength={data.length}
        pageSize={pageSize}
        onChange={setPage}
      />
    </div>
  )
}
