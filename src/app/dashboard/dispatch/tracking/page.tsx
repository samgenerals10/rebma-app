'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, Search, SlidersHorizontal, Package, MessageSquare, Phone, MapPin, Truck, ChevronLeft, ChevronRight, X, Clock, Layers, Plus } from 'lucide-react'

const LiveMap = dynamic(() => import('@/components/dispatch/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
})

export const LOADS = [
  {
    id: '#41239110',
    status: 'In-transit',
    statusColor: 'text-blue-600 bg-blue-50 border-blue-200',
    progress: 40,
    speed: 75, // km/h (Normal)
    from: 'Accra Central, Ghana',
    to: 'Kumasi, Ashanti Region',
    customer: { name: 'David Martinez', role: 'Customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    events: [
      { status: 'Pick up', address: 'Accra Central, Ghana', time: '15.08.2024 at 10:00 PM', done: true },
      { status: 'In sorting centre', address: 'Achimota Hub', time: '18.08.2024 at 13:40 AM', done: true, active: true },
      { status: 'Delivered', address: 'Kumasi, Ashanti', time: '21.08.2024 at 20:00 AM', done: false }
    ],
    lat: 5.6037, lng: -0.1870, destLat: 6.6885, destLng: -1.6244
  },
  {
    id: '#3568129',
    status: 'Delivered',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    progress: 100,
    speed: 0, // Parked
    from: 'Tema Port, Ghana',
    to: 'Osu, Accra',
    customer: { name: 'Jessica Turner', role: 'Customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica' },
    events: [
      { status: 'Pick up', address: 'Tema Port', time: '10.08.2024 at 08:00 AM', done: true },
      { status: 'In sorting centre', address: 'Spintex Hub', time: '11.08.2024 at 14:00 PM', done: true },
      { status: 'Delivered', address: 'Osu, Accra', time: '12.08.2024 at 16:30 PM', done: true }
    ],
    lat: 5.5560, lng: -0.1969, destLat: 5.5560, destLng: -0.1969
  },
  {
    id: '#1248075',
    status: 'Upcoming',
    statusColor: 'text-amber-600 bg-amber-50 border-amber-200',
    progress: 0,
    speed: 0,
    from: 'Spintex, Accra',
    to: 'Takoradi, Western Region',
    customer: { name: 'Samuel Oppong', role: 'Customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel' },
    events: [
      { status: 'Pick up', address: 'Spintex, Accra', time: 'Pending', done: false },
      { status: 'In sorting centre', address: 'Pending', time: 'Pending', done: false },
      { status: 'Delivered', address: 'Takoradi', time: 'Pending', done: false }
    ],
    lat: 5.6260, lng: -0.0890, destLat: 4.8930, destLng: -1.7554
  }
]

