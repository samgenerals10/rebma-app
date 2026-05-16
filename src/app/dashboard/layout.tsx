'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar, { ThemeToggle, NotificationBell, MessagingSystem } from '@/components/Sidebar'
import { useSidebar } from '@/components/SidebarContext'
import { UserAvatar } from '@/components/UserAvatar'
import { GlobalSearch } from '@/components/GlobalSearch'
import MobileNav from '@/components/MobileNav'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'
import {
  ChevronRight, ChevronLeft, Bell, Clock,
  AlertTriangle, CheckCircle, Search, Settings, LogOut, Home,
  MessageCircle, Info, Package, ChevronDown, ChevronUp, X, DollarSign
} from 'lucide-react'

const ROUTE_NAMES: Record<string, string> = {
  'dashboard': 'Overview', 'management': 'Management', 'finance': 'Finance',
  'marketing': 'Marketing', 'operations': 'Operations', 'production': 'Production',
  'dispatch': 'Dispatch', 'hr': 'Human Resources', 'settings': 'Settings',
  'reports': 'Reports', 'tasks': 'Tasks', 'documents': 'Documents',
  'help': 'Help Center', 'accounts': 'Accounts', 'employees': 'Employees',
  'attendance': 'Attendance', 'leave': 'Leave Management', 'payroll': 'Payroll',
  'training': 'Training', 'payments': 'Payments', 'invoices': 'Invoices',
  'expenses': 'Expenses', 'reconciliation': 'Reconciliation', 'fx': 'FX Ledger',
  'gra': 'GRA Reports', 'orders': 'Orders', 'customers': 'Customers',
  'demand': 'Demand Signals', 'imports': 'Import Workflow', 'suppliers': 'Suppliers',
  'receive': 'Goods Receipt', 'discrepancy': 'Discrepancy Report', 'licences': 'Licences',
  'repack': 'Repack Jobs', 'quality': 'Quality Checks', 'packaging': 'Packaging',
  'tracking': 'GPS Tracking', 'trips': 'Trips', 'delivery': 'Proof of Delivery',
  'vehicles': 'Vehicles', 'driver': 'Driver View', 'audit': 'Audit Log',
  'executive': 'Executive Dashboard', 'appearance': 'Appearance', 'profile': 'Profile',
  'password': 'Change Password', 'security': 'Security', 'system': 'System Settings',
  'new': 'New', 'jobs': 'Job Cards', 'history': 'History', 'account': 'Account',
  'goods-receipts': 'Goods Receipts', 'messages': 'Messages',
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs = []
  let path = ''
  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segments[i])
    let name = ROUTE_NAMES[segments[i]] || segments[i].charAt(0).toUpperCase() + segments[i].slice(1)
    if (isUUID) name = 'Profile / Details'
    crumbs.push({ name, path })
  }
  return crumbs
}

function getPageTitle(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const last = segments[segments.length - 1]
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(last)
  if (isUUID) return 'Profile / Details'
  return ROUTE_NAMES[last] || last.charAt(0).toUpperCase() + last.slice(1)
}

