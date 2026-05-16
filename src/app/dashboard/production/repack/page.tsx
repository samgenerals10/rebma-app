'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Filter, Package, ArrowLeft, CheckCircle, Clock, AlertTriangle, Play } from 'lucide-react'

const supabase = createClient()

export default function RepackJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
      setCurrentUser(userData)
    }

    const { data } = await supabase
      .from('repack_jobs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setJobs(data)
    setLoading(false)
  }

  const completeJob = async (job: any) => {
    const confirm = window.confirm(`Are you sure you have finished producing ${job.output_qty_expected} packs of ${job.source_product}?`)
    if (!confirm || !currentUser) return

    setLoading(true)
    
    // Update the job status
    await supabase.from('repack_jobs').update({ status: 'completed', output_qty: job.output_qty_expected }).eq('id', job.id)

    // Notify all departments
    const notifyBody = `Production of ${job.batch_number} is complete. ${job.output_qty_expected} packs of ${job.source_product} are now available in stock.`
    await supabase.from('notifications').insert([
      { recipient_department: 'operations', sender_id: currentUser.id, title: 'New Goods Produced', body: notifyBody, type: 'production_completed', reference_id: job.id, is_read: false },
      { recipient_department: 'marketing', sender_id: currentUser.id, title: 'New Stock Available', body: notifyBody, type: 'production_completed', reference_id: job.id, is_read: false },
      { recipient_department: 'finance', sender_id: currentUser.id, title: 'Production Completed', body: notifyBody, type: 'production_completed', reference_id: job.id, is_read: false },
      { recipient_department: 'management', sender_id: currentUser.id, title: 'Batch Completed', body: notifyBody, type: 'production_completed', reference_id: job.id, is_read: false }
    ])

    await loadJobs()
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.batch_number?.toLowerCase().includes(search.toLowerCase()) ||
      job.source_product?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || job.status === filter
    return matchesSearch && matchesFilter
  })

  const statusColors: Record<string, any> = {
    pending_finance: { bg: 'bg-red-100', text: 'text-red-700', icon: Clock, label: 'Waiting on Finance' },
    pending_operations: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Package, label: 'Waiting for Goods' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Play, label: 'In Production' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Completed' },
  }

  if (loading) return <div className="p-10 text-center">Loading jobs...</div>

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
            <option value="pending_finance">Waiting on Finance</option>
            <option value="pending_operations">Waiting for Goods</option>
            <option value="in_progress">In Production</option>
            <option value="completed">Completed</option>
          </select>
          <Link href="/dashboard/production/repack/new" className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const config = statusColors[job.status] || statusColors.pending_finance
          const StatusIcon = config.icon
          return (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg">{job.batch_number}</span>
                <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${config.bg} ${config.text}`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
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
                  <span className="text-sm font-medium">{job.output_qty || job.output_qty_expected} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium">{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/production/repack/${job.id}`} className="flex-1 py-2 border rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition">
                  Details
                </Link>
                {job.status === 'in_progress' && (
                  <button onClick={() => completeJob(job)} className="flex-1 py-2 rounded-lg text-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-sm font-bold transition">
                    Finish Job
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
          <p className="text-gray-500 mb-4">No repack jobs match your search criteria.</p>
          <Link href="/dashboard/production/repack/new" className="text-emerald-600 hover:underline">
            Create a new job
          </Link>
        </div>
      )}
    </div>
  )
}