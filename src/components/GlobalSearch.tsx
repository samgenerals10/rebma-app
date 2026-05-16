'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search as SearchIcon, User, Package, ShoppingCart, Loader2 } from 'lucide-react'

export function GlobalSearch({ user }: { user: any }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({ customers: [], orders: [], products: [], employees: [] })
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], orders: [], products: [], employees: [] })
      setLoading(false)
      return
    }

    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const performSearch = async (searchTerm: string) => {
    if (!user) return
    setLoading(true)
    const term = `%${searchTerm}%`
    
    const isGlobal = ['ceo', 'manager', 'admin'].includes(user.role)
    const dept = user.department

    let newResults = { customers: [], orders: [], products: [], employees: [] }

    if (isGlobal || ['marketing', 'finance', 'operations', 'dispatch'].includes(dept)) {
      if (isGlobal || dept === 'marketing' || dept === 'finance') {
        const { data: c } = await supabase.from('customers').select('*').or(`name.ilike.${term},phone.ilike.${term},address.ilike.${term}`).limit(5)
        if (c) newResults.customers = c as never[]
      }
      const { data: o } = await supabase.from('orders').select('id, order_number, status, customers(name)').ilike('order_number', term).limit(5)
      if (o) newResults.orders = o as never[]
    }

    if (isGlobal || ['operations', 'production', 'marketing'].includes(dept)) {
      const { data: p } = await supabase.from('products').select('*').or(`name.ilike.${term},sku.ilike.${term}`).limit(5)
      if (p) newResults.products = p as never[]
    }

    if (isGlobal || dept === 'hr') {
      const { data: e } = await supabase.from('users').select('id, first_name, last_name, department').or(`first_name.ilike.${term},last_name.ilike.${term}`).limit(5)
      if (e) newResults.employees = e as never[]
    }

    setResults(newResults)
    setLoading(false)
  }

  const hasResults = results.customers.length > 0 || results.orders.length > 0 || results.products.length > 0 || results.employees.length > 0

  return (
    <div className="flex-1 max-w-sm flex relative" ref={wrapperRef}>
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => { if (query) setShowDropdown(true); }}
          placeholder="Search everywhere..." 
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-100 border border-transparent focus:bg-white"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
      </div>

      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[70vh] overflow-y-auto z-50">
          {!loading && !hasResults ? (
            <div className="p-4 text-center text-sm text-gray-500">No results found for "{query}"</div>
          ) : (
            <div className="p-2 space-y-4">
              {results.customers.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase px-2 mb-1">Customers</div>
                  {results.customers.map((c: any) => (
                    <Link key={c.id} href={`/dashboard/marketing/customers/${c.id}`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                      <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100"><User className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{c.name}</div>
                        <div className="text-xs text-gray-500 truncate">{c.phone || c.address}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.orders.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase px-2 mb-1">Orders</div>
                  {results.orders.map((o: any) => (
                    <Link key={o.id} href={`/dashboard/marketing/orders`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                      <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100"><ShoppingCart className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{o.order_number}</div>
                        <div className="text-xs text-gray-500 truncate">{o.customers?.name} • {o.status}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.products.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase px-2 mb-1">Products & Stock</div>
                  {results.products.map((p: any) => (
                    <Link key={p.id} href={`/dashboard/operations`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                      <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100"><Package className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                        <div className="text-xs text-gray-500 truncate">SKU: {p.sku} • {p.weight_kg}kg</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.employees.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase px-2 mb-1">Employees</div>
                  {results.employees.map((e: any) => (
                    <Link key={e.id} href={`/dashboard/hr/employees`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                      <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100"><User className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{e.first_name} {e.last_name}</div>
                        <div className="text-xs text-gray-500 truncate capitalize">{e.department} Dept</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              <Link href={`/dashboard/search?q=${query}`} onClick={() => setShowDropdown(false)} className="block w-full text-center py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg mt-2 border-t">
                View all results for "{query}"
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
