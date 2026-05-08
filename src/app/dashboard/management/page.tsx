import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, CheckCircle, Clock, DollarSign, ShoppingCart, Shield, AlertTriangle, Package } from 'lucide-react'
import CreditApprovals from '@/components/management/CreditApprovals'

export default async function ManagementDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!currentUser) redirect('/login')

  if (currentUser.role !== 'ceo' && currentUser.role !== 'manager' && currentUser.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const role = currentUser.role

  const { data: approvalQueue } = await supabase
    .from('approval_queue')
    .select('*')
    .eq('status', 'pending')
    .eq('department', role === 'ceo' ? 'ceo' : 'management')
    .order('created_at', { ascending: false })

  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  const { data: creditOrders } = await supabase.from('orders').select('*, customers(*), order_items(*, products(name, sku))').eq('payment_mode', 'credit').in('status', ['pending_manager', 'pending_finance', 'approved', 'rejected']).order('created_at', { ascending: false })
  const { data: payments } = await supabase.from('payments').select('*').order('created_at', { ascending: false })
  const { data: pendingReceipts } = await supabase.from('goods_receipts').select('id').eq('status', 'pending')

  const totalRevenue = orders?.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0) || 0
  const todayPayments = payments?.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length || 0

  const visibleQueue = approvalQueue?.filter(item => {
    if (item.type === 'import') return role === 'ceo'
    return true
  }) || []

  const stats = [
    { label: 'Pending Approvals', value: visibleQueue.length, icon: Clock, color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'Pending Receipts', value: pendingReceipts?.length || 0, icon: Package, color: '#1a73e8', bg: '#1a73e815' },
    { label: 'Total Revenue', value: 'GH\u20b5 ' + totalRevenue.toLocaleString(), icon: DollarSign, color: '#059669', bg: '#05966915' },
    { label: 'Payments Today', value: todayPayments, icon: TrendingUp, color: '#8b5cf6', bg: '#8b5cf615' },
  ]

  const quickActions = [
    { href: '/dashboard/management/goods-receipts', icon: Package, color: '#1a73e8', bg: '#1a73e815', label: 'Goods Receipts', description: 'Review and approve incoming goods' },
    { href: '/dashboard/management/set-price', icon: DollarSign, color: '#059669', bg: '#05966915', label: 'Set Prices', description: 'Set selling prices per product' },
    ...(role === 'ceo' ? [{ href: '/dashboard/operations/imports', icon: AlertTriangle, color: '#dc2626', bg: '#dc262615', label: 'Import Approvals', description: 'CEO only — Poland & Turkey imports' }] : []),
    { href: '/dashboard/management/audit', icon: CheckCircle, color: '#059669', bg: '#05966915', label: 'Audit Log', description: 'View all system activity' },
    { href: '/dashboard/management/executive', icon: TrendingUp, color: '#1a73e8', bg: '#1a73e815', label: 'Executive Dashboard', description: 'Full department overview' },
    { href: '/dashboard/hr/accounts', icon: Shield, color: '#8b5cf6', bg: '#8b5cf615', label: 'HR Registrations', description: 'Approve HR department staff' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Management</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Approvals, revenue and system oversight</p>
        </div>
      </div>

      <CreditApprovals orders={creditOrders || []} currentUser={currentUser} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: stat.bg }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Approval Queue</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
              {visibleQueue.length} pending
            </span>
          </div>
          <div>
            {visibleQueue.map((item, i) => (
              <div key={item.id} className="px-5 py-4" style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                      {item.title || item.type?.replace(/_/g, ' ')}
                    </p>
                    {item.description && (
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  {item.type === 'goods_receipt' ? (
                    <Link href="/dashboard/management/goods-receipts"
                      className="px-3 py-1.5 text-xs font-medium rounded-lg"
                      style={{ background: '#1a73e8', color: 'white' }}>
                      Review
                    </Link>
                  ) : (
                    <div className="flex gap-2 flex-shrink-0">
                      <form method="POST" action="/api/management/approve">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="type" value={item.type} />
                        <input type="hidden" name="reference_id" value={item.reference_id} />
                        <button className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ background: '#059669', color: 'white' }}>Approve</button>
                      </form>
                      <form method="POST" action="/api/management/reject">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="type" value={item.type} />
                        <button className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ background: '#dc2626', color: 'white' }}>Reject</button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {visibleQueue.length === 0 && (
              <div className="px-5 py-10 flex flex-col items-center gap-2">
                <CheckCircle className="w-10 h-10" style={{ color: '#059669' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All caught up</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          </div>
          <div>
            {quickActions.map((action, i) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-4 px-5 py-4 transition hover:opacity-80"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: action.bg }}>
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
