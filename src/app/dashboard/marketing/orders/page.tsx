import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ExportButton from '@/components/ExportButton'
import OrdersTable from './OrdersTable'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('role, department').eq('id', user.id).single()

  if (!currentUser) redirect('/login')

  if (currentUser.department !== 'marketing' && currentUser.role !== 'ceo' && currentUser.role !== 'manager' && currentUser.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, customers(name), users(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Orders</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{orders?.length || 0} orders found</p>
        </div>
        <div className="flex gap-3 print:hidden">
          <ExportButton type="print" label="Print List" data={orders || []} filename="rebma_orders" />
          <Link
            href="/dashboard/marketing/orders/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90 shadow-sm"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            New Order
          </Link>
        </div>
      </div>
      <OrdersTable orders={orders || []} />
    </div>
  )
}
