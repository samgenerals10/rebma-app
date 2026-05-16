'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, MapPin, Phone, ShoppingCart, DollarSign, Calendar } from 'lucide-react'

export default function CustomerProfilePage() {
  const { id } = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    if (id) loadCustomerData()
  }, [id])

  const loadCustomerData = async () => {
    setLoading(true)
    
    // Fetch customer details
    const { data: custData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
      
    if (custData) setCustomer(custData)

    // Fetch order history
    const { data: orderData } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      
    if (orderData) setOrders(orderData)

    setLoading(false)
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading customer profile...</div>
  }

  if (!customer) {
    return <div className="p-8 text-center text-red-500">Customer not found.</div>
  }

  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/marketing/customers" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Customer Profile</h1>
          <p className="text-gray-500">Full history and tracing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 col-span-1">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{customer.name}</h2>
          <p className="text-sm text-gray-500 mb-6 flex items-center gap-2"><MapPin className="w-4 h-4" /> {customer.address || 'No address'}</p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{customer.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShoppingCart className="w-4 h-4 text-gray-400" />
              <span>{orders.length} Total Orders</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-emerald-600">GH₵{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })} Lifetime Value</span>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl shadow-sm border col-span-1 md:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Order History & Tracing</h3>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders found for this customer.</div>
          ) : (
            <div className="divide-y">
              {orders.map(order => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-semibold text-gray-900">{order.order_number}</span>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" /> 
                        {new Date(order.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">GH₵{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <p className={`text-xs mt-1 font-medium px-2 py-0.5 rounded-full inline-block ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mt-3 text-sm border border-gray-100">
                    <p className="font-medium text-gray-700 mb-2">Items Purchased:</p>
                    <ul className="space-y-1">
                      {order.order_items?.map((item: any, i: number) => (
                        <li key={i} className="text-gray-600 flex justify-between">
                          <span>{item.products?.name} × {item.quantity}</span>
                          <span>GH₵{parseFloat(item.unit_price).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
