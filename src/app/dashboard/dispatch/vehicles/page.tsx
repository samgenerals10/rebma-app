import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Truck, ArrowLeft, User, MapPin, History } from 'lucide-react'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const mockVehicles = [
    { id: '1', plate: 'GE-1234-20', model: 'Toyota Hiace', status: 'active', driver: 'John Kwame', currentTrip: 'Trip-001' },
    { id: '2', plate: 'GE-5678-20', model: 'Isuzu Truck', status: 'active', driver: 'Samuel Doe', currentTrip: 'Trip-002' },
    { id: '3', plate: 'GE-9012-20', model: 'Ford Transit', status: 'idle', driver: '—', currentTrip: null },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-gray-900">{mockVehicles.length}</p>
            <p className="text-sm text-gray-500">Total Vehicles</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-green-600">{mockVehicles.filter(v => v.status === 'active').length}</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-gray-600">{mockVehicles.filter(v => v.status === 'idle').length}</p>
            <p className="text-sm text-gray-500">Idle</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-3xl font-bold text-blue-600">2,450 km</p>
            <p className="text-sm text-gray-500">Total Mileage Today</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Vehicle</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Plate Number</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Driver</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Current Trip</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Mileage</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{vehicle.model}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{vehicle.plate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{vehicle.driver}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{vehicle.currentTrip || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">1,250 km</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-emerald-600 hover:underline text-sm">View History</button>
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