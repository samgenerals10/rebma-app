import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, AlertTriangle, TrendingDown, TrendingUp, Warehouse } from 'lucide-react'

export default async function OperationsDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('role, department').eq('id', user.id).single()

  if (!currentUser) redirect('/login')

  if (currentUser.department !== 'operations' && currentUser.role !== 'ceo' && currentUser.role !== 'manager' && currentUser.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: products } = await supabase
    .from('products').select('*').order('name', { ascending: true })

  const { data: stock } = await supabase.from('stock').select('*')

  const { data: recentMovements } = await supabase
    .from('stock_ledger').select('*').order('created_at', { ascending: false }).limit(10)

  const stockMap = new Map(stock?.map(s => [s.product_id, s]) || [])
  const lowStockCount = products?.filter(p => (stockMap.get(p.id)?.quantity || 0) <= (p.reorder_level || 0)).length || 0
  const totalStock = stock?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0

  return (
    <div>
      {/* Action buttons — top */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Live Inventory</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Stock levels and movements</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/operations/receive"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Package className="w-4 h-4" />
            Goods Receipt
          </Link>
          <Link
            href="/dashboard/operations/suppliers"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
          >
            <Warehouse className="w-4 h-4" />
            Suppliers
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products?.length || 0, icon: Package, color: '#1a73e8', bg: '#1a73e815' },
          { label: 'Total Stock Units', value: totalStock.toLocaleString(), icon: Warehouse, color: '#059669', bg: '#05966915' },
          { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: '#dc2626', bg: '#dc262615' },
          { label: 'Recent Movements', value: recentMovements?.length || 0, icon: TrendingUp, color: '#8b5cf6', bg: '#8b5cf615' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: stat.bg }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color === '#dc2626' ? stat.color : 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live Inventory */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Live Inventory</h2>
            <Link href="/dashboard/operations/receive" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              + Receive Goods
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--table-header-bg)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>SKU</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Qty</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Reorder</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product, i) => {
                const stockItem = stockMap.get(product.id)
                const qty = stockItem?.quantity || 0
                const isLow = qty <= (product.reorder_level || 0)
                return (
                  <tr
                    key={product.id}
                    style={{
                      borderTop: i > 0 ? '1px solid var(--card-border)' : 'none',
                    }}
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.category}</p>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{product.sku}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        <span className="font-bold text-sm" style={{ color: isLow ? '#dc2626' : '#059669' }}>{qty}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-sm" style={{ color: 'var(--text-secondary)' }}>{product.reorder_level || 0}</td>
                  </tr>
                )
              })}
              {(!products || products.length === 0) && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Stock Movements */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Stock Movements</h2>
          </div>
          <div>
            {recentMovements?.map((movement, i) => (
              <div
                key={i}
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{movement.reference_type || 'Stock Movement'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{new Date(movement.created_at).toLocaleString()}</p>
                  {movement.notes && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{movement.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  {movement.quantity_change >= 0
                    ? <TrendingUp className="w-4 h-4" style={{ color: '#059669' }} />
                    : <TrendingDown className="w-4 h-4" style={{ color: '#dc2626' }} />
                  }
                  <span className="font-bold text-sm" style={{ color: movement.quantity_change >= 0 ? '#059669' : '#dc2626' }}>
                    {movement.quantity_change >= 0 ? '+' : ''}{movement.quantity_change}
                  </span>
                </div>
              </div>
            ))}
            {(!recentMovements || recentMovements.length === 0) && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No stock movements yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
