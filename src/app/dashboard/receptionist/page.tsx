'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Phone, Package, CalendarCheck, Search, Plus, Clock, CheckCircle, ArrowRight, BookUser, UserCheck, MessageSquare } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

// Initial Mock data
const INITIAL_VISITORS = [
  { id: 1, name: 'Kwame Mensah', phone: '024 123 4567', host: 'William Brandt (CEO)', purpose: 'Meeting', timeIn: '08:30 AM', timeOut: null, status: 'Active' },
  { id: 2, name: 'Joyce Osei', phone: '055 987 6543', host: 'Finance Dept', purpose: 'Auditor', timeIn: '09:15 AM', timeOut: '11:45 AM', status: 'Completed' },
  { id: 3, name: 'Delivery Driver', phone: '020 444 5555', host: 'Operations', purpose: 'Drop off samples', timeIn: '10:00 AM', timeOut: '10:15 AM', status: 'Completed' },
]

const INITIAL_DELIVERIES = [
  { id: 1, type: 'Document', from: 'GRA', for: 'Finance', time: '09:30 AM', status: 'Forwarded' },
  { id: 2, type: 'Package', from: 'DHL', for: 'William Brandt', time: '11:00 AM', status: 'At Reception' },
]

export default function ReceptionistDashboard() {
  const [activeTab, setActiveTab] = useState<'visitors' | 'attendance' | 'deliveries'>('visitors')
  const [visitors, setVisitors] = useState(INITIAL_VISITORS)
  const [liveAttendance, setLiveAttendance] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const supabase = createClient()

  // Modal States
  const [showVisitorModal, setShowVisitorModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)

  const [newVisitor, setNewVisitor] = useState({ name: '', phone: '', host: '', purpose: '' })
  const [newDelivery, setNewDelivery] = useState({ type: 'Package', from: '', for: '' })
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadLiveData()
  }, [])

  const loadLiveData = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [empRes, attRes] = await Promise.all([
      supabase.from('employees').select('*').eq('is_active', true).order('full_name'),
      supabase.from('attendance').select('*, employees(*)').eq('date', today).order('clock_in', { ascending: false })
    ])

    if (empRes.data) setEmployees(empRes.data)
    if (attRes.data) setLiveAttendance(attRes.data)
    setLoading(false)
  }

  const handleClockAction = async (action: 'clock_in' | 'clock_out') => {
    if (!selectedEmployee) return
    setProcessing(true)

    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    if (action === 'clock_in') {
      await supabase.from('attendance').insert({
        employee_id: selectedEmployee,
        date: today,
        clock_in: now,
        status: 'present'
      })
    } else {
      await supabase.from('attendance')
        .update({ clock_out: now })
        .eq('employee_id', selectedEmployee)
        .eq('date', today)
        .is('clock_out', null)
    }

    await loadLiveData()
    setSelectedEmployee('')
    setSearchQuery('')
    setProcessing(false)
  }

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault()
    setVisitors([{
      id: Date.now(),
      ...newVisitor,
      timeIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeOut: null,
      status: 'Active'
    }, ...visitors])
    setShowVisitorModal(false)
    setNewVisitor({ name: '', phone: '', host: '', purpose: '' })
  }

  const handleLogDelivery = (e: React.FormEvent) => {
    e.preventDefault()
    setDeliveries([{
      id: Date.now(),
      ...newDelivery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'At Reception'
    }, ...deliveries])
    setShowCallModal(false)
    setNewDelivery({ type: 'Package', from: '', for: '' })
  }

  const handleCheckOut = (id: number) => {
    setVisitors(visitors.map(v => v.id === id ? { ...v, status: 'Completed', timeOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : v))
  }

  const handleForward = (id: number) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'Forwarded' } : d))
  }

  const printReport = () => window.print()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reception Desk</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Visitor management, staff attendance, and logs.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Visitors', value: visitors.filter(v => v.status === 'Active').length, icon: BookUser, color: '#1a73e8', bg: '#1a73e815' },
          { label: 'Staff Present', value: `${liveAttendance.filter(a => !a.clock_out).length} / ${employees.length || 0}`, icon: UserCheck, color: '#059669', bg: '#05966915' },
          { label: 'Packages at Desk', value: deliveries.filter(d => d.status === 'At Reception').length, icon: Package, color: '#f59e0b', bg: '#f59e0b15' },
          { label: 'Messages Routed', value: deliveries.filter(d => d.status === 'Forwarded').length, icon: MessageSquare, color: '#8b5cf6', bg: '#8b5cf615' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: stat.bg }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)' }}>
        <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--card-border)' }}>
          {[
            { id: 'visitors', label: 'Visitor Log', icon: Users },
            { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
            { id: 'deliveries', label: 'Deliveries & Calls', icon: Package },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                borderColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                backgroundColor: activeTab === tab.id ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent'
              }}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>
          <button onClick={printReport} className="text-sm font-medium text-gray-500 hover:text-gray-700 print:hidden">Export / Print</button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'visitors' && (
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Visitor Name</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Contact</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Host / Purpose</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Time In / Out</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm" style={{ borderColor: 'var(--card-border)' }}>
                {visitors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{v.name}</td>
                    <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>{v.phone}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{v.host}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{v.purpose}</p>
                    </td>
                    <td className="px-5 py-4" style={{ color: 'var(--text-secondary)' }}>
                      {v.timeIn} <br />
                      {v.timeOut ? <span className="text-xs opacity-70">Out: {v.timeOut}</span> : <span className="text-xs text-blue-500 font-medium">Inside</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{
                        background: v.status === 'Active' ? '#1a73e815' : '#f8f9fa',
                        color: v.status === 'Active' ? '#1a73e8' : '#5f6368',
                        border: v.status === 'Completed' ? '1px solid var(--card-border)' : 'none'
                      }}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right print:hidden">
                      {v.status === 'Active' && (
                        <button onClick={() => handleCheckOut(v.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">Check Out</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'attendance' && (
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Staff Search / Select</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search employee..."
                        value={selectedEmployee ? (employees.find(e => e.id === selectedEmployee)?.full_name || '') : searchQuery}
                        onChange={(e) => { setSelectedEmployee(''); setSearchQuery(e.target.value) }}
                        className="w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm focus:ring-2 outline-none"
                      />
                      {searchQuery && !selectedEmployee && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                          {employees.filter(e => e.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(emp => (
                            <button key={emp.id} onClick={() => { setSelectedEmployee(emp.id); setSearchQuery('') }} className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-0 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold">{emp.full_name}</p>
                                <p className="text-[10px] text-gray-500 uppercase">{emp.department}</p>
                              </div>
                              <Plus className="w-3 h-3 text-gray-300" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleClockAction('clock_in')} disabled={!selectedEmployee || processing} className="h-10 px-6 bg-green-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 transition">Clock In</button>
                    <button onClick={() => handleClockAction('clock_out')} disabled={!selectedEmployee || processing} className="h-10 px-6 bg-red-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 transition">Clock Out</button>
                  </div>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)' }}>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Staff Member</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Dept</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>In</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Out</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm" style={{ borderColor: 'var(--card-border)' }}>
                  {liveAttendance.map((a) => (
                    <tr key={a.id}>
                      <td className="px-5 py-4 font-medium">{a.employees?.full_name}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">{a.employees?.department}</td>
                      <td className="px-5 py-4">{new Date(a.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-5 py-4">{a.clock_out ? new Date(a.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.clock_out ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700 animate-pulse'}`}>
                          {a.clock_out ? 'Left' : 'Present'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {liveAttendance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-400 italic">No attendance recorded today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'deliveries' && (
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: 'var(--table-header-bg)' }}>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Type</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>From</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>For</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Time</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm" style={{ borderColor: 'var(--card-border)' }}>
                {deliveries.map((d) => (
                  <tr key={d.id}>
                    <td className="px-5 py-4 font-medium">{d.type}</td>
                    <td className="px-5 py-4">{d.from}</td>
                    <td className="px-5 py-4">{d.for}</td>
                    <td className="px-5 py-4 text-gray-500">{d.time}</td>
                    <td className="px-5 py-4 text-right">
                      <span onClick={() => handleForward(d.id)} className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${d.status === 'Forwarded' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Register New Visitor</h2>
            <form onSubmit={handleAddVisitor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={newVisitor.name} onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input required type="text" value={newVisitor.phone} onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Who are they visiting? (Host)</label>
                <input required type="text" value={newVisitor.host} onChange={e => setNewVisitor({ ...newVisitor, host: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. HR Dept or William Brandt" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                <input required type="text" value={newVisitor.purpose} onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowVisitorModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Check In</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Log Call / Delivery</h2>
            <form onSubmit={handleLogDelivery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={newDelivery.type} onChange={e => setNewDelivery({ ...newDelivery, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none">
                  <option>Package</option>
                  <option>Document</option>
                  <option>Phone Message</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From (Sender / Caller)</label>
                <input required type="text" value={newDelivery.from} onChange={e => setNewDelivery({ ...newDelivery, from: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">For (Recipient / Dept)</label>
                <input required type="text" value={newDelivery.for} onChange={e => setNewDelivery({ ...newDelivery, for: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowCallModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
