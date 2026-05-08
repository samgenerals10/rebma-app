import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Truck, CheckCircle, AlertCircle, Navigation, MapPin } from 'lucide-react'
import DispatchOrders from '@/components/dispatch/DispatchOrders'

export default async function DispatchDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('*').eq('id', user.id).single()
  if (!currentUser) redirect('/login')
  if (currentUser.department !== 'dispatch' && currentUser.role !== 'ceo' && currentUser.role !== 'manager' && currentUser.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*, products(name, sku, unit_of_measure))')
    .in('status', ['ready_for_dispatch', 'dispatched', 'delivered'])
    .order('created_at', { ascending: false })

  const readyCount = orders?.filter(o => o.status === 'ready_for_dispatch').length || 0
  const inTransitCount = orders?.filter(o => o.status === 'dispatched').length || 0
  const deliveredCount = orders?.filter(o => o.status === 'delivered').length || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Dispatch</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Delivery jobs and fleet management</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/dispatch/tracking"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}>
            <Navigation className="w-4 h-4" /> GPS Tracking
          </Link>
          <Link href="/dashboard/dispatch/vehicles"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            <Truck className="w-4 h-4" /> Vehicles
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Ready for Dispatch', value: readyCount, icon: MapPin, color: readyCount > 0 ? '#1a73e8' : '#059669', bg: readyCount > 0 ? '#1a73e815' : '#05966915' },
          { label: 'In Transit', value: inTransitCount, icon: Truck, color: '#f59e0b', bg: '#f59e0b15' },
          { label: 'Delivered', value: deliveredCount, icon: CheckCircle, color: '#059669', bg: '#05966915' },
          { label: 'Issues', value: 0, icon: AlertCircle, color: '#dc2626', bg: '#dc262615' },
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

      <DispatchOrders orders={orders || []} currentUser={currentUser} />
    </div>
  )
}
