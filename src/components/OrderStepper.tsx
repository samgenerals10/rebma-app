'use client'

import { CheckCircle, Clock, XCircle } from 'lucide-react'

const STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'approved', label: 'Approved' },
  { key: 'operations', label: 'Operations' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
]

const STATUS_STEP_MAP: Record<string, number> = {
  pending: 0,
  pending_finance: 0,
  pending_manager: 0,
  processing: 1,
  approved: 2,
  rejected: 2,
  preparing: 3,
  ready_for_dispatch: 3,
  dispatched: 4,
  delivered: 5,
  cancelled: -1,
}

export default function OrderStepper({ status }: { status: string }) {
  const currentStep = STATUS_STEP_MAP[status] ?? 0
  const isRejected = status === 'rejected'
  const isCancelled = status === 'cancelled'

  if (isCancelled) return (
    <div className="flex items-center gap-1.5 py-2">
      <XCircle className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
      <span className="text-xs font-medium" style={{ color: '#dc2626' }}>Cancelled</span>
    </div>
  )

  return (
    <div className="flex items-center w-full py-2 overflow-x-auto">
      {STEPS.map((step, i) => {
        const isCompleted = currentStep > i
        const isCurrent = currentStep === i
        const isRejectedStep = isRejected && i === 2
        const isPending = currentStep < i

        let dotColor = '#e5e7eb'
        let textColor = '#9ca3af'
        let lineColor = '#e5e7eb'

        if (isRejectedStep) {
          dotColor = '#dc2626'
          textColor = '#dc2626'
        } else if (isCompleted) {
          dotColor = '#059669'
          textColor = '#059669'
          lineColor = '#059669'
        } else if (isCurrent) {
          dotColor = '#1a73e8'
          textColor = '#1a73e8'
        }

        return (
          <div key={step.key} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              {/* Dot */}
              <div className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ background: isCompleted || isCurrent || isRejectedStep ? dotColor : 'transparent', border: '2px solid ' + dotColor }}>
                {isRejectedStep ? (
                  <XCircle className="w-3 h-3 text-white" />
                ) : isCompleted ? (
                  <CheckCircle className="w-3 h-3 text-white" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-white" />
                ) : null}
              </div>
              {/* Label */}
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: textColor, fontSize: '9px' }}>
                {isRejectedStep ? 'Rejected' : step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="h-0.5 flex-1 mx-1 transition-all duration-300"
                style={{ background: isCompleted ? '#059669' : '#e5e7eb', minWidth: '8px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
