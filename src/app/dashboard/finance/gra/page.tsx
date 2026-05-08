import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowLeft, Download, Search, Calendar } from 'lucide-react'

export default async function GRAReportsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('role, department').eq('id', session.user.id).single()

  if (user?.department !== 'finance' && user?.role !== 'ceo') redirect('/dashboard')

  const reports = [
    { id: '1', name: 'Q1 2026 VAT Return', type: 'VAT', period: 'Q1 2026', due_date: '2026-04-30', status: 'filed', filed_date: '2026-04-28' },
    { id: '2', name: 'Q4 2025 Annual Returns', type: 'Annual', period: 'Q4 2025', due_date: '2026-01-31', status: 'filed', filed_date: '2026-01-25' },
    { id: '3', name: 'Q1 2026 Withholding Tax', type: 'WHT', period: 'Q1 2026', due_date: '2026-05-15', status: 'pending' },
    { id: '4', name: 'Payroll Tax Summary', type: 'Payroll', period: 'April 2026', due_date: '2026-05-07', status: 'pending' },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Filed</p>
            <p className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'filed').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Report Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Period</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Due Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Filed Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{report.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">{report.type}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{report.period}</td>
                  <td className="px-6 py-4 text-gray-600">{report.due_date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'filed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{report.filed_date || '—'}</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-emerald-600 hover:underline text-sm">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠ Important</h3>
          <p className="text-sm text-yellow-700">GRA requires 7-year data retention. All tax documents must be kept for minimum 7 years. Search functionality available for document retrieval.</p>
        </div>
      </main>
    </div>
  )
}