import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ArrowLeft, Navigation, AlertCircle, User, CheckCircle } from 'lucide-react'

export default async function GPSTrackingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const activeVehicles = [
    { id: '1', plate: 'GE-1234-20', driver: 'John Kwame', lat: 5.556, lng: -0.187, speed: 45, status: 'moving', lastUpdate: '10s ago' },
    { id: '2', plate: 'GE-5678-20', driver: 'Samuel Doe', lat: 5.572, lng: -0.201, speed: 0, status: 'stopped', lastUpdate: '2m ago' },
  ]

  return (
    <div className="">

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Map View</p>
                <p className="text-sm text-gray-400">Google Maps API integration</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Active Vehicles ({activeVehicles.length})</h3>
              {activeVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-3 bg-gray-50 rounded-lg mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{vehicle.plate}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'moving' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p className="flex items-center gap-1"><User className="w-3 h-3" /> {vehicle.driver}</p>
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {vehicle.lat}°N, {vehicle.lng}°W</p>
                    <p>Speed: {vehicle.speed} km/h</p>
                    <p>Last update: {vehicle.lastUpdate}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Journey Events</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" /> Trip started - 9:00 AM
                </p>
                <p className="flex items-center gap-2 text-blue-600">
                  <MapPin className="w-4 h-4" /> Stop 1 arrived - 9:45 AM
                </p>
                <p className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" /> Delivery confirmed - 9:52 AM
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Geofence Alert</p>
                <p className="text-xs text-yellow-600">Vehicle GE-5678-20 stopped outside delivery zone for 15min</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}