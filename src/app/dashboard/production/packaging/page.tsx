import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Box, ArrowLeft, AlertTriangle } from 'lucide-react'

export default async function PackagingInventoryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const packagingItems = [
    { id: '1', name: 'Sachets 500ml', type: 'sachet', unit: 'pcs', quantity: 15000, reorder_level: 5000 },
    { id: '2', name: 'Bags 1kg', type: 'bag', unit: 'pcs', quantity: 8000, reorder_level: 3000 },
    { id: '3', name: 'Cartons Small', type: 'carton', unit: 'pcs', quantity: 500, reorder_level: 200 },
    { id: '4', name: 'Labels Roll', type: 'label', unit: 'rolls', quantity: 250, reorder_level: 100 },
    { id: '5', name: 'Nylon Wrapping', type: 'nylon', unit: 'rolls', quantity: 45, reorder_level: 50 },
    { id: '6', name: 'Sealing Tape', type: 'tape', unit: 'rolls', quantity: 120, reorder_level: 30 },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        {packagingItems.some(i => i.quantity <= i.reorder_level) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">
              {packagingItems.filter(i => i.quantity <= i.reorder_level).length} item(s) below reorder level - needs restocking
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Item</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Quantity</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Reorder Level</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {packagingItems.map((item) => {
                const isLow = item.quantity <= item.reorder_level
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Box className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">{item.type}</td>
                    <td className={`px-6 py-4 text-right font-medium ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{item.reorder_level.toLocaleString()} {item.unit}</td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-emerald-600 hover:underline text-sm">Restock</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}