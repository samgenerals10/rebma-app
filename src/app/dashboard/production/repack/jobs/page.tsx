'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Package, ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface RepackJob {
  id: string
  batch_number: string
  source_product: string
  target_pack: string
  input_qty: number
  output_qty: number
  status: 'pending' | 'in_progress' | 'qc' | 'completed'
  created_by: string
  created_at: string
}

const mockJobs: RepackJob[] = [
  { id: '1', batch_number: 'BATCH-001', source_product: 'Milk Powder 1kg', target_pack: '500g', input_qty: 100, output_qty: 198, status: 'in_progress', created_by: 'Admin', created_at: '2024-01-15' },
  { id: '2', batch_number: 'BATCH-002', source_product: 'Flour 10kg', target_pack: '1kg', input_qty: 200, output_qty: 195, status: 'qc', created_by: 'Admin', created_at: '2024-01-14' },
  { id: '3', batch_number: 'BATCH-003', source_product: 'Sugar 5kg', target_pack: '500g', input_qty: 150, output_qty: 298, status: 'completed', created_by: 'Admin', created_at: '2024-01-13' },
  { id: '4', batch_number: 'BATCH-004', source_product: 'Rice 25kg', target_pack: '5kg', input_qty: 50, output_qty: 48, status: 'pending', created_by: 'Admin', created_at: '2024-01-16' },
]

export default function RepackJobsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      job.source_product.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || job.status === filter
    return matchesSearch && matchesFilter
  })

  const statusColors = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
    qc: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Repack Job Cards</h1>
          <p className="text-gray-500">View and manage all repacking jobs</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="qc">Pending QC</option>
            <option value="completed">Completed</option>
          </select>
          <Link href="/dashboard/production/repack" className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const StatusIcon = statusColors[job.status].icon
          return (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg">{job.batch_number}</span>
                <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusColors[job.status].bg} ${statusColors[job.status].text}`}>
                  <StatusIcon className="w-3 h-3" />
                  {job.status.replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Source:</span>
                  <span className="text-sm font-medium">{job.source_product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Target:</span>
                  <span className="text-sm font-medium">{job.target_pack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Input:</span>
                  <span className="text-sm font-medium">{job.input_qty} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Output:</span>
                  <span className="text-sm font-medium">{job.output_qty} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium">{job.created_at}</span>
                </div>
              </div>
              <Link href={`/dashboard/production/repack/${job.id}`} className="w-full py-2 border rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700">
                View Details
              </Link>
            </div>
          )
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
          <p className="text-gray-500 mb-4">No repack jobs match your search criteria.</p>
          <Link href="/dashboard/production/repack" className="text-emerald-600 hover:underline">
            Create a new job
          </Link>
        </div>
      )}
    </div>
  )
}