'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { CheckCircle, X, Clock, ChevronDown, ChevronUp, CreditCard, User, Phone, MapPin } from 'lucide-react'
import OrderStepper from '@/components/OrderStepper'

export default function CreditApprovals({ orders: initialOrders, currentUser }: { orders: any[], currentUser: any }) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [activeOrder, setActiveOrder] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingOrder, setRejectingOrder] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(*), order_items(*, products(name, sku))')
      .eq('payment_mode', 'credit')
      .in('status', ['pending_manager', 'approved', 'rejected', 'pending_finance'])
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const approveCredit = async (order: any) => {
    setProcessing(order.id)
    await supabase.from('orders').update({ status: 'pending_finance' }).eq('id', order.id)
    await supabase.from('approval_queue')
      .update({ status: 'approved' })
      .eq('reference_id', order.id)
      .eq('type', 'credit_order')

    await supabase.from('notifications').insert([
      {
        recipient_department: 'finance',
        sender_id: currentUser.id,
        title: 'Credit Order Approved — ' + order.order_number,
        body: 'Credit order for ' + order.customers?.name + ' (GH₵' + parseFloat(order.total_amount).toLocaleString() + ') approved by Manager. Please collect payment details.',
        type: 'credit_approved',
        reference_id: order.id,
        is_read: false
      },
      {
        recipient_department: 'marketing',
        sender_id: currentUser.id,
        title: 'Credit Order Approved',
        body: 'Credit order ' + order.order_number + ' for ' + order.customers?.name + ' has been approved. Finance will process payment.',
        type: 'credit_approved',
        reference_id: order.id,
        is_read: false
      }
    ])

    setActiveOrder(null)
    setProcessing(null)
    setActiveTab('approved')
    await loadOrders()
  }

  const rejectCredit = async () => {
    if (!rejectingOrder) return
    if (!rejectionReason.trim()) { alert('Please enter a rejection reason'); return }
    setProcessing(rejectingOrder.id)
    await supabase.from('orders').update({ status: 'rejected', rejection_reason: rejectionReason }).eq('id', rejectingOrder.id)
    await supabase.from('approval_queue')
      .update({ status: 'rejected' })
      .eq('reference_id', rejectingOrder.id)
      .eq('type', 'credit_order')

    await supabase.from('notifications').insert({
      recipient_department: 'marketing',
      sender_id: currentUser.id,
      title: 'Credit Order Rejected — ' + rejectingOrder.order_number,
      body: 'Credit order for ' + rejectingOrder.customers?.name + ' was rejected. Reason: ' + rejectionReason,
      type: 'credit_rejected',
      reference_id: rejectingOrder.id,
      is_read: false
    })

    setRejectingOrder(null)
    setRejectionReason('')
    setActiveOrder(null)
    setProcessing(null)
    setActiveTab('rejected')
    await loadOrders()
  }

  const pendingOrders = orders.filter(o => o.status === 'pending_manager')
  const approvedOrders = orders.filter(o => o.status === 'pending_finance' || o.status === 'approved')
  const rejectedOrders = orders.filter(o => o.status === 'rejected')
  const displayedOrders = activeTab === 'pending' ? pendingOrders : activeTab === 'approved' ? approvedOrders : rejectedOrders

  if (orders.length === 0) return null

  return (
    <div className="mb-8">
      {/* Rejection modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ background: 'var(--card-bg)' }}>
            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Reject Credit Order</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{rejectingOrder.order_number} — {rejectingOrder.customers?.name}</p>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reason *</label>
            <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Customer has outstanding balance, insufficient credit history..."
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none mb-4"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setRejectingOrder(null); setRejectionReason('') }}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--table-header-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
                Cancel
              </button>
              <button onClick={rejectCredit} disabled={processing === rejectingOrder.id}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: '#dc2626', color: 'white' }}>
                {processing === rejectingOrder.id
                  ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <X className="w-4 h-4" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" style={{ color: '#dc2626' }} />
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Credit Order Approvals</h3>
          {pendingOrders.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#dc262615', color: '#dc2626' }}>
              {pendingOrders.length} pending
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {[
            { key: 'pending', label: 'Pending', count: pendingOrders.length, color: '#dc2626' },
            { key: 'approved', label: 'Approved', count: approvedOrders.length, color: '#059669' },
            { key: 'rejected', label: 'Rejected', count: rejectedOrders.length, color: '#6b7280' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              style={{ background: activeTab === tab.key ? tab.color : 'var(--card-bg)', color: activeTab === tab.key ? 'white' : 'var(--text-secondary)', border: '1px solid ' + (activeTab === tab.key ? tab.color : 'var(--card-border)') }}>
              {tab.label}
              <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--table-header-bg)' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {displayedOrders.length === 0 && (
          <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#059669' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {activeTab === 'pending' ? 'No pending credit orders' : activeTab === 'approved' ? 'No approved credit orders' : 'No rejected credit orders'}
            </p>
          </div>
        )}

        {displayedOrders.map(order => {
          const isActive = activeOrder === order.id
          const isPending = order.status === 'pending_manager'
          const isApproved = order.status === 'pending_finance' || order.status === 'approved'
          const borderColor = isPending ? '#dc2626' : isApproved ? '#059669' : '#6b7280'
          const paymentDetails = order.payment_details || {}

          return (
            <div key={order.id} className="rounded-xl overflow-hidden"
              style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)', borderLeft: '4px solid ' + borderColor }}>

              {order.status === 'rejected' && (
                <div className="px-5 py-2.5 flex items-center gap-2" style={{ background: '#dc262610', borderBottom: '1px solid #dc262630' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
                  <p className="text-xs font-medium" style={{ color: '#dc2626' }}>Rejected{order.rejection_reason ? ': ' + order.rejection_reason : ''}</p>
                </div>
              )}

              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#dc262615' }}>
                    <Clock className="w-4 h-4" style={{ color: '#dc2626' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#dc262615', color: '#dc2626' }}>Credit</span>
                      {isPending && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#f59e0b15', color: '#f59e0b' }}>Awaiting Approval</span>}
                      {isApproved && <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: '#05966915', color: '#059669' }}><CheckCircle className="w-3 h-3" /> Approved</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{order.customers?.name}</p>
                      {order.customers?.phone && <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3 h-3" /> {order.customers.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(order.total_amount).toLocaleString()}</p>
                  {isPending && (
                    <button onClick={() => setActiveOrder(isActive ? null : order.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: isActive ? 'var(--table-header-bg)' : '#dc262615', color: isActive ? 'var(--text-secondary)' : '#dc2626', border: '1px solid ' + (isActive ? 'var(--card-border)' : '#dc262630') }}>
                      {isActive ? <><ChevronUp className="w-3.5 h-3.5" /> Close</> : <><ChevronDown className="w-3.5 h-3.5" /> Review</>}
                    </button>
                  )}
                </div>
              </div>

              <div className="px-5 pb-3 flex flex-wrap gap-2">
                {order.order_items?.map((item: any, i: number) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                    {item.products?.name} × {item.quantity} @ GH₵{parseFloat(item.unit_price).toFixed(2)}
                  </span>
                ))}
              </div>

              <div className="px-5 pb-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                <OrderStepper status={order.status} />
              </div>

              {isActive && isPending && (
                <div className="px-5 py-4 space-y-4" style={{ borderTop: '1px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Customer & Credit Details</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>CUSTOMER INFO</p>
                      {[
                        { icon: User, label: order.customers?.name },
                        { icon: Phone, label: order.customers?.phone || 'N/A' },
                        { icon: MapPin, label: order.customers?.address || 'N/A' },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <row.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{row.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>CREDIT DETAILS</p>
                      {[
                        { label: 'Ghana Card #', value: paymentDetails.ghana_card_number || 'Not provided' },
                        { label: 'Due Date', value: paymentDetails.due_date ? new Date(paymentDetails.due_date).toLocaleDateString('en-GB') : 'Not set' },
                        { label: 'Order Total', value: 'GH₵' + parseFloat(order.total_amount).toLocaleString() },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(paymentDetails.ghana_card_front_url || paymentDetails.ghana_card_back_url || paymentDetails.customer_photo_url) && (
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>UPLOADED DOCUMENTS</p>
                      <div className="flex gap-3 flex-wrap">
                        {paymentDetails.ghana_card_front_url && (
                          <a href={paymentDetails.ghana_card_front_url} target="_blank" className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: '#1a73e815', color: '#1a73e8', border: '1px solid #1a73e830' }}>
                            View Ghana Card Front
                          </a>
                        )}
                        {paymentDetails.ghana_card_back_url && (
                          <a href={paymentDetails.ghana_card_back_url} target="_blank" className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: '#1a73e815', color: '#1a73e8', border: '1px solid #1a73e830' }}>
                            View Ghana Card Back
                          </a>
                        )}
                        {paymentDetails.customer_photo_url && (
                          <a href={paymentDetails.customer_photo_url} target="_blank" className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: '#1a73e815', color: '#1a73e8', border: '1px solid #1a73e830' }}>
                            View Customer Photo
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                    <button onClick={() => setRejectingOrder(order)} disabled={processing === order.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                      style={{ background: '#dc262615', color: '#dc2626', border: '1px solid #dc262630' }}>
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => approveCredit(order)} disabled={processing === order.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                      style={{ background: '#059669', color: 'white' }}>
                      {processing === order.id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve Credit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
