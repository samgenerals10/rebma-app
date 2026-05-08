'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, MapPin, CheckCircle, Navigation, WifiOff, Clock } from 'lucide-react'

interface DeliveryStop {
  id: string
  order_number: string
  customer: string
  address: string
  lat: number
  lng: number
  status: 'pending' | 'arrived' | 'delivered' | 'failed'
}

export default function DriverMobilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [currentStop, setCurrentStop] = useState<number>(0)
  const [stops, setStops] = useState<DeliveryStop[]>([])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))

    loadTodayStops()
  }, [])

  const loadTodayStops = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'dispatched')
      .limit(5)

    if (orders) {
      setStops(orders.map(o => ({
        id: o.id,
        order_number: o.order_number || 'ORD-001',
        customer: o.customer_id?.slice(0, 8) || 'Customer',
        address: 'Accra, Ghana',
        lat: 5.556,
        lng: -0.187,
        status: 'pending' as const
      })))
    }
  }

  const handleArrived = (index: number) => {
    const updated = [...stops]
    updated[index].status = 'arrived'
    setStops(updated)
    setCurrentStop(index)
  }

  const handleDelivered = async (index: number) => {
    const stop = stops[index]
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', stop.id)

    if (!error) {
      const updated = [...stops]
      updated[index].status = 'delivered'
      setStops(updated)
    }
  }

  const handleFailed = async (index: number) => {
    const stop = stops[index]
    
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', stop.id)

    const updated = [...stops]
    updated[index].status = 'failed'
    setStops(updated)
  }

  const progress = stops.filter(s => s.status === 'delivered').length / stops.length * 100

  return (
    <div className="">

      <main className="p-4 space-y-4">
        {stops.map((stop, index) => (
          <div key={stop.id} className={`bg-white rounded-xl shadow-sm border p-4 ${stop.status === 'delivered' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Stop {index + 1}</span>
                  {stop.status === 'delivered' && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <h3 className="font-semibold text-gray-900">{stop.order_number}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                stop.status === 'delivered' ? 'bg-green-100 text-green-700' :
                stop.status === 'arrived' ? 'bg-blue-100 text-blue-700' :
                stop.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {stop.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p className="flex items-center gap-2">
                <Package className="w-4 h-4" /> {stop.customer}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {stop.address}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {index === 0 ? 'Next stop' : index < currentStop ? 'Completed' : 'Upcoming'}
              </p>
            </div>

            {stop.status === 'pending' && (
              <div className="space-y-2">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg"
                >
                  <Navigation className="w-4 h-4" /> Navigate
                </a>
                <button 
                  onClick={() => handleArrived(index)}
                  className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg"
                >
                  Mark Arrived
                </button>
              </div>
            )}

            {stop.status === 'arrived' && (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleDelivered(index)}
                  className="py-2 bg-green-600 text-white rounded-lg"
                >
                  Confirm Delivery
                </button>
                <button 
                  onClick={() => handleFailed(index)}
                  className="py-2 bg-red-600 text-white rounded-lg"
                >
                  Failed
                </button>
              </div>
            )}

            {stop.status === 'delivered' && (
              <div className="text-center py-2 text-green-600 font-medium">
                ✓ Delivered at {new Date().toLocaleTimeString()}
              </div>
            )}

            {stop.status === 'failed' && (
              <div className="text-center py-2 text-red-600 font-medium">
                ⚠ Delivery failed
              </div>
            )}
          </div>
        ))}

        {stops.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No deliveries assigned today</p>
          </div>
        )}
      </main>

      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
          <WifiOff className="w-5 h-5 text-yellow-700" />
          <span className="text-sm text-yellow-700">Offline mode - changes will sync when online</span>
        </div>
      )}
    </div>
  )
}