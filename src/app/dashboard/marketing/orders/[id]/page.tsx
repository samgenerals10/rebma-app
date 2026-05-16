'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, User, Clock, FileText, CheckCircle, Package } from 'lucide-react'
import OrderStepper from '@/components/OrderStepper'
import ExportButton from '@/components/ExportButton'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (id) loadOrderDetails()
  }, [id])

  const loadOrderDetails = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, customers(*), users(full_name), order_items(*, products(*))')
      .eq('id', id)
      .single()
      
    if (data) setOrder(data)
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading order details...</div>
  if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>

  const exportData = order.order_items?.map((item: any) => ({
    'Order Number': order.order_number,
    'Customer': order.customers?.name,
    'Product SKU': item.products?.sku,
    'Product Name': item.products?.name,
    'Quantity': item.quantity,
    'Unit Price (GH₵)': item.unit_price,
    'Total Line (GH₵)': (item.quantity * item.unit_price).toFixed(2),
    'Date': new Date(order.created_at).toLocaleDateString()
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/marketing/orders" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition print:hidden">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Order {order.order_number}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Placed on <span suppressHydrationWarning>{new Date(order.created_at).toLocaleString('en-GB')}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <ExportButton type="print" label="Print Invoice" />
          <ExportButton type="export" label="Export Data" data={exportData || []} filename={`invoice_${order.order_number}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Customer Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold text-gray-900">{order.customers?.name || 'Walk-in Customer'}</p>
            </div>
            {order.customers?.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{order.customers?.phone}</p>
              </div>
            )}
            {order.customers?.address && (
              <div>
                <p className="text-sm text-gray-500">Address / Location</p>
                <p className="font-medium text-gray-900">{order.customers?.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Status & Fulfillment
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-500">Current Status</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium capitalize bg-blue-50 text-blue-700">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Mode</span>
              <span className="font-semibold text-gray-900 capitalize">{order.payment_mode?.replace(/_/g, ' ') || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Created By</span>
              <span className="font-semibold text-gray-900">{order.users?.full_name || 'Admin'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Fulfillment Progress</h2>
        <div className="py-2">
          <OrderStepper status={order.status} />
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Order Items</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="px-6 py-3 font-medium">Item</th>
              <th className="px-6 py-3 font-medium text-right">Qty</th>
              <th className="px-6 py-3 font-medium text-right">Unit Price</th>
              <th className="px-6 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.order_items?.map((item: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{item.products?.name}</p>
                  <p className="text-xs text-gray-500">SKU: {item.products?.sku}</p>
                </td>
                <td className="px-6 py-4 text-right font-medium">{item.quantity}</td>
                <td className="px-6 py-4 text-right text-gray-600">GH₵{parseFloat(item.unit_price).toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">GH₵{(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
            {(!order.order_items || order.order_items.length === 0) && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No items found.</td></tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-500">Subtotal</td>
              <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">GH₵{parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
