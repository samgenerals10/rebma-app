'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function InvoiceContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const type = searchParams.get('type') || 'invoice'
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-0000000001')

  useEffect(() => {
    if (orderId) loadOrder()
    fetchInvoiceNumber()
  }, [orderId])

  const fetchInvoiceNumber = async () => {
    const { data } = await supabase.rpc('get_next_invoice_number')
    if (data) setInvoiceNumber(data)
  }

  const loadOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(*), order_items(*, products(name, sku, unit_of_measure))')
      .eq('id', orderId)
      .single()
    if (data) setOrder(data)
    setLoading(false)
  }

  const handlePrint = () => window.print()

  const subtotal = order?.order_items?.reduce((sum: number, item: any) =>
    sum + (item.quantity * parseFloat(item.unit_price)), 0) || 0
  const vat = subtotal * 0.15
  const total = subtotal + vat

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#059669', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!order) return (
    <div className="text-center p-10">
      <p className="text-gray-500">Order not found</p>
    </div>
  )

  const isPackingNote = type === 'packing'

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <Link href="/dashboard/finance?tab=approved"
          className="p-2 rounded-lg border"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {isPackingNote ? 'Packing Note' : 'Invoice'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.order_number}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#059669', color: 'white' }}>
            <Download className="w-4 h-4" /> Save as PDF
          </button>
        </div>
      </div>

      {/* Invoice */}
      <div className="invoice-wrap bg-white shadow-lg mx-auto"
        style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

        {isPackingNote ? (
          /* PACKING NOTE */
          <div style={{ padding: '15mm 20mm', color: '#1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10mm', borderBottom: '2px solid #059669', paddingBottom: '6mm' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4mm' }}>
                <img src="/rebma-logo.jpg" alt="REBMA" style={{ height: 60, objectFit: 'contain' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 24, fontWeight: 900, margin: '0 0 1mm', letterSpacing: '-0.5px', color: '#1a1a1a' }}>PACKING NOTE</p>
                <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{order.order_number}</p>
                <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm', marginBottom: '8mm' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '1px', margin: '0 0 2mm', textTransform: 'uppercase' }}>Deliver To</p>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 1mm' }}>{order.customers?.name}</p>
                <p style={{ fontSize: 11, color: '#555', margin: '0 0 1mm' }}>{order.customers?.contact_person}</p>
                <p style={{ fontSize: 11, color: '#555', margin: '0 0 1mm' }}>{order.customers?.phone}</p>
                <p style={{ fontSize: 11, color: '#555', margin: 0 }}>{order.customers?.address}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '1px', margin: '0 0 2mm', textTransform: 'uppercase' }}>Order Info</p>
                <p style={{ fontSize: 11, margin: '0 0 1mm' }}><strong>Order #:</strong> {order.order_number}</p>
                <p style={{ fontSize: 11, margin: '0 0 1mm' }}><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                <p style={{ fontSize: 11, margin: 0 }}><strong>Payment:</strong> {order.payment_mode?.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8mm' }}>
              <thead>
                <tr>
                  <th style={{ padding: '3mm 4mm', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#333', borderTop: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '3mm 4mm', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#333', borderTop: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ padding: '3mm 4mm', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#333', borderTop: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', textTransform: 'uppercase' }}>Unit</th>
                  <th style={{ padding: '3mm 4mm', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#333', borderTop: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a', textTransform: 'uppercase' }}>Packed ✓</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '3mm 4mm' }}>
                      <p style={{ fontWeight: 600, fontSize: 12, margin: '0 0 1px' }}>{item.products?.name}</p>
                      <p style={{ fontSize: 10, color: '#999', margin: 0 }}>{item.products?.sku}</p>
                    </td>
                    <td style={{ padding: '3mm 4mm', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ padding: '3mm 4mm', textAlign: 'center', fontSize: 11, color: '#666' }}>{item.products?.unit_of_measure || 'pcs'}</td>
                    <td style={{ padding: '3mm 4mm', textAlign: 'right' }}>
                      <div style={{ width: 18, height: 18, border: '2px solid #1a1a1a', borderRadius: 3, display: 'inline-block' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5mm', borderTop: '1px solid #e5e7eb' }}>
              <div>
                <p style={{ fontSize: 11, margin: '0 0 3mm' }}>Packed by: ________________________________</p>
                <p style={{ fontSize: 11, margin: 0 }}>Date: ________________________________</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, margin: '0 0 3mm' }}>Received by: ________________________________</p>
                <p style={{ fontSize: 11, margin: 0 }}>Date: ________________________________</p>
              </div>
            </div>

            <div style={{ marginTop: '8mm', padding: '4mm', background: '#f9fafb', borderRadius: 4, textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#666', margin: 0 }}>REBMA IMPEX GHANA LIMITED · Accra, Ghana · info@rebma.com</p>
            </div>
          </div>
        ) : (
          /* INVOICE — matching ON TOUCH design */
          <div style={{ display: 'flex', minHeight: '297mm', color: '#1a1a1a' }}>

            {/* Left panel — light gray */}
            <div style={{ width: '68mm', background: '#f5f5f5', padding: '14mm 10mm', display: 'flex', flexDirection: 'column', gap: '10mm' }}>

              {/* Logo */}
              <div>
                <img src="/rebma-logo.jpg" alt="REBMA Ghana" style={{ width: '70px', height: '50px', objectFit: 'contain' }} />
              </div>

              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8mm' }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: '#333', margin: '0 0 3mm', textTransform: 'uppercase' }}>Invoice To</p>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px', color: '#1a1a1a' }}>{order.customers?.name}</p>
                {order.customers?.contact_person && <p style={{ fontSize: 10, color: '#555', margin: '0 0 2px' }}>{order.customers.contact_person}</p>}
                {order.customers?.address && <p style={{ fontSize: 10, color: '#555', margin: '0 0 2px' }}>{order.customers.address}</p>}
                {order.customers?.phone && <p style={{ fontSize: 10, color: '#555', margin: '0 0 2px' }}>P: {order.customers.phone}</p>}
                {order.customers?.email && <p style={{ fontSize: 10, color: '#555', margin: 0 }}>M: {order.customers.email}</p>}
              </div>

              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8mm' }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: '#333', margin: '0 0 3mm', textTransform: 'uppercase' }}>Payment</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>{order.payment_mode?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Cash'}</p>
                {order.payment_details?.bank_name && (
                  <>
                    <p style={{ fontSize: 10, color: '#555', margin: '0 0 1px' }}>{order.payment_details.bank_name}</p>
                    {order.payment_details.account_name && <p style={{ fontSize: 10, color: '#555', margin: '0 0 1px' }}>{order.payment_details.account_name}</p>}
                    {order.payment_details.cheque_number && <p style={{ fontSize: 10, color: '#555', margin: 0 }}>Cheque: {order.payment_details.cheque_number}</p>}
                  </>
                )}
                {order.payment_details?.network && (
                  <>
                    <p style={{ fontSize: 10, color: '#555', margin: '0 0 1px' }}>{order.payment_details.network}</p>
                    {order.payment_details.momo_number && <p style={{ fontSize: 10, color: '#555', margin: 0 }}>{order.payment_details.momo_number}</p>}
                  </>
                )}
                {order.payment_details?.due_date && (
                  <p style={{ fontSize: 10, color: '#c00', margin: '2px 0 0' }}>Due: {new Date(order.payment_details.due_date).toLocaleDateString('en-GB')}</p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8mm' }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: '#333', margin: '0 0 3mm', textTransform: 'uppercase' }}>Terms</p>
                <p style={{ fontSize: 10, color: '#555', lineHeight: 1.5, margin: 0 }}>Payment is due as per the agreed terms. Late payments may attract additional charges. All goods remain property of REBMA until full payment is received.</p>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid #ddd', paddingTop: '8mm' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>THANK YOU</p>
                <p style={{ fontSize: 10, color: '#555', margin: 0 }}>FOR YOUR BUSINESS</p>
              </div>
            </div>

            {/* Right panel */}
            <div style={{ flex: 1, padding: '14mm 12mm', display: 'flex', flexDirection: 'column' }}>

              {/* Invoice title + number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12mm' }}>
                <div>
                  <p style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-1px', color: '#1a1a1a', margin: 0 }}>INVOICE</p>
                  <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>Invoice# {invoiceNumber}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#555', margin: '0 0 2px' }}>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p style={{ fontSize: 11, color: '#555', margin: '0 0 6mm' }}>Order: {order.order_number}</p>
                  <p style={{ fontSize: 10, color: '#888', margin: '0 0 2px' }}>Total Due:</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>GH₵{total.toFixed(2)}</p>
                </div>
              </div>

              {/* Items table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm' }}>
                <thead>
                  <tr style={{ borderTop: '2px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
                    <th style={{ padding: '3mm 2mm 3mm 0', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                    <th style={{ padding: '3mm 2mm', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                    <th style={{ padding: '3mm 2mm', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>QTY</th>
                    <th style={{ padding: '3mm 0 3mm 2mm', textAlign: 'right', fontSize: 10, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items?.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '3mm 2mm 3mm 0' }}>
                        <p style={{ fontWeight: 500, fontSize: 12, margin: '0 0 1px', color: '#1a1a1a' }}>{item.products?.name}</p>
                        <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>{item.products?.sku}</p>
                      </td>
                      <td style={{ padding: '3mm 2mm', textAlign: 'center', fontSize: 12, color: '#333' }}>GH₵{parseFloat(item.unit_price).toFixed(2)}</td>
                      <td style={{ padding: '3mm 2mm', textAlign: 'center', fontSize: 12, color: '#333' }}>{item.quantity}</td>
                      <td style={{ padding: '3mm 0 3mm 2mm', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>GH₵{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals + signature */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10mm' }}>
                {/* Signature */}
                <div>
                  <div style={{ width: '50mm', borderBottom: '1px solid #aaa', marginBottom: '2mm', height: '12mm' }} />
                  <p style={{ fontSize: 11, fontWeight: 600, margin: '0 0 1px', color: '#1a1a1a' }}>Finance Department</p>
                  <p style={{ fontSize: 10, color: '#888', margin: 0 }}>REBMA IMPEX GHANA LIMITED</p>
                </div>

                {/* Totals */}
                <div style={{ width: '55mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2mm 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: 11, color: '#666' }}>Sub Total</span>
                    <span style={{ fontSize: 11, color: '#1a1a1a' }}>GH₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2mm 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: 11, color: '#666' }}>VAT (15%)</span>
                    <span style={{ fontSize: 11, color: '#1a1a1a' }}>GH₵{vat.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3mm 4mm', border: '2px solid #1a1a1a', marginTop: '2mm' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>TOTAL</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>GH₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid #ddd', paddingTop: '5mm' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 10, color: '#888', margin: 0 }}>REBMA IMPEX GHANA LIMITED · Accra, Ghana</p>
                  <p style={{ fontSize: 10, color: '#888', margin: 0 }}>+233 XXX XXX XXX · info@rebma.com</p>
                  <p style={{ fontSize: 10, color: '#888', margin: 0 }}>www.rebma.com</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          .invoice-wrap, .invoice-wrap * { visibility: visible; }
          .invoice-wrap { position: absolute; left: 0; top: 0; width: 210mm; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#059669', borderTopColor: 'transparent' }} /></div>}>
      <InvoiceContent />
    </Suspense>
  )
}
