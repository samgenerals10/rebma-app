import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Users, Package, DollarSign, Truck, ShoppingCart, Factory, ShieldAlert, ArrowRight, Activity, Anchor, Briefcase, ChevronRight, CheckCircle, Clock, Navigation, AlertTriangle } from 'lucide-react'

export default async function ExecutiveDashboard() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single()
  if (user?.role !== 'ceo') redirect('/dashboard')

  // Parallel data fetching for performance
  const [
    { data: orders },
    { data: payments },
    { data: employees },
    { data: products },
    { data: stock },
    { data: ceoQueue }
  ] = await Promise.all([
    supabase.from('orders').select('*, order_items(*, products(*))'),
    supabase.from('payments').select('*'),
    supabase.from('employees').select('department'),
    supabase.from('products').select('*'),
    supabase.from('stock').select('*'),
    supabase.from('approval_queue').select('*').eq('status', 'pending').eq('department', 'ceo').order('created_at', { ascending: false })
  ])

  // Revenue & Metrics
  const totalRevenue = orders?.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0) || 0

  // Headcount by Dept
  const deptCount: Record<string, number> = {}
  employees?.forEach(e => { deptCount[e.department] = (deptCount[e.department] || 0) + 1 })

  // Top Products (Mock calculation based on order items)
  const productSales: Record<string, { name: string, total: number, qty: number }> = {}
  orders?.forEach(o => {
    o.order_items?.forEach((item: any) => {
      const p = item.products
      if (p) {
        if (!productSales[p.id]) productSales[p.id] = { name: p.name, total: 0, qty: 0 }
        productSales[p.id].total += (item.quantity * parseFloat(item.unit_price))
        productSales[p.id].qty += item.quantity
      }
    })
  })
  const topProducts = Object.values(productSales).sort((a, b) => b.total - a.total).slice(0, 5)

  // Orders by Status
  const statusCount = { approved: 0, preparing: 0, ready: 0, dispatched: 0, delivered: 0 }
  orders?.forEach(o => {
    if (o.status === 'approved') statusCount.approved++
    if (o.status === 'preparing') statusCount.preparing++
    if (o.status === 'ready_for_dispatch') statusCount.ready++
    if (o.status === 'dispatched') statusCount.dispatched++
    if (o.status === 'delivered') statusCount.delivered++
  })

  // Live Stock Valuation
  const stockMap = new Map(stock?.map(s => [s.product_id, s]) || [])
  const lowStockProducts = products?.filter(p => (stockMap.get(p.id)?.quantity || 0) <= (p.reorder_level || 0)) || []

  const departments = [
    { name: 'Management', icon: Briefcase, count: deptCount['management'] || 1, color: '#6366f1' },
    { name: 'Finance', icon: DollarSign, count: deptCount['finance'] || 0, color: '#10b981' },
    { name: 'Marketing', icon: ShoppingCart, count: deptCount['marketing'] || 0, color: '#f59e0b' },
    { name: 'Operations', icon: Package, count: deptCount['operations'] || 0, color: '#3b82f6' },
    { name: 'Production', icon: Factory, count: deptCount['production'] || 0, color: '#ec4899' },
    { name: 'Dispatch', icon: Truck, count: deptCount['dispatch'] || 0, color: '#f43f5e' },
    { name: 'HR', icon: Users, count: deptCount['hr'] || 0, color: '#8b5cf6' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Cockpit Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">CEO Cockpit</span>
          </div>
          <h1 className="text-3xl font-bold">Executive Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time telemetry across all 8 departments.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/dispatch/tracking" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-900/50">
            <Navigation className="w-4 h-4" /> Live GPS Fleet
          </Link>
          <Link href="/dashboard/operations/imports" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-900/50">
            <Anchor className="w-4 h-4" /> Import Operations
          </Link>
          <Link href="/dashboard/management" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition border border-gray-700">
            <ShieldAlert className="w-4 h-4" /> Management Queue
          </Link>
        </div>
      </div>

      {/* Primary Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Revenue', value: `GH₵ ${(totalRevenue / 1000).toFixed(1)}k`, trend: '+14%', color: '#10b981' },
          { label: 'Pending Approvals', value: ceoQueue?.length || 0, trend: ceoQueue?.length ? 'Action Req' : 'Clear', color: ceoQueue?.length ? '#f59e0b' : '#6b7280' },
          { label: 'Total Orders', value: orders?.length || 0, trend: 'Active', color: '#3b82f6' },
          { label: 'Staff Headcount', value: employees?.length || 0, trend: '8 Depts', color: '#8b5cf6' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-full" style={{ background: stat.color }}></div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold mt-1" style={{ color: stat.color }}>{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Orders Pipeline (Bar Chart emulation) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Order Fulfillment Pipeline</h2>
          <div className="flex flex-col justify-center h-48 space-y-4">
            {[
              { label: 'New / Approved', count: statusCount.approved, color: '#3b82f6' },
              { label: 'Preparing in Warehouse', count: statusCount.preparing, color: '#f59e0b' },
              { label: 'Ready for Dispatch', count: statusCount.ready, color: '#10b981' },
              { label: 'Currently in Transit', count: statusCount.dispatched, color: '#8b5cf6' },
              { label: 'Successfully Delivered', count: statusCount.delivered, color: '#64748b' },
            ].map((bar, i) => {
              const max = Math.max(1, orders?.length || 1)
              const width = Math.max(2, (bar.count / max) * 100)
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-40 text-xs font-medium text-gray-600 text-right">{bar.label}</div>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden flex items-center">
                    <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${width}%`, backgroundColor: bar.color }}></div>
                  </div>
                  <div className="w-8 text-xs font-bold text-gray-900">{bar.count}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CEO Approval Queue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Requires Attention</h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{ceoQueue?.length || 0} items</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {ceoQueue?.map(item => (
              <div key={item.id} className="p-3 rounded-lg hover:bg-gray-50 flex items-start gap-3 border border-transparent hover:border-gray-100 transition">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate capitalize">{item.title || item.type?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-2" />
              </div>
            ))}
            {(!ceoQueue || ceoQueue.length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-10">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <p className="text-sm font-medium">No pending CEO approvals</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Top Selling Products</h2>
          </div>
          <div className="p-0">
            {topProducts.map((prod, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-gray-400 w-4">{i + 1}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{prod.name}</p>
                    <p className="text-xs text-gray-500">{prod.qty} units sold</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-600">GH₵ {prod.total.toLocaleString()}</p>
              </div>
            ))}
            {topProducts.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No sales data yet</div>}
          </div>
        </div>

        {/* Headcount by Department */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Staff Headcount</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            {departments.map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <dept.icon className="w-4 h-4" style={{ color: dept.color }} />
                  <span className="text-xs font-bold text-gray-700">{dept.name}</span>
                </div>
                <span className="text-sm font-extrabold text-gray-900">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Inventory Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Inventory Health</h2>
            <span className="text-xs font-bold text-gray-500">{products?.length || 0} Total SKUs</span>
          </div>
          <div className="flex-1 p-5">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-800">{lowStockProducts.length} Products Low on Stock</p>
                <p className="text-xs text-red-600 mt-1">These items require immediate reorder from suppliers.</p>
              </div>
            </div>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 4).map(p => {
                const qty = stockMap.get(p.id)?.quantity || 0
                return (
                  <div key={p.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                    <span className="font-medium text-gray-700">{p.name}</span>
                    <span className="font-bold text-red-600">{qty} left</span>
                  </div>
                )
              })}
            </div>
            <Link href="/dashboard/operations" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition">
              View Full Inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}