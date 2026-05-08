import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Truck, ArrowLeft, MapPin, Clock, CheckCircle } from 'lucide-react'

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'dispatched')
    .order('updated_at', { ascending: false })

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Trips</h2>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Trip #{order.order_number}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">In Transit</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">View Route</button>
                      <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Stop</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> 3 stops</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Started 2h ago</span>
                    <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 1 delivered</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No active trips</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Assignment</h2>
          <p className="text-gray-500">Orders ready to be assigned to trips</p>
        </div>
      </main>
    </div>
  )
}