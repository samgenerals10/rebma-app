import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', session.user.id)
    .single()

  if (user?.department !== 'finance' && user?.role !== 'ceo' && user?.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const order_id = formData.get('order_id') as string
  const amount = formData.get('amount') as string
  const payment_method = formData.get('payment_method') as string
  const reference_number = formData.get('reference_number') as string

  if (!order_id || !amount || !payment_method) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      order_id,
      amount: parseFloat(amount),
      payment_method,
      reference_number: reference_number || null,
      recorded_by: session.user.id
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update order status to paid if fully paid
  const { data: order } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('id', order_id)
    .single()

  if (order && parseFloat(amount) >= parseFloat(order.total_amount)) {
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', order_id)
  }

  redirect('/dashboard/finance')
}