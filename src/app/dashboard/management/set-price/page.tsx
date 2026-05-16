'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Save, CheckCircle, TrendingUp, Clock, Package } from 'lucide-react'

export default function SetPricePage() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [currentPrices, setCurrentPrices] = useState<Record<string, any>>({})
  const [recentArrivals, setRecentArrivals] = useState<any[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [allPrices, setAllPrices] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState<string | null>(null)

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    setCurrentUser(userData)

    const { data: prods } = await supabase.from('products').select('*').order('name')
    if (prods) setProducts(prods)

    // Get recently approved receipts (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentReceipts } = await supabase
      .from('goods_receipts')
      .select('*, goods_receipt_items(*)')
      .eq('status', 'approved')
      .gte('approved_at', sevenDaysAgo)
      .order('approved_at', { ascending: false })

    if (recentReceipts) {
      const items: any[] = []
      recentReceipts.forEach(r => {
        r.goods_receipt_items?.forEach((item: any) => {
          if (item.product_id) {
            const product = prods?.find(p => p.id === item.product_id)
            if (product) {
              items.push({
                ...product,
                receipt_id: r.id,
                approved_at: r.approved_at,
                supplier: r.supplier,
                receipt_number: r.receipt_number
              })
            }
          }
        })
      })
      // Remove duplicates (same product in multiple receipts)
      const uniqueItems = items.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      setRecentArrivals(uniqueItems)
    }

    // Get ALL price records for history
    const { data: priceData } = await supabase
      .from('product_prices')
      .select('*, users:set_by(full_name)')
      .order('created_at', { ascending: false })

    if (priceData) {
      setAllPrices(priceData)
      const latestPrices: Record<string, any> = {}
      for (const price of priceData) {
        if (!latestPrices[price.product_id]) {
          latestPrices[price.product_id] = price
        }
      }
      setCurrentPrices(latestPrices)

      // Pre-fill price inputs with current prices
      const priceInputs: Record<string, string> = {}
      for (const [productId, price] of Object.entries(latestPrices)) {
        priceInputs[productId] = (price as any).selling_price?.toString() || ''
      }
      setPrices(priceInputs)
    }

    setLoading(false)
  }

  const savePrice = async (product: any) => {
    const price = parseFloat(prices[product.id])
    if (!price || price <= 0) { alert('Please enter a valid price'); return }
    if (!currentUser) return

    setSaving(product.id)

    // Save to product_prices
    const { data: newPrice, error } = await supabase.from('product_prices').insert({
      product_id: product.id,
      product_name: product.name,
      selling_price: price,
      set_by: currentUser.id
    }).select('*, users:set_by(full_name)').single()

    if (error) { alert('Error saving price: ' + error.message); setSaving(null); return }

    // Notify Finance, Marketing and CEO
    const notifBase = {
      sender_id: currentUser.id,
      title: 'Price Updated: ' + product.name,
      body: 'Selling price set to GH₵' + price.toFixed(2) + ' per unit by ' + currentUser.full_name,
      type: 'price_update',
      is_read: false
    }

    await supabase.from('notifications').insert([
      { ...notifBase, recipient_department: 'finance' },
      { ...notifBase, recipient_department: 'marketing' },
      { ...notifBase, recipient_department: 'ceo' },
      { ...notifBase, recipient_department: 'management' },
    ])

    // Update local state
    setAllPrices(prev => [newPrice, ...prev])
    setCurrentPrices(prev => ({
      ...prev,
      [product.id]: newPrice
    }))

    setSaving(null)
    setSaved(product.id)
    setTimeout(() => setSaved(null), 2000)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return mins + 'm ago'
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return hrs + 'h ago'
    return Math.floor(hrs / 24) + 'd ago'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  const priced = products.filter(p => currentPrices[p.id])
  const unpriced = products.filter(p => !currentPrices[p.id])

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/management" className="p-2 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Set Selling Prices</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Set or update selling price per product — Finance, Marketing and CEO will be notified</p>
        </div>
      </div>

      {/* Recent Arrivals - Specific to approved goods receipts */}
      {recentArrivals.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Recently Received Goods</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentArrivals.map((product) => {
              const currentPrice = currentPrices[product.id]
              return (
                <div key={product.id} className="rounded-xl p-5 border-2" style={{ background: 'var(--card-bg)', borderColor: 'var(--accent)20', boxShadow: 'var(--card-shadow)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.sku} · {product.category}</p>
                      <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded bg-blue-50 text-blue-700 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Recently Approved</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supplier</p>
                      <p className="text-xs font-semibold truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>{product.supplier}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Current Price</span>
                      <span className="font-bold" style={{ color: currentPrice ? '#059669' : '#f59e0b' }}>
                        {currentPrice ? `GH₵${parseFloat(currentPrice.selling_price).toFixed(2)}` : 'Not Set'}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>GH₵</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={prices[product.id] || ''}
                          onChange={e => setPrices(prev => ({ ...prev, [product.id]: e.target.value }))}
                          placeholder="New Price"
                          className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <button
                        onClick={() => savePrice(product)}
                        disabled={saving === product.id || !prices[product.id]}
                        className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                        style={{ background: saved === product.id ? '#059669' : 'var(--accent)', color: 'white' }}>
                        {saving === product.id ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : saved === product.id ? (
                          <><CheckCircle className="w-4 h-4" /> Saved</>
                        ) : (
                          <><Save className="w-4 h-4" /> Set</>
                        )}
                      </button>
                    </div>

                    {/* History Toggle */}
                    <button 
                      onClick={() => setShowHistory(showHistory === product.id ? null : product.id)}
                      className="text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition flex items-center gap-1 mt-1" 
                      style={{ color: 'var(--accent)' }}>
                      <Clock className="w-3 h-3" /> {showHistory === product.id ? 'Hide History' : 'View History'}
                    </button>

                    {showHistory === product.id && (
                      <div className="mt-4 pt-4 border-t border-dashed" style={{ borderColor: 'var(--card-border)' }}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Price History</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                          {allPrices.filter(p => p.product_id === product.id).map((h, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] py-1">
                              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(h.selling_price).toFixed(2)}</span>
                              <div className="text-right">
                                <p style={{ color: 'var(--text-secondary)' }}>{h.users?.full_name}</p>
                                <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{timeAgo(h.created_at)}</p>
                              </div>
                            </div>
                          ))}
                          {allPrices.filter(p => p.product_id === product.id).length === 0 && (
                            <p className="text-xs text-center py-2 italic text-gray-400">No previous records</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{products.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Total Products</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <p className="text-2xl font-bold" style={{ color: '#059669' }}>{priced.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Prices Set</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{unpriced.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Needs Pricing</p>
        </div>
      </div>

      {/* Unpriced products first */}
      {unpriced.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock className="w-4 h-4" style={{ color: '#f59e0b' }} /> Needs Pricing ({unpriced.length})
          </h3>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            {unpriced.map((product, i) => (
              <div key={product.id} className="flex flex-col px-5 py-4"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b15' }}>
                    <DollarSign className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.sku} · {product.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>GH₵</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={prices[product.id] || ''}
                        onChange={e => setPrices(prev => ({ ...prev, [product.id]: e.target.value }))}
                        placeholder="0.00"
                        className="pl-12 pr-4 py-2 rounded-lg text-sm outline-none w-36"
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <button
                      onClick={() => savePrice(product)}
                      disabled={saving === product.id || !prices[product.id]}
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                      style={{ background: saved === product.id ? '#059669' : 'var(--accent)', color: 'white' }}>
                      {saving === product.id ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : saved === product.id ? (
                        <><CheckCircle className="w-4 h-4" /> Saved</>
                      ) : (
                        <><Save className="w-4 h-4" /> Set Price</>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* History for unpriced */}
                <button 
                  onClick={() => setShowHistory(showHistory === product.id ? null : product.id)}
                  className="text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition flex items-center gap-1 mt-2 ml-14" 
                  style={{ color: 'var(--accent)' }}>
                  <Clock className="w-3 h-3" /> {showHistory === product.id ? 'Hide History' : 'View History'}
                </button>
                {showHistory === product.id && (
                  <div className="mt-2 ml-14 max-w-sm">
                    <div className="space-y-1">
                      {allPrices.filter(p => p.product_id === product.id).map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] py-1 border-b border-gray-100 last:border-0">
                          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(h.selling_price).toFixed(2)}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{h.users?.full_name} · {timeAgo(h.created_at)}</span>
                        </div>
                      ))}
                      {allPrices.filter(p => p.product_id === product.id).length === 0 && (
                        <p className="text-[11px] italic text-gray-400">No previous records</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priced products */}
      {priced.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: '#059669' }} /> Priced Products ({priced.length})
          </h3>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
            {priced.map((product, i) => {
              const currentPrice = currentPrices[product.id]
              return (
                <div key={product.id} className="flex flex-col px-5 py-4"
                  style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#05966915' }}>
                      <DollarSign className="w-5 h-5" style={{ color: '#059669' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.sku} · {product.category}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold" style={{ color: '#059669' }}>
                          Current: GH₵{parseFloat(currentPrice.selling_price).toFixed(2)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          · Set by {currentPrice.users?.full_name} · {timeAgo(currentPrice.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>GH₵</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={prices[product.id] || ''}
                          onChange={e => setPrices(prev => ({ ...prev, [product.id]: e.target.value }))}
                          placeholder={currentPrice.selling_price?.toString()}
                          className="pl-12 pr-4 py-2 rounded-lg text-sm outline-none w-36"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <button
                        onClick={() => savePrice(product)}
                        disabled={saving === product.id || !prices[product.id]}
                        className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                        style={{ background: saved === product.id ? '#059669' : 'var(--accent)', color: 'white' }}>
                        {saving === product.id ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : saved === product.id ? (
                          <><CheckCircle className="w-4 h-4" /> Saved</>
                        ) : (
                          <><Save className="w-4 h-4" /> Update</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* History for priced */}
                  <button 
                    onClick={() => setShowHistory(showHistory === product.id ? null : product.id)}
                    className="text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition flex items-center gap-1 mt-2 ml-14" 
                    style={{ color: 'var(--accent)' }}>
                    <Clock className="w-3 h-3" /> {showHistory === product.id ? 'Hide History' : 'View History'}
                  </button>
                  {showHistory === product.id && (
                    <div className="mt-2 ml-14 max-w-md">
                      <div className="space-y-1">
                        {allPrices.filter(p => p.product_id === product.id).map((h, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] py-1 border-b border-gray-100 last:border-0">
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>GH₵{parseFloat(h.selling_price).toFixed(2)}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{h.users?.full_name} · {timeAgo(h.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
