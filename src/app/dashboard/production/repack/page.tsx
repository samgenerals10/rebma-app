'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { Clipboard, ArrowLeft, Plus, Users } from 'lucide-react'

export default function RepackJobsPage() {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    source_product: '',
    target_product: '',
    input_qty: '',
    assigned_workers: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const batchNumber = `BATCH-${Date.now()}`

    await supabase.from('approval_queue').insert({
      type: 'repack_job',
      reference_id: batchNumber,
      amount: parseInt(form.input_qty) || 0,
      notes: `${form.source_product}|${form.target_product}|${form.input_qty}|${form.assigned_workers}|${form.notes}`,
      status: 'pending'
    })

    setShowForm(false)
    setLoading(false)
  }

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Repack Job</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Product</label>
                <input required type="text" value={form.source_product} onChange={e => setForm({...form, source_product: e.target.value})} placeholder="e.g., Milk Powder 1kg" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Product</label>
                <input required type="text" value={form.target_product} onChange={e => setForm({...form, target_product: e.target.value})} placeholder="e.g., Milk Powder 500g" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Input Quantity (kg)</label>
                <input required type="number" value={form.input_qty} onChange={e => setForm({...form, input_qty: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Workers</label>
                <input required type="text" value={form.assigned_workers} onChange={e => setForm({...form, assigned_workers: e.target.value})} placeholder="e.g., John, Mary, Peter" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Job'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Batch</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Source → Target</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Input</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Output</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Workers</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { batch: 'BATCH-001', source: 'Milk Powder 1kg', target: 'Milk Powder 500g', input: '100kg', output: '198 packs', workers: 'John, Mary', status: 'in_progress' },
                { batch: 'BATCH-002', source: 'Flour 10kg', target: 'Flour 1kg', input: '200kg', output: '195 bags', workers: 'Peter, Paul', status: 'pending_qc' },
                { batch: 'BATCH-003', source: 'Margarine 1kg', target: 'Margarine 500g', input: '50kg', output: '98 packs', workers: 'James', status: 'completed' },
              ].map((job, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{job.batch}</td>
                  <td className="px-6 py-4 text-gray-600">{job.source} → {job.target}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{job.input}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{job.output}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" /> {job.workers}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'completed' ? 'bg-green-100 text-green-700' :
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.status === 'in_progress' ? 'In Progress' : job.status === 'pending_qc' ? 'Pending QC' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-emerald-600 hover:underline text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}