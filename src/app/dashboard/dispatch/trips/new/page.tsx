'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, ArrowLeft, Truck, Calendar, MapPin, User, 
  Package, Clock, CheckCircle, XCircle, FileText 
} from 'lucide-react'

const supabase = createClient()

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    trip_date: '',
    departure_time: '',
    driver_id: '',
    vehicle_id: '',
    route_from: '',
    route_to: '',
    cargo_description: '',
    cargo_weight: '',
    client_name: '',
    client_contact: '',
    notes: '',
  })

  const [drivers, setDrivers] = useState<{ id: any; name: string }[]>([])
  const [vehicles, setVehicles] = useState<{ id: any; plate: string; model: string }[]>([])

  useEffect(() => {
    fetchDrivers()
    fetchVehicles()
  }, [])

  const fetchDrivers = async () => {
    const { data } = await supabase.from('users').select('id, full_name').eq('role', 'driver')
    if (data) setDrivers(data.map(d => ({ id: d.id, name: d.full_name })))
  }

  const fetchVehicles = async () => {
    const { data } = await supabase.from('vehicles').select('id, plate_number, model').eq('status', 'available')
    if (data) setVehicles(data.map(v => ({ id: v.id, plate: v.plate_number, model: v.model })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('trips').insert({
      ...formData,
      created_by: user.id,
      status: 'pending',
    })

    if (!error) {
      router.push('/dashboard/dispatch/trips')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Create New Trip</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Trip Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Trip Date</label>
              <input 
                type="date" 
                required
                value={formData.trip_date}
                onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Departure Time</label>
              <input 
                type="time" 
                required
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Driver</label>
              <select 
                required
                value={formData.driver_id}
                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">Select Driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle</label>
              <select 
                required
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Route Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Location</label>
              <input 
                type="text" 
                required
                placeholder="Origin depot/warehouse"
                value={formData.route_from}
                onChange={(e) => setFormData({ ...formData, route_from: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Location</label>
              <input 
                type="text" 
                required
                placeholder="Destination"
                value={formData.route_to}
                onChange={(e) => setFormData({ ...formData, route_to: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Cargo & Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Cargo Description</label>
              <textarea 
                rows={3}
                placeholder="Describe the cargo being transported"
                value={formData.cargo_description}
                onChange={(e) => setFormData({ ...formData, cargo_description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cargo Weight (kg)</label>
              <input 
                type="number" 
                placeholder="Weight in kg"
                value={formData.cargo_weight}
                onChange={(e) => setFormData({ ...formData, cargo_weight: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Name</label>
              <input 
                type="text" 
                placeholder="Client/Company name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Contact</label>
              <input 
                type="text" 
                placeholder="Phone or email"
                value={formData.client_contact}
                onChange={(e) => setFormData({ ...formData, client_contact: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea 
                rows={2}
                placeholder="Any special instructions or notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
          <Link
            href="/dashboard/dispatch/trips"
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}