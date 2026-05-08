'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, ShoppingCart, Truck, DollarSign, Factory, TrendingUp, Users } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user: auth } } = await supabase.auth.getUser()
      if (!auth) { window.location.href = '/login'; return }
      const { data } = await supabase.from('users').select('*').eq('id', auth.id).single()
      setUser(data)
      setLoading(false)
    }
    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const departments = [
    { key: 'management', name: 'Management', icon: TrendingUp, color: '#1a73e8' },
    { key: 'finance', name: 'Finance', icon: DollarSign, color: '#059669' },
    { key: 'marketing', name: 'Marketing', icon: ShoppingCart, color: '#ea4335' },
    { key: 'operations', name: 'Operations', icon: Package, color: '#f59e0b' },
    { key: 'production', name: 'Production', icon: Factory, color: '#8b5cf6' },
    { key: 'dispatch', name: 'Dispatch', icon: Truck, color: '#06b6d4' },
    { key: 'hr', name: 'HR', icon: Users, color: '#ec4899' },
  ]

  const stats = [
    { label: 'Pending Approvals', value: '12', color: '#f59e0b' },
    { label: 'Active Orders', value: '45', color: 'var(--accent)' },
    { label: 'Low Stock Items', value: '3', color: '#ef4444' },
    { label: "Today's Deliveries", value: '28', color: '#10b981' },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {user?.full_name || 'User'}!
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Here is what is happening with your business today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-xl p-5"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Departments</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {departments.map(({ key, name, icon: Icon, color }) => (
          <Link
            key={key}
            href={`/dashboard/${key}`}
            className="rounded-xl p-5 transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{name}</h3>
            <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-secondary)' }}>{key}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
