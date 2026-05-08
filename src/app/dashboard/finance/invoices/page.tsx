import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowLeft, Plus, Eye } from 'lucide-react'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', user.id)
    .single()

  if (currentUser?.department !== 'finance' && currentUser?.role !== 'ceo' && currentUser?.role !== 'manager') {
    redirect('/dashboard')
  }

  const { data: invoices } = await supabase
    .from('Invoice')
    .select('*')
    .order('createdAt', { ascending: false })

  const totalAmount = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.subtotal) || 0), 0) || 0
  const paidCount = invoices?.filter(inv => inv.status === 'paid').length || 0
  const pendingCount = invoices?.filter(inv => inv.status === 'pending').length || 0
  const overdueCount = invoices?.filter(inv => inv.status === 'overdue').length || 0

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-gray-900">GH₵ {totalAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Invoiced</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-green-600">{paidCount}</p>
            <p className="text-sm text-gray-500">Paid</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Invoice #</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Due Date</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Subtotal</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">VAT</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices?.map(invoice => {
                const isOverdue = invoice.status !== 'paid' && invoice.dueDate && new Date(invoice.dueDate) < new Date()
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{invoice.date ? new Date(invoice.date).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">GH₵ {parseFloat(invoice.subtotal || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-gray-500">GH₵ {parseFloat(invoice.vatAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">GH₵ {parseFloat(invoice.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        isOverdue ? 'bg-red-100 text-red-700' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {isOverdue && invoice.status !== 'paid' ? 'overdue' : invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/finance/invoices/${invoice.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-block" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {(!invoices || invoices.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No invoices yet. Create your first invoice.
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
