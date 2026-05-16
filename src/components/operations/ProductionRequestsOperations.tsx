'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Package, CheckCircle, ChevronDown, ChevronUp, Play } from 'lucide-react'

export default function ProductionRequestsOperations({ requests: initialRequests, currentUser }: { requests: any[], currentUser: any }) {
  const supabase = createClient()
  const [requests, setRequests] = useState(initialRequests)
  const [processing, setProcessing] = useState<string | null>(null)

  const loadRequests = async () => {
    const { data } = await supabase
      .from('repack_jobs')
      .select('*')
      .eq('status', 'pending_operations')
      .order('created_at', { ascending: false })
    if (data) setRequests(data)
  }

  const issueGoods = async (job: any) => {
    const confirm = window.confirm(`Confirm issuing ${job.input_qty} of ${job.source_product} to Production?`)
    if (!confirm) return

    setProcessing(job.id)
    await supabase.from('repack_jobs').update({ status: 'in_progress' }).eq('id', job.id)
    
    // Alert Production that goods are issued and they can start producing
    await supabase.from('notifications').insert({
      recipient_department: 'production',
      sender_id: currentUser.id,
      title: 'Goods Issued for Production',
      body: `Operations has issued ${job.input_qty} of ${job.source_product} for batch ${job.batch_number}. You can start producing.`,
      type: 'goods_issued',
      reference_id: job.id,
      is_read: false
    })

    setProcessing(null)
    await loadRequests()
  }

  if (requests.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Production Requests (Awaiting Goods)</h3>
        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
          {requests.length} Pending
        </span>
      </div>

      <div className="space-y-3">
        {requests.map(job => (
          <div key={job.id} className="rounded-xl overflow-hidden p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)', borderLeft: '4px solid #8b5cf6' }}>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Batch: {job.batch_number}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium text-gray-500 mr-1">Required:</span> 
                  <span className="font-bold">{job.input_qty}</span> units of <span className="font-bold">{job.source_product}</span>
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium text-gray-500 mr-1">Expected Output:</span> 
                  {job.output_qty_expected} ({job.target_pack})
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => issueGoods(job)}
              disabled={processing === job.id}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              {processing === job.id ? 'Issuing...' : 'Issue Goods'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
