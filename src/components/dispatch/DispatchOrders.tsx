'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { Truck, CheckCircle, ChevronDown, ChevronUp, MapPin, Phone, Package, Navigation } from 'lucide-react'
import OrderStepper from '@/components/OrderStepper'

export default function DispatchOrders({ orders: initialOrders, currentUser }: { orders: any[], currentUser: any }) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [activeOrder, setActiveOrder] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ready' | 'dispatched' | 'delivered'>('ready')
  const [driverName, setDriverName] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(*), order_items(*, products(name, sku, unit_of_measure))')
      .in('status', ['ready_for_dispatch', 'dispatched', 'delivered'])
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const dispatchOrder = async (order: any) => {
    if (!driverName.trim()) { alert('Please enter driver name'); return }
    if (!vehicleNumber.trim()) { alert('Please enter vehicle number'); return }
    setProcessing(order.id)
    await supabase.from('orders').update({
      status: 'dispatched',
      notes: (order.notes || '') + ' | Dispatched by: ' + driverName + ', Vehicle: ' + vehicleNumber + (estimatedTime ? ', ETA: ' + estimatedTime : '')
    }).eq('id', order.id)

    await supabase.from('notifications').insert([
      {
        recipient_department: 'marketing',
        sender_id: currentUser.id,
        title: 'Order Dispatched — ' + order.order_number,
        body: 'Order dispatched to ' + order.customers?.name + '. Driver: ' + driverName + ', Vehicle: ' + vehicleNumber,
        type: 'order_dispatched',
        reference_id: order.id,
        is_read: false
      },
      {
        recipient_department: 'finance',
        sender_id: currentUser.id,
        title: 'Order Dispatched — ' + order.order_number,
        body: order.customers?.name + ' — GH₵' + parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' dispatched.',
        type: 'order_dispatched',
        reference_id: order.id,
        is_read: false
      }
    ])

    setDriverName(''); setVehicleNumber(''); setEstimatedTime('')
    setActiveOrder(null); setProcessing(null)
    setActiveTab('dispatched')
    await loadOrders()
  }

  const markDelivered = async (order: any) => {
    setProcessing(order.id)
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id)
    await supabase.from('notifications').insert([
      {
        recipient_department: 'marketing',
        sender_id: currentUser.id,
        title: 'Order Delivered — ' + order.order_number,
        body: 'Order successfully delivered to ' + order.customers?.name,
        type: 'order_delivered',
        reference_id: order.id,
        is_read: false
      },
      {
        recipient_department: 'finance',
        sender_id: currentUser.id,
        title: 'Order Delivered — ' + order.order_number,
        body: order.customers?.name + ' — GH₵' + parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' delivered.',
        type: 'order_delivered',
        reference_id: order.id,
        is_read: false
      }
    ])
    setProcessing(null); setActiveOrder(null)
    setActiveTab('delivered')
    await loadOrders()
  }

  const readyOrders = orders.filter(o => o.status === 'ready_for_dispatch')
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const displayedOrders = activeTab === 'ready' ? readyOrders : activeTab === 'dispatched' ? dispatchedOrders : deliveredOrders

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Delivery Jobs</h3>
        <div className="flex gap-2">
          {[
            { key: 'ready', label: 'Ready', count: readyOrders.length, color: '#1a73e8' },
            { key: 'dispatched', label: 'In Transit', count: dispatchedOrders.length, color: '#f59e0b' },
            { key: 'delivered', label: 'Delivered', count: deliveredOrders.length, color: '#059669' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              style={{ background: activeTab === tab.key ? tab.color : 'var(--card-bg)', color: activeTab === tab.key ? 'white' : 'var(--text-secondary)', border: '1px solid ' + (activeTab === tab.key ? tab.color : 'var(--card-border)') }}>
              {tab.label}
              <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--table-header-bg)' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {displayedOrders.length === 0 && (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <Truck className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {activeTab === 'ready' ? 'No orders ready for dispatch' : activeTab === 'dispatched' ? 'No orders in transit' : 'No deliveries yet'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {displayedOrders.map(order => {
          const isActive = activeOrder === order.id
          const isReady = order.status === 'ready_for_dispatch'
          const isDispatched = order.status === 'dispatched'
          const isDelivered = order.status === 'delivered'
          const borderColor = isReady ? '#1a73e8' : isDispatched ? '#f59e0b' : '#059669'

          return (
            <div key={order.id} className="rounded-xl overflow-hidden"
              style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)', borderLeft: '4px solid ' + borderColor }}>

              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: borderColor + '15' }}>
                    <Truck className="w-4 h-4" style={{ color: borderColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{ background: borderColor + '15', color: borderColor }}>
                        {isReady ? 'Ready' : isDispatched ? 'In Transit' : 'Delivered'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{order.customers?.name}</p>
                      {order.customers?.phone && (
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                          <Phone className="w-3 h-3" /> {order.customers.phone}
                        </span>
                      )}
                      {order.customers?.address && (
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                          <MapPin className="w-3 h-3" /> {order.customers.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  {!isDelivered && (
                    <button onClick={() => setActiveOrder(isActive ? null : order.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: borderColor + '15', color: borderColor, border: '1px solid ' + borderColor + '30' }}>
                      {isActive ? <><ChevronUp className="w-3.5 h-3.5" /> Close</> : <><ChevronDown className="w-3.5 h-3.5" /> Details</>}
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="px-5 pb-3 flex flex-wrap gap-2">
                {order.order_items?.map((item: any, i: number) => (
                  <span key={item.id || item.product_id || i} className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                    {item.products?.name} × {item.quantity}
                  </span>
                ))}
              </div>

              {/* Stepper */}
              <div className="px-5 pb-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                <OrderStepper status={order.status} />
              </div>

              {/* Details panel */}
              {isActive && (
                <div className="px-5 py-4 space-y-4" style={{ borderTop: '1px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery info */}
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>DELIVERY INFO</p>
                      <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                        {[
                          { label: 'Customer', value: order.customers?.name },
                          { label: 'Phone', value: order.customers?.phone || 'N/A' },
                          { label: 'Address', value: order.customers?.address || 'N/A' },
                          { label: 'Payment', value: order.payment_mode?.replace(/_/g, ' ') || 'N/A' },
                          { label: 'Total', value: 'GH₵' + parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
                        ].map(row => (
                          <div key={row.label} className="flex justify-between">
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Driver details — only for ready orders */}
                    {isReady && (
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>DRIVER & VEHICLE</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Driver Name *', value: driverName, set: setDriverName, placeholder: 'e.g. Kwame Asante' },
                            { label: 'Vehicle Number *', value: vehicleNumber, set: setVehicleNumber, placeholder: 'e.g. GR-1234-22' },
                            { label: 'Estimated Delivery Time', value: estimatedTime, set: setEstimatedTime, placeholder: 'e.g. 2:30 PM', type: 'time' },
                          ].map(field => (
                            <div key={field.label}>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                              <input type={field.type || 'text'} value={field.value} onChange={e => field.set(e.target.value)} placeholder={field.placeholder}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dispatch info for in-transit orders */}
                    {isDispatched && order.notes && (
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>DISPATCH INFO</p>
                        <div className="p-3 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{order.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                    {isReady && (
                      <button onClick={() => dispatchOrder(order)} disabled={processing === order.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                        style={{ background: '#f59e0b', color: 'white' }}>
                        {processing === order.id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Truck className="w-4 h-4" />}
                        Dispatch Now
                      </button>
                    )}
                    {isDispatched && (
                      <button onClick={() => markDelivered(order)} disabled={processing === order.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                        style={{ background: '#059669', color: 'white' }}>
                        {processing === order.id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
