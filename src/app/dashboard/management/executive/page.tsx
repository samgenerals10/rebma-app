import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Users, Package, DollarSign, Truck, ShoppingCart, Factory, FileText } from 'lucide-react'

export default async function ExecutiveDashboard() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single()

  if (user?.role !== 'ceo') redirect('/dashboard')

  const { data: orders } = await supabase.from('orders').select('*')
  const { data: payments } = await supabase.from('payments').select('*')
  const { data: users } = await supabase.from('users').select('*')
  const { data: employees } = await supabase.from('employees').select('*')
  const { data: products } = await supabase.from('products').select('*')
  const { data: stock } = await supabase.from('stock').select('*')

  const totalRevenue = orders?.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0) || 0
  const totalPayments = payments?.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0) || 0

  const departments = [
    { name: 'Management', key: 'management', icon: TrendingUp, revenue: totalRevenue * 0.1, orders: orders?.length || 0, color: 'bg-purple-50' },
    { name: 'Finance', key: 'finance', icon: DollarSign, revenue: totalRevenue * 0.15, orders: 0, color: 'bg-green-50' },
    { name: 'Marketing', key: 'marketing', icon: ShoppingCart, revenue: totalRevenue * 0.35, orders: orders?.length || 0, color: 'bg-orange-50' },
    { name: 'Operations', key: 'operations', icon: Package, revenue: 0, orders: 0, products: products?.length || 0, color: 'bg-blue-50' },
    { name: 'Production', key: 'production', icon: Factory, revenue: 0, orders: 0, color: 'bg-yellow-50' },
    { name: 'Dispatch', key: 'dispatch', icon: Truck, revenue: 0, orders: orders?.filter(o => o.status === 'dispatched').length || 0, color: 'bg-red-50' },
    { name: 'HR', key: 'hr', icon: Users, revenue: 0, employees: employees?.length || 0, color: 'bg-indigo-50' },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">GH₵ {totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">↑ 12% vs last month</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{orders?.length || 0}</p>
            <p className="text-sm text-green-600 mt-1">↑ 8% vs last month</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-1">Active Staff</p>
            <p className="text-3xl font-bold text-gray-900">{employees?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">of {users?.length || 0} registered</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-1">Products</p>
            <p className="text-3xl font-bold text-gray-900">{products?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{stock?.length || 0} in stock</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Department Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <div key={dept.key} className={`${dept.color} rounded-xl p-6 border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <dept.icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900">{dept.name}</h3>
              </div>
              <div className="space-y-2 text-sm">
                {dept.revenue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-medium">GH₵ {dept.revenue.toLocaleString()}</span>
                  </div>
                )}
                {dept.orders !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orders</span>
                    <span className="font-medium">{dept.orders}</span>
                  </div>
                )}
                {dept.products !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products</span>
                    <span className="font-medium">{dept.products}</span>
                  </div>
                )}
                {dept.employees !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staff</span>
                    <span className="font-medium">{dept.employees}</span>
                  </div>
                )}
              </div>
              <Link href={`/dashboard/${dept.key}`} className="mt-4 block text-center text-sm text-emerald-600 hover:underline">
                View Details →
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Order #1234 delivered to Accra</span>
                <span className="text-gray-400 ml-auto">2h ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Payment received - GH₵ 5,000</span>
                <span className="text-gray-400 ml-auto">4h ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">New staff registration</span>
                <span className="text-gray-400 ml-auto">6h ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                <span className="text-red-700">3 items low stock</span>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <span className="text-yellow-700">Import licence expires in 30 days</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <span className="text-blue-700">Pending approvals: 5</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}