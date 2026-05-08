'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, ArrowLeft, Plus } from 'lucide-react'

export default function ExpenseLogPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    
    const { error } = await supabase
      .from('approval_queue')
      .insert({
        type: 'expense',
        amount: parseFloat(formData.get('amount') as string),
        notes: `${formData.get('category')}|${formData.get('description')}`,
        requester_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending'
      })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.push('/dashboard/finance')
    }
    setLoading(false)
  }

  return (
    <div className="">

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select name="category" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="">Select category...</option>
                <option value="operational">Operational</option>
                <option value="transport">Transport</option>
                <option value="utilities">Utilities</option>
                <option value="supplies">Supplies</option>
                <option value="maintenance">Maintenance</option>
                <option value="salary">Salary/Allowance</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (GH₵)</label>
              <input 
                type="number" 
                name="amount" 
                step="0.01" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                name="description" 
                rows={3}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="Describe the expense..."
              />
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
              <Link href="/dashboard/finance" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}