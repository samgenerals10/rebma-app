import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, ArrowLeft, CheckCircle, XCircle, Calendar } from 'lucide-react'

export default async function AttendancePage() {
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

  const today = new Date().toISOString().split('T')[0]

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*, employees(*)')
    .eq('date', today)
    .order('clock_in', { ascending: false })

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('is_active', true)

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-gray-900">{employees?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Staff</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-green-600">{attendance?.length || 0}</p>
            <p className="text-sm text-gray-500">Checked In Today</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-blue-600">{(employees?.length || 0) - (attendance?.length || 0)}</p>
            <p className="text-sm text-gray-500">Not Checked In</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-gray-600">{attendance?.filter(a => a.clock_out).length || 0}</p>
            <p className="text-sm text-gray-500">Checked Out</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clock In / Out</h2>
          <form method="POST" action="/api/hr/attendance" className="flex gap-4">
            <select name="employee_id" required className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
              <option value="">Select employee...</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.employee_number || emp.id.slice(0, 8)} - {emp.department}</option>
              ))}
            </select>
            <button type="submit" name="action" value="clock_in" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Clock In
            </button>
            <button type="submit" name="action" value="clock_out" className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Clock Out
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Today's Attendance</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Employee</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Department</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Clock In</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Clock Out</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendance?.map((record) => {
                const clockIn = record.clock_in ? new Date(record.clock_in) : null
                const clockOut = record.clock_out ? new Date(record.clock_out) : null
                const duration = clockIn && clockOut ? Math.round((clockOut.getTime() - clockIn.getTime()) / 60000) : null
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{record.employees?.employee_number || record.employee_id?.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">{record.employees?.department || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{clockIn ? clockIn.toLocaleTimeString() : '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{clockOut ? clockOut.toLocaleTimeString() : <span className="text-yellow-600">Still in</span>}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '—'}
                    </td>
                  </tr>
                )
              })}
              {(!attendance || attendance.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No attendance records for today
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