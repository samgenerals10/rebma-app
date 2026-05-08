'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Save, CheckCircle, TrendingUp, Clock } from 'lucide-react'

export default function SetPricePage() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [currentPrices, setCurrentPrices] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { init() }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    setCurrentUser(userData)

    const { data: prods } = await supabase.from('products').select('*').order('name')
    if (prods) setProducts(prods)

    // Get latest price for each product
    const { data: priceData } = await supabase
      .from('product_prices')
      .select('*, users:set_by(full_name)')
      .order('created_at', { ascending: false })

    if (priceData) {
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
    const { error } = await supabase.from('product_prices').insert({
      product_id: product.id,
      product_name: product.name,
      selling_price: price,
      set_by: currentUser.id
    })

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
    ])

    // Update local state
    setCurrentPrices(prev => ({
      ...prev,
      [product.id]: { selling_price: price, set_by: currentUser.id, created_at: new Date().toISOString(), users: { full_name: currentUser.full_name } }
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
              <div key={product.id} className="flex items-center gap-4 px-5 py-4"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
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
                <div key={product.id} className="flex items-center gap-4 px-5 py-4"
                  style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
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
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
