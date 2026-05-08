'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, X, CreditCard, Smartphone, Banknote, Clock, ChevronDown, ChevronUp, AlertCircle, FileText, Printer } from 'lucide-react'
import OrderStepper from '@/components/OrderStepper'
import RejectionModal from '@/components/finance/RejectionModal'
import PaymentForm from '@/components/finance/PaymentForm'

export default function FinanceDashboardClient({ orders: initialOrders, payments, currentUser }: { orders: any[], payments: any[], currentUser: any }) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [activeOrder, setActiveOrder] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingOrder, setRejectingOrder] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  // Payment fields
  const [cashAmount, setCashAmount] = useState('')
  const [chequeNumber, setChequeNumber] = useState('')
  const [chequeDate, setChequeDate] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [branch, setBranch] = useState('')
  const [momoNetwork, setMomoNetwork] = useState('MTN')
  const [momoNumber, setMomoNumber] = useState('')
  const [momoAccountName, setMomoAccountName] = useState('')
  const [momoTransactionId, setMomoTransactionId] = useState('')
  const [momoScreenshot, setMomoScreenshot] = useState<File | null>(null)
  const [ghanaCardNumber, setGhanaCardNumber] = useState('')
  const [ghanaCardFront, setGhanaCardFront] = useState<File | null>(null)
  const [ghanaCardBack, setGhanaCardBack] = useState<File | null>(null)
  const [customerPhoto, setCustomerPhoto] = useState<File | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [financeNotes, setFinanceNotes] = useState('')

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(*), order_items(*, products(name, sku))')
      .in('status', ['pending_finance', 'pending_manager', 'approved', 'rejected'])
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  const resetFields = () => {
    setCashAmount(''); setChequeNumber(''); setChequeDate(''); setBankName('')
    setBankAccountNumber(''); setAccountName(''); setBranch(''); setMomoNumber('')
    setMomoAccountName(''); setMomoTransactionId(''); setMomoScreenshot(null)
    setGhanaCardNumber(''); setGhanaCardFront(null); setGhanaCardBack(null)
    setCustomerPhoto(null); setDueDate(''); setFinanceNotes('')
  }

  const approveOrder = async (order: any) => {
    if (order.payment_mode === 'cash' && !cashAmount) { alert('Please enter the amount received'); return }
    if (order.payment_mode === 'cheque' && (!bankName || !chequeNumber || !chequeDate)) { alert('Please fill in all cheque details'); return }
    if (order.payment_mode === 'mobile_money' && (!momoNumber || !momoTransactionId)) { alert('Please fill in all Mobile Money details'); return }
    if (order.payment_mode === 'credit' && (!ghanaCardNumber || !dueDate)) { alert('Please fill in Ghana Card number and due date'); return }

    setProcessing(order.id)
    let paymentDetails: any = {}
    if (order.payment_mode === 'cash') paymentDetails = { amount: cashAmount }
    else if (order.payment_mode === 'cheque') paymentDetails = { cheque_number: chequeNumber, cheque_date: chequeDate, bank_name: bankName, bank_account_number: bankAccountNumber, account_name: accountName, branch }
    else if (order.payment_mode === 'mobile_money') {
      let screenshotUrl = null
      if (momoScreenshot) screenshotUrl = await uploadFile(momoScreenshot, `momo/${order.order_number}/screenshot`)
      paymentDetails = { network: momoNetwork, momo_number: momoNumber, account_name: momoAccountName, transaction_id: momoTransactionId, screenshot_url: screenshotUrl }
    } else if (order.payment_mode === 'credit') {
      let frontUrl = null, backUrl = null, photoUrl = null
      if (ghanaCardFront) frontUrl = await uploadFile(ghanaCardFront, `credit/${order.order_number}/front`)
      if (ghanaCardBack) backUrl = await uploadFile(ghanaCardBack, `credit/${order.order_number}/back`)
      if (customerPhoto) photoUrl = await uploadFile(customerPhoto, `credit/${order.order_number}/photo`)
      paymentDetails = { ghana_card_number: ghanaCardNumber, ghana_card_front_url: frontUrl, ghana_card_back_url: backUrl, customer_photo_url: photoUrl, due_date: dueDate }
    }

    await supabase.from('orders').update({ status: 'approved', payment_details: paymentDetails, notes: financeNotes ? (order.notes ? order.notes + ' | Finance: ' + financeNotes : 'Finance: ' + financeNotes) : order.notes }).eq('id', order.id)
    await supabase.from('notifications').insert([
      { recipient_department: 'operations', sender_id: currentUser.id, title: 'Order Ready for Preparation', body: order.order_number + ' approved. Prepare goods for dispatch.', type: 'order_approved', reference_id: order.id, is_read: false },
      { recipient_department: 'marketing', sender_id: currentUser.id, title: 'Order Approved — ' + order.order_number, body: 'Payment confirmed for ' + order.customers?.name + ' — GH₵' + parseFloat(order.total_amount).toLocaleString(), type: 'order_approved', reference_id: order.id, is_read: false }
    ])
    await supabase.from('approval_queue').insert({ type: 'prepare_goods', reference_id: order.id, requester_id: currentUser.id, status: 'pending', department: 'operations', title: 'Prepare Goods — ' + order.customers?.name, description: 'Finance approved ' + order.order_number, notes: order.order_number })
    resetFields(); setActiveOrder(null); setProcessing(null); setActiveTab('approved')
    await loadOrders()
  }

  const rejectOrder = async () => {
    if (!rejectingOrder) return
    if (!rejectionReason.trim()) { alert('Please enter a rejection reason'); return }
    setProcessing(rejectingOrder.id)
    await supabase.from('orders').update({ status: 'rejected', rejection_reason: rejectionReason }).eq('id', rejectingOrder.id)
    await supabase.from('notifications').insert({ recipient_department: 'marketing', sender_id: currentUser.id, title: 'Order Rejected — ' + rejectingOrder.order_number, body: 'Order ' + rejectingOrder.order_number + ' rejected. Reason: ' + rejectionReason, type: 'order_rejected', reference_id: rejectingOrder.id, is_read: false })
    setRejectingOrder(null); setRejectionReason(''); setActiveOrder(null); setProcessing(null); setActiveTab('rejected')
    await loadOrders()
  }

  const getPaymentConfig = (mode: string) => {
    if (mode === 'cash') return { icon: Banknote, color: '#059669', label: 'Cash' }
    if (mode === 'cheque') return { icon: CreditCard, color: '#1a73e8', label: 'Cheque' }
    if (mode === 'mobile_money') return { icon: Smartphone, color: '#f59e0b', label: 'Mobile Money' }
    if (mode === 'credit') return { icon: Clock, color: '#dc2626', label: 'Credit' }
    return { icon: Banknote, color: '#059669', label: mode || 'Cash' }
  }

  const pendingOrders = orders.filter(o => o.status === 'pending_finance' || o.status === 'pending_manager')
  const approvedOrders = orders.filter(o => o.status === 'approved')
  const rejectedOrders = orders.filter(o => o.status === 'rejected')
  const displayedOrders = activeTab === 'pending' ? pendingOrders : activeTab === 'approved' ? approvedOrders : rejectedOrders

  const paymentFormProps = { order: null, cashAmount, setCashAmount, chequeNumber, setChequeNumber, chequeDate, setChequeDate, bankName, setBankName, bankAccountNumber, setBankAccountNumber, accountName, setAccountName, branch, setBranch, momoNetwork, setMomoNetwork, momoNumber, setMomoNumber, momoAccountName, setMomoAccountName, momoTransactionId, setMomoTransactionId, setMomoScreenshot, ghanaCardNumber, setGhanaCardNumber, dueDate, setDueDate, setGhanaCardFront, setGhanaCardBack, setCustomerPhoto, financeNotes, setFinanceNotes }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {rejectingOrder && (
        <RejectionModal
          order={rejectingOrder}
          reason={rejectionReason}
          processing={processing === rejectingOrder.id}
          onReasonChange={setRejectionReason}
          onConfirm={rejectOrder}
          onCancel={() => { setRejectingOrder(null); setRejectionReason('') }}
        />
      )}

      <div className="lg:col-span-2">
        <div className="flex gap-2 mb-4">
          {[
            { key: 'pending', label: 'Pending', count: pendingOrders.length, color: '#dc2626' },
            { key: 'approved', label: 'Approved', count: approvedOrders.length, color: '#059669' },
            { key: 'rejected', label: 'Rejected', count: rejectedOrders.length, color: '#6b7280' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition"
              style={{ background: activeTab === tab.key ? tab.color : 'var(--card-bg)', color: activeTab === tab.key ? 'white' : 'var(--text-secondary)', border: '1px solid ' + (activeTab === tab.key ? tab.color : 'var(--card-border)') }}>
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--table-header-bg)' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {displayedOrders.length === 0 && (
            <div className="rounded-xl p-10 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
              <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#059669' }} />
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {activeTab === 'pending' ? 'All caught up — no pending orders' : activeTab === 'approved' ? 'No approved orders yet' : 'No rejected orders'}
              </p>
            </div>
          )}

          {displayedOrders.map(order => {
            const isActive = activeOrder === order.id
            const { icon: Icon, color, label } = getPaymentConfig(order.payment_mode)
            const isPending = order.status === 'pending_finance' || order.status === 'pending_manager'
            const isApproved = order.status === 'approved'
            const isPendingManager = order.status === 'pending_manager'
            const borderColor = isPending ? '#dc2626' : isApproved ? '#059669' : '#6b7280'

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
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '15' }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + '15', color }}>{label}</span>
                        {isPendingManager && <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: '#f59e0b15', color: '#f59e0b' }}><AlertCircle className="w-3 h-3" /> Awaiting Manager</span>}
                        {isApproved && <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: '#05966915', color: '#059669' }}><CheckCircle className="w-3 h-3" /> Approved</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        <Link href={'/dashboard/marketing/customers/' + order.customers?.id} className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>{order.customers?.name}</Link>
                        {' · ' + new Date(order.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(order.total_amount).toLocaleString()}</p>
                    {isPending && !isPendingManager && (
                      <button onClick={() => { setActiveOrder(isActive ? null : order.id); resetFields() }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: isActive ? 'var(--table-header-bg)' : '#1a73e815', color: isActive ? 'var(--text-secondary)' : '#1a73e8', border: '1px solid ' + (isActive ? 'var(--card-border)' : '#1a73e830') }}>
                        {isActive ? <><ChevronUp className="w-3.5 h-3.5" /> Close</> : <><ChevronDown className="w-3.5 h-3.5" /> Process</>}
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-3 flex flex-wrap gap-2">
                  {order.order_items?.map((item: any, i: number) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                      {item.products?.name} × {item.quantity} @ GH₵{parseFloat(item.unit_price).toFixed(2)}
                    </span>
                  ))}
                </div>

                <div className="px-5 pb-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                  <OrderStepper status={order.status} />
                </div>

                {isApproved && (
                  <div className="px-5 py-3 flex items-center gap-3" style={{ borderTop: '1px solid var(--card-border)', background: '#05966908' }}>
                    <p className="text-xs font-medium flex-1" style={{ color: '#059669' }}>Generate documents</p>
                    <a href={'/dashboard/finance/invoice?order_id=' + order.id + '&type=invoice'} target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#059669', color: 'white' }}>
                      <FileText className="w-3.5 h-3.5" /> Invoice
                    </a>
                    <a href={'/dashboard/finance/invoice?order_id=' + order.id + '&type=packing'} target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#1a73e8', color: 'white' }}>
                      <Printer className="w-3.5 h-3.5" /> Packing Note
                    </a>
                  </div>
                )}

                {isActive && isPending && !isPendingManager && (
                  <div className="px-5 py-4" style={{ borderTop: '1px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
                    <PaymentForm {...{ ...paymentFormProps, order }} />
                    <div className="flex justify-end gap-3 pt-3 mt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                      <button onClick={() => setRejectingOrder(order)} disabled={processing === order.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                        style={{ background: '#dc262615', color: '#dc2626', border: '1px solid #dc262630' }}>
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={() => approveOrder(order)} disabled={processing === order.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                        style={{ background: '#059669', color: 'white' }}>
                        {processing === order.id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve & Notify Operations
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Payments</h3>
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          {payments.length === 0 && <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No payments recorded</div>}
          {payments.map((payment: any, i: number) => (
            <div key={payment.id} className="px-4 py-3 flex items-center justify-between" style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{payment.order_id?.slice(0, 8) || 'N/A'}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{new Date(payment.created_at).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(payment.amount).toFixed(2)}</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>{payment.payment_method}</span>
              </div>
            </div>
          ))}
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--card-border)' }}>
            <Link href="/dashboard/finance/payments/new" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>+ Record Payment</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
