'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  total_amount: string
  customer_id: string
  customers: { name: string } | null
}

export default function NewInvoicePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [form, setForm] = useState({
    salesOrderId: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    subtotal: '',
    vatAmount: '0',
    notes: '',
  })

  useEffect(() => {
    async function loadOrders() {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, customer_id, customers(name)')
        .order('created_at', { ascending: false })
      if (data) setOrders(data as any)
    }
    loadOrders()
  }, [])

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      setForm(f => ({
        ...f,
        salesOrderId: orderId,
        customerId: order.customer_id,
        subtotal: parseFloat(order.total_amount || '0').toFixed(2),
      }))
    }
  }

  const generateInvoiceNumber = () => {
    const now = new Date()
    return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`
  }

  const subtotal = parseFloat(form.subtotal) || 0
  const vat = parseFloat(form.vatAmount) || 0
  const total = subtotal + vat

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.salesOrderId) {
      setError('Please select an order')
      return
    }
    if (!form.dueDate) {
      setError('Please set a due date')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('Invoice').insert({
      invoiceNumber: generateInvoiceNumber(),
      salesOrderId: form.salesOrderId,
      customerId: form.customerId,
      date: form.date,
      dueDate: form.dueDate,
      subtotal,
      vatAmount: vat,
      total,
      notes: form.notes,
      status: 'pending',
      createdBy: user?.id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/finance/invoices')
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
              value={form.salesOrderId}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal (GH₵)</label>
              <input
                type="number"
                step="0.01"
                value={form.subtotal}
                onChange={e => setForm({ ...form, subtotal: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">VAT Amount (GH₵)</label>
              <input
                type="number"
                step="0.01"
                value={form.vatAmount}
                onChange={e => setForm({ ...form, vatAmount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Amount:</span>
              <span className="text-xl font-bold text-emerald-600">GH₵ {total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Payment terms, delivery notes..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Link href="/dashboard/finance/invoices" className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
