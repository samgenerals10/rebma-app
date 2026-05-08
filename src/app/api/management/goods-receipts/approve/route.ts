import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: currentUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (currentUser?.role !== 'manager' && currentUser?.role !== 'supervisor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const receipt_id = formData.get('receipt_id') as string
  if (!receipt_id) return NextResponse.json({ error: 'Receipt ID required' }, { status: 400 })

  // Approve the goods receipt
  const { error } = await supabase
    .from('goods_receipts')
    .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', receipt_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify Operations
  await supabase.from('approval_queue').insert({
    type: 'goods_receipt_approved',
    reference_id: receipt_id,
    requester_id: user.id,
    status: 'pending',
    department: 'operations',
    title: 'Goods Receipt Approved',
    description: 'Your goods receipt has been approved by Management.',
    notes: 'Receipt ID: ' + receipt_id
  })

  // Notify CEO
  await supabase.from('approval_queue').insert({
    type: 'goods_receipt_approved',
    reference_id: receipt_id,
    requester_id: user.id,
    status: 'pending',
    department: 'ceo',
    title: 'Goods Receipt Approved',
    description: 'Management has approved a goods receipt.',
    notes: 'Receipt ID: ' + receipt_id
  })

  // Mark original goods_receipt approval queue item as approved
  await supabase
    .from('approval_queue')
    .update({ status: 'approved', approved_by: user.id, resolved_at: new Date().toISOString() })
    .eq('reference_id', receipt_id)
    .eq('type', 'goods_receipt')
    .eq('department', 'management')

  return NextResponse.redirect(new URL('/dashboard/management/goods-receipts', request.url))
}