const ALL_QUICK_ACTIONS = [
  { label: 'New Order', href: '/dashboard/marketing/orders/new' },
  { label: 'Record Payment', href: '/dashboard/finance/payments/new' },
  { label: 'HR Accounts', href: '/dashboard/hr/accounts' },
  { label: 'Live Inventory', href: '/dashboard/operations' },
  { label: 'Goods Receipt', href: '/dashboard/operations/receive' },
  { label: 'Goods Receipts', href: '/dashboard/management/goods-receipts' },
  { label: 'New Customer', href: '/dashboard/marketing/customers' },
  { label: 'Audit Log', href: '/dashboard/management/audit' },
  { label: 'Messages', href: '/dashboard/messages' },
]

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [isMediumScreen, setIsMediumScreen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [messageThreads, setMessageThreads] = useState<any[]>([])
  const [quickActions, setQuickActions] = useState<any[]>([])
  const [editingActions, setEditingActions] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const pathname = usePathname()
  const { isOpen } = useSidebar()
  const supabase = createClient()

  const setStoreUser = useAppStore(s => s.setUser)
  const setStoreNotifications = useAppStore(s => s.setNotifications)
  const setStoreMessageThreads = useAppStore(s => s.setMessageThreads)

  useEffect(() => {
    setMounted(true)
    const savedRight = localStorage.getItem('right_panel_open')
    if (savedRight !== null) setRightPanelOpen(savedRight === 'true')

    // Track screen size for left and right panel margin guards
    const checkSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
      setIsMediumScreen(window.innerWidth >= 768)
    }
    checkSize()
    window.addEventListener('resize', checkSize)

    loadData()

    const channel = supabase
      .channel('layout-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => loadData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => loadData())
      .subscribe()

    return () => {
      window.removeEventListener('resize', checkSize)
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => { setStoreUser(user) }, [user, setStoreUser])
  useEffect(() => { setStoreNotifications(notifications) }, [notifications, setStoreNotifications])
  useEffect(() => { setStoreMessageThreads(messageThreads) }, [messageThreads, setStoreMessageThreads])

  const loadData = async () => {
    const { data: { user: auth } } = await supabase.auth.getUser()
    if (!auth) { window.location.href = '/login'; return }
    const { data: userData } = await supabase.from('users').select('*').eq('id', auth.id).single()
    setUser(userData)
    const dept = userData?.department

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .or(`recipient_id.eq.${auth.id},recipient_department.eq.${dept}`)
      .order('created_at', { ascending: false })
    if (notifs) setNotifications(notifs)

    const { data: recipients } = await supabase
      .from('message_recipients')
      .select('thread_id')
      .or(`recipient_id.eq.${auth.id},recipient_department.eq.${dept}`)

    if (recipients?.length) {
      const threadIds = [...new Set(recipients.map((r: any) => r.thread_id))]
      const { data: threadData } = await supabase
        .from('message_threads')
        .select('*, message_recipients(recipient_id, recipient_department, users:recipient_id(id, full_name, department)), messages(id, body, created_at, sender_id, is_deleted, users:sender_id(full_name))')
        .in('id', threadIds)
        .order('last_message_at', { ascending: false })
      if (threadData) setMessageThreads(threadData)
    }

    const saved = userData?.quick_actions
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setQuickActions(saved)
    } else {
      setQuickActions([
        { label: 'New Order', href: '/dashboard/marketing/orders/new' },
        { label: 'Record Payment', href: '/dashboard/finance/payments/new' },
        { label: 'HR Accounts', href: '/dashboard/hr/accounts' },
        { label: 'Live Inventory', href: '/dashboard/operations' },
      ])
    }
  }

  const saveQuickActions = async (actions: any[]) => {
    if (!user) return
    await supabase.from('users').update({ quick_actions: actions }).eq('id', user.id)
    setQuickActions(actions)
    setEditingActions(false)
  }

  const toggleRightPanel = () => {
    const next = !rightPanelOpen
    setRightPanelOpen(next)
    localStorage.setItem('right_panel_open', String(next))
  }

  const role = user?.role || 'staff'
  const department = user?.department || 'management'
  const leftWidth = isOpen ? 256 : 80
  const rightWidth = 280
  const hideRightPanel = pathname.startsWith('/dashboard/settings')
  // Only show right panel on large screens (≥1024px)
  const showRight = rightPanelOpen && !hideRightPanel && mounted && isLargeScreen
  const breadcrumbs = getBreadcrumbs(pathname)
  const pageTitle = getPageTitle(pathname)

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return mins + 'm ago'
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return hrs + 'h ago'
    return Math.floor(hrs / 24) + 'd ago'
  }

  const getNotifIcon = (type: string) => {
    if (type?.includes('approved')) return { icon: CheckCircle, color: '#059669' }
    if (type?.includes('rejected') || type?.includes('failed')) return { icon: AlertTriangle, color: '#dc2626' }
    if (type?.includes('message')) return { icon: MessageCircle, color: '#1a73e8' }
    if (type?.includes('receipt') || type?.includes('goods')) return { icon: Package, color: '#8b5cf6' }
    if (type?.includes('price_update') || type?.includes('price')) return { icon: DollarSign, color: '#059669' }
    if (type?.includes('pending')) return { icon: Clock, color: '#f59e0b' }
    return { icon: Info, color: '#1a73e8' }
  }

  const getThreadName = (thread: any) => {
    if (thread.thread_type === 'department') {
      const dept = thread.department || ''
      return dept.charAt(0).toUpperCase() + dept.slice(1) + ' Dept'
    }
    const recipients = thread.message_recipients || []
    const other = recipients.find((r: any) => r.recipient_id && r.recipient_id !== user?.id)
    if (other?.users?.full_name) return other.users.full_name
    return 'Direct Message'
  }

  const getLastMsg = (thread: any) => {
    const msgs = thread.messages || []
    if (!msgs.length) return 'No messages yet'
    const last = msgs[msgs.length - 1]
    if (last.is_deleted) return 'Message deleted'
    const name = last.sender_id === user?.id ? 'You' : last.users?.full_name?.split(' ')[0] || 'Someone'
    return name + ': ' + last.body
  }

  const nonMessageNotifs = notifications.filter(n => n.type !== 'message')
  const groupedNotifs = nonMessageNotifs.reduce((acc: Record<string, any[]>, notif) => {
    const key = notif.type || 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(notif)
    return acc
  }, {})

  return (<div className="min-h-screen flex" style={{ background: 'var(--content-bg)' }}>
      <Sidebar userRole={role} userDepartment={department} />

      <div
        className="flex flex-col flex-1 min-h-screen main-content-area"
        style={{
          // marginLeft: show sidebar offset on md+ screens only (mobile uses MobileNav)
          // isMediumScreen is false until mount, so no hydration mismatch
          marginLeft: mounted && !isMediumScreen ? 0 : leftWidth,
          // marginRight only on large screens where right panel is visible
          marginRight: showRight ? rightWidth : 0,
          transition: mounted ? 'margin 0.3s ease' : 'none',
        }}
      >

        <header
          className="hidden md:flex sticky top-0 z-30 items-center gap-3 px-5 print:hidden"
          style={{
            background: 'var(--header-bg)',
            borderBottom: '1px solid var(--header-border)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            minHeight: 60,
          }}
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold leading-tight truncate" style={{ color: 'var(--header-text)' }}>{pageTitle}</h1>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <Link href="/dashboard" className="flex items-center hover:opacity-70 transition">
                <Home className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
              </Link>
              {breadcrumbs.slice(1).map((crumb, i) => (
                <span key={crumb.path} className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                  {i === breadcrumbs.length - 2 ? (
                    <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{crumb.name}</span>
                  ) : (
                    <Link href={crumb.path} className="text-xs hover:opacity-70 transition" style={{ color: 'var(--text-secondary)' }}>{crumb.name}</Link>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Predictive Global Search */}
          <GlobalSearch user={user} />

          <div className="flex items-center gap-1 ml-auto">
            <ThemeToggle />
            <NotificationBell />
            <Link href="/dashboard/messages" className="p-2.5 rounded-xl transition relative" style={{ background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle className="w-4 h-4" />
              {messageThreads.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {messageThreads.length > 9 ? '9+' : messageThreads.length}
                </span>
              )}
            </Link>
            <Link href="/dashboard/settings" className="p-2 rounded-lg hover:opacity-80 transition">
              <Settings className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </Link>
            <UserAvatar />
            <form action="/auth/signout" method="post">
              <button type="submit" className="p-2 rounded-lg hover:opacity-70 transition">
                <LogOut className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </form>
          </div>
        </header>

        <header
          className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 print:hidden"
          style={{
            background: 'var(--header-bg)',
            borderBottom: '1px solid var(--header-border)',
            minHeight: 56,
          }}
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold leading-tight truncate" style={{ color: 'var(--header-text)' }}>
              {pageTitle}
            </h1>
            {breadcrumbs.length > 1 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Link href="/dashboard" className="flex items-center">
                  <Home className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                </Link>
                {breadcrumbs.slice(1, -1).map(crumb => (
                  <span key={crumb.path} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <Link href={crumb.path} className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {crumb.name}
                    </Link>
                  </span>
                ))}
              </div>
            )}
          </div>
          <UserAvatar />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto pt-20 md:pt-6">{children}</main>
      </div>

      {!hideRightPanel && (
        <button onClick={toggleRightPanel} className="hidden md:block fixed z-40 p-1.5 rounded-l-lg print:hidden"
          style={{ top: 70, right: showRight ? rightWidth : 0, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRight: 'none', boxShadow: '-2px 0 6px rgba(0,0,0,0.06)', transition: 'right 0.3s ease' }}>
          {showRight
            ? <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
            : <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />}
        </button>
      )}

      {!hideRightPanel && (
        <aside className="hidden md:flex fixed right-0 top-0 h-screen flex-col z-40 print:hidden"
          style={{ width: showRight ? rightWidth : 0, background: 'var(--card-bg)', borderLeft: showRight ? '1px solid var(--card-border)' : 'none', boxShadow: showRight ? '-2px 0 12px rgba(0,0,0,0.06)' : 'none', transition: 'width 0.3s ease', overflow: 'hidden' }}>
          <div className="flex flex-col h-full" style={{ width: rightWidth }}>

            <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--card-border)', minHeight: 60 }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Activity</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>Live</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-2">

                {Object.keys(groupedNotifs).length > 0 && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Notifications</p>
                    {Object.entries(groupedNotifs).map(([type, items]) => {
                      const latest = items[0]
                      const { icon: Icon, color } = getNotifIcon(type)
                      const isExpanded = expandedGroups[type]
                      const showAccordion = items.length > 3

                      return (
                        <div key={type} className="rounded-lg overflow-hidden mb-2" style={{ border: '1px solid var(--card-border)' }}>
                          <div 
                            onClick={async () => {
                              if (!latest.is_read) {
                                await supabase.from('notifications').update({ is_read: true }).eq('id', latest.id)
                                loadData()
                              }
                            }}
                            className="flex items-start gap-2 p-2.5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition"
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
                              <Icon className="w-3 h-3" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{latest.title}</p>
                              {latest.body && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{latest.body}</p>}
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{timeAgo(latest.created_at)}</p>
                            </div>
                            {!latest.is_read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 shadow-sm" style={{ background: 'var(--accent)' }} />}
                          </div>
                          {showAccordion && (
                            <>
                              <button onClick={() => setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }))}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs"
                                style={{ background: 'var(--table-header-bg)', color: 'var(--text-secondary)', borderTop: '1px solid var(--card-border)' }}>
                                <span>{items.length - 1} more</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                              {isExpanded && items.slice(1).map((item, i) => (
                                <div 
                                  key={i} 
                                  onClick={async () => {
                                    if (!item.is_read) {
                                      await supabase.from('notifications').update({ is_read: true }).eq('id', item.id)
                                      loadData()
                                    }
                                  }}
                                  className="flex items-start gap-2 p-2.5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition" 
                                  style={{ borderTop: '1px solid var(--card-border)' }}
                                >
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
                                    <Icon className="w-3 h-3" style={{ color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{timeAgo(item.created_at)}</p>
                                  </div>
                                  {!item.is_read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 shadow-sm" style={{ background: 'var(--accent)' }} />}
                                </div>
                              ))}
                            </>
                          )}
                          {!showAccordion && items.slice(1).map((item, i) => (
                            <div 
                              key={i} 
                              onClick={async () => {
                                if (!item.is_read) {
                                  await supabase.from('notifications').update({ is_read: true }).eq('id', item.id)
                                  loadData()
                                }
                              }}
                              className="flex items-start gap-2 p-2.5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition" 
                              style={{ borderTop: '1px solid var(--card-border)' }}
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
                                <Icon className="w-3 h-3" style={{ color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{timeAgo(item.created_at)}</p>
                              </div>
                              {!item.is_read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 shadow-sm" style={{ background: 'var(--accent)' }} />}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </>
                )}

                {messageThreads.length > 0 && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider mt-2 mb-2" style={{ color: 'var(--text-secondary)' }}>Messages</p>
                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
                      {messageThreads.slice(0, 3).map((thread, i) => (
                        <Link key={thread.id} href="/dashboard/messages"
                          className="flex items-start gap-2 p-2.5 hover:opacity-80 transition"
                          style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none', display: 'flex' }}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#1a73e820', color: '#1a73e8' }}>
                            {getThreadName(thread).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{getThreadName(thread)}</p>
                            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{getLastMsg(thread)}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{timeAgo(thread.updated_at)}</p>
                          </div>
                        </Link>
                      ))}
                      {messageThreads.length > 3 && (
                        <Link href="/dashboard/messages" className="block text-center py-2 text-xs" style={{ borderTop: '1px solid var(--card-border)', color: 'var(--accent)' }}>
                          View all {messageThreads.length} conversations
                        </Link>
                      )}
                    </div>
                  </>
                )}

                {notifications.length === 0 && messageThreads.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No activity yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--card-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Quick Actions</p>
                <button onClick={() => setEditingActions(!editingActions)} className="p-1 rounded" style={{ color: 'var(--text-secondary)' }}>
                  {editingActions ? <X className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                </button>
              </div>

              {editingActions ? (
                <div className="space-y-1">
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Select up to 4:</p>
                  {ALL_QUICK_ACTIONS.map(action => {
                    const isSelected = quickActions.some(q => q.href === action.href)
                    return (
                      <button key={action.href} onClick={() => {
                        if (isSelected) setQuickActions(prev => prev.filter(q => q.href !== action.href))
                        else if (quickActions.length < 4) setQuickActions(prev => [...prev, action])
                      }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                        style={{ background: isSelected ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--table-header-bg)', color: isSelected ? 'var(--accent)' : 'var(--text-secondary)', border: '1px solid ' + (isSelected ? 'var(--accent)' : 'var(--card-border)') }}>
                        {action.label}
                        {isSelected && <CheckCircle className="w-3 h-3" />}
                      </button>
                    )
                  })}
                  <button onClick={() => saveQuickActions(quickActions)} className="w-full py-2 rounded-lg text-xs font-medium mt-2" style={{ background: 'var(--accent)', color: 'white' }}>Save</button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {quickActions.map(link => (
                    <Link key={link.href} href={link.href}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition hover:opacity-80"
                      style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                      {link.label}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <LayoutInner>{children}</LayoutInner>
}
