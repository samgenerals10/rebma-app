'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, TrendingUp, ShoppingCart, Banknote, CreditCard, ChevronUp, ChevronDown, Calendar, Smartphone, Package, Search, Eye, Clock } from 'lucide-react'

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'annual', label: 'Annual' },
]

type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: string; active: string | null; dir: SortDir }) {
  if (active !== col) return <ChevronUp className="w-3 h-3 opacity-20 inline ml-1" />
  return dir === 'asc'
    ? <ChevronUp className="w-3 h-3 inline ml-1" style={{ color: 'var(--accent)' }} />
    : <ChevronDown className="w-3 h-3 inline ml-1" style={{ color: 'var(--accent)' }} />
}

function useSortable(defaultCol: string | null = null, defaultDir: SortDir = 'desc') {
  const [sortCol, setSortCol] = useState<string | null>(defaultCol)
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir)

  function toggle(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  return { sortCol, sortDir, toggle }
}

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
  const [generatedAt, setGeneratedAt] = useState('')
  useEffect(() => { setGeneratedAt(new Date().toLocaleString('en-GB')) }, [])

  const [period, setPeriod] = useState<Period>('daily')
  const [offset, setOffset] = useState(0)
  const [activeTab, setActiveTab] = useState<'payments' | 'products' | 'orders'>('payments')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
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

  const paymentRows = [
    { mode: 'Cash', orders: cashOrders.length, total: cashTotal, color: '#059669' },
    { mode: 'Cheque', orders: chequeOrders.length, total: chequeTotal, color: '#1a73e8' },
    { mode: 'Mobile Money', orders: momoOrders.length, total: momoTotal, color: '#f59e0b' },
    { mode: 'Credit', orders: creditOrders.length, total: creditTotal, color: '#dc2626' },
  ]

  const pmSort = useSortable()
  const sortedPaymentRows = [...paymentRows].sort((a, b) => {
    if (!pmSort.sortCol) return 0
    let av: any, bv: any
    if (pmSort.sortCol === 'mode') { av = a.mode; bv = b.mode }
    else if (pmSort.sortCol === 'orders') { av = a.orders; bv = b.orders }
    else if (pmSort.sortCol === 'total') { av = a.total; bv = b.total }
    else if (pmSort.sortCol === 'pct') { av = a.total; bv = b.total }
    if (typeof av === 'string') return pmSort.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return pmSort.sortDir === 'asc' ? av - bv : bv - av
  })

  const productMap: Record<string, { name: string; qty: number; total: number }> = {}
  filteredOrders.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const name = item.products?.name || 'Unknown'
      if (!productMap[name]) productMap[name] = { name, qty: 0, total: 0 }
      productMap[name].qty += item.quantity
      productMap[name].total += item.quantity * parseFloat(item.unit_price || 0)
    })
  })
  const productRows = Object.values(productMap)

  const prodSort = useSortable('total', 'desc')
  const sortedProductRows = [...productRows].sort((a, b) => {
    if (!prodSort.sortCol) return b.total - a.total
    let av: any, bv: any
    if (prodSort.sortCol === 'name') { av = a.name; bv = b.name }
    else if (prodSort.sortCol === 'qty') { av = a.qty; bv = b.qty }
    else if (prodSort.sortCol === 'total') { av = a.total; bv = b.total }
    else if (prodSort.sortCol === 'pct') { av = a.total; bv = b.total }
    if (typeof av === 'string') return prodSort.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return prodSort.sortDir === 'asc' ? av - bv : bv - av
  })

  const ordSort = useSortable('date', 'desc')
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!ordSort.sortCol) return 0
    let av: any, bv: any
    if (ordSort.sortCol === 'order') { av = a.order_number || ''; bv = b.order_number || '' }
    else if (ordSort.sortCol === 'customer') { av = a.customers?.name || ''; bv = b.customers?.name || '' }
    else if (ordSort.sortCol === 'payment') { av = a.payment_mode || ''; bv = b.payment_mode || '' }
    else if (ordSort.sortCol === 'status') { av = a.status || ''; bv = b.status || '' }
    else if (ordSort.sortCol === 'amount') { av = parseFloat(a.total_amount || 0); bv = parseFloat(b.total_amount || 0) }
    else if (ordSort.sortCol === 'date') { av = new Date(a.created_at).getTime(); bv = new Date(b.created_at).getTime() }
    if (typeof av === 'string') return ordSort.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return ordSort.sortDir === 'asc' ? av - bv : bv - av
  })

  const thStyle = { color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' as const }
  const handlePrint = () => window.print()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <Link href="/dashboard/finance" className="p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Financial Reports</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Revenue, payments and order breakdowns</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handlePrint}
            className="flex items-center gap-2 p-2 md:px-4 md:py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            <Printer className="w-4 h-4" /> <span className="hidden md:inline">Print</span>
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 p-2 md:px-4 md:py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'white' }}>
            <Download className="w-4 h-4" /> <span className="hidden md:inline">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="mb-6 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Time Period</span>
            <div className="flex gap-1 p-1 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              {PERIODS.map(p => (
                <button key={p.key} onClick={() => { setPeriod(p.key); setOffset(0) }}
                  className="px-3 py-1 rounded-md text-xs font-semibold transition whitespace-nowrap"
                  style={{ background: period === p.key ? 'var(--accent)' : 'transparent', color: period === p.key ? 'white' : 'var(--text-secondary)' }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Browse Date</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setOffset(o => o + 1)}
                className="p-2 rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ color: 'var(--text-secondary)' }}>
                ←
              </button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm min-w-[180px] justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)' }}>
                <Calendar className="w-4 h-4" />
                {label}
              </div>
              <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0}
                className="p-2 rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                style={{ color: 'var(--text-secondary)' }}>
                →
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Search Activities</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders, customers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-800/50 border-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b mb-6 print:hidden" style={{ borderColor: 'var(--card-border)' }}>
        {[
          { id: 'payments', label: 'Payment Mode Breakdown', icon: Banknote },
          { id: 'products', label: 'Product Sales Breakdown', icon: Package },
          { id: 'orders', label: `Activity List (${filteredOrders.length})`, icon: ShoppingCart },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 py-4 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2"
            style={{ 
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              background: activeTab === tab.id ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent'
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={printRef} className="space-y-6">
        <div className="hidden print:block mb-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold">REBMA IMPEX GHANA LIMITED</p>
              <p className="text-sm text-gray-500">Financial Report — {label}</p>
              <p className="text-xs text-gray-400">Generated: {generatedAt}</p>
            </div>
            <img src="/rebma-logo.jpg" alt="REBMA" style={{ height: 60, objectFit: 'contain' }} />
          </div>
          <hr className="mt-4 border-gray-300" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Payment Mode Breakdown */}
        {activeTab === 'payments' && (
          <div className="rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Payment Mode Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 480 }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)' }}>
                    {[
                      { key: 'mode', label: 'Payment Mode' },
                      { key: 'orders', label: 'Orders' },
                      { key: 'total', label: 'Total Amount' },
                      { key: 'pct', label: '% of Revenue' },
                    ].map(h => (
                      <th key={h.key} onClick={() => pmSort.toggle(h.key)}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={thStyle}>
                        {h.label}
                        <SortIcon col={h.key} active={pmSort.sortCol} dir={pmSort.sortDir} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedPaymentRows.map((row) => (
                    <tr key={row.mode} style={{ borderTop: '1px solid var(--card-border)' }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: row.color + '15' }}>
                            {row.mode === 'Cash' && <Banknote className="w-4 h-4" style={{ color: row.color }} />}
                            {row.mode === 'Cheque' && <CreditCard className="w-4 h-4" style={{ color: row.color }} />}
                            {row.mode === 'Mobile Money' && <Smartphone className="w-4 h-4" style={{ color: row.color }} />}
                            {row.mode === 'Credit' && <Clock className="w-4 h-4" style={{ color: row.color }} />}
                          </div>
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{row.mode}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.orders}</td>
                      <td className="px-5 py-4 text-sm font-bold" style={{ color: row.color }}>GH₵{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full" style={{ width: (totalRevenue > 0 ? (row.total / totalRevenue) * 100 : 0) + '%', background: row.color }} />
                          </div>
                          <span className="w-10 text-right">{totalRevenue > 0 ? ((row.total / totalRevenue) * 100).toFixed(1) + '%' : '0%'}</span>
                        </div>
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
          </div>
        )}

        {/* Product Sales Breakdown */}
        {activeTab === 'products' && (
          <div className="rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Product Sales Breakdown</h3>
            </div>
            {sortedProductRows.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No sales in this period</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: 400 }}>
                  <thead>
                    <tr style={{ background: 'var(--table-header-bg)' }}>
                      {[
                        { key: 'name', label: 'Product' },
                        { key: 'qty', label: 'Units Sold' },
                        { key: 'total', label: 'Revenue' },
                        { key: 'pct', label: '% of Total' },
                      ].map(h => (
                        <th key={h.key} onClick={() => prodSort.toggle(h.key)}
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={thStyle}>
                          {h.label}
                          <SortIcon col={h.key} active={prodSort.sortCol} dir={prodSort.sortDir} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProductRows.map((row) => (
                      <tr key={row.name} style={{ borderTop: '1px solid var(--card-border)' }} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                              <Package className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{row.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.qty}</td>
                        <td className="px-5 py-4 text-sm font-bold text-emerald-600">GH₵{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: (totalRevenue > 0 ? (row.total / totalRevenue) * 100 : 0) + '%' }} />
                            </div>
                            <span className="w-10 text-right">{totalRevenue > 0 ? ((row.total / totalRevenue) * 100).toFixed(1) + '%' : '0%'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders List */}
        {activeTab === 'orders' && (
          <div className="rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Activity Log ({filteredOrders.length})</h3>
              <div className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-600">Live</div>
            </div>
            {filteredOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No activities recorded for this date</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: 560 }}>
                  <thead>
                    <tr style={{ background: 'var(--table-header-bg)' }}>
                      {[
                        { key: 'order', label: 'Order #' },
                        { key: 'customer', label: 'Customer' },
                        { key: 'payment', label: 'Payment' },
                        { key: 'status', label: 'Status' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'action', label: '' },
                      ].map(h => (
                        <th key={h.key} onClick={() => h.key !== 'action' && ordSort.toggle(h.key)}
                          className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider ${h.key !== 'action' ? 'cursor-pointer' : ''}`}
                          style={thStyle}>
                          {h.label}
                          {h.key !== 'action' && <SortIcon col={h.key} active={ordSort.sortCol} dir={ordSort.sortDir} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrders.map((order) => (
                      <tr key={order.id} style={{ borderTop: '1px solid var(--card-border)' }} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-4 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{order.order_number}</td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{order.customers?.name}</p>
                          <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                            {order.payment_mode?.replace(/_/g, ' ') || 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            order.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                            order.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/dashboard/marketing/orders/${order.id}`} className="p-2 rounded-lg bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-50 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
