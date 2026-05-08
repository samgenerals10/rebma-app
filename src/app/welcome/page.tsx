'use client'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Package, DollarSign, Truck, Users, BarChart2, MessageCircle } from 'lucide-react'

const FEATURES = [
  { icon: Package, label: 'Inventory', color: '#059669', bg: '#05966915' },
  { icon: DollarSign, label: 'Finance', color: '#1a73e8', bg: '#1a73e815' },
  { icon: Truck, label: 'Dispatch', color: '#f59e0b', bg: '#f59e0b15' },
  { icon: Users, label: 'HR', color: '#8b5cf6', bg: '#8b5cf615' },
  { icon: BarChart2, label: 'Reports', color: '#dc2626', bg: '#dc262615' },
  { icon: MessageCircle, label: 'Messaging', color: '#06b6d4', bg: '#06b6d415' },
]

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fffe' }}>
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
            <span className="text-white font-black text-sm">R</span>
          </div>
          <div>
            <p className="font-black text-sm leading-none" style={{ color: '#1a1a1a' }}>REBMA</p>
            <p className="text-xs leading-none" style={{ color: '#6b7280' }}>IMPEX GHANA</p>
          </div>
        </div>
        <Link href="/login"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
          Sign In <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col px-5 pt-8 pb-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start mb-5" style={{ background: '#05966915', border: '1px solid #05966930' }}>
          <CheckCircle className="w-3.5 h-3.5" style={{ color: '#059669' }} />
          <span className="text-xs font-semibold" style={{ color: '#059669' }}>Operational Management System</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black leading-tight mb-4" style={{ color: '#1a1a1a' }}>
          Streamline Your<br />
          <span style={{ color: '#059669' }}>Business</span><br />
          Operations
        </h1>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-8" style={{ color: '#6b7280' }}>
          Complete enterprise management platform with real-time tracking, integrated messaging, and powerful analytics for all departments.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.label} className="flex flex-col items-center gap-2 p-3 rounded-2xl"
                style={{ background: 'white', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: f.bg }}>
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <span className="text-xs font-medium" style={{ color: '#374151' }}>{f.label}</span>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { value: '8', label: 'Departments' },
            { value: '24/7', label: 'Real-time' },
            { value: '100%', label: 'Secure' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center p-3 rounded-2xl"
              style={{ background: 'white', border: '1px solid #f0f0f0' }}>
              <p className="text-xl font-black" style={{ color: '#059669' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <Link href="/login"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}>
            Sign In to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: '#9ca3af' }}>
          © 2024 REBMA IMPEX Ghana Limited. All rights reserved.
        </p>
      </div>
    </div>
  )
}
