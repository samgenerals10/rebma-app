'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, History, Calendar, User, MapPin, Clock, Search, Filter } from 'lucide-react'

interface VehicleHistory {
  id: string
  vehicle_plate: string
  trip_id: string
  driver: string
  route: string
  date: string
  distance: number
  fuel_used: number
  status: string
}

const mockHistory: VehicleHistory[] = [
  { id: '1', vehicle_plate: 'GE-1234-20', trip_id: 'TRIP-001', driver: 'John Kwame', route: 'Accra → Kumasi', date: '2024-01-15', distance: 270, fuel_used: 25, status: 'Completed' },
  { id: '2', vehicle_plate: 'GE-1234-20', trip_id: 'TRIP-002', driver: 'John Kwame', route: 'Accra → Takoradi', date: '2024-01-14', distance: 380, fuel_used: 35, status: 'Completed' },
  { id: '3', vehicle_plate: 'GE-5678-20', trip_id: 'TRIP-003', driver: 'Samuel Doe', route: 'Accra → Tamale', date: '2024-01-14', distance: 570, fuel_used: 50, status: 'Completed' },
  { id: '4', vehicle_plate: 'GE-1234-20', trip_id: 'TRIP-004', driver: 'John Kwame', route: 'Accra → Cape Coast', date: '2024-01-13', distance: 150, fuel_used: 15, status: 'Completed' },
]

export default function VehicleHistoryPage() {
  const [search, setSearch] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  const uniqueVehicles = [...new Set(mockHistory.map(v => v.vehicle_plate))]

  const filteredHistory = mockHistory.filter(h => {
    const matchesSearch = !search || 
      h.vehicle_plate.toLowerCase().includes(search.toLowerCase()) ||
      h.driver.toLowerCase().includes(search.toLowerCase()) ||
      h.trip_id.toLowerCase().includes(search.toLowerCase())
    const matchesVehicle = !selectedVehicle || h.vehicle_plate === selectedVehicle
    return matchesSearch && matchesVehicle
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vehicle History</h1>
          <p className="text-gray-500">View trip history for all vehicles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueVehicles.length}</p>
              <p className="text-sm text-gray-500">Total Vehicles</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockHistory.length}</p>
              <p className="text-sm text-gray-500">Total Trips</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockHistory.reduce((a, b) => a + b.distance, 0)} km</p>
              <p className="text-sm text-gray-500">Total Distance</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockHistory.reduce((a, b) => a + b.fuel_used, 0)} L</p>
              <p className="text-sm text-gray-500">Fuel Used</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle, driver, or trip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedVehicle(null)}
              className={`px-4 py-2 rounded-lg ${!selectedVehicle ? 'bg-emerald-500 text-white' : 'border dark:border-gray-600'}`}
            >
              All
            </button>
            {uniqueVehicles.map(v => (
              <button
                key={v}
                onClick={() => setSelectedVehicle(v)}
                className={`px-4 py-2 rounded-lg ${selectedVehicle === v ? 'bg-emerald-500 text-white' : 'border dark:border-gray-600'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Trip ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Driver</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Route</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Distance</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Fuel</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {filteredHistory.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 font-mono text-sm">{h.vehicle_plate}</td>
                <td className="px-4 py-3 font-mono text-sm">{h.trip_id}</td>
                <td className="px-4 py-3">{h.driver}</td>
                <td className="px-4 py-3">{h.route}</td>
                <td className="px-4 py-3 text-sm">{h.date}</td>
                <td className="px-4 py-3">{h.distance} km</td>
                <td className="px-4 py-3">{h.fuel_used} L</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}