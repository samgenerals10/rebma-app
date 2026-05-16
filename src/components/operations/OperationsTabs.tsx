'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Package, Warehouse, TrendingUp, TrendingDown, AlertTriangle, Eye, ArrowRight } from 'lucide-react'

export default function OperationsTabs({ receipts, products, stockMap, recentMovements }: { receipts: any[], products: any[], stockMap: Map<string, any>, recentMovements: any[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlTab = (searchParams.get('tab') as any) || 'receipts'
  const [activeTab, setActiveTabState] = useState<'receipts' | 'inventory' | 'movements'>(urlTab)

  useEffect(() => {
    const tab = searchParams.get('tab') as any
    if (tab && ['receipts', 'inventory', 'movements'].includes(tab)) {
      setActiveTabState(tab)
    }
  }, [searchParams])

  const setActiveTab = (tab: 'receipts' | 'inventory' | 'movements') => {
    setActiveTabState(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
      {/* Tab Navigation */}
      <div className="flex border-b" style={{ borderColor: 'var(--card-border)' }}>
        <button
          onClick={() => setActiveTab('receipts')}
          className="flex-1 py-4 text-sm font-semibold transition-colors border-b-2"
          style={{ 
            color: activeTab === 'receipts' ? 'var(--accent)' : 'var(--text-secondary)',
            borderColor: activeTab === 'receipts' ? 'var(--accent)' : 'transparent',
            backgroundColor: activeTab === 'receipts' ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent'
          }}
        >
          My Goods Receipts
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className="flex-1 py-4 text-sm font-semibold transition-colors border-b-2"
          style={{ 
            color: activeTab === 'inventory' ? 'var(--accent)' : 'var(--text-secondary)',
            borderColor: activeTab === 'inventory' ? 'var(--accent)' : 'transparent',
            backgroundColor: activeTab === 'inventory' ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent'
          }}
        >
          Live Inventory
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className="flex-1 py-4 text-sm font-semibold transition-colors border-b-2"
          style={{ 
            color: activeTab === 'movements' ? 'var(--accent)' : 'var(--text-secondary)',
            borderColor: activeTab === 'movements' ? 'var(--accent)' : 'transparent',
            backgroundColor: activeTab === 'movements' ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent'
          }}
        >
          Recent Movements
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-0">
        
        {/* RECEIPTS TAB */}
        {activeTab === 'receipts' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  {['Receipt #', 'Supplier', 'Date', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receipts?.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                    <td className="px-5 py-3 font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{r.receipt_number}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.supplier}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span suppressHydrationWarning>{new Date(r.created_at).toLocaleDateString('en-GB')}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize" style={{
                        background: r.status === 'approved' ? '#05966915' : r.status === 'rejected' ? '#dc262615' : '#f59e0b15',
                        color: r.status === 'approved' ? '#059669' : r.status === 'rejected' ? '#dc2626' : '#f59e0b'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/dashboard/operations/goods-receipts/${r.id}`} className="inline-flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!receipts || receipts.length === 0) && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No recent receipts. <Link href="/dashboard/operations/receive" className="text-blue-500 hover:underline">Create one</Link></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  {['Product', 'SKU', 'Qty in Stock', 'Reorder Lvl'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-left last:text-right" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products?.map((product, i) => {
                  const stockItem = stockMap.get(product.id)
                  const qty = stockItem?.quantity || 0
                  const isLow = qty <= (product.reorder_level || 0)
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.category}</p>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{product.sku}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLow && <span title="Low Stock" className="flex"><AlertTriangle className="w-4 h-4" style={{ color: '#dc2626' }} /></span>}
                          <span className="font-bold text-sm" style={{ color: isLow ? '#dc2626' : '#059669' }}>{qty} {product.unit_of_measure}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-sm" style={{ color: 'var(--text-secondary)' }}>{product.reorder_level || 0}</td>
                    </tr>
                  )
                })}
                {(!products || products.length === 0) && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MOVEMENTS TAB */}
        {activeTab === 'movements' && (
          <div>
            {recentMovements?.map((movement, i) => (
              <div key={movement.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{movement.reference_type || 'Stock Adjustment'}</p>
                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">{movement.reference_id?.split('-')[0]}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    <span suppressHydrationWarning>{new Date(movement.created_at).toLocaleString('en-GB')}</span>
                  </p>
                  {movement.notes && <p className="text-sm mt-1.5 text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 pl-2">{movement.notes}</p>}
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: movement.quantity_change >= 0 ? '#05966915' : '#dc262615' }}>
                    {movement.quantity_change >= 0
                      ? <TrendingUp className="w-4 h-4" style={{ color: '#059669' }} />
                      : <TrendingDown className="w-4 h-4" style={{ color: '#dc2626' }} />}
                    <span className="font-bold text-sm" style={{ color: movement.quantity_change >= 0 ? '#059669' : '#dc2626' }}>
                      {movement.quantity_change >= 0 ? '+' : ''}{movement.quantity_change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!recentMovements || recentMovements.length === 0) && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No recent stock movements</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
