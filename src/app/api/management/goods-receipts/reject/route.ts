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
  const reason = formData.get('reason') as string || 'Rejected by Management'
  if (!receipt_id) return NextResponse.json({ error: 'Receipt ID required' }, { status: 400 })

  const { error } = await supabase
    .from('goods_receipts')
    .update({ status: 'rejected', rejected_by: user.id, rejected_at: new Date().toISOString(), rejection_reason: reason })
    .eq('id', receipt_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify Operations
  await supabase.from('approval_queue').insert({
    type: 'goods_receipt_rejected',
    reference_id: receipt_id,
    requester_id: user.id,
    status: 'pending',
    department: 'operations',
    title: 'Goods Receipt Rejected',
    description: 'Your goods receipt has been rejected by Management. Reason: ' + reason,
    notes: 'Receipt ID: ' + receipt_id
  })

  // Mark original queue item as rejected
  await supabase
    .from('approval_queue')
    .update({ status: 'rejected', resolved_at: new Date().toISOString() })
    .eq('reference_id', receipt_id)
    .eq('type', 'goods_receipt')
    .eq('department', 'management')

  return NextResponse.redirect(new URL('/dashboard/management/goods-receipts', request.url))
}
