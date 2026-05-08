'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-center mt-6">
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-2xl"
        style={{
          background: 'var(--card-bg)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid var(--card-border)',
        }}
      >
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-full transition hover:opacity-70 disabled:opacity-30"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Pages */}
        {getPages().map((page, i) => (
          page === '...' ? (
            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition"
              style={{
                background: currentPage === page ? 'var(--accent)' : 'var(--input-bg)',
                color: currentPage === page ? 'white' : 'var(--text-secondary)',
                fontWeight: currentPage === page ? 700 : 500,
              }}
            >
              {page}
            </button>
          )
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-full transition hover:opacity-70 disabled:opacity-30"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
