'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { Package, CheckCircle, ChevronDown, ChevronUp, Printer, MapPin, Phone } from 'lucide-react'
import OrderStepper from '@/components/OrderStepper'

export default function OrdersToPrep({ orders: initialOrders, currentUser }: { orders: any[], currentUser: any }) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [activeOrder, setActiveOrder] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'approved' | 'preparing' | 'ready'>('approved')

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(*), order_items(*, products(name, sku, unit_of_measure))')
      .in('status', ['approved', 'preparing', 'ready_for_dispatch', 'dispatched', 'delivered'])
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const updateStatus = async (order: any, newStatus: string, notifyDept?: string, notifyMsg?: string) => {
    setProcessing(order.id)
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
    if (notifyDept && notifyMsg) {
      await supabase.from('notifications').insert({
        recipient_department: notifyDept,
        sender_id: currentUser.id,
        title: notifyMsg,
        body: order.order_number + ' — ' + order.customers?.name,
        type: 'order_status',
        reference_id: order.id,
        is_read: false
      })
    }
    setProcessing(null)
    setActiveOrder(null)
    await loadOrders()
  }

  const approvedOrders = orders.filter(o => o.status === 'approved')
  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const readyOrders = orders.filter(o => o.status === 'ready_for_dispatch')
  const displayedOrders = activeTab === 'approved' ? approvedOrders : activeTab === 'preparing' ? preparingOrders : readyOrders

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Orders to Prepare</h3>
        <div className="flex gap-2">
          {[
            { key: 'approved', label: 'New', count: approvedOrders.length, color: '#1a73e8' },
            { key: 'preparing', label: 'Preparing', count: preparingOrders.length, color: '#f59e0b' },
            { key: 'ready', label: 'Ready', count: readyOrders.length, color: '#059669' },
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
          <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#059669' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {activeTab === 'approved' ? 'No new orders to prepare' : activeTab === 'preparing' ? 'No orders being prepared' : 'No orders ready for dispatch'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {displayedOrders.map(order => {
          const isActive = activeOrder === order.id
          const isApproved = order.status === 'approved'
          const isPreparing = order.status === 'preparing'
          const isReady = order.status === 'ready_for_dispatch'
          const borderColor = isApproved ? '#1a73e8' : isPreparing ? '#f59e0b' : '#059669'

          return (
            <div key={order.id} className="rounded-xl overflow-hidden"
              style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)', borderLeft: '4px solid ' + borderColor }}>

              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: borderColor + '15' }}>
                    <Package className="w-4 h-4" style={{ color: borderColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{ background: borderColor + '15', color: borderColor }}>
                        {order.status === 'ready_for_dispatch' ? 'Ready' : order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
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
                  <a href={'/dashboard/finance/invoice?order_id=' + order.id + '&type=packing'} target="_blank"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--table-header-bg)', color: 'var(--text-secondary)', border: '1px solid var(--card-border)' }}>
                    <Printer className="w-3.5 h-3.5" /> Packing Note
                  </a>
                  <button onClick={() => setActiveOrder(isActive ? null : order.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: borderColor + '15', color: borderColor, border: '1px solid ' + borderColor + '30' }}>
                    {isActive ? <><ChevronUp className="w-3.5 h-3.5" /> Close</> : <><ChevronDown className="w-3.5 h-3.5" /> Details</>}
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="px-5 pb-3 flex flex-wrap gap-2">
                {order.order_items?.map((item: any, i: number) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                    {item.products?.name} × {item.quantity} {item.products?.unit_of_measure || 'pcs'}
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
                    {/* Packing details */}
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>PACKING DETAILS</p>
                      <div className="space-y-2">
                        {order.order_items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                            <div>
                              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.products?.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.products?.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.quantity} {item.products?.unit_of_measure || 'pcs'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>DELIVERY INFO</p>
                      <div className="p-3 rounded-lg space-y-2" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Customer</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{order.customers?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Phone</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{order.customers?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Address</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{order.customers?.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Payment</span>
                          <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{order.payment_mode?.replace(/_/g, ' ') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>GH₵{parseFloat(order.total_amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                    {isApproved && (
                      <button onClick={() => updateStatus(order, 'preparing')} disabled={processing === order.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                        style={{ background: '#f59e0b', color: 'white' }}>
                        {processing === order.id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Package className="w-4 h-4" />}
                        Start Preparing
                      </button>
                    )}
                    {isPreparing && (
                      <button onClick={() => updateStatus(order, 'ready_for_dispatch', 'dispatch', 'Order Ready for Dispatch')} disabled={processing === order.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                        style={{ background: '#059669', color: 'white' }}>
                        {processing === order.id ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Mark Ready for Dispatch
                      </button>
                    )}
                    {isReady && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#05966915', border: '1px solid #05966930' }}>
                        <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} />
                        <span className="text-sm font-medium" style={{ color: '#059669' }}>Waiting for Dispatch</span>
                      </div>
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
