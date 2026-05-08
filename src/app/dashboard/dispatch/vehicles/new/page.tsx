'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Truck, Calendar, User, FileText } from 'lucide-react'

const supabase = createClient()

export default function AddVehiclePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    plate_number: '',
    model: '',
    make: '',
    year: '',
    capacity: '',
    fuel_type: '',
    insurance_expiry: '',
    license_expiry: '',
    fitness_expiry: '',
    road_worth_expiry: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('vehicles').insert({
      ...formData,
      capacity: parseInt(formData.capacity),
      year: parseInt(formData.year),
      status: 'available',
      added_by: user.id,
    })

    if (!error) {
      router.push('/dashboard/dispatch/vehicles')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Add New Vehicle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plate Number *</label>
              <input 
                type="text" 
                required
                placeholder="GE-1234-20"
                value={formData.plate_number}
                onChange={(e) => setFormData({ ...formData, plate_number: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Make *</label>
              <input 
                type="text" 
                required
                placeholder="Toyota"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model *</label>
              <input 
                type="text" 
                required
                placeholder="Hiace"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year *</label>
              <input 
                type="number" 
                required
                placeholder="2020"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity (kg) *</label>
              <input 
                type="number" 
                required
                placeholder="1000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fuel Type *</label>
              <select 
                required
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">Select Fuel Type</option>
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
                <option value="electric">Electric</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Documents & Expiry Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Insurance Expiry *</label>
              <input 
                type="date" 
                required
                value={formData.insurance_expiry}
                onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Expiry *</label>
              <input 
                type="date" 
                required
                value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fitness Certificate *</label>
              <input 
                type="date" 
                required
                value={formData.fitness_expiry}
                onChange={(e) => setFormData({ ...formData, fitness_expiry: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Road Worthiness *</label>
              <input 
                type="date" 
                required
                value={formData.road_worth_expiry}
                onChange={(e) => setFormData({ ...formData, road_worth_expiry: e.target.value })}
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
            {loading ? 'Adding...' : 'Add Vehicle'}
          </button>
          <Link
            href="/dashboard/dispatch/vehicles"
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}