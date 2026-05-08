import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'

export default async function LeavePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', session.user.id)
    .single()

  if (user?.department !== 'hr' && user?.role !== 'ceo' && user?.role !== 'manager' && user?.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: leaveRequests } = await supabase
    .from('approval_queue')
    .select('*')
    .eq('type', 'leave')
    .order('created_at', { ascending: false })

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('is_active', true)

  const pendingCount = leaveRequests?.filter(l => l.status === 'pending').length || 0

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-gray-900">{leaveRequests?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Requests</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-green-600">{leaveRequests?.filter(l => l.status === 'approved').length || 0}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-red-600">{leaveRequests?.filter(l => l.status === 'rejected').length || 0}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Leave Request</h2>
          <form method="POST" action="/api/hr/leave" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select name="employee_id" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="">Select employee...</option>
                {employees?.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.employee_number || emp.id.slice(0, 8)} - {emp.department}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select name="leave_type" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value="">Select type...</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input type="date" name="start_date" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input type="date" name="end_date" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <textarea name="notes" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Reason for leave..."></textarea>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                Submit Request
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Leave Requests</h2>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              {pendingCount} pending
            </span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Employee</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Period</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Days</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaveRequests?.map((request) => {
                const startDate = request.notes?.split('|')[0] || '-'
                const endDate = request.notes?.split('|')[1] || '-'
                const days = request.amount || 0
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{request.requester_id?.slice(0, 8) || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">{request.notes?.split('|')[2] || 'Leave'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{startDate} - {endDate}</td>
                    <td className="px-6 py-4 text-gray-600">{days}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-700' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <form method="POST" action="/api/hr/leave/approve">
                            <input type="hidden" name="id" value={request.id} />
                            <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Approve</button>
                          </form>
                          <form method="POST" action="/api/hr/leave/reject">
                            <input type="hidden" name="id" value={request.id} />
                            <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Reject</button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {(!leaveRequests || leaveRequests.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No leave requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}