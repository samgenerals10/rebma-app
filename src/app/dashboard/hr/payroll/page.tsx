import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, ArrowLeft, Download, FileText, Printer } from 'lucide-react'

export default async function PayrollPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('role, department').eq('id', session.user.id).single()

  if (user?.department !== 'hr' && user?.role !== 'ceo') redirect('/dashboard')

  const employees = [
    { id: '1', name: 'John Kwame', position: 'Sales Manager', department: 'marketing', salary: 3500, status: 'active' },
    { id: '2', name: 'Mary Smith', position: 'Accountant', department: 'finance', salary: 2800, status: 'active' },
    { id: '3', name: 'Peter Jones', position: 'Driver', department: 'dispatch', salary: 1800, status: 'active' },
    { id: '4', name: 'Sarah Doe', position: 'HR Officer', department: 'hr', salary: 2500, status: 'active' },
    { id: '5', name: 'James Wilson', position: 'Warehouse Supervisor', department: 'operations', salary: 2200, status: 'active' },
  ]

  const currentMonth = 'April 2026'
  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0)

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payroll Run: {currentMonth}</h2>
              <p className="text-sm text-gray-500">5 employees • GH₵ {totalPayroll.toLocaleString()} total</p>
            </div>
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
              Run Payroll
            </button>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Employee</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Position</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Department</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Basic Salary</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Deductions</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Net Pay</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-400">ID: {emp.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{emp.position}</td>
                  <td className="px-6 py-4 capitalize text-gray-600">{emp.department}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">GH₵ {emp.salary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600">GH₵ {(emp.salary * 0.1).toFixed(0)}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">GH₵ {(emp.salary * 0.9).toFixed(0)}</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-emerald-600 hover:underline text-sm">
                      <FileText className="w-4 h-4" /> Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 font-medium text-gray-900">Total</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">GH₵ {totalPayroll.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-gray-600">GH₵ {(totalPayroll * 0.1).toFixed(0)}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">GH₵ {(totalPayroll * 0.9).toFixed(0)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>
    </div>
  )
}