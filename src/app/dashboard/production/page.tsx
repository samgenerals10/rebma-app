import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clipboard, CheckCircle, AlertTriangle, Box, Plus } from 'lucide-react'

export default async function ProductionDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('role, department').eq('id', user.id).single()

  if (!currentUser) redirect('/login')

  if (currentUser.department !== 'production' && currentUser.role !== 'ceo' && currentUser.role !== 'manager') {
    redirect('/dashboard')
  }

  const stats = [
    { label: 'Active Batches', value: 3, icon: Clipboard, color: '#1a73e8', bg: '#1a73e815' },
    { label: 'Quality Passed', value: 12, icon: CheckCircle, color: '#059669', bg: '#05966915' },
    { label: 'Quality Failed', value: 1, icon: AlertTriangle, color: '#dc2626', bg: '#dc262615' },
    { label: 'Packaging Items', value: 8, icon: Box, color: '#8b5cf6', bg: '#8b5cf615' },
  ]

  const batches = [
    { id: 'BATCH-001', status: 'In Progress', statusColor: '#059669', statusBg: '#05966915', description: 'Milk Powder 1kg → 500g packs', input: '100kg', output: '198 packs' },
    { id: 'BATCH-002', status: 'Pending QC', statusColor: '#f59e0b', statusBg: '#f59e0b15', description: 'Flour 10kg → 1kg bags', input: '200kg', output: '195 bags' },
  ]

  const quickActions = [
    { href: '/dashboard/production/repack/new', icon: Clipboard, color: '#1a73e8', bg: '#1a73e815', label: 'Create Repack Job', description: 'Start a new repack batch' },
    { href: '/dashboard/production/quality', icon: CheckCircle, color: '#059669', bg: '#05966915', label: 'Quality Check Log', description: 'Review and approve batches' },
    { href: '/dashboard/production/packaging', icon: Box, color: '#8b5cf6', bg: '#8b5cf615', label: 'Packaging Inventory', description: 'Track packaging materials' },
  ]

  return (
    <div>
      {/* Header with actions at top */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Production</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Repack jobs, quality checks and packaging</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/production/repack/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            New Repack Job
          </Link>
          <Link
            href="/dashboard/production/quality"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
          >
            <CheckCircle className="w-4 h-4" />
            Quality Check
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        {/* Repack Job Cards */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Repack Job Cards</h2>
            <Link href="/dashboard/production/repack" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              View All
            </Link>
          </div>
          <div>
            {batches.map((batch, i) => (
              <div
                key={batch.id}
                className="px-5 py-4"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{batch.id}</span>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: batch.statusBg, color: batch.statusColor }}
                  >
                    {batch.status}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{batch.description}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Input: {batch.input}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Output: {batch.output}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          </div>
          <div>
            {quickActions.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 px-5 py-4 transition hover:opacity-80"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
              >
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
