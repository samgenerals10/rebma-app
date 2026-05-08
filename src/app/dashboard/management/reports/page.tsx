import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, ArrowLeft, Users, Package, DollarSign, ShoppingCart, Truck } from 'lucide-react'

export default async function ExecutiveReportsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single()
  const role = user?.role || 'staff'

  if (role !== 'ceo' && role !== 'manager') {
    redirect('/dashboard')
  }

  const { data: orders } = await supabase.from('orders').select('*')
  const { data: payments } = await supabase.from('payments').select('*')
  const { data: users } = await supabase.from('users').select('*')
  const { data: products } = await supabase.from('products').select('*')

  const departmentStats = {
    management: users?.filter(u => u.department === 'management').length || 0,
    finance: users?.filter(u => u.department === 'finance').length || 0,
    marketing: users?.filter(u => u.department === 'marketing').length || 0,
    operations: users?.filter(u => u.department === 'operations').length || 0,
    production: users?.filter(u => u.department === 'production').length || 0,
    dispatch: users?.filter(u => u.department === 'dispatch').length || 0,
    hr: users?.filter(u => u.department === 'hr').length || 0,
  }

  const totalRevenue = orders?.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0) || 0
  const totalOrders = orders?.length || 0
  const totalPayments = payments?.length || 0
  const totalProducts = products?.length || 0

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">GH₵ {totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            <p className="text-sm text-gray-500">Products</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Staff</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Staff Count</h2>
            <div className="space-y-3">
              {Object.entries(departmentStats).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="capital font-medium text-gray-900">{dept}</span>
                  <span className="font-bold text-emerald-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {orders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-green-600">GH₵ {parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <p className="text-center text-gray-500 py-4">No orders found</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}