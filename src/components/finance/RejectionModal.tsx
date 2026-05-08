'use client'
import { X } from 'lucide-react'

interface Props {
  order: any
  reason: string
  processing: boolean
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export default function RejectionModal({ order, reason, processing, onReasonChange, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ background: 'var(--card-bg)' }}>
        <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Reject Order</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {order.order_number} — {order.customers?.name}
        </p>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Reason for rejection *
        </label>
        <textarea
          value={reason}
          onChange={e => onReasonChange(e.target.value)}
          placeholder="e.g. Insufficient payment details, Invalid cheque..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none mb-4"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
        />
        <div className="flex justify-end gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--table-header-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={processing}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: '#dc2626', color: 'white' }}>
            {processing
              ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <X className="w-4 h-4" />}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  )
}
