'use client'
import OrderStepper from '@/components/OrderStepper'
import { Activity } from 'lucide-react'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Settings, Eye } from 'lucide-react'

const PAGE_SIZE = 10

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  pending_finance: { bg: '#f59e0b15', color: '#f59e0b', dot: '#f59e0b' },
  pending_manager: { bg: '#dc262615', color: '#dc2626', dot: '#dc2626' },
  approved: { bg: '#05966915', color: '#059669', dot: '#059669' },
  rejected: { bg: '#dc262615', color: '#dc2626', dot: '#dc2626' },
  preparing: { bg: '#8b5cf615', color: '#8b5cf6', dot: '#8b5cf6' },
  ready_for_dispatch: { bg: '#06b6d415', color: '#06b6d4', dot: '#06b6d4' },
  pending: { bg: '#f59e0b15', color: '#f59e0b', dot: '#f59e0b' },
  confirmed: { bg: '#1a73e815', color: '#1a73e8', dot: '#1a73e8' },
  processing: { bg: '#8b5cf615', color: '#8b5cf6', dot: '#8b5cf6' },
  dispatched: { bg: '#06b6d415', color: '#06b6d4', dot: '#06b6d4' },
  delivered: { bg: '#05966915', color: '#059669', dot: '#059669' },
  cancelled: { bg: '#dc262615', color: '#dc2626', dot: '#dc2626' },
  paid: { bg: '#05966915', color: '#059669', dot: '#059669' },
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered']

function Pagination({ current, total, pageSize, totalRecords, onChange }: {
  current: number; total: number; pageSize: number; totalRecords: number; onChange: (p: number) => void
}) {
  if (total <= 1) return null
  const getPages = () => {
    const pages: (number | '...')[] = []
    if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i) }
    else {
      pages.push(1)
      if (current > 3) pages.push('...')
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }
  const from = (current - 1) * pageSize + 1
  const to = Math.min(current * pageSize, totalRecords)

  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--card-border)' }}>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Showing {from}–{to} of {totalRecords}
      </p>
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
        <button onClick={() => onChange(current - 1)} disabled={current === 1} className="w-7 h-7 flex items-center justify-center rounded-full disabled:opacity-30 transition" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={`d${i}`} className="w-7 h-7 flex items-center justify-center text-xs" style={{ color: 'var(--text-secondary)' }}>...</span>
          ) : (
            <button key={page} onClick={() => onChange(page as number)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition"
              style={{ background: current === page ? 'var(--accent)' : 'transparent', color: current === page ? 'white' : 'var(--text-secondary)' }}
            >
              {page}
            </button>
          )
        )}
        <button onClick={() => onChange(current + 1)} disabled={current === total} className="w-7 h-7 flex items-center justify-center rounded-full disabled:opacity-30 transition" style={{ color: 'var(--text-secondary)' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function OrdersTable({ orders }: { orders: any[] }) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [viewStepperOrder, setViewStepperOrder] = useState<any | null>(null)

  const filtered = filter === 'all' ? orders : filter === 'pending' ? orders.filter(o => o.status?.startsWith('pending')) : orders.filter(o => o.status === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const filters = ['all', 'pending', 'approved', 'processing', 'dispatched', 'delivered']

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
      {/* Filter tabs */}
      <div className="px-5 pt-4 flex items-center gap-1 overflow-x-auto" style={{ borderBottom: '1px solid var(--card-border)' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className="px-4 py-2 text-sm font-medium capitalize whitespace-nowrap transition-all"
            style={{
              color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: filter === f ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {f === 'all' ? 'All Orders' : f}
          </button>
        ))}
        <div className="ml-auto pb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length} orders
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--table-header-bg)' }}>
              {['Order #', 'Customer', 'Created By', 'Amount', 'Status', 'Timeline', 'Date', 'Action'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((order, i) => {
              const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending
              const currentStep = STATUS_STEPS.indexOf(order.status)
              const isHovered = hoveredRow === order.id
              return (
                <tr
                  key={order.id}
                  onMouseEnter={() => setHoveredRow(order.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className="transition-all duration-150"
                  style={{
                    borderTop: '1px solid var(--card-border)',
                    background: isHovered ? `color-mix(in srgb, var(--accent) 4%, var(--card-bg))` : 'var(--card-bg)',
                  }}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'var(--accent)' }}>
                        {(order.customers?.name || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.customers?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {order.users?.full_name || 'N/A'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      GH₵ {parseFloat(order.total_amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                      <span className="text-xs font-medium capitalize" style={{ color: status.color }}>
                        {order.status === 'pending_finance' ? 'Pending' :
                         order.status === 'pending_manager' ? 'Awaiting Approval' :
                         order.status === 'ready_for_dispatch' ? 'Ready' :
                         order.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setViewStepperOrder(order)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-80"
                      style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                      <Activity className="w-3.5 h-3.5" />
                      Track
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span suppressHydrationWarning>{new Date(order.created_at).toLocaleDateString("en-GB")}</span><br />
                    <span suppressHydrationWarning>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 transition-all duration-200" style={{ opacity: isHovered ? 1 : 0 }}>
                      <Link
                        href={`/dashboard/marketing/orders/${order.id}`}
                        className="p-1.5 rounded-lg transition hover:opacity-80"
                        style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        className="p-1.5 rounded-lg transition hover:opacity-80"
                        style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
                        title="Actions"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination current={page} total={totalPages} pageSize={PAGE_SIZE} totalRecords={filtered.length} onChange={setPage} />
      {viewStepperOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setViewStepperOrder(null)}>
          <div className="rounded-2xl p-6 w-full max-w-lg" style={{ background: 'var(--card-bg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{viewStepperOrder.order_number}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{viewStepperOrder.customers?.name}</p>
              </div>
              <button onClick={() => setViewStepperOrder(null)} className="p-2 rounded-lg" style={{ background: 'var(--table-header-bg)', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <OrderStepper status={viewStepperOrder.status} />
            <div className="mt-4 pt-4 grid grid-cols-3 gap-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Amount</p>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(viewStepperOrder.total_amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Payment</p>
                <p className="font-bold text-sm capitalize" style={{ color: 'var(--text-primary)' }}>{viewStepperOrder.payment_mode?.replace(/_/g, ' ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Date</p>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{new Date(viewStepperOrder.created_at).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
