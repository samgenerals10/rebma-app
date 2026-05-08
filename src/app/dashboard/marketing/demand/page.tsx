'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, ArrowLeft, Package, Send } from 'lucide-react'

export default function DemandSignalPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    product_name: '',
    category: '',
    expected_quantity: '',
    urgency: 'medium',
    reason: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await supabase
      .from('approval_queue')
      .insert({
        type: 'demand_signal',
        amount: parseInt(form.expected_quantity) || 0,
        notes: `${form.product_name}|${form.category}|${form.urgency}|${form.reason}`,
        requester_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending'
      })

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="">

      <main className="max-w-2xl mx-auto px-4 py-8">
        {submitted ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Demand Signal Submitted</h2>
            <p className="text-gray-600 mb-4">CEO will review this request for import consideration.</p>
            <button onClick={() => setSubmitted(false)} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Submit Another
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Demand Signal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input required type="text" value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., Premium Butter 500g" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="">Select...</option>
                    <option value="dairy">Dairy</option>
                    <option value="bakery">Bakery</option>
                    <option value="ingredients">Ingredients</option>
                    <option value="packaging">Packaging</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Quantity</label>
                  <input required type="text" value={form.expected_quantity} onChange={e => setForm({...form, expected_quantity: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., 5000 units" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                <div className="flex gap-4">
                  {['low', 'medium', 'high'].map(u => (
                    <label key={u} className="flex items-center gap-2">
                      <input type="radio" name="urgency" value={u} checked={form.urgency === u} onChange={e => setForm({...form, urgency: e.target.value})} className="text-emerald-600" />
                      <span className="capitalize text-gray-700">{u}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Demand</label>
                <textarea required rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Why is this product needed? Customer requests, market trend, etc." />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Demand Signal'}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Demand Signals</h3>
          <p className="text-gray-500 text-center py-4">No demand signals submitted yet</p>
        </div>
      </main>
    </div>
  )
}