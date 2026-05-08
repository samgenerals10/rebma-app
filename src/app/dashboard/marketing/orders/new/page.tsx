'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Search, CheckCircle, CreditCard, Smartphone, Banknote, Clock, ChevronRight } from 'lucide-react'

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

const PAYMENT_MODES = [
  { key: 'cash', label: 'Cash', description: 'Direct cash payment', icon: Banknote, color: '#059669' },
  { key: 'cheque', label: 'Cheque', description: 'Bank cheque payment', icon: CreditCard, color: '#1a73e8' },
  { key: 'mobile_money', label: 'Mobile Money', description: 'MTN, Vodafone, AirtelTigo', icon: Smartphone, color: '#f59e0b' },
  { key: 'credit', label: 'Credit', description: 'Credit order needs to be approved before processing', icon: Clock, color: '#dc2626' },
]

function CashCard() {
  return (
    <div className="w-full h-40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)' }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-4 border-white" />
        <div className="absolute top-8 right-8 w-24 h-24 rounded-full border-4 border-white" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-xs opacity-70">Payment Method</p>
          <p className="text-white font-bold text-lg">Cash</p>
        </div>
        <Banknote className="w-8 h-8 text-white opacity-80" />
      </div>
      <div>
        <p className="text-white text-xs opacity-70">Finance will record the cash amount</p>
        <p className="text-white font-semibold text-sm mt-1">Direct Payment</p>
      </div>
    </div>
  )
}

