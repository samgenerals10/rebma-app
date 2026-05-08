import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Truck, CheckCircle, AlertCircle, Navigation, Plus, MapPin } from 'lucide-react'

export default async function DispatchDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('role, department').eq('id', user.id).single()

  if (!currentUser) redirect('/login')

  if (currentUser.department !== 'dispatch' && currentUser.role !== 'ceo' && currentUser.role !== 'manager' && currentUser.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  const stats = [
    { label: 'Pending Dispatch', value: orders?.length || 0, icon: Truck, color: '#1a73e8', bg: '#1a73e815' },
    { label: 'In Transit', value: 0, icon: Navigation, color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'Delivered Today', value: 0, icon: CheckCircle, color: '#059669', bg: '#05966915' },
    { label: 'Issues', value: 0, icon: AlertCircle, color: '#dc2626', bg: '#dc262615' },
  ]

  const quickActions = [
    { href: '/dashboard/dispatch/tracking', icon: Navigation, color: '#1a73e8', bg: '#1a73e815', label: 'GPS Live Tracking', description: 'View all drivers on map' },
    { href: '/dashboard/dispatch/trips', icon: Truck, color: '#f59e0b', bg: '#f59e0b15', label: 'Manage Trips', description: 'Create and assign trips' },
    { href: '/dashboard/dispatch/delivery', icon: CheckCircle, color: '#059669', bg: '#05966915', label: 'Proof of Delivery', description: 'Confirm deliveries' },
    { href: '/dashboard/dispatch/vehicles', icon: MapPin, color: '#8b5cf6', bg: '#8b5cf615', label: 'Vehicle & Driver Log', description: 'Manage fleet' },
  ]

  return (
    <div>
      {/* Header with actions at top */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Dispatch</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Deliveries, trips and GPS tracking</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/dispatch/trips/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            New Trip
          </Link>
          <Link
            href="/dashboard/dispatch/tracking"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
          >
            <Navigation className="w-4 h-4" />
            Live Tracking
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: stat.bg }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Job Board */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Delivery Job Board</h2>
            <Link href="/dashboard/dispatch/trips/new" className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>
              <Plus className="w-3.5 h-3.5" /> Assign Trip
            </Link>
          </div>
          <div>
            {orders?.map((order, i) => (
              <div
                key={order.id}
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    GH₵ {parseFloat(order.total_amount || 0).toFixed(2)}
                  </p>
                </div>
                <Link
                  href={`/dashboard/dispatch/trips/new?order=${order.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-90"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  Assign Trip
                </Link>
              </div>
            ))}
            {(!orders || orders.length === 0) && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                No orders ready for dispatch
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          </div>
          <div>
            {quickActions.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 px-5 py-4 transition hover:opacity-80"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: action.bg }}>
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
