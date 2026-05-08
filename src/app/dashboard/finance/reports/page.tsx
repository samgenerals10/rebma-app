import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FinanceReportsClient from './FinanceReportsClient'

export default async function FinanceReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!currentUser) redirect('/login')
  if (currentUser.department !== 'finance' && currentUser.role !== 'ceo' && currentUser.role !== 'manager') redirect('/dashboard')

  // Fetch all approved orders with items
  const { data: orders } = await supabase
    .from('orders')
    .select('*, customers(name), order_items(*, products(name, sku))')
    .in('status', ['approved', 'preparing', 'ready_for_dispatch', 'dispatched', 'delivered'])
    .order('created_at', { ascending: false })

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })

  return <FinanceReportsClient orders={orders || []} payments={payments || []} currentUser={currentUser} />
}
