'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { FileText, ArrowLeft, Search, X, Eye } from 'lucide-react'

const supabase = createClient()

interface AuditLogEntry {
  id: string
  table_name: string
  action: string
  record_id: string
  old_data: any
  new_data: any
  user_id: string
  created_at: string
}

export default function AuditLogPage() {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)

  useEffect(() => {
    fetchAuditLog()
  }, [])

  const fetchAuditLog = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setAuditLog(data as any)
    }
    setLoading(false)
  }

  const filteredLogs = auditLog.filter(log => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      log.table_name?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.user_id?.toLowerCase().includes(query)
    )
  })

  return (
    <>
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEntry(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Audit Log Details</h2>
                <p className="text-sm text-gray-500">{new Date(selectedEntry.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Table</p>
                  <p className="font-medium">{selectedEntry.table_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Action</p>
                  <span className={`px-2 py-1 inline-block rounded text-xs font-medium ${
                    selectedEntry.action === 'INSERT' ? 'bg-green-100 text-green-700' :
                    selectedEntry.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedEntry.action}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Record ID</p>
                  <p className="font-mono text-sm">{selectedEntry.record_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-mono text-sm">{selectedEntry.user_id || 'System'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Old Data (Before)</p>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {selectedEntry.old_data ? JSON.stringify(selectedEntry.old_data, null, 2) : '—'}
                  </pre>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">New Data (After)</p>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {selectedEntry.new_data ? JSON.stringify(selectedEntry.new_data, null, 2) : '—'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="">

        <main className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by table, action, or user..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <p className="text-gray-500">Loading audit log...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Timestamp</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Table</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Action</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Record ID</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                          {log.table_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.action === 'INSERT' ? 'bg-green-100 text-green-700' :
                          log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                        {log.record_id?.slice(0, 8) || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {log.user_id?.slice(0, 8) || 'System'}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedEntry(log)}
                          className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(filteredLogs.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {searchQuery ? 'No matching entries found' : 'No audit log entries found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {filteredLogs.length} entries • Log is immutable - cannot be edited or deleted
          </div>
        </main>
      </div>
    </>
  )
}