export default function DispatchTrackingPage() {
  const [activeTab, setActiveTab] = useState('All Loads')
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(LOADS[0].id)
  const [search, setSearch] = useState('')
  const [mapStyle, setMapStyle] = useState<'map' | 'satellite'>('map')

  const filteredLoads = LOADS.filter(l => {
    if (activeTab === 'In-transit' && l.status !== 'In-transit') return false
    if (activeTab === 'Delivered' && l.status !== 'Delivered') return false
    if (search && !l.id.includes(search) && !l.customer.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const selectedLoad = LOADS.find(l => l.id === selectedLoadId)

  return (
    <div className="h-[calc(100vh-6rem)] w-full flex gap-4 overflow-hidden -mt-2">
      
      {/* LEFT PANEL: Tracking Loads List */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-hidden flex-shrink-0 z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard/dispatch" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Tracking loads</h1>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or customer..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All Loads', 'In-transit', 'Delivered'].map(tab => {
              const isActive = activeTab === tab
              let count = LOADS.length
              if (tab === 'In-transit') count = LOADS.filter(l => l.status === 'In-transit').length
              if (tab === 'Delivered') count = LOADS.filter(l => l.status === 'Delivered').length
              
              return (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                    isActive ? 'bg-amber-400 text-gray-900' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab} 
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
            <div className="flex-1"></div>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg border border-gray-200 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {filteredLoads.map(load => {
            const isSelected = selectedLoadId === load.id
            return (
              <div 
                key={load.id}
                onClick={() => setSelectedLoadId(load.id)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                  isSelected ? 'border-amber-400 shadow-md ring-1 ring-amber-400' : 'border-gray-100 shadow-sm hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-800" />
                    <span className="font-extrabold text-gray-900">{load.id}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${load.statusColor}`}>
                    {load.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1 bg-gray-100 rounded-full mb-4">
                  <div className="absolute top-0 left-0 h-full bg-gray-800 rounded-full transition-all duration-1000" style={{ width: `${load.progress}%` }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-800 left-0"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 text-gray-800 bg-white p-0.5 rounded-full z-10" style={{ left: `calc(${load.progress}% - 8px)` }}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-gray-300 bg-white right-0"></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mb-6 gap-4">
                  <span className="truncate flex-1">{load.from}</span>
                  <span className="truncate flex-1 text-right">{load.to}</span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-3">
                    <img src={load.customer.avatar} alt="avatar" className="w-9 h-9 rounded-full bg-gray-100" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{load.customer.name}</p>
                      <p className="text-xs text-gray-500">{load.customer.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Load Button */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add load
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Map & Floating Widgets */}
      <div className="flex-1 relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden z-0">
        
        {/* The Live Map Component */}
        <LiveMap selectedLoadId={selectedLoadId} mapStyle={mapStyle} />

        {/* Floating Controls Top Right */}
        <div className="absolute top-6 right-6 z-[400] flex gap-2">
          <div className="bg-white p-1 rounded-xl shadow-lg border border-gray-100 flex items-center">
            <button 
              onClick={() => setMapStyle('map')}
              className={`px-4 py-2 font-bold text-sm rounded-lg transition ${mapStyle === 'map' ? 'bg-amber-400 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Map
            </button>
            <button 
              onClick={() => setMapStyle('satellite')}
              className={`px-4 py-2 font-bold text-sm rounded-lg transition ${mapStyle === 'satellite' ? 'bg-amber-400 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Satellite
            </button>
          </div>
          <button className="bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 text-gray-700 font-bold text-sm hover:bg-gray-50 transition">
            <Layers className="w-4 h-4" /> Layers
          </button>
        </div>

        {/* Selected Load Details Widget */}
        {selectedLoad && (
          <div className="absolute top-6 left-6 z-[400] w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[80%]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900">No: {selectedLoad.id}</h3>
              <div className="flex gap-2 text-gray-400">
                <button className="hover:text-gray-600"><Package className="w-4 h-4" /></button>
                <button className="hover:text-gray-600"><Clock className="w-4 h-4" /></button>
                <button className="hover:text-gray-600" onClick={() => setSelectedLoadId(null)}><X className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="p-3 border-b border-gray-100 flex gap-1">
              <button className="flex-1 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg">Load info</button>
              <button className="flex-1 py-1.5 text-xs font-bold bg-amber-400 text-gray-900 rounded-lg shadow-sm">Tracking</button>
              <button className="flex-1 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg">Docs</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="relative pl-6 space-y-8">
                {/* Vertical Line */}
                <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-gray-200"></div>
                <div className="absolute top-2 bottom-1/2 left-[11px] w-0.5 bg-blue-500 transition-all"></div>

                {selectedLoad.events.map((ev, i) => (
                  <div key={i} className="relative">
                    {/* Dots */}
                    <div className={`absolute -left-[30px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                      ev.active ? 'bg-blue-500 ring-4 ring-blue-100' : ev.done ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    
                    <h4 className={`text-sm font-bold ${ev.done || ev.active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {ev.status}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{ev.address}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ev.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}