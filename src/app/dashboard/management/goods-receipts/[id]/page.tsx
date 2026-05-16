'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react'
import ExportButton from '@/components/ExportButton'

export default function GoodsReceiptDetailsPage() {
  const { id } = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState<any>(null)

  useEffect(() => {
    if (id) loadReceipt()
  }, [id])

  const loadReceipt = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('goods_receipts')
      .select('*, goods_receipt_items(*), discrepancy_reports(*)')
      .eq('id', id)
      .single()
      
    if (data) setReceipt(data)
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading goods receipt details...</div>
  if (!receipt) return <div className="p-8 text-center text-red-500">Goods receipt not found.</div>

  const hasDiscrepancy = receipt.discrepancy_reports?.length > 0
  const items = receipt.goods_receipt_items || []
  const totalQty = items.reduce((s: number, i: any) => s + (i.qty || i.received_qty || 0), 0)
  const totalWeight = items.reduce((s: number, i: any) => s + (i.total_weight || 0), 0)

  const exportData = items.map((item: any) => ({
    'Receipt Number': receipt.receipt_number,
    'Supplier': receipt.supplier,
    'Product': item.product_name,
    'Received Qty': item.qty || item.received_qty,
    'Passed Qty': item.passed_qty,
    'Failed Qty': item.failed_qty,
    'Total Weight (kg)': item.total_weight,
    'Status': receipt.status,
    'Date': new Date(receipt.created_at).toLocaleDateString()
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/operations" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition print:hidden">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Receipt {receipt.receipt_number}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Received on <span suppressHydrationWarning>{new Date(receipt.created_at).toLocaleString('en-GB')}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <ExportButton type="print" label="Print Report" />
          <ExportButton type="export" label="Export Data" data={exportData || []} filename={`receipt_${receipt.receipt_number}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Supplier & Logistics
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between pb-2 border-b">
              <span className="text-sm text-gray-500">Supplier Name</span>
              <span className="font-semibold text-gray-900">{receipt.supplier}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-sm text-gray-500">PO Number</span>
              <span className="font-medium text-gray-900">{receipt.po_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-sm text-gray-500">Origin Location</span>
              <span className="font-medium text-gray-900">{receipt.location_from || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Destination</span>
              <span className="font-medium text-gray-900">{receipt.location_to || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Receipt Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Status & Approval
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-500">Current Status</span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium capitalize" style={{
                  background: receipt.status === 'approved' ? '#05966915' : receipt.status === 'rejected' ? '#dc262615' : '#f59e0b15',
                  color: receipt.status === 'approved' ? '#059669' : receipt.status === 'rejected' ? '#dc2626' : '#f59e0b'
              }}>
                {receipt.status === 'pending' ? <Clock className="w-4 h-4" /> : receipt.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {receipt.status}
              </span>
            </div>
            {hasDiscrepancy && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Discrepancy reported on this receipt.</span>
              </div>
            )}
            {receipt.notes && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">General Notes:</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-100">{receipt.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discrepancy Details */}
      {hasDiscrepancy && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden border-red-200">
          <div className="px-6 py-4 border-b bg-red-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-800">Discrepancy Report Details</h2>
          </div>
          <div className="p-6 space-y-3">
            {receipt.discrepancy_reports.map((d: any, i: number) => (
              <div key={i} className="flex gap-3 items-start border-l-4 border-red-500 pl-4">
                <p className="text-sm text-gray-800">{d.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Received */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Received Items Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium text-center">Received Qty</th>
                <th className="px-6 py-3 font-medium text-center text-green-600">Passed</th>
                <th className="px-6 py-3 font-medium text-center text-red-600">Failed</th>
                <th className="px-6 py-3 font-medium text-right">Weight/Sack</th>
                <th className="px-6 py-3 font-medium text-right">Total Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {items.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.product_name || 'Unknown Item'}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{item.qty || item.received_qty}</td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">{item.passed_qty ?? '—'}</td>
                  <td className="px-6 py-4 text-center font-bold text-red-600">{item.failed_qty > 0 ? item.failed_qty : '—'}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{item.weight_per_sack ? `${item.weight_per_sack} kg` : '—'}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{item.total_weight ? `${item.total_weight} kg` : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-700">TOTALS</td>
                <td className="px-6 py-4 text-center font-bold text-gray-900">{totalQty}</td>
                <td colSpan={3}></td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">{totalWeight} kg</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
