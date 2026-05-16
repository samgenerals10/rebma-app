import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, FileText, Plus, TrendingUp, CreditCard, Banknote, CheckCircle, Clock, Smartphone, BarChart2, Navigation } from 'lucide-react'
import FinanceDashboardClient from './FinanceDashboardClient'
import FinanceActionsMenu from './FinanceActionsMenu'

export default async function FinanceDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('role, department').eq('id', user.id).single()
  if (!currentUser) redirect('/login')
  if (currentUser.department !== 'finance' && currentUser.role !== 'ceo' && currentUser.role !== 'manager') {
    redirect('/dashboard')
  }

  const { data: payments } = await supabase
    .from('payments').select('*').order('created_at', { ascending: false }).limit(5)

  const { data: allOrders } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*, products(name, sku))')
    .in('status', ['pending', 'pending_finance', 'pending_manager', 'approved', 'rejected'])
    .order('created_at', { ascending: false })

  const { data: priceUpdates } = await supabase
    .from('product_prices')
    .select('*, products(*, stock(quantity, location)), users:set_by(full_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: repackJobs } = await supabase
    .from('repack_jobs')
    .select('*')
    .eq('status', 'pending_finance')
    .order('created_at', { ascending: false })

  const totalRevenue = allOrders?.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0) || 0
  const cashPayments = payments?.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0
  const pendingCount = allOrders?.filter(o => o.status === 'pending_finance' || o.status === 'pending_manager' || o.status === 'pending').length || 0
  const approvedCount = allOrders?.filter(o => o.status === 'approved').length || 0

  const stats = [
    { label: 'Total Revenue', value: 'GH₵ ' + totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), icon: TrendingUp, color: '#059669', bg: '#05966915' },
    { label: 'Cash Payments', value: 'GH₵ ' + cashPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), icon: Banknote, color: '#1a73e8', bg: '#1a73e815' },
    { label: 'Pending Review', value: pendingCount, icon: Clock, color: '#dc2626', bg: '#dc262615' },
    { label: 'Approved Orders', value: approvedCount, icon: CheckCircle, color: '#059669', bg: '#05966915' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Finance</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Payments, invoices and reconciliation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: stat.bg }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-lg sm:text-2xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <FinanceDashboardClient
        orders={allOrders || []}
        payments={payments || []}
        priceUpdates={priceUpdates || []}
        repackJobs={repackJobs || []}
        currentUser={currentUser}
      />
    </div>
  )
}
