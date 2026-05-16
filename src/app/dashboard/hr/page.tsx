import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, UserCheck, Clock, Calendar, DollarSign, ClipboardList, Plus, UserPlus, Navigation } from 'lucide-react'

export default async function HRDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users').select('*').eq('id', user.id).single()

  if (!currentUser) redirect('/login')

  if (currentUser.department !== 'hr' && currentUser.role !== 'ceo' && currentUser.role !== 'manager') {
    redirect('/dashboard')
  }

  const { data: pendingRegistrations } = await supabase
    .from('registrations').select('*').eq('status', 'pending').order('created_at', { ascending: false })

  const { data: allUsers } = await supabase.from('users').select('*')

  const activeCount = allUsers?.filter(u => u.status === 'active').length || 0
  const pendingCount = pendingRegistrations?.length || 0

  const stats = [
    { label: 'Pending Registrations', value: pendingCount, icon: UserPlus, color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'Active Staff', value: activeCount, icon: UserCheck, color: '#059669', bg: '#05966915' },
    { label: 'Total Users', value: allUsers?.length || 0, icon: Users, color: '#1a73e8', bg: '#1a73e815' },
  ]

  const quickActions = [
    { href: '/dashboard/hr/accounts', icon: UserCheck, color: '#1a73e8', bg: '#1a73e815', label: 'User Accounts', description: 'Manage accounts and registrations' },
    { href: '/dashboard/hr/employees', icon: ClipboardList, color: '#059669', bg: '#05966915', label: 'Employee Roster', description: 'View all staff records' },
    { href: '/dashboard/hr/attendance', icon: Clock, color: '#8b5cf6', bg: '#8b5cf615', label: 'Attendance', description: 'Track staff attendance' },
    { href: '/dashboard/hr/leave', icon: Calendar, color: '#f59e0b', bg: '#f59e0b15', label: 'Leave Management', description: 'Approve and track leave requests' },
    { href: '/dashboard/hr/payroll', icon: DollarSign, color: '#059669', bg: '#05966915', label: 'Payroll', description: 'Manage salaries and payslips' },
    { href: '/dashboard/dispatch/tracking', icon: Navigation, color: '#059669', bg: '#05966915', label: 'Live GPS Tracking', description: 'Monitor delivery fleet' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Human Resources</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Staff management, attendance and payroll</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

      <div className="grid grid-cols-1 gap-6">
        {/* Pending Registrations */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pending Registrations</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
              {pendingCount} pending
            </span>
          </div>
          <div>
            {pendingRegistrations && pendingRegistrations.length > 0 ? (
              pendingRegistrations.map((reg, i) => (
                <div
                  key={reg.id}
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
                >
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{reg.full_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {reg.email} · {reg.department_requested}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/hr/accounts"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:opacity-90"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                No pending registrations
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
