import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, AlertTriangle, TrendingDown, TrendingUp, Warehouse, Navigation } from 'lucide-react'
import OrdersToPrep from '@/components/operations/OrdersToPrep'
import OperationsTabs from '@/components/operations/OperationsTabs'
import ProductionRequestsOperations from '@/components/operations/ProductionRequestsOperations'

export default async function OperationsDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('*').eq('id', user.id).single()
  if (!currentUser) redirect('/login')
  if (currentUser.department !== 'operations' && currentUser.role !== 'ceo' && currentUser.role !== 'manager' && currentUser.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: products } = await supabase.from('products').select('*').order('name', { ascending: true })
  const { data: stock } = await supabase.from('stock').select('*')
  const { data: recentMovements } = await supabase.from('stock_ledger').select('*').order('created_at', { ascending: false })
  const { data: orders } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*, products(name, sku, unit_of_measure))')
    .in('status', ['approved', 'preparing', 'ready_for_dispatch', 'dispatched', 'delivered'])
    .order('created_at', { ascending: false })
  const { data: receipts } = await supabase
    .from('goods_receipts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  const { data: productionRequests } = await supabase
    .from('repack_jobs')
    .select('*')
    .eq('status', 'pending_operations')
    .order('created_at', { ascending: false })

  const stockMap = new Map(stock?.map(s => [s.product_id, s]) || [])
  const lowStockCount = products?.filter(p => (stockMap.get(p.id)?.quantity || 0) <= (p.reorder_level || 0)).length || 0
  const totalStock = stock?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0
  const pendingPrep = orders?.filter(o => o.status === 'approved').length || 0
  const pendingProdReqs = productionRequests?.length || 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Operations</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Orders, inventory and stock movements</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Orders to Prepare', value: pendingPrep, icon: Package, color: pendingPrep > 0 ? '#dc2626' : '#059669', bg: pendingPrep > 0 ? '#dc262615' : '#05966915' },
          { label: 'Production Requests', value: pendingProdReqs, icon: Warehouse, color: pendingProdReqs > 0 ? '#8b5cf6' : '#6b7280', bg: pendingProdReqs > 0 ? '#8b5cf615' : '#f3f4f6' },
          { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: '#dc2626', bg: '#dc262615' },
          { label: 'Total Products', value: products?.length || 0, icon: TrendingUp, color: '#1a73e8', bg: '#1a73e815' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: stat.bg }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Orders to Prepare */}
      <OrdersToPrep orders={orders || []} currentUser={currentUser} />

      {/* Production Requests */}
      <ProductionRequestsOperations requests={productionRequests || []} currentUser={currentUser} />

      {/* Tabbed Interface for Receipts, Inventory, and Movements */}
      <OperationsTabs 
        receipts={receipts || []} 
        products={products || []} 
        stockMap={stockMap} 
        recentMovements={recentMovements || []} 
      />
    </div>
  )
}
