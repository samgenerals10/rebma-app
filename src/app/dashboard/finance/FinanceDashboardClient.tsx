'use client'

import { createClient } from '@/lib/supabase/client'
import OrderStepper from '@/components/OrderStepper'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, X, CreditCard, Smartphone, Banknote, Clock, Upload, ChevronDown, ChevronUp, AlertCircle, FileText, Printer } from 'lucide-react'

export default function FinanceDashboardClient({ orders: initialOrders, payments, currentUser }: { orders: any[], payments: any[], currentUser: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [activeOrder, setActiveOrder] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingOrder, setRejectingOrder] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return (params.get('tab') as any) || 'pending'
    }
    return 'pending'
  })

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
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null)

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
    setCustomerPhoto(null); setDueDate(''); setFinanceNotes(''); setRejectionReason(''); setRejectingOrder(null); setRejectionReason(''); setRejectingOrderId(null)
  }

  const approveOrder = async (order: any) => {
    // Validate required fields
    if (order.payment_mode === 'cash' && !cashAmount) { alert('Please enter the amount received'); return }
    if (order.payment_mode === 'cheque' && (!bankName || !chequeNumber || !chequeDate)) { alert('Please fill in all cheque details'); return }
    if (order.payment_mode === 'mobile_money' && (!momoNumber || !momoTransactionId)) { alert('Please fill in all Mobile Money details'); return }
    if (order.payment_mode === 'credit' && (!ghanaCardNumber || !dueDate)) { alert('Please fill in Ghana Card number and due date'); return }
    setProcessing(order.id)
    let paymentDetails: any = {}

    if (order.payment_mode === 'cash') {
      paymentDetails = { amount: cashAmount }
    } else if (order.payment_mode === 'cheque') {
      paymentDetails = { cheque_number: chequeNumber, cheque_date: chequeDate, bank_name: bankName, bank_account_number: bankAccountNumber, account_name: accountName, branch }
    } else if (order.payment_mode === 'mobile_money') {
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

    await supabase.from('orders').update({
      status: 'approved',
      payment_details: paymentDetails,
      notes: financeNotes ? (order.notes ? order.notes + ' | Finance: ' + financeNotes : 'Finance: ' + financeNotes) : order.notes
    }).eq('id', order.id)

    await supabase.from('notifications').insert([
      {
        recipient_department: 'operations',
        sender_id: currentUser.id,
        title: 'Order Ready for Preparation',
        body: order.order_number + ' approved. Prepare goods for dispatch.',
        type: 'order_approved',
        reference_id: order.id,
        is_read: false
      },
      {
        recipient_department: 'marketing',
        sender_id: currentUser.id,
        title: 'Order Approved — ' + order.order_number,
        body: 'Payment confirmed for ' + order.customers?.name + ' — GH₵' + parseFloat(order.total_amount).toLocaleString(),
        type: 'order_approved',
        reference_id: order.id,
        is_read: false
      }
    ])

    await supabase.from('approval_queue').insert({
      type: 'prepare_goods',
      reference_id: order.id,
      requester_id: currentUser.id,
      status: 'pending',
      department: 'operations',
      title: 'Prepare Goods — ' + order.customers?.name,
      description: 'Finance approved ' + order.order_number + '. Prepare goods for dispatch.',
      notes: order.order_number
    })

    resetFields()
    setActiveOrder(null)
    setProcessing(null)
    setActiveTab('approved')
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', 'approved')
      window.history.replaceState({}, '', url.toString())
    }
    await loadOrders()
    router.push('/dashboard/finance/invoice?order_id=' + order.id + '&type=invoice&back_tab=approved')
  }

  const rejectOrder = async (orderId: string, orderNumber: string, reason: string) => {
    setProcessing(orderId)
    await supabase.from('orders').update({ status: 'rejected', rejection_reason: reason }).eq('id', orderId)
    await supabase.from('notifications').insert({
      recipient_department: 'marketing',
      sender_id: currentUser.id,
      title: 'Order Rejected — ' + orderNumber,
      body: 'Order ' + orderNumber + ' was rejected by Finance.' + (reason ? ' Reason: ' + reason : ''),
      type: 'order_rejected',
      reference_id: orderId,
      is_read: false
    })
    setActiveOrder(null)
    setProcessing(null)
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

  const OrderCard = ({ order }: { order: any }) => {
    const isActive = activeOrder === order.id
    const { icon: Icon, color, label } = getPaymentConfig(order.payment_mode)
    const isPending = order.status === 'pending_finance' || order.status === 'pending_manager'
    const isApproved = order.status === 'approved'
    const isPendingManager = order.status === 'pending_manager'
    const borderColor = isPending ? '#dc2626' : isApproved ? '#059669' : '#6b7280'

    return (
      <div className="rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: 'var(--card-bg)',
          boxShadow: 'var(--card-shadow)',
          borderLeft: '4px solid ' + borderColor,
          border: '1px solid var(--card-border)',
          borderLeftColor: borderColor,
          borderLeftWidth: '4px'
        }}>

        {/* Rejected banner */}
        {order.status === 'rejected' && (
          <div className="px-5 py-2.5 flex items-center gap-2" style={{ background: '#dc262610', borderBottom: '1px solid #dc262630' }}>
            <X className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
            <p className="text-xs font-medium" style={{ color: '#dc2626' }}>
              Order Rejected{order.rejection_reason ? ': ' + order.rejection_reason : ''}
            </p>
          </div>
        )}

        {/* Order header */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '15' }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + '15', color }}>{label}</span>
                {isPendingManager && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
                    <AlertCircle className="w-3 h-3" /> Awaiting Manager
                  </span>
                )}
                {isApproved && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: '#05966915', color: '#059669' }}>
                    <CheckCircle className="w-3 h-3" /> Approved
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                <Link href={'/dashboard/marketing/customers/' + order.customers?.id}
                  className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                  {order.customers?.name}
                </Link>
                {' · ' + new Date(order.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              GH₵{parseFloat(order.total_amount).toLocaleString()}
            </p>
            {isPending && !isPendingManager && (
              <button
                onClick={() => { setActiveOrder(isActive ? null : order.id); resetFields() }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                style={{
                  background: isActive ? 'var(--table-header-bg)' : '#dc262615',
                  color: isActive ? 'var(--text-secondary)' : '#dc2626',
                  border: '1px solid ' + (isActive ? 'var(--card-border)' : '#dc262630')
                }}>
                {isActive ? <><ChevronUp className="w-3.5 h-3.5" /> Close</> : <><ChevronDown className="w-3.5 h-3.5" /> Process</>}
              </button>
            )}
          </div>
        </div>

        {/* Order items */}
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {order.order_items?.map((item: any, i: number) => (
            <span key={i} className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
              {item.products?.name} × {item.quantity} @ GH₵{parseFloat(item.unit_price).toFixed(2)}
            </span>
          ))}
        </div>

        {/* Order Stepper */}
        <div className="px-5 pb-2" style={{ borderTop: '1px solid var(--card-border)' }}>
          <OrderStepper status={order.status} />
        </div>

        {/* Invoice buttons for approved orders */}
        {order.status === 'approved' && (
          <div className="px-5 py-3 flex items-center gap-3" style={{ borderTop: '1px solid var(--card-border)', background: '#05966908' }}>
            <p className="text-xs font-medium flex-1" style={{ color: '#059669' }}>Order approved — generate documents</p>
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

        {/* Payment details form — inline */}
        {isActive && isPending && !isPendingManager && (
          <div className="px-5 py-4 space-y-4" style={{ borderTop: '1px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enter Payment Details</p>

            {order.payment_mode === 'cash' && (
              <div className="max-w-xs">
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Amount Received (GH₵) *</label>
                <input type="number" value={cashAmount} onChange={e => setCashAmount(e.target.value)} placeholder="0.00" step="0.01"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
            )}

            {order.payment_mode === 'cheque' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Bank Name', value: bankName, set: setBankName, placeholder: 'e.g. GCB Bank' },
                  { label: 'Cheque Number', value: chequeNumber, set: setChequeNumber, placeholder: 'CHQ-001' },
                  { label: 'Cheque Date', value: chequeDate, set: setChequeDate, type: 'date' },
                  { label: 'Account Name', value: accountName, set: setAccountName, placeholder: 'Account holder' },
                  { label: 'Account Number', value: bankAccountNumber, set: setBankAccountNumber, placeholder: '1234567890' },
                  { label: 'Branch', value: branch, set: setBranch, placeholder: 'Branch name' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{field.label} *</label>
                    <input type={field.type || 'text'} value={field.value} onChange={e => field.set(e.target.value)} placeholder={(field as any).placeholder || ''}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                  </div>
                ))}
              </div>
            )}

            {order.payment_mode === 'mobile_money' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Network *</label>
                  <select value={momoNetwork} onChange={e => setMomoNetwork(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Vodafone">Vodafone Cash</option>
                    <option value="AirtelTigo">AirtelTigo Money</option>
                  </select>
                </div>
                {[
                  { label: 'MoMo Number', value: momoNumber, set: setMomoNumber, placeholder: '024 XXX XXXX' },
                  { label: 'Account Name', value: momoAccountName, set: setMomoAccountName, placeholder: 'Account name' },
                  { label: 'Transaction ID', value: momoTransactionId, set: setMomoTransactionId, placeholder: 'TXN-001' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{field.label} *</label>
                    <input type="text" value={field.value} onChange={e => field.set(e.target.value)} placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Screenshot</label>
                  <input type="file" accept="image/*" onChange={e => setMomoScreenshot(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                </div>
              </div>
            )}

            {order.payment_mode === 'credit' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Ghana Card Number *</label>
                    <input type="text" value={ghanaCardNumber} onChange={e => setGhanaCardNumber(e.target.value)} placeholder="GHA-XXXXXXXXX-X"
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Payment Due Date *</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Ghana Card Front', set: setGhanaCardFront },
                    { label: 'Ghana Card Back', set: setGhanaCardBack },
                    { label: 'Customer Photo', set: setCustomerPhoto },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                      <label className="flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer hover:opacity-80"
                        style={{ background: 'var(--input-bg)', border: '2px dashed var(--card-border)' }}>
                        <Upload className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => field.set(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Finance Notes</label>
              <textarea value={financeNotes} onChange={e => setFinanceNotes(e.target.value)} placeholder="Optional notes..." rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
            </div>

            <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
              <button onClick={() => setRejectingOrderId(rejectingOrderId === order.id ? null : order.id)} disabled={processing === order.id}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: '#dc262615', color: '#dc2626', border: '1px solid #dc262630' }}>
                <X className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => approveOrder(order)} disabled={processing === order.id}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: '#059669', color: 'white' }}>
                {processing === order.id
                  ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <CheckCircle className="w-4 h-4" />}
                Approve & Notify Operations
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Orders panel — 2/3 width */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {[
              { key: 'pending', label: 'Pending', count: pendingOrders.length, color: '#dc2626' },
              { key: 'approved', label: 'Approved', count: approvedOrders.length, color: '#059669' },
              { key: 'rejected', label: 'Rejected', count: rejectedOrders.length, color: '#6b7280' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                style={{
                  background: activeTab === tab.key ? tab.color : 'var(--card-bg)',
                  color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                  border: '1px solid ' + (activeTab === tab.key ? tab.color : 'var(--card-border)')
                }}>
                {tab.label}
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--table-header-bg)' }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {/* Rejection reason modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: 'var(--card-bg)' }}>
            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Reject Order</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{rejectingOrder.order_number} — {rejectingOrder.customers?.name}</p>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reason for rejection *</label>
            <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Insufficient payment details, Invalid cheque..." rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none mb-4"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setRejectingOrder(null); setRejectionReason('') }}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--table-header-bg)', color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button onClick={() => rejectOrder(rejectingOrder)} disabled={processing === rejectingOrder.id}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: '#dc2626', color: 'white' }}>
                {processing === rejectingOrder.id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <X className="w-4 h-4" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {displayedOrders.length === 0 && (
            <div className="rounded-xl p-10 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
              <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#059669' }} />
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {activeTab === 'pending' ? 'All caught up — no pending orders' : activeTab === 'approved' ? 'No approved orders yet' : 'No rejected orders'}
              </p>
            </div>
          )}
          {displayedOrders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      </div>

      {/* Recent Payments — 1/3 width */}
      <div>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Payments</h3>
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          {payments.length === 0 && (
            <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No payments recorded</div>
          )}
          {payments.map((payment, i) => (
            <div key={payment.id} className="px-4 py-3 flex items-center justify-between"
              style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {payment.order_id?.slice(0, 8) || 'N/A'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(payment.created_at).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  GH₵{parseFloat(payment.amount).toFixed(2)}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)15', color: 'var(--accent)' }}>
                  {payment.payment_method}
                </span>
              </div>
            </div>
          ))}
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--card-border)' }}>
            <Link href="/dashboard/finance/payments/new" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              + Record Payment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
