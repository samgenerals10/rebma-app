import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Package } from 'lucide-react'

export default async function DiscrepancyPage() {
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

  if (user?.department !== 'operations' && user?.role !== 'ceo' && user?.role !== 'manager' && user?.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const { data: stock } = await supabase
    .from('stock')
    .select('*, products(name, sku, reorder_level)')

  const discrepancies = stock?.filter(s => {
    const reorderLevel = s.products?.reorder_level || 0
    return s.quantity <= reorderLevel
  }) || []

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        {discrepancies.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">{discrepancies.length} item(s) below reorder level - alert sent to Manager & Supervisor</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">SKU</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">System Qty</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Reorder Level</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Variance</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stock?.map((item) => {
                const reorderLevel = item.products?.reorder_level || 0
                const variance = item.quantity - reorderLevel
                const isLow = item.quantity <= reorderLevel
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{item.products?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.products?.sku || '—'}</td>
                    <td className={`px-6 py-4 text-right font-medium ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{reorderLevel}</td>
                    <td className={`px-6 py-4 text-right font-medium ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {variance > 0 ? '+' : ''}{variance}
                    </td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Low Stock</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">OK</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {(!stock || stock.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No stock records found
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