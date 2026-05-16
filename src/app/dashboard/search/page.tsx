import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search as SearchIcon, User, Package, ShoppingCart, DollarSign, FileText, Truck, ArrowRight } from 'lucide-react'

export default async function GlobalSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || ''
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('role, department')
    .eq('id', session.user.id)
    .single()

  if (!user) redirect('/login')

  const isGlobalAccess = ['ceo', 'manager', 'admin'].includes(user.role)
  const dept = user.department

  // Results containers
  let customers: any[] = []
  let orders: any[] = []
  let products: any[] = []
  let employees: any[] = []

  if (query.trim()) {
    const searchTerm = `%${query}%`

    // Marketing & Finance & Global can see Customers and Orders
    if (isGlobalAccess || ['marketing', 'finance', 'operations', 'dispatch'].includes(dept)) {
      if (isGlobalAccess || dept === 'marketing' || dept === 'finance') {
        const { data: c } = await supabase
          .from('customers')
          .select('*')
          .or(`name.ilike.${searchTerm},phone.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .limit(10)
        if (c) customers = c
      }

      const { data: o } = await supabase
        .from('orders')
        .select('*, customers(name)')
        .ilike('order_number', searchTerm)
        .limit(10)
      if (o) orders = o
    }

    // Operations, Production, Global can see Products
    if (isGlobalAccess || ['operations', 'production', 'marketing'].includes(dept)) {
      const { data: p } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.${searchTerm},sku.ilike.${searchTerm}`)
        .limit(10)
      if (p) products = p
    }

    // HR, Management can see Employees
    if (isGlobalAccess || dept === 'hr') {
      const { data: e } = await supabase
        .from('users')
        .select('id, first_name, last_name, department, role')
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`)
        .limit(10)
      if (e) employees = e
    }
  }

  const hasResults = customers.length > 0 || orders.length > 0 || products.length > 0 || employees.length > 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Search Results for "{query}"</h1>
        <p className="text-gray-500">Searching within {isGlobalAccess ? 'all departments' : `the ${dept} department`}</p>
      </div>

      {!query.trim() ? (
        <div className="text-center py-16 text-gray-500">
          <SearchIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Please enter a search term above.</p>
        </div>
      ) : !hasResults ? (
        <div className="text-center py-16 text-gray-500">
          <SearchIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No results found for "{query}" in your permitted departments.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Customers */}
          {customers.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2">
                <User className="w-5 h-5 text-blue-500" /> Customers ({customers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map(c => (
                  <Link key={c.id} href={`/dashboard/marketing/customers/${c.id}`} className="bg-white rounded-xl shadow-sm border p-4 hover:border-blue-500 transition block">
                    <div className="font-bold text-gray-900">{c.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{c.phone || 'No phone'}</div>
                    <div className="text-sm text-gray-500">{c.address || 'No address'}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Orders */}
          {orders.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2">
                <ShoppingCart className="w-5 h-5 text-emerald-500" /> Orders ({orders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(o => (
                  <Link key={o.id} href={`/dashboard/marketing/orders`} className="bg-white rounded-xl shadow-sm border p-4 hover:border-emerald-500 transition block">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-gray-900">{o.order_number}</div>
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-full">{o.status}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Customer: {o.customers?.name || 'Unknown'}</div>
                    <div className="text-sm font-semibold text-emerald-600 mt-1">GH₵{parseFloat(o.total_amount).toLocaleString()}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Products */}
          {products.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2">
                <Package className="w-5 h-5 text-purple-500" /> Products ({products.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <Link key={p.id} href={`/dashboard/operations`} className="bg-white rounded-xl shadow-sm border p-4 hover:border-purple-500 transition block">
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-500 mt-1">SKU: {p.sku}</div>
                    <div className="text-sm text-gray-500 mt-1 flex justify-between">
                      <span>Price: GH₵{p.unit_price}</span>
                      <span>Weight: {p.weight_kg}kg</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Employees */}
          {employees.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2">
                <User className="w-5 h-5 text-orange-500" /> Employees ({employees.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map(e => (
                  <Link key={e.id} href={`/dashboard/hr/employees`} className="bg-white rounded-xl shadow-sm border p-4 hover:border-orange-500 transition block">
                    <div className="font-bold text-gray-900">{e.first_name} {e.last_name}</div>
                    <div className="text-sm text-gray-500 mt-1 capitalize">Role: {e.role}</div>
                    <div className="text-sm text-gray-500 capitalize">Department: {e.department}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
