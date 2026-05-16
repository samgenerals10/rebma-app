'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react'

export default function RepackJobDetailsPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  
  // Mock data for the demo, replace with real DB fetch
  const job = { 
    id, 
    batch_number: `BATCH-00${id}`, 
    source_product: 'Milk Powder 1kg', 
    target_pack: '500g', 
    input_qty: 100, 
    output_qty: 198, 
    status: 'in_progress', 
    created_by: 'Admin', 
    created_at: '2024-01-15',
    workers: ['John Doe', 'Jane Smith']
  }

  useEffect(() => {
    // Simulate DB load
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading job details...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/production/repack" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Job Details: {job.batch_number}</h1>
          <p className="text-gray-500">View progress and quality checks</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold border-b pb-4 mb-4">Production Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Source Material</p>
            <p className="font-semibold">{job.source_product}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Target Output</p>
            <p className="font-semibold">{job.target_pack}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Input Quantity</p>
            <p className="font-semibold">{job.input_qty} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Output</p>
            <p className="font-semibold text-emerald-600">{job.output_qty} packs</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold border-b pb-4 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" /> Assigned Workers
        </h2>
        <ul className="space-y-2">
          {job.workers.map((worker, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> {worker}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <Clock className="w-10 h-10 text-blue-500 mx-auto mb-3" />
        <h3 className="font-semibold text-blue-800">Job is currently In Progress</h3>
        <p className="text-blue-600 text-sm mt-1">Quality Control checks will be available once repacking is complete.</p>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Mark as Completed & Send to QC
        </button>
      </div>
    </div>
  )
}
