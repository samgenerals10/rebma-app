'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, ShoppingCart, MessageCircle, Bell, MoreHorizontal,
  X, TrendingUp, DollarSign, Truck, Package, Users,
  Settings, LogOut, ChevronRight, Factory
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import RightDrawer from './RightDrawer'

export default function MobileNav() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer automatically when route changes
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const user = useAppStore(s => s.user)
  const notifications = useAppStore(s => s.notifications)
  const messageThreads = useAppStore(s => s.messageThreads)
  const openDrawer = useAppStore(s => s.openDrawer)

  const unreadNotifs = notifications.filter(n => !n.is_read).length
  const unreadMessages = messageThreads.filter((t: any) => {
    const msgs = t.messages || []
    return msgs.some((m: any) => m.sender_id !== user?.id && !m.is_deleted)
  }).length

  const dept = user?.department || 'management'

  const getDeptIcon = () => {
    if (dept === 'finance') return DollarSign
    if (dept === 'marketing') return ShoppingCart
    if (dept === 'operations') return Package
    if (dept === 'dispatch') return Truck
    if (dept === 'hr') return Users
    if (dept === 'production') return Factory
    return TrendingUp
  }
  const DeptIcon = getDeptIcon()
  const deptHref = `/dashboard/${dept}`
  const isActive = (href: string, exact = false) => exact ? pathname === href : pathname.startsWith(href)

  const DEPARTMENTS = [
    { label: 'Management', href: '/dashboard/management', icon: TrendingUp, color: '#1a73e8' },
    { label: 'Finance', href: '/dashboard/finance', icon: DollarSign, color: '#059669' },
    { label: 'Marketing', href: '/dashboard/marketing', icon: ShoppingCart, color: '#f59e0b' },
    { label: 'Operations', href: '/dashboard/operations', icon: Package, color: '#8b5cf6' },
    { label: 'Dispatch', href: '/dashboard/dispatch', icon: Truck, color: '#06b6d4' },
    { label: 'Production', href: '/dashboard/production', icon: Factory, color: '#dc2626' },
    { label: 'HR', href: '/dashboard/hr', icon: Users, color: '#ec4899' },
  ]

  return (
    <>
      <RightDrawer />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2"
        style={{
          background: 'var(--card-bg)',
          borderTop: '1px solid var(--card-border)',
          height: 64,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl"
          style={{
            color: isActive('/dashboard', true) ? 'var(--accent)' : 'var(--text-muted)',
            minWidth: 52,
          }}
        >
          <Home className="w-5 h-5" />
          <span style={{ fontSize: 10 }}>Home</span>
        </Link>

        <Link
          href={deptHref}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl"
          style={{
            color: isActive(deptHref) ? 'var(--accent)' : 'var(--text-muted)',
            minWidth: 52,
          }}
        >
          <DeptIcon className="w-5 h-5" />
          <span style={{ fontSize: 10 }}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</span>
        </Link>

        <Link
          href="/dashboard/messages"
          className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl"
          style={{
            color: isActive('/dashboard/messages') ? 'var(--accent)' : 'var(--text-muted)',
            minWidth: 52,
          }}
          aria-label="Messages"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ background: '#dc2626', fontSize: 9 }}
              >
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </div>
          <span style={{ fontSize: 10 }}>Messages</span>
        </Link>

        <button
          onClick={() => openDrawer('alerts')}
          className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl"
          style={{ color: 'var(--text-muted)', minWidth: 52 }}
          aria-label="Open notifications"
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ background: '#dc2626', fontSize: 9 }}
              >
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </div>
          <span style={{ fontSize: 10 }}>Alerts</span>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl"
          style={{ color: 'var(--text-muted)', minWidth: 52 }}
          aria-label="Open menu"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span style={{ fontSize: 10 }}>More</span>
        </button>
      </nav>

      <div
        className={`md:hidden fixed inset-0 z-50 flex flex-col transition-all duration-300 ${
          drawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ background: 'var(--content-bg)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--card-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'var(--accent)' }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {user?.full_name}
              </p>
              <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                {user?.role} · {user?.department}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg"
            style={{ background: 'var(--table-header-bg)' }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            Departments
          </p>
          {DEPARTMENTS.map(d => {
            const Icon = d.icon
            return (
              <Link
                key={d.href}
                href={d.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition"
                style={{
                  background: isActive(d.href) ? d.color + '15' : 'var(--card-bg)',
                  border: '1px solid ' + (isActive(d.href) ? d.color + '30' : 'var(--card-border)'),
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: d.color + '15' }}
                >
                  <Icon className="w-4 h-4" style={{ color: d.color }} />
                </div>
                <span
                  className="font-medium text-sm flex-1"
                  style={{ color: isActive(d.href) ? d.color : 'var(--text-primary)' }}
                >
                  {d.label}
                </span>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </Link>
            )
          })}

          <div
            className="pt-4 space-y-2"
            style={{ borderTop: '1px solid var(--card-border)', marginTop: 16 }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Account
            </p>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#6b728015' }}
              >
                <Settings className="w-4 h-4" style={{ color: '#6b7280' }} />
              </div>
              <span className="font-medium text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                Settings
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#dc262610', border: '1px solid #dc262620' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: '#dc262615' }}
                >
                  <LogOut className="w-4 h-4" style={{ color: '#dc2626' }} />
                </div>
                <span className="font-medium text-sm" style={{ color: '#dc2626' }}>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
