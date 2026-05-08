import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ArrowLeft, Star, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: suppliers } = await supabase.from('suppliers').select('*').order('name')

  const mockSuppliers = [
    { id: '1', name: 'Polish Dairy Co.', country: 'Poland', reliability: 95, status: 'approved', contact: 'john@polishdairy.pl', products: 'Milk Powder' },
    { id: '2', name: 'Turkish Flour Mills', country: 'Turkey', reliability: 88, status: 'approved', contact: 'info@turkishflour.com', products: 'Flour' },
    { id: '3', name: 'Global Margarine Inc.', country: 'Netherlands', reliability: 72, status: 'pending', contact: 'sales@globalmargarine.nl', products: 'Margarine' },
    { id: '4', name: 'Suspended Supplier', country: 'China', reliability: 30, status: 'blacklisted', contact: 'blocked', products: 'Various' },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-gray-900">{mockSuppliers.length}</p>
            <p className="text-sm text-gray-500">Total Suppliers</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-green-600">{mockSuppliers.filter(s => s.status === 'approved').length}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-yellow-600">{mockSuppliers.filter(s => s.status === 'pending').length}</p>
            <p className="text-sm text-gray-500">Pending Review</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-red-600">{mockSuppliers.filter(s => s.status === 'blacklisted').length}</p>
            <p className="text-sm text-gray-500">Blacklisted</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Supplier</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Country</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Products</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Reliability</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4 text-gray-600">{supplier.country}</td>
                  <td className="px-6 py-4 text-gray-600">{supplier.products}</td>
                  <td className="px-6 py-4 text-gray-500">{supplier.contact}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${supplier.reliability >= 80 ? 'bg-green-500' : supplier.reliability >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${supplier.reliability}%` }} />
                      </div>
                      <span className="text-sm text-gray-600">{supplier.reliability}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.status === 'approved' ? 'bg-green-100 text-green-700' :
                      supplier.status === 'blacklisted' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                    {supplier.status === 'approved' && (
                      <button className="ml-2 text-red-600 hover:underline text-sm">Blacklist</button>
                    )}
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