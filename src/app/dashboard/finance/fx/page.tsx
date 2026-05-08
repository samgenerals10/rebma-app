import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, ArrowLeft, Plus } from 'lucide-react'

export default async function FXLedgerPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('role, department').eq('id', session.user.id).single()

  if (user?.role !== 'ceo' && user?.department !== 'finance') {
    redirect('/dashboard')
  }

  const fxTransactions = [
    { id: '1', date: '2026-05-01', supplier: 'Polish Dairy Co.', currency: 'EUR', amount: 15000, ghs_equiv: 180000, rate: 12.0, status: 'paid' },
    { id: '2', date: '2026-04-28', supplier: 'Turkish Flour Mills', currency: 'USD', amount: 8500, ghs_equiv: 102000, rate: 12.0, status: 'paid' },
    { id: '3', date: '2026-04-25', supplier: 'Dutch Margarine Inc.', currency: 'EUR', amount: 5200, ghs_equiv: 62400, rate: 12.0, status: 'pending' },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total EUR Paid</p>
            <p className="text-2xl font-bold text-gray-900">€ {fxTransactions.filter(f => f.currency === 'EUR').reduce((s, f) => s + f.amount, 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total USD Paid</p>
            <p className="text-2xl font-bold text-gray-900">$ {fxTransactions.filter(f => f.currency === 'USD').reduce((s, f) => s + f.amount, 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total GH₵ Paid</p>
            <p className="text-2xl font-bold text-gray-900">GH₵ {fxTransactions.reduce((s, f) => s + f.ghs_equiv, 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Current FX Rate</p>
            <p className="text-2xl font-bold text-gray-900">GH₵ 12.00 / USD</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Supplier</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Currency</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">GH₵ Equivalent</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">FX Rate</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {fxTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">{tx.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{tx.supplier}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.currency === 'EUR' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {tx.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {tx.currency === 'EUR' ? '€' : '$'}{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">GH₵ {tx.ghs_equiv.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{tx.rate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status}
                    </span>
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