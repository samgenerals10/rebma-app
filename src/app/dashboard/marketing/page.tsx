import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Users, Plus, Phone, MapPin } from 'lucide-react'

export default async function MarketingDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('role, department').eq('id', user.id).single()

  if (!currentUser) redirect('/login')

  if (currentUser.department !== 'marketing' && currentUser.role !== 'ceo' && currentUser.role !== 'manager' && currentUser.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: customers } = await supabase
    .from('customers').select('*').order('name', { ascending: true }).limit(5)

  const { data: orders } = await supabase
    .from('orders').select('*, customers(name)').order('created_at', { ascending: false }).limit(5)

  const { data: allOrders } = await supabase
    .from('orders').select('total_amount, status')

  const totalRevenue = allOrders?.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0) || 0
  const activeOrders = allOrders?.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'paid').length || 0
  const deliveredOrders = allOrders?.filter(o => o.status === 'delivered').length || 0

  const stats = [
    { label: 'Total Customers', value: customers?.length || 0, color: '#1a73e8' },
    { label: 'Active Orders', value: activeOrders, color: '#f59e0b' },
    { label: 'Delivered', value: deliveredOrders, color: '#059669' },
    { label: 'Total Revenue', value: `GH₵ ${totalRevenue.toLocaleString()}`, color: '#8b5cf6' },
  ]

  const getStatusStyle = (status: string) => {
    if (status === 'delivered') return { background: '#05966915', color: '#059669' }
    if (status === 'paid') return { background: '#1a73e815', color: '#1a73e8' }
    if (status === 'processing') return { background: '#f59e0b15', color: '#f59e0b' }
    return { background: 'var(--card-border)', color: 'var(--text-secondary)' }
  }

  const getRiskStyle = (risk: string) => {
    if (risk === 'high') return { background: '#dc262615', color: '#dc2626' }
    if (risk === 'medium') return { background: '#f59e0b15', color: '#f59e0b' }
    return { background: '#05966915', color: '#059669' }
  }

  return (
    <div>
      {/* Header with actions at top */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Marketing & Sales</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Customers, orders and revenue</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/marketing/orders/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            New Order
          </Link>
          <Link
            href="/dashboard/marketing/customers/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Customers</h2>
            <Link href="/dashboard/marketing/customers" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              View All
            </Link>
          </div>
          <div>
            {customers?.map((customer, i) => (
              <div
                key={customer.id}
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{customer.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {customer.phone && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Phone className="w-3 h-3" />{customer.phone}
                      </span>
                    )}
                    {customer.address && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin className="w-3 h-3" />{customer.address.substring(0, 20)}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full ml-3 flex-shrink-0"
                  style={getRiskStyle(customer.risk_status)}
                >
                  {customer.risk_status || 'normal'}
                </span>
              </div>
            ))}
            {(!customers || customers.length === 0) && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No customers yet</div>
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--card-border)' }}>
            <Link
              href="/dashboard/marketing/customers/new"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium transition hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              <Plus className="w-4 h-4" /> Add Customer
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Orders</h2>
            <Link href="/dashboard/marketing/orders" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              View All
            </Link>
          </div>
          <div>
            {orders?.map((order, i) => (
              <div
                key={order.id}
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {(order as any).customers?.name || 'Unknown'} · {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    GH₵ {parseFloat(order.total_amount || 0).toFixed(2)}
                  </p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={getStatusStyle(order.status)}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!orders || orders.length === 0) && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No orders yet</div>
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--card-border)' }}>
            <Link
              href="/dashboard/marketing/orders/new"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium transition hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              <Plus className="w-4 h-4" /> New Order
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/marketing/orders"
          className="flex items-center gap-3 p-4 rounded-xl transition hover:opacity-80"
          style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b15' }}>
            <ShoppingCart className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>All Orders</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>View and manage orders</p>
          </div>
        </Link>
        <Link
          href="/dashboard/marketing/customers"
          className="flex items-center gap-3 p-4 rounded-xl transition hover:opacity-80"
          style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1a73e815' }}>
            <Users className="w-4 h-4" style={{ color: '#1a73e8' }} />
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Customer Directory</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>View all customers</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
