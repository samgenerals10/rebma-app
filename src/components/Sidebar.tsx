'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft, ChevronRight, ChevronDown, TrendingUp, DollarSign, ShoppingCart,
  Package, Factory, Truck, Users, Home, Settings, BarChart3, ClipboardList,
  FileText, HelpCircle, Sun, Moon, Bell, MessageCircle, X, Send, Plus,
  CheckCircle, AlertTriangle, Clock, Info, ShieldAlert
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useSidebar } from '@/components/SidebarContext'
import { RebmaLogo } from '@/components/RebmaLogo'
import { SidebarAvatar } from '@/components/SidebarAvatar'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'


// Static configuration outside component for performance
const DEPT_SUB_MENUS: Record<string, any[]> = {
  management: [
    { name: 'Overview', href: '/dashboard/management', icon: Home },
    { name: 'Goods Receipts', href: '/dashboard/management/goods-receipts', icon: Package, pulse: true },
    { name: 'Set Prices', href: '/dashboard/management/set-price', icon: DollarSign },
    { name: 'Audit Trail', href: '/dashboard/management/audit', icon: ClipboardList },
  ],
  finance: [
    { name: 'Overview', href: '/dashboard/finance', icon: Home },
    { name: 'Pending Orders', href: '/dashboard/finance?tab=pending', icon: Clock, pulse: true },
    { name: 'Approved', href: '/dashboard/finance?tab=approved', icon: CheckCircle },
    { name: 'Rejected', href: '/dashboard/finance?tab=rejected', icon: X },
    { name: 'Production', href: '/dashboard/finance?tab=production', icon: Factory },
    { name: 'Price Updates', href: '/dashboard/finance?tab=prices', icon: DollarSign },
    { name: 'Record Payment', href: '/dashboard/finance/payments/new', icon: Plus },
    { name: 'Reports', href: '/dashboard/finance/reports', icon: BarChart3 },
    { name: 'Reconciliation', href: '/dashboard/finance/reconciliation', icon: DollarSign },
    { name: 'GPS Tracking', href: '/dashboard/dispatch/tracking', icon: Truck },
  ],
  marketing: [
    { name: 'Overview', href: '/dashboard/marketing', icon: Home },
    { name: 'Customers', href: '/dashboard/marketing/customers', icon: Users },
    { name: 'Orders', href: '/dashboard/marketing/orders', icon: ShoppingCart },
    { name: 'Demand Forecaster', href: '/dashboard/marketing/demand', icon: TrendingUp },
  ],
  operations: [
    { name: 'Overview', href: '/dashboard/operations', icon: Home },
    { name: 'Receive Goods', href: '/dashboard/operations/receive', icon: Plus },
    { name: 'Inventory', href: '/dashboard/operations?tab=inventory', icon: Package },
    { name: 'GPS Tracking', href: '/dashboard/dispatch/tracking', icon: Truck },
  ],
  production: [
    { name: 'Overview', href: '/dashboard/production', icon: Home },
    { name: 'Repack Jobs', href: '/dashboard/production/repack', icon: Factory },
    { name: 'Quality Checks', href: '/dashboard/production/quality', icon: CheckCircle },
  ],
  dispatch: [
    { name: 'Overview', href: '/dashboard/dispatch', icon: Home },
    { name: 'GPS Tracking', href: '/dashboard/dispatch/tracking', icon: Truck },
    { name: 'Trips', href: '/dashboard/dispatch/trips', icon: ClipboardList },
    { name: 'Vehicles', href: '/dashboard/dispatch/vehicles', icon: Truck },
  ],
  hr: [
    { name: 'Overview', href: '/dashboard/hr', icon: Home },
    { name: 'Employees', href: '/dashboard/hr/employees', icon: Users },
    { name: 'Payroll', href: '/dashboard/hr/payroll', icon: DollarSign },
  ],
  receptionist: [
    { name: 'Overview', href: '/dashboard/receptionist', icon: Home },
    { name: 'Attendance', href: '/dashboard/receptionist/attendance', icon: ClipboardList },
    { name: 'Visitors', href: '/dashboard/receptionist/visitors', icon: Users },
  ]
};

const DEPARTMENTS = [
  { key: 'management', name: 'Management', icon: TrendingUp },
  { key: 'finance', name: 'Finance', icon: DollarSign },
  { key: 'marketing', name: 'Marketing', icon: ShoppingCart },
  { key: 'operations', name: 'Operations', icon: Package },
  { key: 'production', name: 'Production', icon: Factory },
  { key: 'dispatch', name: 'Dispatch', icon: Truck },
  { key: 'hr', name: 'HR', icon: Users },
  { key: 'receptionist', name: 'Receptionist', icon: Users },
];

