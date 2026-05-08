'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, ArrowLeft, Plus } from 'lucide-react'

export default function QualityCheckPage() {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    batch_number: '',
    product: '',
    input_qty: '',
    output_qty: '',
    result: 'pass',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await supabase.from('approval_queue').insert({
      type: 'quality_check',
      reference_id: form.batch_number,
      amount: parseInt(form.output_qty) || 0,
      notes: `${form.product}|${form.input_qty}|${form.output_qty}|${form.result}|${form.notes}`,
      status: form.result === 'pass' ? 'approved' : 'rejected'
    })

    setShowForm(false)
    setLoading(false)
  }

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Check</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                <input required type="text" value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <input required type="text" value={form.product} onChange={e => setForm({...form, product: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Input Quantity</label>
                <input required type="text" value={form.input_qty} onChange={e => setForm({...form, input_qty: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Output Quantity</label>
                <input required type="text" value={form.output_qty} onChange={e => setForm({...form, output_qty: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
                <div className="flex gap-4 py-3">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="result" value="pass" checked={form.result === 'pass'} onChange={e => setForm({...form, result: e.target.value})} className="text-green-600" />
                    <span className="flex items-center gap-1 text-green-700"><CheckCircle className="w-4 h-4" /> Pass</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="result" value="fail" checked={form.result === 'fail'} onChange={e => setForm({...form, result: e.target.value})} className="text-red-600" />
                    <span className="flex items-center gap-1 text-red-700"><XCircle className="w-4 h-4" /> Fail</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Quality Check'}
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
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Input</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Output</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Result</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { batch: 'BATCH-001', product: 'Milk Powder 500g', input: '100kg', output: '198 packs', result: 'pass', date: '2026-05-01' },
                { batch: 'BATCH-002', product: 'Flour 1kg', input: '200kg', output: '195 bags', result: 'pass', date: '2026-04-30' },
                { batch: 'BATCH-003', product: 'Margarine 500g', input: '50kg', output: '98 packs', result: 'fail', date: '2026-04-29' },
              ].map((qc, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{qc.batch}</td>
                  <td className="px-6 py-4 text-gray-600">{qc.product}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{qc.input}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{qc.output}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      qc.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {qc.result === 'pass' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {qc.result.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{qc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}