function ChequeCard() {
  return (
    <div className="w-full h-40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 50%, #0d3c7a 100%)' }}>
      <div className="absolute inset-0 opacity-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-full border-b border-white" style={{ top: i * 28 + 'px' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-xs opacity-70">Payment Method</p>
          <p className="text-white font-bold text-lg">Cheque</p>
        </div>
        <CreditCard className="w-8 h-8 text-white opacity-80" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-white text-xs opacity-70">Finance will collect cheque details</p>
          <p className="text-white font-semibold text-sm mt-1">Bank Cheque</p>
        </div>
        <div className="text-right">
          <p className="text-white text-xs opacity-50">_ _ _ _ _ _ _ _</p>
          <p className="text-white text-xs opacity-50 mt-1">Cheque No.</p>
        </div>
      </div>
    </div>
  )
}

function MoMoCard() {
  return (
    <div className="w-full h-40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-xs opacity-70">Payment Method</p>
          <p className="text-white font-bold text-lg">Mobile Money</p>
        </div>
        <Smartphone className="w-8 h-8 text-white opacity-80" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-white text-xs opacity-70">Finance will collect MoMo details</p>
          <div className="flex gap-2 mt-1">
            <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>MTN</span>
            <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>Vodafone</span>
            <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>AirtelTigo</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreditCard2() {
  return (
    <div className="w-full h-40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)' }}>
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-xs opacity-70">Payment Method</p>
          <p className="text-white font-bold text-lg">Credit</p>
        </div>
        <Clock className="w-8 h-8 text-white opacity-80" />
      </div>
      <div>
        <p className="text-white text-xs opacity-70">Requires Manager approval · Finance sets due date</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-white text-sm font-semibold">Ghana Card Required</p>
        </div>
      </div>
    </div>
  )
}

export default function NewOrderPage() {
  const supabase = createClient()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [productPrices, setProductPrices] = useState<Record<string, number>>({})
  const [customers, setCustomers] = useState<any[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ product_id: '', product_name: '', quantity: 1, unit_price: 0, total: 0 }])
  const [paymentMode, setPaymentMode] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const customerSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    init()
    function handleClick(e: MouseEvent) {
      if (customerSearchRef.current && !customerSearchRef.current.contains(e.target as Node)) setShowCustomerSearch(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    setCurrentUser(userData)
    const { data: prods } = await supabase.from('products').select('*').order('name')
    if (prods) setProducts(prods)
    const { data: custs } = await supabase.from('customers').select('*').order('name')
    if (custs) setCustomers(custs)
    const { data: prices } = await supabase.from('product_prices').select('*').order('created_at', { ascending: false })
    if (prices) {
      const latestPrices: Record<string, number> = {}
      for (const p of prices) {
        if (!latestPrices[p.product_id]) latestPrices[p.product_id] = p.selling_price
      }
      setProductPrices(latestPrices)
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
    setShowCustomerSearch(false)
  }

  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...orderItems]
    updated[i] = { ...updated[i], [field]: value }
    if (field === 'product_id') {
      const product = products.find(p => p.id === value)
      updated[i].product_name = product?.name || ''
      updated[i].unit_price = productPrices[value] || 0
    }
    updated[i].total = updated[i].quantity * updated[i].unit_price
    setOrderItems(updated)
  }

  const addItem = () => setOrderItems([...orderItems, { product_id: '', product_name: '', quantity: 1, unit_price: 0, total: 0 }])
  const removeItem = (i: number) => setOrderItems(orderItems.filter((_, idx) => idx !== i))
  const calculateTotal = () => orderItems.reduce((sum, item) => sum + item.total, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selectedCustomer) { setError('Please select a customer'); return }
    const validItems = orderItems.filter(item => item.product_id && item.quantity > 0)
    if (validItems.length === 0) { setError('Please add at least one product'); return }
    if (!paymentMode) { setError('Please select a payment mode'); return }

    setLoading(true)
    const orderNumber = 'ORD-' + Date.now()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: selectedCustomer.id,
        status: paymentMode === 'credit' ? 'pending_manager' : 'pending_finance',
        total_amount: calculateTotal(),
        notes,
        payment_mode: paymentMode,
        payment_details: {},
        created_by: currentUser?.id,
      })
      .select()
      .single()

    if (orderError) { setError('Error: ' + orderError.message); setLoading(false); return }

    for (const item of validItems) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total,
      })
    }

    if (paymentMode === 'credit') {
      await supabase.from('approval_queue').insert({
        type: 'credit_order',
        reference_id: order.id,
        requester_id: currentUser?.id,
        status: 'pending',
        department: 'management',
        title: 'Credit Order — ' + selectedCustomer.name,
        description: 'GH₵' + calculateTotal().toFixed(2) + ' credit order from ' + selectedCustomer.name,
        notes: orderNumber
      })
      await supabase.from('notifications').insert({
        recipient_department: 'management',
        sender_id: currentUser?.id,
        title: 'Credit Order Pending Approval',
        body: selectedCustomer.name + ' — GH₵' + calculateTotal().toFixed(2),
        type: 'credit_order',
        reference_id: order.id,
        is_read: false
      })
    } else {
      await supabase.from('approval_queue').insert({
        type: 'order_payment',
        reference_id: order.id,
        requester_id: currentUser?.id,
        status: 'pending',
        department: 'finance',
        title: 'New Order — ' + selectedCustomer.name,
        description: paymentMode.replace('_', ' ').toUpperCase() + ' — GH₵' + calculateTotal().toFixed(2),
        notes: orderNumber
      })
      await supabase.from('notifications').insert({
        recipient_department: 'finance',
        sender_id: currentUser?.id,
        title: 'New Order Submitted',
        body: selectedCustomer.name + ' — GH₵' + calculateTotal().toFixed(2) + ' — ' + paymentMode.replace('_', ' '),
        type: 'order_payment',
        reference_id: order.id,
        is_read: false
      })
    }

    router.push('/dashboard/marketing/orders')
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/marketing/orders" className="p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New Order</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create a customer order</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg text-sm" style={{ background: '#dc262610', border: '1px solid #dc2626', color: '#dc2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

        {/* Customer */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Customer</h3>
          <div ref={customerSearchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <input type="text" value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerSearch(true); setSelectedCustomer(null) }}
                onFocus={() => setShowCustomerSearch(true)}
                placeholder="Search customer by name or phone..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
            </div>
            {showCustomerSearch && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl overflow-hidden shadow-xl max-h-64 overflow-y-auto"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                {filteredCustomers.length === 0 && (
                  <div className="p-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                    No customers found. <Link href="/dashboard/marketing/customers" style={{ color: 'var(--accent)' }}>Add customer</Link>
                  </div>
                )}
                {filteredCustomers.map((c, i) => (
                  <button key={c.id} type="button" onClick={() => selectCustomer(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:opacity-80 transition"
                    style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: '#1a73e820', color: '#1a73e8' }}>
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.phone}{c.address ? ' · ' + c.address : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCustomer && (
            <div className="mt-3 p-3 rounded-lg flex items-center gap-3" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: '#1a73e820', color: '#1a73e8' }}>
                {selectedCustomer.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{selectedCustomer.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {selectedCustomer.phone}{selectedCustomer.address ? ' · ' + selectedCustomer.address : ''}{selectedCustomer.location ? ' · ' + selectedCustomer.location : ''}
                </p>
              </div>
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} />
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Order Items</h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {orderItems.map((item, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)' }}>
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Product</label>
                    <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Qty</label>
                    <input type="number" value={item.quantity} min="1" onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Unit Price (GH₵)</label>
                    <input type="number" step="0.01" value={item.unit_price} readOnly
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-not-allowed"
                      style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)' }} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {orderItems.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="p-1.5 rounded-lg" style={{ color: '#dc2626' }}>
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {item.unit_price === 0 && item.product_id ? 'No price set for this product' : ''}
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>GH₵{item.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 flex justify-end" style={{ borderTop: '1px solid var(--card-border)' }}>
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Total: GH₵{calculateTotal().toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Mode */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Payment Mode</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Select how the customer will pay — Finance will collect the details</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left — payment list */}
            <div className="space-y-2">
              {PAYMENT_MODES.map(mode => {
                const Icon = mode.icon
                const isSelected = paymentMode === mode.key
                return (
                  <button key={mode.key} type="button" onClick={() => setPaymentMode(mode.key)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition hover:opacity-90"
                    style={{
                      background: isSelected ? 'color-mix(in srgb, ' + mode.color + ' 8%, var(--card-bg))' : 'var(--table-header-bg)',
                      border: '1.5px solid ' + (isSelected ? mode.color : 'var(--card-border)'),
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isSelected ? mode.color : mode.color + '15' }}>
                      <Icon className="w-4 h-4" style={{ color: isSelected ? 'white' : mode.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{mode.label}</p>
                    </div>
                    {isSelected
                      ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: mode.color }} />
                      : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                    }
                  </button>
                )
              })}
            </div>

            {/* Right — card visual */}
            <div className="flex items-center justify-center">
              {!paymentMode && (
                <div className="w-full h-40 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--table-header-bg)', border: '2px dashed var(--card-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select a payment mode</p>
                </div>
              )}
              {paymentMode === 'cash' && <CashCard />}
              {paymentMode === 'cheque' && <ChequeCard />}
              {paymentMode === 'mobile_money' && <MoMoCard />}
              {paymentMode === 'credit' && <CreditCard2 />}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/marketing/orders" className="px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition active:scale-95"
            style={{ background: 'var(--accent)', color: 'white' }}>
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
