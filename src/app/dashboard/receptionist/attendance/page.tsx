'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock, Search, UserCheck, Users, AlertTriangle } from 'lucide-react'

export default function ReceptionistAttendance() {
  const [employees, setEmployees] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [empRes, attRes] = await Promise.all([
      supabase.from('employees').select('*, users:user_id(*)').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('attendance').select('*, employees(*, users:user_id(*))').eq('date', today).order('clock_in', { ascending: false })
    ])

    if (empRes.data) setEmployees(empRes.data)
    if (attRes.data) setAttendance(attRes.data)
    setLoading(false)
  }

  const handleClockAction = async (employeeId: string, action: 'clock_in' | 'clock_out') => {
    setProcessing(employeeId)
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    if (action === 'clock_in') {
      await supabase.from('attendance').insert({
        employee_id: employeeId,
        date: today,
        clock_in: now
      })
    } else {
      await supabase.from('attendance')
        .update({ clock_out: now })
        .eq('employee_id', employeeId)
        .eq('date', today)
        .is('clock_out', null)
    }

    await loadData()
    setProcessing(null)
  }

  const filteredEmployees = employees.filter(emp => 
    emp.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: 'Total Staff', value: employees.length, icon: Users, color: '#1a73e8', bg: '#1a73e815' },
    { label: 'Present Today', value: attendance.length, icon: UserCheck, color: '#059669', bg: '#05966915' },
    { label: 'Not Arrived', value: employees.length - attendance.length, icon: Clock, color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'Shift Ended', value: attendance.filter(a => a.clock_out).length, icon: CheckCircle, color: '#6366f1', bg: '#6366f115' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Staff Attendance</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Log staff entry and exit times at the front desk.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: stat.bg }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock In Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Clock-In Registry</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-gray-50">
            {filteredEmployees.map(emp => {
              const record = attendance.find(a => a.employee_id === emp.id)
              const isPresent = !!record
              const isCheckedOut = !!record?.clock_out

              return (
                <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${isPresent ? (isCheckedOut ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700') : 'bg-gray-50 text-gray-500'}`}>
                      {emp.users?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{emp.users?.full_name}</p>
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{emp.department} • {emp.employee_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCheckedOut ? (
                      <div className="text-right mr-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Finished</p>
                        <p className="text-xs text-gray-500">{new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ) : isPresent ? (
                      <>
                        <div className="text-right mr-4">
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">On Duty</p>
                          <p className="text-xs text-gray-500">In: {new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <button 
                          onClick={() => handleClockAction(emp.id, 'clock_out')}
                          disabled={processing === emp.id}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <Clock className="w-3.5 h-3.5" /> Clock Out
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleClockAction(emp.id, 'clock_in')}
                        disabled={processing === emp.id}
                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Clock In
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {filteredEmployees.length === 0 && (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                <Search className="w-8 h-8 opacity-20" />
                <p className="text-sm">No staff matching your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Activity Feed</h2>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[600px]">
            {attendance.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No activity logged for today</p>
              </div>
            ) : (
              attendance.map(record => (
                <div key={record.id} className="relative pl-6 border-l-2 border-gray-100 pb-4 last:pb-0">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${record.clock_out ? 'bg-red-400' : 'bg-green-500'}`} />
                  <p className="text-xs font-bold text-gray-900">{record.employees?.users?.full_name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {record.clock_out ? (
                      <span className="text-red-600 font-medium italic">Clocked Out at {new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ) : (
                      <span className="text-green-600 font-medium">Clocked In at {new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">{record.employees?.department}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
