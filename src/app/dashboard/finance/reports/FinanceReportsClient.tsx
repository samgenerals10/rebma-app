'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, TrendingUp, ShoppingCart, Banknote, CreditCard } from 'lucide-react'

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'annual', label: 'Annual' },
]

function getDateRange(period: Period, offset = 0): { start: Date; end: Date; label: string } {
  const now = new Date()
  let start = new Date(), end = new Date(), label = ''

  if (period === 'daily') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)
    end = new Date(start)
    end.setDate(end.getDate() + 1)
    label = start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } else if (period === 'weekly') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) - (offset * 7)
    start = new Date(now.getFullYear(), now.getMonth(), diff)
    end = new Date(start)
    end.setDate(end.getDate() + 7)
    label = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' – ' + new Date(end.getTime() - 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } else if (period === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1)
    label = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  } else if (period === 'quarterly') {
    const quarter = Math.floor(now.getMonth() / 3) - offset
    const year = now.getFullYear() + Math.floor(quarter / 4)
    const q = ((quarter % 4) + 4) % 4
    start = new Date(year, q * 3, 1)
    end = new Date(year, q * 3 + 3, 1)
    label = 'Q' + (q + 1) + ' ' + year
  } else {
    start = new Date(now.getFullYear() - offset, 0, 1)
    end = new Date(now.getFullYear() - offset + 1, 0, 1)
    label = (now.getFullYear() - offset).toString()
  }

  return { start, end, label }
}

export default function FinanceReportsClient({ orders, payments, currentUser }: { orders: any[], payments: any[], currentUser: any }) {
  const [period, setPeriod] = useState<Period>('monthly')
  const [offset, setOffset] = useState(0)
  const printRef = useRef<HTMLDivElement>(null)

  const { start, end, label } = getDateRange(period, offset)

  const filteredOrders = orders.filter(o => {
    const d = new Date(o.created_at)
    return d >= start && d < end
  })

  const filteredPayments = payments.filter(p => {
    const d = new Date(p.created_at)
    return d >= start && d < end
  })

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  const cashOrders = filteredOrders.filter(o => o.payment_mode === 'cash')
  const chequeOrders = filteredOrders.filter(o => o.payment_mode === 'cheque')
  const momoOrders = filteredOrders.filter(o => o.payment_mode === 'mobile_money')
  const creditOrders = filteredOrders.filter(o => o.payment_mode === 'credit')

  const cashTotal = cashOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  const chequeTotal = chequeOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  const momoTotal = momoOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  const creditTotal = creditOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)

  // Product breakdown
  const productMap: Record<string, { name: string; qty: number; total: number }> = {}
  filteredOrders.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const name = item.products?.name || 'Unknown'
      if (!productMap[name]) productMap[name] = { name, qty: 0, total: 0 }
      productMap[name].qty += item.quantity
      productMap[name].total += item.quantity * parseFloat(item.unit_price || 0)
    })
  })
  const productRows = Object.values(productMap).sort((a, b) => b.total - a.total)

  const handlePrint = () => window.print()

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <Link href="/dashboard/finance" className="p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Financial Reports</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Revenue, payments and order breakdowns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'white' }}>
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => { setPeriod(p.key); setOffset(0) }}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition"
              style={{ background: period === p.key ? 'var(--accent)' : 'transparent', color: period === p.key ? 'white' : 'var(--text-secondary)' }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(o => o + 1)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)', border: '1px solid var(--card-border)' }}>
            ← Prev
          </button>
          <span className="text-sm font-medium px-3" style={{ color: 'var(--text-primary)' }}>{label}</span>
          <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0}
            className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)', border: '1px solid var(--card-border)' }}>
            Next →
          </button>
        </div>
      </div>

      {/* Report content */}
      <div ref={printRef} className="space-y-6">

        {/* Print header */}
        <div className="hidden print:block mb-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold">REBMA IMPEX GHANA LIMITED</p>
              <p className="text-sm text-gray-500">Financial Report — {label}</p>
              <p className="text-xs text-gray-400">Generated: {new Date().toLocaleString('en-GB')}</p>
            </div>
            <img src="/rebma-logo.jpg" alt="REBMA" style={{ height: 60, objectFit: 'contain' }} />
          </div>
          <hr className="mt-4 border-gray-300" />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: 'GH₵' + totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: TrendingUp, color: '#059669', bg: '#05966915' },
            { label: 'Total Orders', value: filteredOrders.length, icon: ShoppingCart, color: '#1a73e8', bg: '#1a73e815' },
            { label: 'Cash Collected', value: 'GH₵' + cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: Banknote, color: '#f59e0b', bg: '#f59e0b15' },
            { label: 'Credit Orders', value: creditOrders.length, icon: CreditCard, color: '#dc2626', bg: '#dc262615' },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 print:hidden" style={{ background: stat.bg }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Payment mode breakdown */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Payment Mode Breakdown</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--table-header-bg)' }}>
                {['Payment Mode', 'Orders', 'Total Amount', '% of Revenue'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { mode: 'Cash', orders: cashOrders.length, total: cashTotal, color: '#059669' },
                { mode: 'Cheque', orders: chequeOrders.length, total: chequeTotal, color: '#1a73e8' },
                { mode: 'Mobile Money', orders: momoOrders.length, total: momoTotal, color: '#f59e0b' },
                { mode: 'Credit', orders: creditOrders.length, total: creditTotal, color: '#dc2626' },
              ].map((row, i) => (
                <tr key={row.mode} style={{ borderTop: '1px solid var(--card-border)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.mode}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{row.orders}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>GH₵{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {totalRevenue > 0 ? ((row.total / totalRevenue) * 100).toFixed(1) + '%' : '0%'}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total</td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{filteredOrders.length}</td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>GH₵{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Product breakdown */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Product Sales Breakdown</h3>
          </div>
          {productRows.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No sales in this period</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  {['Product', 'Units Sold', 'Revenue', '% of Total'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productRows.map((row, i) => (
                  <tr key={row.name} style={{ borderTop: '1px solid var(--card-border)' }}>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.name}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{row.qty}</td>
                    <td className="px-5 py-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>GH₵{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {totalRevenue > 0 ? ((row.total / totalRevenue) * 100).toFixed(1) + '%' : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Orders list */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Orders ({filteredOrders.length})</h3>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No orders in this period</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  {['Order #', 'Customer', 'Payment', 'Status', 'Amount', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => (
                  <tr key={order.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                    <td className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{order.order_number}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-primary)' }}>{order.customers?.name}</td>
                    <td className="px-5 py-3 text-xs capitalize" style={{ color: 'var(--text-primary)' }}>{order.payment_mode?.replace(/_/g, ' ') || 'N/A'}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--table-header-bg)', color: 'var(--text-secondary)' }}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Print footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">REBMA IMPEX GHANA LIMITED — Confidential Financial Report — {label}</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  )
}