const MAIN_LINKS = [
  { key: 'overview', name: 'Overview', icon: Home, href: '/dashboard' },
  { key: 'reports', name: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
  { key: 'tasks', name: 'Tasks', icon: ClipboardList, href: '/dashboard/tasks' },
  { key: 'documents', name: 'Documents', icon: FileText, href: '/dashboard/documents' },
];

export default function Sidebar({ userRole, userDepartment }: { userRole: string; userDepartment: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { config, toggleDarkMode } = useTheme();
  const { isOpen, toggle } = useSidebar();
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const showAllDepartments = userRole === 'ceo' || userRole === 'manager';
  const visibleDepartments = showAllDepartments
    ? DEPARTMENTS
    : DEPARTMENTS.filter(d => d.key === userDepartment);

  const itemStyle = (isActive: boolean, isSub: boolean = false) => ({
    background: isActive ? (isSub ? 'rgba(255,255,255,0.1)' : 'var(--sidebar-active-bg)') : 'transparent',
    color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: isSub ? '8px 12px 8px 44px' : '10px 12px',
    transition: 'all 0.2s',
    textDecoration: 'none',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
    position: 'relative' as any,
  })

  return (
    <>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4" style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}>
        <RebmaLogo size={32} showText={true} />
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg" style={{ background: 'var(--card-border)' }}>
          <div className="w-6 h-0.5 bg-gray-600 mb-1.5" />
          <div className="w-6 h-0.5 bg-gray-600 mb-1.5" />
          <div className="w-6 h-0.5 bg-gray-600" />
        </button>
      </div>

      <button
        onClick={toggle}
        className="hidden md:flex fixed z-50 p-1.5 rounded-r-lg shadow items-center justify-center print:hidden"
        style={{
          top: 72,
          left: isOpen ? 256 : 80,
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderLeft: 'none',
          transition: 'left 0.3s',
        }}
      >
        {isOpen
          ? <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          : <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        }
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 print:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          width: isOpen ? 256 : 80,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--sidebar-border)', minHeight: 64 }}>
          {isOpen ? <RebmaLogo size={38} showText={true} /> : <RebmaLogo size={34} showText={false} />}
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1">
            <X className="w-5 h-5" style={{ color: 'var(--sidebar-text)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
          {isOpen && <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2 mt-1" style={{ color: 'var(--sidebar-text-muted)' }}>Main</p>}
          {MAIN_LINKS.map(link => {
            const Icon = link.icon
            const isActive = link.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link key={link.key} href={link.href} style={itemStyle(isActive) as any} title={!isOpen ? link.name : undefined} aria-label={link.name}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium">{link.name}</span>}
              </Link>
            )
          })}

          <div className="my-2 mx-2" style={{ borderTop: '1px solid var(--sidebar-border)' }} />

          {isOpen && <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--sidebar-text-muted)' }}>Departments</p>}
          {visibleDepartments.map(dept => {
            const Icon = dept.icon
            const deptPath = `/dashboard/${dept.key}`
            const isActive = pathname.startsWith(deptPath)
            const isExpanded = expandedDept === dept.key
            const subItems = DEPT_SUB_MENUS[dept.key] || []

            return (
              <div key={dept.key} className="flex flex-col">
                <Link 
                  href={deptPath}
                  onClick={() => {
                    // Toggle expansion but allow navigation
                    setExpandedDept(isExpanded ? null : dept.key)
                    if (!isOpen) toggle() // Open sidebar if collapsed
                  }}
                  style={itemStyle(isActive) as any} 
                  title={!isOpen ? dept.name : undefined}
                  className={`cursor-pointer group ${isActive ? 'ring-1 ring-inset ring-white/10' : ''}`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300" 
                    style={{ background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.15)', boxShadow: isActive ? '0 0 10px var(--accent)' : 'none' }}>
                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  </div>
                  {isOpen && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className={`text-sm font-medium truncate ${isActive ? 'font-bold' : ''}`} style={{ color: isActive ? 'var(--sidebar-active-text)' : 'inherit' }}>{dept.name}</span>
                      {subItems.length > 0 && (
                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                        </div>
                      )}
                    </div>
                  )}
                </Link>

                {/* Sub Menu with smooth CSS transition */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {subItems.map((sub, idx) => {
                    const SubIcon = sub.icon
                    const isSubActive = pathname === sub.href || (typeof window !== 'undefined' && (pathname + window.location.search).includes(sub.href))
                    
                    return (
                      <Link 
                        key={idx} 
                        href={sub.href} 
                        style={itemStyle(isSubActive, true) as any}
                        className="group relative"
                      >
                        <SubIcon className={`w-4 h-4 flex-shrink-0 transition-opacity ${isSubActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                        <span className={`text-[13px] font-medium ${isSubActive ? 'font-bold' : ''}`}>{sub.name}</span>
                        {sub.pulse && (
                          <div className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 animate-attention" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-2 pb-3 space-y-0.5" style={{ borderTop: '1px solid var(--sidebar-border)', paddingTop: 8 }}>
          <Link href="/dashboard/help" style={itemStyle(pathname === '/dashboard/help') as any} title={!isOpen ? 'Help' : undefined}>
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Help Center</span>}
          </Link>
          <Link href="/dashboard/settings" style={itemStyle(pathname.startsWith('/dashboard/settings')) as any} title={!isOpen ? 'Settings' : undefined}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Settings</span>}
          </Link>
          <button onClick={toggleDarkMode} style={itemStyle(false) as any} title={!isOpen ? 'Toggle Mode' : undefined}>
            {config.darkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {isOpen && <span className="text-sm font-medium">{config.darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          {isOpen && <SidebarAvatar userRole={userRole} userDepartment={userDepartment} />}
        </div>
      </aside>
    </>
  )
}

export function ThemeToggle() {
  const { config, toggleDarkMode } = useTheme()
  return (
    <button onClick={toggleDarkMode} className="p-2.5 rounded-xl transition" style={{ background: 'var(--card-border)', color: 'var(--text-secondary)' }}>
      {config.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, user } = useAppStore()
  const unreadCount = notifications.filter(n => !n.is_read).length
  const supabase = createClient()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .or(`recipient_id.eq.${user.id},recipient_department.eq.${user.department}`)
  }

  const getIcon = (type: string) => {
    if (type?.includes('approved')) return { icon: CheckCircle, color: '#059669' }
    if (type?.includes('rejected') || type?.includes('failed')) return { icon: AlertTriangle, color: '#dc2626' }
    if (type?.includes('pending') || type?.includes('receipt')) return { icon: Clock, color: '#f59e0b' }
    return { icon: Info, color: '#1a73e8' }
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

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 rounded-xl transition relative" style={{ background: 'var(--card-border)', color: 'var(--text-secondary)' }}>
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-attention">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs" style={{ color: 'var(--accent)' }}>Mark all read</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No notifications yet</p>
              </div>
            )}
            {notifications.map((notif, i) => {
              const { icon: Icon, color } = getIcon(notif.type)
              return (
                <div key={notif.id} className="p-3 flex items-start gap-3 cursor-pointer hover:opacity-80"
                  style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none', background: !notif.is_read ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{notif.title}</p>
                    {notif.body && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{notif.body}</p>}
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--accent)' }} />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function MessagingSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [threads, setThreads] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [view, setView] = useState<'list' | 'thread' | 'new'>('list')
  const [activeThread, setActiveThread] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')
  const [recipientType, setRecipientType] = useState<'person' | 'department'>('department')
  const [recipientDept, setRecipientDept] = useState('')
  const [recipientId, setRecipientId] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const supabase = createClient()
  const ref = useRef<HTMLDivElement>(null)

  const departments = ['ceo', 'management', 'finance', 'marketing', 'operations', 'production', 'dispatch', 'hr']

  useEffect(() => {
    loadData()
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        if (activeThread) loadThreadMessages(activeThread.id)
        loadData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    setCurrentUser(userData)

    const { data: allUsers } = await supabase.from('users').select('id, full_name, department, role').eq('status', 'active')
    if (allUsers) setUsers(allUsers)

    const { data: recipients } = await supabase
      .from('message_recipients')
      .select('thread_id, is_read')
      .or(`recipient_id.eq.${user.id},recipient_department.eq.${userData?.department}`)

    if (recipients) {
      const threadIds = [...new Set(recipients.map(r => r.thread_id))]
      const unread = recipients.filter(r => !r.is_read).length
      setUnreadCount(unread)

      if (threadIds.length > 0) {
        const { data: threadData } = await supabase
          .from('message_threads')
          .select('*, messages(*, users:sender_id(full_name, department))')
          .in('id', threadIds)
          .order('updated_at', { ascending: false })
        if (threadData) setThreads(threadData)
      }
    }
  }

  const loadThreadMessages = async (threadId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, users:sender_id(full_name, department)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !currentUser) return
    await supabase
      .from('message_recipients')
      .update({ is_read: true, last_read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .or(`recipient_id.eq.${user.id},recipient_department.eq.${currentUser.department}`)
    loadData()
  }

  const openThread = (thread: any) => {
    setActiveThread(thread)
    loadThreadMessages(thread.id)
    setView('thread')
  }

  const sendReply = async () => {
    if (!newMessage.trim() || !activeThread || !currentUser) return
    setSending(true)
    await supabase.from('messages').insert({ thread_id: activeThread.id, sender_id: currentUser.id, body: newMessage.trim() })
    await supabase.from('message_threads').update({ updated_at: new Date().toISOString() }).eq('id', activeThread.id)
    setNewMessage('')
    loadThreadMessages(activeThread.id)
    setSending(false)
  }

  const sendNewMessage = async () => {
    if (!newSubject.trim() || !newBody.trim() || !currentUser) return
    setSending(true)

    const { data: thread } = await supabase
      .from('message_threads')
      .insert({ subject: newSubject.trim(), created_by: currentUser.id })
      .select('id')
      .single()

    if (!thread) { setSending(false); return }

    await supabase.from('messages').insert({ thread_id: thread.id, sender_id: currentUser.id, body: newBody.trim() })

    if (recipientType === 'department') {
      await supabase.from('message_recipients').insert({ thread_id: thread.id, recipient_department: recipientDept })
    } else {
      await supabase.from('message_recipients').insert({ thread_id: thread.id, recipient_id: recipientId })
    }

    // Also add sender as recipient so they can see it
    await supabase.from('message_recipients').insert({ thread_id: thread.id, recipient_id: currentUser.id, is_read: true })

    // Send notification
    const notifData = {
      sender_id: currentUser.id,
      title: 'New Message: ' + newSubject.trim(),
      body: newBody.trim().slice(0, 100),
      type: 'message',
      reference_id: thread.id,
      reference_type: 'message_thread',
      is_read: false
    }

    if (recipientType === 'department') {
      await supabase.from('notifications').insert({ ...notifData, recipient_department: recipientDept })
    } else {
      await supabase.from('notifications').insert({ ...notifData, recipient_id: recipientId })
    }

    setNewSubject(''); setNewBody(''); setRecipientDept(''); setRecipientId('')
    setView('list')
    loadData()
    setSending(false)
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

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => window.location.href = '/dashboard/messages'}
        className="p-2.5 rounded-xl transition relative" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
        <MessageCircle className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', maxHeight: '480px' }}>

          {/* Header */}
          <div className="p-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-2">
              {view !== 'list' && (
                <button onClick={() => setView('list')} style={{ color: 'var(--text-secondary)' }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {view === 'list' ? 'Messages' : view === 'new' ? 'New Message' : activeThread?.subject}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {view === 'list' && (
                <button onClick={() => setView('new')} className="p-1 rounded-lg" style={{ background: 'var(--accent)', color: 'white' }}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)}><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button>
            </div>
          </div>

          {/* List view */}
          {view === 'list' && (
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 && (
                <div className="p-8 text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No messages yet</p>
                  <button onClick={() => setView('new')} className="mt-3 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--accent)', color: 'white' }}>
                    Send a message
                  </button>
                </div>
              )}
              {threads.map((thread, i) => {
                const lastMsg = thread.messages?.[thread.messages.length - 1]
                return (
                  <div key={thread.id} onClick={() => openThread(thread)} className="p-3 cursor-pointer hover:opacity-80"
                    style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{thread.subject}</p>
                      <p className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{timeAgo(thread.updated_at)}</p>
                    </div>
                    {lastMsg && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                        {lastMsg.users?.full_name}: {lastMsg.body}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Thread view */}
          {view === 'thread' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === currentUser?.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%]">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {isMe ? 'You' : msg.users?.full_name} · {timeAgo(msg.created_at)}
                        </p>
                        <div className="px-3 py-2 rounded-xl text-xs" style={{
                          background: isMe ? 'var(--accent)' : 'var(--table-header-bg)',
                          color: isMe ? 'white' : 'var(--text-primary)',
                          borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px'
                        }}>
                          {msg.body}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--card-border)' }}>
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                <button onClick={sendReply} disabled={sending} className="p-2 rounded-lg" style={{ background: 'var(--accent)', color: 'white' }}>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {/* New message view */}
          {view === 'new' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Send to</label>
                <div className="flex gap-2 mb-2">
                  <button onClick={() => setRecipientType('department')}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: recipientType === 'department' ? 'var(--accent)' : 'var(--table-header-bg)', color: recipientType === 'department' ? 'white' : 'var(--text-secondary)', border: '1px solid var(--card-border)' }}>
                    Department
                  </button>
                  <button onClick={() => setRecipientType('person')}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: recipientType === 'person' ? 'var(--accent)' : 'var(--table-header-bg)', color: recipientType === 'person' ? 'white' : 'var(--text-secondary)', border: '1px solid var(--card-border)' }}>
                    Person
                  </button>
                </div>
                {recipientType === 'department' ? (
                  <select value={recipientDept} onChange={e => setRecipientDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none capitalize"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                ) : (
                  <select value={recipientId} onChange={e => setRecipientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                    <option value="">Select person...</option>
                    {users.filter(u => u.id !== currentUser?.id).map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.department})</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Message subject"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Type your message..." rows={4}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
              <button onClick={sendNewMessage} disabled={sending || !newSubject || !newBody || (!recipientDept && !recipientId)}
                className="w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'white' }}>
                <Send className="w-3.5 h-3.5" /> {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
