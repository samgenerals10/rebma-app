import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EmployeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', user.id)
    .single()

  if (currentUser?.department !== 'hr' && currentUser?.role !== 'ceo' && currentUser?.role !== 'manager') {
    redirect('/dashboard')
  }

  const { data: employees } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const departments = ['hr', 'finance', 'marketing', 'operations', 'production', 'dispatch', 'management']

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">

        {/* Stats by department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {departments.map(dept => {
            const count = employees?.filter(e => e.department === dept).length || 0
            if (count === 0) return null
            return (
              <div key={dept} className="bg-white rounded-xl border p-4">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{dept}</p>
              </div>
            )
          })}
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 600 }}>
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Department</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees && employees.length > 0 ? employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{emp.full_name}</p>
                    <p className="text-xs text-gray-400">ID: {emp.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{emp.email}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{emp.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-gray-900">{emp.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      emp.role === 'ceo' ? 'bg-purple-100 text-purple-700' :
                      emp.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      emp.role === 'supervisor' ? 'bg-orange-100 text-orange-700' :
                      emp.role === 'dept_head' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{emp.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No active employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  )
}
