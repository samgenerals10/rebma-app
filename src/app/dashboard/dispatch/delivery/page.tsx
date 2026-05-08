import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowLeft, MapPin, User, CheckCircle } from 'lucide-react'

export default async function DeliveryProofPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'delivered')
    .order('updated_at', { ascending: false })
    .limit(20)

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Order</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Delivered At</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Signature</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">GPS Location</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Driver</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4 text-gray-600">{order.customer_id?.slice(0, 8) || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {order.updated_at ? new Date(order.updated_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Signed
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> 5.556° N, 0.187° W
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Driver 1</td>
                  <td className="px-6 py-4">
                    <button className="text-emerald-600 hover:underline text-sm">View POD</button>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No delivered orders with proof
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