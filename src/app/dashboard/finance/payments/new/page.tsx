'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Banknote, CreditCard, Smartphone, Clock, Search } from 'lucide-react'

const PAYMENT_MODES = [
  { key: 'cash', label: 'Cash', icon: Banknote, color: '#059669' },
  { key: 'cheque', label: 'Cheque', icon: CreditCard, color: '#1a73e8' },
  { key: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: '#f59e0b' },
  { key: 'credit', label: 'Credit Clearance', icon: Clock, color: '#dc2626' },
]

export default function RecordPaymentPage() {
  const supabase = createClient()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderSearch, setShowOrderSearch] = useState(false)
  const [paymentMode, setPaymentMode] = useState('cash')
  const [amount, setAmount] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [chequeNumber, setChequeNumber] = useState('')
  const [chequeDate, setChequeDate] = useState('')
  const [momoNetwork, setMomoNetwork] = useState('MTN')
  const [momoNumber, setMomoNumber] = useState('')
  const [momoTransactionId, setMomoTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    setCurrentUser(userData)

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, customers(name, phone)')
      .in('status', ['approved', 'dispatched', 'delivered', 'preparing', 'ready_for_dispatch'])
      .order('created_at', { ascending: false })
    if (ordersData) setOrders(ordersData)
  }

  const filteredOrders = orders.filter(o =>
    o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customers?.name?.toLowerCase().includes(orderSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!amount || parseFloat(amount) <= 0) { setError('Please enter a valid amount'); return }

    setLoading(true)

    const paymentDetails: any = { payment_method: paymentMode }
    if (paymentMode === 'cheque') Object.assign(paymentDetails, { bank_name: bankName, cheque_number: chequeNumber, cheque_date: chequeDate })
    if (paymentMode === 'mobile_money') Object.assign(paymentDetails, { network: momoNetwork, momo_number: momoNumber, transaction_id: momoTransactionId })

    const { error: paymentError } = await supabase.from('payments').insert({
      order_id: selectedOrder?.id || null,
      amount: parseFloat(amount),
      payment_method: paymentMode,
      reference_number: referenceNumber || null,
      notes: notes || null,
      recorded_by: currentUser?.id,
    })

    if (paymentError) { setError('Error recording payment: ' + paymentError.message); setLoading(false); return }

    if (selectedOrder) {
      await supabase.from('notifications').insert({
        recipient_department: 'management',
        sender_id: currentUser?.id,
        title: 'Payment Recorded — ' + selectedOrder.order_number,
        body: 'GH₵' + parseFloat(amount).toLocaleString() + ' recorded via ' + paymentMode.replace(/_/g, ' ') + ' for ' + selectedOrder.customers?.name,
        type: 'payment_recorded',
        reference_id: selectedOrder.id,
        is_read: false
      })
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard/finance'), 1500)
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#05966915' }}>
        <CheckCircle className="w-8 h-8" style={{ color: '#059669' }} />
      </div>
      <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Payment Recorded!</p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Redirecting to Finance dashboard...</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/finance" className="p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Record Payment</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Record a payment received — cheque clearance, balance payment, etc.</p>
        </div>
      </div>

      {error && <div className="mb-4 p-4 rounded-lg text-sm" style={{ background: '#dc262610', border: '1px solid #dc2626', color: '#dc2626' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        {/* Link to order (optional) */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Link to Order <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(optional)</span></h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={orderSearch}
              onChange={e => { setOrderSearch(e.target.value); setShowOrderSearch(true) }}
              onFocus={() => setShowOrderSearch(true)}
              placeholder="Search by order number or customer name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
            {showOrderSearch && orderSearch && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                {filteredOrders.length === 0 && <div className="p-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>No orders found</div>}
                {filteredOrders.map((o, i) => (
                  <button key={o.id} type="button" onClick={() => { setSelectedOrder(o); setOrderSearch(o.order_number); setShowOrderSearch(false); setAmount(o.total_amount) }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition"
                    style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{o.order_number}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{o.customers?.name}</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>GH₵{parseFloat(o.total_amount).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedOrder && (
            <div className="mt-3 p-3 rounded-lg flex items-center justify-between" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedOrder.order_number}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedOrder.customers?.name} · {selectedOrder.status}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold" style={{ color: 'var(--accent)' }}>GH₵{parseFloat(selectedOrder.total_amount).toLocaleString()}</p>
                <button type="button" onClick={() => { setSelectedOrder(null); setOrderSearch('') }}
                  className="text-xs px-2 py-1 rounded" style={{ background: '#dc262615', color: '#dc2626' }}>Remove</button>
              </div>
            </div>
          )}
        </div>

        {/* Payment amount */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Payment Amount</h3>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-sm" style={{ color: 'var(--text-muted)' }}>GH₵</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0" required
              className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Payment mode */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Payment Mode</h3>
          <div className="space-y-2 mb-4">
            {PAYMENT_MODES.map(mode => {
              const Icon = mode.icon
              const isSelected = paymentMode === mode.key
              return (
                <button key={mode.key} type="button" onClick={() => setPaymentMode(mode.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition"
                  style={{ background: isSelected ? 'color-mix(in srgb, ' + mode.color + ' 8%, var(--card-bg))' : 'var(--table-header-bg)', border: '1.5px solid ' + (isSelected ? mode.color : 'var(--card-border)') }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isSelected ? mode.color : mode.color + '15' }}>
                    <Icon className="w-4 h-4" style={{ color: isSelected ? 'white' : mode.color }} />
                  </div>
                  <span className="text-sm font-medium flex-1 text-left" style={{ color: 'var(--text-primary)' }}>{mode.label}</span>
                  {isSelected && <CheckCircle className="w-4 h-4" style={{ color: mode.color }} />}
                </button>
              )
            })}
          </div>

          {/* Cheque fields */}
          {paymentMode === 'cheque' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              {[
                { label: 'Bank Name', value: bankName, set: setBankName, placeholder: 'e.g. GCB Bank' },
                { label: 'Cheque Number', value: chequeNumber, set: setChequeNumber, placeholder: 'CHQ-001' },
                { label: 'Cheque Date', value: chequeDate, set: setChequeDate, type: 'date' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                  <input type={field.type || 'text'} value={field.value} onChange={e => field.set(e.target.value)} placeholder={(field as any).placeholder || ''}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                </div>
              ))}
            </div>
          )}

          {/* MoMo fields */}
          {paymentMode === 'mobile_money' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Network</label>
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
                { label: 'Transaction ID', value: momoTransactionId, set: setMomoTransactionId, placeholder: 'TXN-001' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                  <input type="text" value={field.value} onChange={e => field.set(e.target.value)} placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                </div>
              ))}
            </div>
          )}

          {/* Reference number */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Reference Number</label>
            <input type="text" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} placeholder="Optional reference number"
              className="w-full md:w-64 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Notes</h3>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes about this payment..." rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/finance" className="px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'white' }}>
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  )
}
