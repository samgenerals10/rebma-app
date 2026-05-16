import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, Package } from 'lucide-react'

export default async function GoodsReceiptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('role, department').eq('id', user.id).single()
  if (!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'ceo')) redirect('/dashboard')

  const { data: receipts } = await supabase
    .from('goods_receipts')
    .select('*, goods_receipt_items(*), discrepancy_reports(*)')
    .order('created_at', { ascending: false })

  const pending = receipts?.filter(r => r.status === 'pending') || []
  const approved = receipts?.filter(r => r.status === 'approved') || []
  const rejected = receipts?.filter(r => r.status === 'rejected') || []

  const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
      pending: { bg: '#f59e0b20', color: '#f59e0b', label: 'Pending', icon: Clock },
      approved: { bg: '#05966920', color: '#059669', label: 'Approved', icon: CheckCircle },
      rejected: { bg: '#dc262620', color: '#dc2626', label: 'Rejected', icon: XCircle },
    }
    const c = config[status] || config.pending
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: c.bg, color: c.color }}>
        {status === 'pending' ? <Clock className="w-3 h-3" /> : status === 'approved' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {c.label}
      </span>
    )
  }

  const ReceiptCard = ({ receipt }: { receipt: any }) => {
    const hasDiscrepancy = receipt.discrepancy_reports?.length > 0
    const items = receipt.goods_receipt_items || []
    const totalQty = items.reduce((s: number, i: any) => s + (i.qty || i.received_qty || 0), 0)
    const totalWeight = items.reduce((s: number, i: any) => s + (i.total_weight || 0), 0)

    return (
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)' }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{receipt.receipt_number}</p>
              <StatusBadge status={receipt.status} />
              {hasDiscrepancy && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#dc262615', color: '#dc2626' }}>
                  <AlertTriangle className="w-3 h-3" /> Discrepancy
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(receipt.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          {receipt.status === 'pending' && currentUser.role === 'manager' && (
            <div className="flex gap-2">
              <form method="POST" action="/api/management/goods-receipts/approve">
                <input type="hidden" name="receipt_id" value={receipt.id} />
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ background: '#059669', color: 'white' }}>Approve</button>
              </form>
              <form method="POST" action="/api/management/goods-receipts/reject">
                <input type="hidden" name="receipt_id" value={receipt.id} />
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ background: '#dc2626', color: 'white' }}>Reject</button>
              </form>
            </div>
          )}
        </div>

        {/* Receipt details */}
        <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Supplier</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{receipt.supplier}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>PO Number</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{receipt.po_number || '—'}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>From</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{receipt.location_from || '—'}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>To</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{receipt.location_to || '—'}</p>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Items Received</p>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th className="text-left pb-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Product</th>
                <th className="text-center pb-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Qty</th>
                <th className="text-center pb-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Weight/Sack</th>
                <th className="text-center pb-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Weight</th>
                <th className="text-center pb-2 text-xs font-semibold" style={{ color: '#059669' }}>Passed</th>
                <th className="text-center pb-2 text-xs font-semibold" style={{ color: '#dc2626' }}>Failed</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                  <td className="py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{item.product_name || 'Unknown'}</td>
                  <td className="py-2 text-center" style={{ color: 'var(--text-secondary)' }}>{item.qty || item.received_qty}</td>
                  <td className="py-2 text-center" style={{ color: 'var(--text-secondary)' }}>{item.weight_per_sack ? item.weight_per_sack + ' kg' : '—'}</td>
                  <td className="py-2 text-center" style={{ color: 'var(--text-secondary)' }}>{item.total_weight ? item.total_weight + ' kg' : '—'}</td>
                  <td className="py-2 text-center font-bold" style={{ color: '#059669' }}>{item.passed_qty ?? '—'}</td>
                  <td className="py-2 text-center font-bold" style={{ color: item.failed_qty > 0 ? '#dc2626' : 'var(--text-muted)' }}>{item.failed_qty ?? '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--card-border)' }}>
                <td className="pt-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>TOTAL</td>
                <td className="pt-2 text-center font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{totalQty}</td>
                <td />
                <td className="pt-2 text-center font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{totalWeight} kg</td>
                <td /><td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Discrepancy report */}
        {hasDiscrepancy && (
          <div className="px-5 py-3 mx-5 mb-4 rounded-lg" style={{ background: '#dc262610', border: '1px solid #dc2626' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#dc2626' }}>Discrepancy Report</p>
            {receipt.discrepancy_reports.map((d: any, i: number) => (
              <p key={i} className="text-sm" style={{ color: 'var(--text-primary)' }}>{d.reason}</p>
            ))}
          </div>
        )}

        {/* Notes */}
        {receipt.notes && (
          <div className="px-5 pb-4">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Notes: {receipt.notes}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/management" className="p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Goods Receipts</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review and approve incoming goods from Operations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending', value: pending.length, color: '#f59e0b', bg: '#f59e0b15' },
          { label: 'Approved', value: approved.length, color: '#059669', bg: '#05966915' },
          { label: 'Rejected', value: rejected.length, color: '#dc2626', bg: '#dc262615' },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-5 ${s.label === 'Pending' && s.value > 0 ? 'animate-attention' : ''}`} style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock className="w-4 h-4" style={{ color: '#f59e0b' }} /> Pending Approval ({pending.length})
          </h3>
          <div className="space-y-4">
            {pending.map(r => <ReceiptCard key={r.id} receipt={r} />)}
          </div>
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} /> Approved ({approved.length})
          </h3>
          <div className="space-y-4">
            {approved.map(r => <ReceiptCard key={r.id} receipt={r} />)}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <XCircle className="w-4 h-4" style={{ color: '#dc2626' }} /> Rejected ({rejected.length})
          </h3>
          <div className="space-y-4">
            {rejected.map(r => <ReceiptCard key={r.id} receipt={r} />)}
          </div>
        </div>
      )}

      {(!receipts || receipts.length === 0) && (
        <div className="rounded-xl p-10 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <Package className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No goods receipts yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Operations will submit goods receipts for your review</p>
        </div>
      )}
    </div>
  )
}
