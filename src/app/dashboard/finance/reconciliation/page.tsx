import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, ArrowLeft, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

export default async function ReconciliationPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', session.user.id)
    .single()

  if (user?.department !== 'finance' && user?.role !== 'ceo' && user?.role !== 'manager') {
    redirect('/dashboard')
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .gte('created_at', today)

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', today)

  const totalPayments = payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0
  const totalOrders = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0
  const difference = totalOrders - totalPayments

  const isBalanced = Math.abs(difference) < 0.01

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className={`rounded-xl border p-6 mb-6 ${isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Today's Status ({today})</h2>
              <p className="text-sm text-gray-600 mt-1">
                {isBalanced ? 'All reconciled' : 'MISMATCH DETECTED - Requires attention'}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isBalanced ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span className="font-medium">{isBalanced ? 'Balanced' : 'Unbalanced'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-2">Total Sales (Orders)</p>
            <p className="text-3xl font-bold text-gray-900">GH₵ {totalOrders.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">{orders?.length || 0} orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-2">Total Payments Received</p>
            <p className="text-3xl font-bold text-gray-900">GH₵ {totalPayments.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">{payments?.length || 0} payments</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-2">Difference</p>
            <p className={`text-3xl font-bold ${difference >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
              GH₵ {Math.abs(difference).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">{difference >= 0 ? 'Unpaid orders' : 'Overpayment'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Unpaid Orders</h3>
            {orders?.filter(o => o.status !== 'paid' && o.status !== 'delivered').length ? (
              <div className="space-y-3">
                {orders?.filter(o => o.status !== 'paid' && o.status !== 'delivered').map((order) => (
                  <div key={order.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{order.order_number}</span>
                    <span className="font-medium">GH₵ {parseFloat(order.total_amount || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No unpaid orders</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Payments</h3>
            {payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">{payment.reference_number || payment.id.slice(0, 8)}</span>
                    <span className="font-medium">GH₵ {parseFloat(payment.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No payments today</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}