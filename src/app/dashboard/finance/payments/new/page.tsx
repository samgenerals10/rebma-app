'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, ArrowLeft } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  total_amount: string
  customers: { name: string } | null
}

export default function NewPaymentPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [form, setForm] = useState({
    order_id: '',
    amount: '',
    payment_method: '',
    reference_number: '',
    notes: '',
  })

  useEffect(() => {
    async function loadOrders() {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, customers(name)')
        .in('status', ['pending', 'confirmed', 'processing'])
        .order('created_at', { ascending: false })
      if (data) setOrders(data as any)
    }
    loadOrders()
  }, [])

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      setForm(f => ({ ...f, order_id: orderId, amount: parseFloat(order.total_amount || '0').toFixed(2) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.order_id || !form.amount || !form.payment_method) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: form.order_id,
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        reference_number: form.reference_number || null,
        recorded_by: user?.id,
      })

    if (paymentError) {
      setError(paymentError.message)
      setLoading(false)
      return
    }

    // Update order status if fully paid
    const order = orders.find(o => o.id === form.order_id)
    if (order && parseFloat(form.amount) >= parseFloat(order.total_amount)) {
      await supabase.from('orders').update({ status: 'paid' }).eq('id', form.order_id)
    }

    router.push('/dashboard/finance/payments')
  }

  return (
    <div className="">

      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Order *</label>
            <select
              value={form.order_id}
              onChange={e => handleOrderChange(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Select an order...</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.order_number} — {(order as any).customers?.name || 'Unknown'} — GH₵ {parseFloat(order.total_amount || '0').toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (GH₵) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
            <div className="grid grid-cols-3 gap-3">
              {['cash', 'transfer', 'cheque'].map(method => (
                <label key={method} className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition ${form.payment_method === method ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value={method}
                    checked={form.payment_method === method}
                    onChange={e => setForm({ ...form, payment_method: e.target.value })}
                    className="sr-only"
                  />
                  <span className="font-medium capitalize text-gray-900">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
            <input
              type="text"
              value={form.reference_number}
              onChange={e => setForm({ ...form, reference_number: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Transaction ID / Cheque number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Link href="/dashboard/finance" className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
