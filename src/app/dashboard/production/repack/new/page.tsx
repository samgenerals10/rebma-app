'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Package, Scale, User } from 'lucide-react'

const supabase = createClient()

interface Product {
  id: string
  name: string
  current_qty: number
  unit: string
}

export default function NewRepackJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    source_product: '',
    target_pack_size: '',
    input_qty: '',
    output_qty_expected: '',
    assigned_to: '',
    notes: '',
  })

  const mockProducts: Product[] = [
    { id: '1', name: 'Milk Powder 1kg', current_qty: 500, unit: 'packs' },
    { id: '2', name: 'Flour 10kg', current_qty: 200, unit: 'bags' },
    { id: '3', name: 'Sugar 5kg', current_qty: 300, unit: 'bags' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const batchNumber = `BATCH-${Date.now().toString().slice(-6)}`

    const { data: job, error } = await supabase.from('repack_jobs').insert({
      batch_number: batchNumber,
      source_product: formData.source_product,
      target_pack: formData.target_pack_size,
      input_qty: parseInt(formData.input_qty),
      output_qty_expected: parseInt(formData.output_qty_expected),
      status: 'pending_finance',
      created_by: user.id,
    }).select().single()

    if (error) {
      console.error('Error inserting repack job:', error)
      alert(`Error creating job: ${error.message}`)
      setLoading(false)
      return
    }

    if (job) {
      await supabase.from('notifications').insert({
        recipient_department: 'finance',
        title: `Production Request: ${batchNumber}`,
        body: `Production requested ${formData.input_qty} of ${formData.source_product} for repacking. Needs Finance approval.`,
        type: 'production_request',
        reference_id: job.id,
        reference_type: 'repack_job'
      })
      router.push('/dashboard/production/repack')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Create New Repack Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Job Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Source Product *</label>
              <select 
                required
                value={formData.source_product}
                onChange={(e) => setFormData({ ...formData, source_product: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">Select Product</option>
                {mockProducts.map(p => (
                  <option key={p.id} value={p.name}>{p.name} ({p.current_qty} {p.unit} available)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Pack Size *</label>
              <input 
                type="text" 
                required
                placeholder="e.g., 500g"
                value={formData.target_pack_size}
                onChange={(e) => setFormData({ ...formData, target_pack_size: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Input Quantity *</label>
              <input 
                type="number" 
                required
                placeholder="Amount to repack"
                value={formData.input_qty}
                onChange={(e) => setFormData({ ...formData, input_qty: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Output *</label>
              <input 
                type="number" 
                required
                placeholder="Expected packs"
                value={formData.output_qty_expected}
                onChange={(e) => setFormData({ ...formData, output_qty_expected: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assign To</label>
              <input 
                type="text" 
                placeholder="Worker name"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea 
                rows={3}
                placeholder="Special instructions"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Job'}
          </button>
          <Link
            href="/dashboard/production/repack"
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}