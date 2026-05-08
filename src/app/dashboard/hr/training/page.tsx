import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, AlertTriangle, ArrowLeft, Plus, User } from 'lucide-react'

export default async function TrainingDisciplinaryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('role, department').eq('id', session.user.id).single()

  if (user?.department !== 'hr' && user?.role !== 'ceo') redirect('/dashboard')

  const trainingRecords = [
    { id: '1', employee: 'John Kwame', type: 'Safety Training', date: '2026-04-15', duration: '4 hours', status: 'completed' },
    { id: '2', employee: 'Mary Smith', type: 'Financial Reporting', date: '2026-04-20', duration: '2 hours', status: 'completed' },
    { id: '3', employee: 'Peter Jones', type: 'Customer Service', date: '2026-05-01', duration: '3 hours', status: 'scheduled' },
  ]

  const disciplinaryRecords = [
    { id: '1', employee: 'James Wilson', incident: 'Late arrival (3rd time)', action: 'Verbal Warning', date: '2026-04-10', recorded_by: 'HR Head' },
    { id: '2', employee: 'Samuel Doe', incident: 'Minor stock discrepancy', action: 'Written Warning', date: '2026-03-28', recorded_by: 'CEO' },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Training Log
            </h2>
            <div className="space-y-3">
              {trainingRecords.map((record) => (
                <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{record.employee}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{record.type}</p>
                    <p className="text-gray-400">{record.date} • {record.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Disciplinary Records
              {user?.role === 'ceo' && <span className="text-xs text-gray-400 ml-2">(CEO only view)</span>}
            </h2>
            <div className="space-y-3">
              {disciplinaryRecords.map((record) => (
                <div key={record.id} className="p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{record.employee}</span>
                    <span className="text-xs text-gray-500">{record.date}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{record.incident}</p>
                    <p className="font-medium text-red-700">{record.action}</p>
                    <p className="text-gray-400 text-xs">Recorded by: {record.recorded_by}</p>
                  </div>
                </div>
              ))}
              {disciplinaryRecords.length === 0 && (
                <p className="text-center text-gray-500 py-4">No disciplinary records</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Access Control</h3>
          <p className="text-sm text-blue-700">Training log: All HR can view/edit. Disciplinary records: HR Head + CEO only.</p>
        </div>
      </main>
    </div>
  )
}