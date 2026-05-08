'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Ship, CheckCircle } from 'lucide-react'

export default function ImportsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [demands, setDemands] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [formData, setFormData] = useState({
    product_name: '',
    quantity: '',
    supplier: '',
    estimated_cost: '',
    currency: 'USD',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      setUserRole(profile?.role || '')
    }

    const { data } = await supabase
      .from('approval_queue')
      .select('*')
      .eq('type', 'import')
      .order('created_at', { ascending: false })
    if (data) setDemands(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('approval_queue').insert({
      type: 'import',
      amount: parseFloat(formData.estimated_cost),
      notes: `${formData.product_name}|${formData.quantity}|${formData.supplier}|${formData.currency}|${formData.notes}`,
      requester_id: user?.id,
      status: 'pending'
    })

    setShowForm(false)
    setFormData({ product_name: '', quantity: '', supplier: '', estimated_cost: '', currency: 'USD', notes: '' })
    loadData()
    setLoading(false)
  }

  const workflowSteps = ['Demand Signal', 'CEO Approval', 'Payment', 'PO Created', 'Customs', 'Goods Receipt']

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Import Request</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                <input required type="text" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Milk Powder" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input required type="text" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 5000 kg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                <select required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Select supplier...</option>
                  <option value="Poland">Poland</option>
                  <option value="Turkey">Turkey</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost *</label>
                <input required type="number" step="0.01" value={formData.estimated_cost} onChange={e => setFormData({...formData, estimated_cost: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
                <select required value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Additional details..." />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit for CEO Approval'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Workflow Steps */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Workflow</h2>
          <div className="flex items-center justify-between overflow-x-auto">
            {workflowSteps.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    {i === 0 ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-medium">{i + 1}</span>}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 text-center">{step}</span>
                </div>
                {i < workflowSteps.length - 1 && <div className="w-8 h-0.5 bg-gray-200 mx-2 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* CEO Approval Notice */}
        {userRole !== 'ceo' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 text-sm font-medium">⚠️ Import approvals are handled exclusively by the CEO. Submitted requests will appear in the CEO approval queue.</p>
          </div>
        )}

        {/* Import Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Import Requests</h2>
            <span className="text-sm text-gray-500">{demands.length} total</span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Request ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Supplier</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Quantity</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Cost</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {demands.map((d) => {
                const notes = d.notes?.split('|') || []
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 text-sm">IMP-{d.id.slice(0, 6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-900">{notes[0] || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${notes[2] === 'Poland' ? 'bg-blue-100 text-blue-700' : notes[2] === 'Turkey' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {notes[2] || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{notes[1] || '—'}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{notes[3] || 'USD'} {d.amount ? parseFloat(d.amount).toLocaleString() : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.status === 'approved' ? 'bg-green-100 text-green-700' :
                        d.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                )
              })}
              {demands.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No import requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
