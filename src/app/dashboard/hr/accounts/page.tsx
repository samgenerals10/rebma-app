'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, UserCheck, Clock, CheckCircle, XCircle, Edit2, Save, X } from 'lucide-react'

interface Registration {
  id: string
  full_name: string
  email: string
  phone: string
  department_requested: string
  role_requested: string
  employment_type: string
  status: string
  created_at: string
}

interface User {
  id: string
  full_name: string
  email: string
  department: string
  role: string
  status: string
}

const DEPARTMENTS = ['hr', 'finance', 'marketing', 'operations', 'production', 'dispatch', 'management']
const ROLES = ['staff', 'dept_head', 'supervisor', 'manager', 'ceo']

export default function AccountsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ role: string; department: string }>({ role: '', department: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [regRes, userRes] = await Promise.all([
      fetch('/api/hr/registrations'),
      fetch('/api/hr/users'),
    ])
    const regData = await regRes.json()
    const userData = await userRes.json()
    setRegistrations(regData.registrations || [])
    setUsers(userData.users || [])
    setLoading(false)
  }

  async function handleApprove(registration_id: string) {
    setActionLoading(registration_id)
    const res = await fetch('/api/hr/approve-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'success', text: `Approved! Temp password: ${data.tempPassword}` })
      fetchData()
    } else {
      setMessage({ type: 'error', text: data.error })
    }
    setActionLoading(null)
  }

  async function handleReject(registration_id: string) {
    if (!rejectReason.trim()) return
    setActionLoading(registration_id)
    const res = await fetch('/api/hr/reject-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id, reason: rejectReason }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'success', text: 'Registration declined.' })
      setRejectingId(null)
      setRejectReason('')
      fetchData()
    } else {
      setMessage({ type: 'error', text: data.error })
    }
    setActionLoading(null)
  }

  async function handleUpdateUser(user_id: string) {
    setActionLoading(user_id)
    const res = await fetch('/api/hr/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, ...editValues }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'success', text: 'User updated successfully.' })
      setEditingId(null)
      fetchData()
    } else {
      setMessage({ type: 'error', text: data.error })
    }
    setActionLoading(null)
  }

  async function handleToggleStatus(user_id: string, currentStatus: string) {
    setActionLoading(user_id)
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active'
    const res = await fetch('/api/hr/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, status: newStatus }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'success', text: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}.` })
      fetchData()
    } else {
      setMessage({ type: 'error', text: data.error })
    }
    setActionLoading(null)
  }

  const pending = registrations.filter(r => r.status === 'pending')

  return (
    <div className="">

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-4 underline text-sm">Dismiss</button>
          </div>
        )}

        {/* Pending Registrations */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-bold text-gray-900">Pending Registrations</h2>
            {pending.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
            )}
          </div>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">No pending registrations</div>
          ) : (
            <div className="space-y-4">
              {pending.map(reg => (
                <div key={reg.id} className="bg-white rounded-xl border shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{reg.full_name}</p>
                      <p className="text-sm text-gray-500">{reg.email} · {reg.phone}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full capitalize">{reg.department_requested}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full capitalize">{reg.role_requested || 'staff'}</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full capitalize">{reg.employment_type || 'full_time'}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(reg.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(reg.id)}
                        disabled={actionLoading === reg.id}
                        className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading === reg.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setRejectingId(reg.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>

                  {rejectingId === reg.id && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800 mb-2">Reason for declining (required):</p>
                      <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        className="w-full border border-red-200 rounded-lg p-2 text-sm"
                        rows={3}
                        placeholder="Enter reason..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleReject(reg.id)}
                          disabled={!rejectReason.trim() || actionLoading === reg.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm Decline
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason('') }}
                          className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Accounts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">Staff Accounts</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.full_name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{u.email}</td>
                    <td className="px-6 py-4">
                      {editingId === u.id ? (
                        <select
                          value={editValues.department}
                          onChange={e => setEditValues(v => ({ ...v, department: e.target.value }))}
                          className="border rounded-lg px-2 py-1 text-sm"
                        >
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      ) : (
                        <span className="capitalize text-gray-900">{u.department}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === u.id ? (
                        <select
                          value={editValues.role}
                          onChange={e => setEditValues(v => ({ ...v, role: e.target.value }))}
                          className="border rounded-lg px-2 py-1 text-sm"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'ceo' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                          u.role === 'supervisor' ? 'bg-orange-100 text-orange-700' :
                          u.role === 'dept_head' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{u.role}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' :
                        u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{u.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {editingId === u.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateUser(u.id)}
                              disabled={actionLoading === u.id}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(u.id)
                                setEditValues({ role: u.role, department: u.department })
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u.id, u.status)}
                              disabled={actionLoading === u.id}
                              className={`p-1.5 rounded-lg ${u.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                              title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}
