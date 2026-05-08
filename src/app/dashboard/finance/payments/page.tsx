import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, ArrowLeft, Plus } from 'lucide-react'

export default async function PaymentsPage() {
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

  const { data: payments } = await supabase
    .from('payments')
    .select('*, orders(order_number, total_amount, customers(name))')
    .order('created_at', { ascending: false })

  const totalPaid = payments?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0
  const cashCount = payments?.filter(p => p.payment_method === 'cash').length || 0
  const transferCount = payments?.filter(p => p.payment_method === 'transfer').length || 0

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-green-600">GH₵ {totalPaid.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Collected</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-gray-900">{cashCount}</p>
            <p className="text-sm text-gray-500">Cash Payments</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-gray-900">{transferCount}</p>
            <p className="text-sm text-gray-500">Bank Transfers</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Order</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Method</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Reference</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments?.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {payment.orders?.order_number || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {payment.orders?.customers?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    GH₵ {parseFloat(payment.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      payment.payment_method === 'cash' ? 'bg-green-100 text-green-700' :
                      payment.payment_method === 'transfer' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {payment.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{payment.reference_number || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!payments || payments.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No payments recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
