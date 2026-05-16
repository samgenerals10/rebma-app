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

  // Fetch the goods receipt and its items
  const { data: receipt } = await supabase.from('goods_receipts').select('*, goods_receipt_items(*)').eq('id', receipt_id).single()
  if (!receipt) return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })

  // Approve the goods receipt
  const { error } = await supabase
    .from('goods_receipts')
    .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', receipt_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Process items: Create products if missing and update stock
  if (receipt.goods_receipt_items) {
    for (const item of receipt.goods_receipt_items) {
      let productId = item.product_id

      // 1. Create product if it was a manual entry
      if (!productId) {
        const { data: newProd, error: prodErr } = await supabase
          .from('products')
          .insert({
            name: item.product_name,
            sku: 'GR-' + Math.floor(1000 + Math.random() * 9000),
            category: 'General',
            unit_of_measure: 'units',
            reorder_level: 10
          })
          .select('id')
          .single()
        
        if (newProd) {
          productId = newProd.id
          // Update item with the new product_id
          await supabase.from('goods_receipt_items').update({ product_id: productId }).eq('id', item.id)
        }
      }

      if (productId) {
        // 2. Update Stock
        const { data: existingStock } = await supabase.from('stock').select('*').eq('product_id', productId).single()
        const receivedQty = item.passed_qty || item.qty || 0

        if (existingStock) {
          await supabase
            .from('stock')
            .update({ quantity: (existingStock.quantity || 0) + receivedQty, updated_at: new Date().toISOString() })
            .eq('id', existingStock.id)
        } else {
          await supabase
            .from('stock')
            .insert({
              product_id: productId,
              quantity: receivedQty,
              location: receipt.location_to || 'Warehouse'
            })
        }

        // 3. Log Stock Movement
        await supabase.from('stock_ledger').insert({
          product_id: productId,
          type: 'in',
          quantity: receivedQty,
          reference_id: receipt_id,
          reference_type: 'goods_receipt',
          notes: 'Received from ' + receipt.supplier
        })
      }
    }
  }

  // Notify Operations
  await supabase.from('approval_queue').insert({
    type: 'goods_receipt_approved',
    reference_id: receipt_id,
    requester_id: user.id,
    status: 'pending',
    department: 'operations',
    title: 'Goods Receipt Approved',
    description: `Your goods receipt ${receipt.receipt_number} from ${receipt.supplier} has been approved.`,
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
    description: `Management has approved goods receipt ${receipt.receipt_number} from ${receipt.supplier}.`,
    notes: 'Receipt ID: ' + receipt_id
  })

  // Notify Finance & Marketing (using notifications table for general awareness)
  const deptNotif = {
    sender_id: user.id,
    title: 'Goods Received: ' + receipt.supplier,
    body: `Goods receipt ${receipt.receipt_number} has been approved. Management is now setting selling prices.`,
    type: 'goods_receipt_approved',
    is_read: false
  }
  await supabase.from('notifications').insert([
    { ...deptNotif, recipient_department: 'finance' },
    { ...deptNotif, recipient_department: 'marketing' }
  ])


  // Mark original goods_receipt approval queue item as approved
  await supabase
    .from('approval_queue')
    .update({ status: 'approved', approved_by: user.id, resolved_at: new Date().toISOString() })
    .eq('reference_id', receipt_id)
    .eq('type', 'goods_receipt')
    .eq('department', 'management')

  return NextResponse.redirect(new URL('/dashboard/management/goods-receipts', request.url))

}
