'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft, ChevronRight, TrendingUp, DollarSign, ShoppingCart,
  Package, Factory, Truck, Users, Home, Settings, BarChart3, ClipboardList,
  FileText, HelpCircle, Sun, Moon, Bell, MessageCircle, X, Send, Plus,
  CheckCircle, AlertTriangle, Clock, Info
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useSidebar } from '@/components/SidebarContext'
import { RebmaLogo } from '@/components/RebmaLogo'
import { SidebarAvatar } from '@/components/SidebarAvatar'
import { createClient } from '@/lib/supabase/client'

export default function Sidebar({ userRole, userDepartment }: { userRole: string; userDepartment: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { config, toggleDarkMode } = useTheme()
  const { isOpen, toggle } = useSidebar()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const departments = [
    { key: 'management', name: 'Management', icon: TrendingUp },
    { key: 'finance', name: 'Finance', icon: DollarSign },
    { key: 'marketing', name: 'Marketing', icon: ShoppingCart },
    { key: 'operations', name: 'Operations', icon: Package },
    { key: 'production', name: 'Production', icon: Factory },
    { key: 'dispatch', name: 'Dispatch', icon: Truck },
    { key: 'hr', name: 'HR', icon: Users },
  ]

  const mainLinks = [
    { key: 'overview', name: 'Overview', icon: Home, href: '/dashboard' },
    { key: 'reports', name: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
    { key: 'tasks', name: 'Tasks', icon: ClipboardList, href: '/dashboard/tasks' },
    { key: 'documents', name: 'Documents', icon: FileText, href: '/dashboard/documents' },
  ]

  const showAllDepartments = userRole === 'ceo' || userRole === 'manager'
  const visibleDepartments = showAllDepartments
    ? departments
    : departments.filter(d => d.key === userDepartment)

  const itemStyle = (isActive: boolean) => ({
    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
    color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    transition: 'all 0.2s',
    textDecoration: 'none',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
  })

  return (
    <>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      <button
        onClick={toggle}
        className="hidden md:flex fixed z-50 p-1.5 rounded-r-lg shadow items-center justify-center"
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
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {isOpen && <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2 mt-1" style={{ color: 'var(--sidebar-text-muted)' }}>Main</p>}
          {mainLinks.map(link => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.key} href={link.href} style={itemStyle(isActive) as any} title={!isOpen ? link.name : undefined}>
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
            return (
              <Link key={dept.key} href={deptPath} style={itemStyle(isActive) as any} title={!isOpen ? dept.name : undefined}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Icon className="w-4 h-4" />
                </div>
                {isOpen && <span className="text-sm font-medium truncate">{dept.name}</span>}
              </Link>
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
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadNotifications()
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => loadNotifications())
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

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('department').eq('id', user.id).single()
    const dept = userData?.department

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`recipient_id.eq.${user.id},recipient_department.eq.${dept}`)
      .order('created_at', { ascending: false })

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('department').eq('id', user.id).single()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .or(`recipient_id.eq.${user.id},recipient_department.eq.${userData?.department}`)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
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
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
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

  const departments = ['management', 'finance', 'marketing', 'operations', 'production', 'dispatch', 'hr']

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
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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
