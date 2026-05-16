import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Plus, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react'
import ExportButton from '@/components/ExportButton'

export default async function CustomerDirectoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', user.id)
    .single()

  if (currentUser?.department !== 'marketing' && currentUser?.role !== 'ceo' && currentUser?.role !== 'manager' && currentUser?.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  const highRisk = customers?.filter(c => c.risk_status === 'high').length || 0
  const mediumRisk = customers?.filter(c => c.risk_status === 'medium').length || 0
  const normalRisk = customers?.filter(c => !c.risk_status || c.risk_status === 'normal' || c.risk_status === 'low').length || 0

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Customer Directory</h1>
            <p className="text-gray-500">{customers?.length || 0} customers total</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <ExportButton type="export" label="Export" data={customers || []} filename="rebma_customers" />
            <Link
              href="/dashboard/marketing/customers/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90 shadow-sm"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <Plus className="w-4 h-4" />
              New Customer
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-green-600">{normalRisk}</p>
            <p className="text-sm text-gray-500">Normal Risk</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-yellow-600">{mediumRisk}</p>
            <p className="text-sm text-gray-500">Medium Risk</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-red-600">{highRisk}</p>
            <p className="text-sm text-gray-500">High Risk</p>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Address</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Risk</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers?.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    {customer.contact_person && (
                      <p className="text-xs text-gray-400">Contact: {customer.contact_person}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {customer.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </p>
                      )}
                      {customer.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {customer.address ? (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {customer.address}
                      </p>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                      customer.risk_status === 'high' ? 'bg-red-100 text-red-700' :
                      customer.risk_status === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {customer.risk_status === 'high' && <AlertTriangle className="w-3 h-3" />}
                      {customer.risk_status || 'normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!customers || customers.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No customers found. Add your first customer.
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
