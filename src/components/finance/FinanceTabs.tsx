'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Clock, 
  ChevronRight, 
  Calendar,
  Package,
  TrendingUp,
  FileText
} from 'lucide-react'

interface FinanceTabsProps {
  orders: any[]
}

export default function FinanceTabs({ orders }: FinanceTabsProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'products' | 'orders'>('payments')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Filter orders by date
  const filteredOrders = useMemo(() => {
    if (!startDate && !endDate) return orders
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0]
      if (startDate && orderDate < startDate) return false
      if (endDate && orderDate > endDate) return false
      return true
    })
  }, [orders, startDate, endDate])

  // Payment Mode Breakdown
  const paymentModeBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number, total: number }> = {
      cash: { count: 0, total: 0 },
      cheque: { count: 0, total: 0 },
      mobile_money: { count: 0, total: 0 },
      credit: { count: 0, total: 0 }
    }

    filteredOrders.forEach(order => {
      const mode = order.payment_mode || 'cash'
      if (breakdown[mode]) {
        breakdown[mode].count += 1
        breakdown[mode].total += parseFloat(order.total_amount) || 0
      } else {
        breakdown[mode] = { count: 1, total: parseFloat(order.total_amount) || 0 }
      }
    })

    return Object.entries(breakdown).map(([mode, data]) => ({
      mode,
      ...data
    })).sort((a, b) => b.total - a.total)
  }, [filteredOrders])

  // Product Sales Breakdown
  const productSalesBreakdown = useMemo(() => {
    const breakdown: Record<string, { name: string, qty: number, total: number }> = {}

    filteredOrders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const prodName = item.products?.name || 'Unknown Product'
        if (!breakdown[prodName]) {
          breakdown[prodName] = { name: prodName, qty: 0, total: 0 }
        }
        breakdown[prodName].qty += item.quantity || 0
        breakdown[prodName].total += (item.quantity * item.unit_price) || 0
      })
    })

    return Object.values(breakdown).sort((a, b) => b.total - a.total)
  }, [filteredOrders])

  const getPaymentConfig = (mode: string) => {
    switch (mode) {
      case 'cash': return { icon: Banknote, color: '#059669', label: 'Cash' }
      case 'cheque': return { icon: CreditCard, color: '#1a73e8', label: 'Cheque' }
      case 'mobile_money': return { icon: Smartphone, color: '#f59e0b', label: 'Mobile Money' }
      case 'credit': return { icon: Clock, color: '#dc2626', label: 'Credit' }
      default: return { icon: Banknote, color: '#059669', label: mode }
    }
  }

  return (
    <div className="rounded-xl overflow-hidden mt-8" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)' }}>
      {/* Date Filter & Tab Navigation */}
      <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'payments', label: 'Payment Mode Breakdown' },
              { id: 'products', label: 'Product Sales Breakdown' },
              { id: 'orders', label: `Orders (${filteredOrders.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                style={{ 
                  background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  border: activeTab === tab.id ? '1px solid var(--accent)' : '1px solid transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs" style={{ background: 'var(--table-header-bg)', borderColor: 'var(--card-border)' }}>
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 text-gray-700 dark:text-gray-200"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none focus:ring-0 text-gray-700 dark:text-gray-200"
              />
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate('') }} className="ml-1 text-red-500 hover:text-red-700">Clear</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-0">
        {/* PAYMENTS BREAKDOWN */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Payment Mode</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Orders</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Volume</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {paymentModeBreakdown.map((item, i) => {
                  const { icon: Icon, color, label } = getPaymentConfig(item.mode)
                  return (
                    <tr key={item.mode} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '15' }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.count}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold" style={{ color: color }}>GH₵ {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/finance/reports?mode=${item.mode}&start=${startDate}&end=${endDate}`} className="text-xs font-medium hover:underline flex items-center justify-end gap-1" style={{ color: 'var(--accent)' }}>
                          View Reports <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PRODUCTS BREAKDOWN */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Product Name</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Quantity Sold</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Sales</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {productSalesBreakdown.map((item, i) => (
                  <tr key={item.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#05966915' }}>
                          <Package className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.qty}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">GH₵ {item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold text-xs">
                        <TrendingUp className="w-3 h-3" /> 
                        Top Seller
                      </div>
                    </td>
                  </tr>
                ))}
                {productSalesBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No sales data for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Order #</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Amount</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {filteredOrders.map((order, i) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{order.customers?.name || 'Walk-in Customer'}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ 
                        background: order.status === 'approved' ? '#05966915' : order.status === 'rejected' ? '#dc262615' : '#f59e0b15',
                        color: order.status === 'approved' ? '#059669' : order.status === 'rejected' ? '#dc2626' : '#f59e0b'
                      }}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold" style={{ color: 'var(--text-primary)' }}>GH₵ {parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/marketing/orders/${order.id}`} className="text-xs font-medium hover:underline flex items-center justify-end gap-1" style={{ color: 'var(--accent)' }}>
                        Details <FileText className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No orders found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
