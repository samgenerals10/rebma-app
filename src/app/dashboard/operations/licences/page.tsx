import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, FileText, Clock } from 'lucide-react'

export default async function ImportLicencesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('role, department').eq('id', session.user.id).single()

  if (user?.role !== 'ceo' && user?.department !== 'operations' && user?.role !== 'manager') {
    redirect('/dashboard')
  }

  const licences = [
    { id: '1', name: 'Import Licence - Milk Powder', supplier: 'Polish Dairy Co.', expiry_date: '2026-05-15', days_left: 14, status: 'critical' },
    { id: '2', name: 'Import Licence - Flour', supplier: 'Turkish Flour Mills', expiry_date: '2026-06-30', days_left: 60, status: 'normal' },
    { id: '3', name: 'Import Licence - Margarine', supplier: 'Dutch Margarine Inc.', expiry_date: '2026-05-20', days_left: 19, status: 'warning' },
    { id: '4', name: 'Import Licence - Sugar', supplier: 'Brazil Sugar Co.', expiry_date: '2026-12-31', days_left: 244, status: 'ok' },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        {licences.filter(l => l.days_left <= 30).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">
              {licences.filter(l => l.days_left <= 30).length} licence(s) expiring within 30 days - urgent action required
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Licence</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Supplier</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Expiry Date</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Days Left</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {licences.map((licence) => (
                <tr key={licence.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{licence.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{licence.supplier}</td>
                  <td className="px-6 py-4 text-gray-600">{licence.expiry_date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-medium ${
                      licence.days_left <= 14 ? 'text-red-600' :
                      licence.days_left <= 30 ? 'text-orange-600' :
                      'text-gray-900'
                    }`}>
                      {licence.days_left} days
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      licence.status === 'critical' ? 'bg-red-100 text-red-700' :
                      licence.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      licence.status === 'normal' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {licence.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-emerald-600 hover:underline text-sm">Renew</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}