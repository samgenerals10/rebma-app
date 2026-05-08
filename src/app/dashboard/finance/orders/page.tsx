import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FinanceOrdersClient from './FinanceOrdersClient'

export default async function FinanceOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!currentUser) redirect('/login')
  if (currentUser.department !== 'finance' && currentUser.role !== 'manager' && currentUser.role !== 'ceo') redirect('/dashboard')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*, products(name, sku))')
    .in('status', ['pending_finance', 'pending_manager', 'approved', 'rejected'])
    .order('created_at', { ascending: false })

  return <FinanceOrdersClient orders={orders || []} currentUser={currentUser} />
}
