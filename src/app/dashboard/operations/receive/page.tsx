'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Plus, X, CheckCircle, AlertTriangle, ArrowLeft, ClipboardList } from 'lucide-react'

type Item = {
  product_id: string
  product_name: string
  is_manual: boolean
  qty: number
  weight_per_sack: number
  total_weight: number
}

type QCResult = {
  product_name: string
  product_id: string
  qty: number
  passed: number
  failed: number
  fail_reason: string
}

export default function GoodsReceiptPage() {
  const supabase = createClient()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [allPassed, setAllPassed] = useState(false)
  const [poNumber, setPoNumber] = useState('')
  const [supplier, setSupplier] = useState('')
  const [locationFrom, setLocationFrom] = useState('')
  const [locationTo, setLocationTo] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<Item[]>([{ product_id: '', product_name: '', is_manual: false, qty: 1, weight_per_sack: 0, total_weight: 0 }])
  const [qcResults, setQcResults] = useState<QCResult[]>([])
  const dateTime = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setCurrentUserId(data.user.id) })
    supabase.from('products').select('*').order('name').then(({ data }) => { if (data) setProducts(data) })
  }, [])

  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: value }
    if (field === 'qty' || field === 'weight_per_sack') updated[i].total_weight = updated[i].qty * updated[i].weight_per_sack
    if (field === 'product_id') { const p = products.find(p => p.id === value); updated[i].product_name = p?.name || ''; updated[i].is_manual = false }
    setItems(updated)
  }

  const addItem = () => setItems([...items, { product_id: '', product_name: '', is_manual: false, qty: 1, weight_per_sack: 0, total_weight: 0 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const goToQC = () => {
    setQcResults(items.map(item => ({ product_name: item.product_name, product_id: item.product_id, qty: item.qty, passed: item.qty, failed: 0, fail_reason: '' })))
    setStep(3)
  }

  const updateQc = (i: number, field: string, value: any) => {
    const updated = [...qcResults]
    updated[i] = { ...updated[i], [field]: value }
    if (field === 'passed') updated[i].failed = updated[i].qty - (parseInt(value) || 0)
    if (field === 'failed') updated[i].passed = updated[i].qty - (parseInt(value) || 0)
    setQcResults(updated)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const passed = qcResults.every(r => r.failed === 0)
    setAllPassed(passed)

    const { data: receipt, error: receiptError } = await supabase
      .from('goods_receipts')
      .insert({
        receipt_number: 'GR-' + Date.now(),
        po_number: poNumber,
        supplier,
        notes,
        location_from: locationFrom,
        location_to: locationTo,
        status: 'pending',
        received_by: currentUserId
      })
      .select('id')
      .single()

    if (receiptError || !receipt) { alert('Error: ' + receiptError?.message); setLoading(false); return }

    // Save full item details including QC results
    await supabase.from('goods_receipt_items').insert(
      items.map((item, i) => {
        const qc = qcResults[i]
        return {
          receipt_id: receipt.id,
          product_id: item.product_id || null,
          product_name: item.product_name,
          received_qty: item.qty,
          qty: item.qty,
          weight_per_sack: item.weight_per_sack,
          total_weight: item.total_weight,
          passed_qty: qc?.passed ?? item.qty,
          failed_qty: qc?.failed ?? 0,
          fail_reason: qc?.fail_reason || null,
          condition: (qc?.failed ?? 0) === 0 ? 'good' : 'damaged'
        }
      })
    )

    // Save discrepancy report if any items failed
    if (!passed) {
      const failedItems = qcResults.filter(r => r.failed > 0)
      const reason = failedItems.map(r => r.product_name + ': ' + r.failed + ' units failed — ' + r.fail_reason).join(', ')
      await supabase.from('discrepancy_reports').insert({
        receipt_id: receipt.id,
        reason,
        status: 'open',
        reported_by: currentUserId
      })
    }

    // Notify Management and CEO with full receipt details
    const description = [
      'Supplier: ' + supplier,
      'From: ' + locationFrom + ' → To: ' + locationTo,
      'Items: ' + items.map((item, i) => {
        const qc = qcResults[i]
        return item.product_name + ' | Qty: ' + item.qty + ' | Weight: ' + item.total_weight + 'kg | Passed: ' + (qc?.passed ?? item.qty) + ' | Failed: ' + (qc?.failed ?? 0)
      }).join(' || '),
      passed ? 'QC Status: All Passed' : 'QC Status: FAILED — ' + qcResults.filter(r => r.failed > 0).map(r => r.product_name + ' (' + r.failed + ' units) — ' + r.fail_reason).join(', ')
    ].join('\n')

    await supabase.from('approval_queue').insert([
      {
        type: 'goods_receipt',
        reference_id: receipt.id,
        requester_id: currentUserId,
        status: 'pending',
        department: 'management',
        title: 'New Goods Receipt — ' + supplier,
        description,
        notes: 'PO: ' + (poNumber || 'N/A') + ' | Receipt: ' + receipt.id
      },
      {
        type: 'goods_receipt',
        reference_id: receipt.id,
        requester_id: currentUserId,
        status: 'pending',
        department: 'ceo',
        title: 'New Goods Receipt — ' + supplier,
        description,
        notes: 'PO: ' + (poNumber || 'N/A') + ' | Receipt: ' + receipt.id
      }
    ])

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-3xl">
        <div className="rounded-xl p-10 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#05966920' }}>
            <CheckCircle className="w-7 h-7" style={{ color: '#059669' }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Goods Receipt Submitted</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Management and CEO have been notified for review and approval.
          </p>
          <Link href="/dashboard/operations" className="px-6 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'white' }}>
            Back to Operations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/operations" className="p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Goods Receipt</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{['Receipt Details','Items Received','Quality Check','Summary & Confirm'][step - 1]}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1,2,3,4].map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: step > s ? '#059669' : step === s ? 'var(--accent)' : 'var(--card-border)', color: step >= s ? 'white' : 'var(--text-muted)' }}>
                {step > s ? '✓' : s}
              </div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: step === s ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {['Receipt Details','Items Received','Quality Check','Summary'][idx]}
              </span>
            </div>
            {idx < 3 && <div className="w-8 h-px mx-1" style={{ background: 'var(--card-border)' }} />}
          </div>
        ))}
      </div>

      <div className="max-w-3xl">
        {step === 1 && (
          <div className="rounded-xl p-6 space-y-4" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Receipt Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>PO Number</label>
                <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="PO-12345" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Supplier <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="e.g. Poland Dairy Co." required className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date / Time</label>
                <input type="text" value={dateTime} readOnly className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)' }} />
              </div>
              <div />
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Location From <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={locationFrom} onChange={e => setLocationFrom(e.target.value)} placeholder="e.g. Warsaw, Poland" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Location To <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={locationTo} onChange={e => setLocationTo(e.target.value)} placeholder="e.g. Warehouse A, Accra" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => { if (!supplier || !locationFrom || !locationTo) { alert('Please fill Supplier, Location From and Location To'); return } setStep(2) }} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'white' }}>
                Next — Add Items
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Items Received</h3>
              <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ background: 'var(--accent)15', color: 'var(--accent)' }}>
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="p-4 rounded-lg space-y-3" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Item {i + 1}</p>
                    {items.length > 1 && <button onClick={() => removeItem(i)} style={{ color: '#dc2626' }}><X className="w-4 h-4" /></button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Product</label>
                      {item.is_manual ? (
                        <div className="flex gap-2">
                          <input type="text" value={item.product_name} onChange={e => updateItem(i, 'product_name', e.target.value)} placeholder="Enter product name" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                          <button onClick={() => updateItem(i, 'is_manual', false)} className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>Use dropdown</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                            <option value="">Select product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                          </select>
                          <button onClick={() => updateItem(i, 'is_manual', true)} className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>Enter manually</button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Quantity (sacks/units)</label>
                      <input type="number" value={item.qty} min="1" onChange={e => updateItem(i, 'qty', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Weight per sack (kg)</label>
                      <input type="number" value={item.weight_per_sack} min="0" onChange={e => updateItem(i, 'weight_per_sack', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Weight (auto-calculated)</label>
                      <div className="px-3 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--accent)' }}>{item.total_weight.toLocaleString()} kg</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 mt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>Back</button>
              <button onClick={() => { if (items.some(item => !item.product_name && !item.product_id)) { alert('Please select or enter a product for all items'); return } goToQC() }} className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: 'var(--accent)', color: 'white' }}>
                <CheckCircle className="w-4 h-4" /> Next — Quality Check
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quality Check</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Enter passed and failed units per item. Any failed units will be reported to Manager, CEO and Finance.</p>
            <div className="space-y-4">
              {qcResults.map((result, i) => (
                <div key={i} className="p-4 rounded-lg" style={{ border: '1px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{result.product_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total received: {result.qty} units</p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: result.failed === 0 ? '#05966920' : '#dc262620', color: result.failed === 0 ? '#059669' : '#dc2626' }}>
                      {result.failed === 0 ? 'All Pass' : result.failed + ' Failed'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#059669' }}>Units Passed</label>
                      <input type="number" value={result.passed} min="0" max={result.qty} onChange={e => updateQc(i, 'passed', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid #059669', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#dc2626' }}>Units Failed</label>
                      <input type="number" value={result.failed} min="0" max={result.qty} onChange={e => updateQc(i, 'failed', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid #dc2626', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                  {result.failed > 0 && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Reason for failure <span style={{ color: '#dc2626' }}>*</span></label>
                      <input type="text" value={result.fail_reason} onChange={e => updateQc(i, 'fail_reason', e.target.value)} placeholder="Describe the issue..." className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid #dc2626', color: 'var(--text-primary)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 mt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>Back</button>
              <button onClick={() => { if (qcResults.some(r => r.failed > 0 && !r.fail_reason)) { alert('Please provide a reason for all failed items'); return } setStep(4) }} className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: 'var(--accent)', color: 'white' }}>
                <ClipboardList className="w-4 h-4" /> Next — Review Summary
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Summary & Confirm</h3>
            <div className="rounded-lg p-4" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Receipt Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm overflow-hidden">
                <span style={{ color: 'var(--text-secondary)' }}>PO Number</span><span style={{ color: 'var(--text-primary)' }}>{poNumber || '—'}</span>
                <span style={{ color: 'var(--text-secondary)' }}>Supplier</span><span style={{ color: 'var(--text-primary)' }}>{supplier}</span>
                <span style={{ color: 'var(--text-secondary)' }}>Date / Time</span><span style={{ color: 'var(--text-primary)' }}>{dateTime}</span>
                <span style={{ color: 'var(--text-secondary)' }}>From</span><span style={{ color: 'var(--text-primary)' }}>{locationFrom}</span>
                <span style={{ color: 'var(--text-secondary)' }}>To</span><span style={{ color: 'var(--text-primary)' }}>{locationTo}</span>
                {notes && <><span style={{ color: 'var(--text-secondary)' }}>Notes</span><span style={{ color: 'var(--text-primary)' }}>{notes}</span></>}
              </div>
            </div>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider px-4 py-2" style={{ color: 'var(--text-secondary)', background: 'var(--table-header-bg)' }}>Items & QC Results</p>
              <div className="overflow-x-auto"><table className="w-full text-sm" style={{ minWidth: 400 }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--card-border)' }}>
                    <th className="text-left px-4 py-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Product</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Qty</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Weight</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold" style={{ color: '#059669' }}>Passed</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold" style={{ color: '#dc2626' }}>Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const qc = qcResults[i]
                    return (
                      <tr key={i} style={{ borderTop: '1px solid var(--card-border)' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{item.product_name}</td>
                        <td className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>{item.qty}</td>
                        <td className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>{item.total_weight} kg</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: '#059669' }}>{qc?.passed}</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: qc?.failed > 0 ? '#dc2626' : 'var(--text-muted)' }}>{qc?.failed}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table></div>
            </div>
            {qcResults.some(r => r.failed > 0) && (
              <div className="rounded-lg p-4" style={{ background: '#dc262610', border: '1px solid #dc2626' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#dc2626' }}>Discrepancy Report</p>
                {qcResults.filter(r => r.failed > 0).map((r, i) => (
                  <p key={i} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {r.product_name}: {r.failed} units failed — {r.fail_reason}
                  </p>
                ))}
              </div>
            )}
            <div className="rounded-lg p-4" style={{ background: '#1a73e810', border: '1px solid #1a73e8' }}>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" style={{ color: '#1a73e8' }} />
                <p className="text-sm font-medium" style={{ color: '#1a73e8' }}>
                  Full receipt details will be sent to Management and CEO for review and approval.
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(3)} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>Back</button>
              <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--accent)', color: 'white' }}>
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit to Management & CEO'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
