'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, X, CreditCard, Smartphone, Banknote, Clock, Upload, ChevronDown, ChevronUp } from 'lucide-react'

export default function FinanceOrdersClient({ orders: initialOrders, currentUser }: { orders: any[], currentUser: any }) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [activeOrder, setActiveOrder] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
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
      .in('status', ['pending_finance', 'pending_manager'])
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  const approveOrder = async (order: any) => {
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

    await supabase.from('notifications').insert({
      recipient_department: 'operations',
      sender_id: currentUser.id,
      title: 'Order Ready for Preparation',
      body: 'Order ' + order.order_number + ' approved by Finance. Please prepare goods for dispatch.',
      type: 'order_approved',
      reference_id: order.id,
      is_read: false
    })

    await supabase.from('approval_queue').insert({
      type: 'prepare_goods',
      reference_id: order.id,
      requester_id: currentUser.id,
      status: 'pending',
      department: 'operations',
      title: 'Prepare Goods — ' + order.customers?.name,
      description: 'Finance approved order ' + order.order_number + '. Prepare goods for dispatch.',
      notes: order.order_number
    })

    await supabase.from('notifications').insert({
      recipient_department: 'marketing',
      sender_id: currentUser.id,
      title: 'Order Approved — ' + order.order_number,
      body: 'Payment confirmed for ' + order.customers?.name + ' — GH₵' + parseFloat(order.total_amount).toLocaleString() + '. Operations is preparing the goods.',
      type: 'order_approved',
      reference_id: order.id,
      is_read: false
    })
    resetFields()
    setActiveOrder(null)
    setProcessing(null)
    await loadOrders()
  }

  const rejectOrder = async (orderId: string, orderNumber: string) => {
    setProcessing(orderId)
    await supabase.from('orders').update({ status: 'rejected' }).eq('id', orderId)
    await supabase.from('notifications').insert({
      recipient_department: 'marketing',
      sender_id: currentUser.id,
      title: 'Order Rejected',
      body: 'Order ' + orderNumber + ' was rejected by Finance.',
      type: 'order_rejected',
      reference_id: orderId,
      is_read: false
    })
    setProcessing(null)
    await loadOrders()
  }

  const resetFields = () => {
    setCashAmount(''); setChequeNumber(''); setChequeDate(''); setBankName('')
    setBankAccountNumber(''); setAccountName(''); setBranch(''); setMomoNumber('')
    setMomoAccountName(''); setMomoTransactionId(''); setMomoScreenshot(null)
    setGhanaCardNumber(''); setGhanaCardFront(null); setGhanaCardBack(null)
    setCustomerPhoto(null); setDueDate(''); setFinanceNotes('')
  }

  const getPaymentConfig = (mode: string) => {
    if (mode === 'cash') return { icon: Banknote, color: '#059669', label: 'Cash' }
    if (mode === 'cheque') return { icon: CreditCard, color: '#1a73e8', label: 'Cheque' }
    if (mode === 'mobile_money') return { icon: Smartphone, color: '#f59e0b', label: 'Mobile Money' }
    if (mode === 'credit') return { icon: Clock, color: '#dc2626', label: 'Credit' }
    return { icon: Banknote, color: '#059669', label: mode }
  }

  const pendingFinance = orders.filter(o => o.status === 'pending_finance')
  const pendingManager = orders.filter(o => o.status === 'pending_manager')

  const OrderCard = ({ order }: { order: any }) => {
    const isActive = activeOrder === order.id
    const { icon: Icon, color, label } = getPaymentConfig(order.payment_mode)
    const isPendingManager = order.status === 'pending_manager'

    return (
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '15' }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + '15', color }}>{label}</span>
                {isPendingManager && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#f59e0b15', color: '#f59e0b' }}>Pending Manager</span>}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                <Link href={'/dashboard/marketing/customers/' + order.customers?.id} className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                  {order.customers?.name}
                </Link>
                {' · ' + new Date(order.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(order.total_amount).toLocaleString()}</p>
            {!isPendingManager && (
              <button onClick={() => { setActiveOrder(isActive ? null : order.id); resetFields() }}
                className="p-1.5 rounded-lg" style={{ background: 'var(--table-header-bg)', color: 'var(--text-secondary)' }}>
                <span className="text-xs font-medium mr-1">{isActive ? 'Close' : 'Review & Process'}</span>
                {isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-3" style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex flex-wrap gap-2">
            {order.order_items?.map((item: any, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                {item.products?.name} × {item.quantity} @ GH₵{parseFloat(item.unit_price).toFixed(2)}
              </span>
            ))}
          </div>
          {order.notes && <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Note: {order.notes}</p>}
        </div>

        {isActive && !isPendingManager && (
          <div className="px-5 py-4">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Enter Payment Details</p>

            {order.payment_mode === 'cash' && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Amount Received (GH₵) *</label>
                <input type="number" value={cashAmount} onChange={e => setCashAmount(e.target.value)} placeholder="0.00" step="0.01"
                  className="w-full md:w-64 px-3 py-2 rounded-lg text-sm outline-none"
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
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
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

            <div className="mt-3">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Finance Notes</label>
              <textarea value={financeNotes} onChange={e => setFinanceNotes(e.target.value)} placeholder="Optional notes..." rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <button onClick={() => rejectOrder(order.id, order.order_number)} disabled={processing === order.id}
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

        {isPendingManager && (
          <div className="px-5 py-3">
            <p className="text-xs" style={{ color: '#f59e0b' }}>Waiting for Manager approval before Finance can process this credit order.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/finance" className="p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Order Review</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review and process pending orders from Marketing</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Finance Review', value: pendingFinance.length, color: '#f59e0b' },
          { label: 'Pending Manager Approval', value: pendingManager.length, color: '#dc2626' },
          { label: 'Total Pending', value: orders.length, color: 'var(--text-primary)' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {pendingFinance.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Pending Finance Review ({pendingFinance.length})</h3>
          {pendingFinance.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}

      {pendingManager.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Pending Manager Approval ({pendingManager.length})</h3>
          {pendingManager.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}

      {orders.length === 0 && (
        <div className="rounded-xl p-10 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#059669' }} />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>All caught up</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>No pending orders to review</p>
        </div>
      )}
    </div>
  )
}
