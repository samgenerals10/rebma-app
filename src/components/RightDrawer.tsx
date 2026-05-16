'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X, Bell, MessageCircle, CheckCircle, AlertTriangle, Info, Package, Clock, ChevronRight
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  return Math.floor(hrs / 24) + 'd ago'
}

function getNotifIcon(type: string) {
  if (type?.includes('approved')) return { icon: CheckCircle, color: '#059669' }
  if (type?.includes('rejected') || type?.includes('failed')) return { icon: AlertTriangle, color: '#dc2626' }
  if (type?.includes('message')) return { icon: MessageCircle, color: '#1a73e8' }
  if (type?.includes('receipt') || type?.includes('goods')) return { icon: Package, color: '#8b5cf6' }
  if (type?.includes('pending')) return { icon: Clock, color: '#f59e0b' }
  return { icon: Info, color: '#1a73e8' }
}

export default function RightDrawer() {
  const drawerOpen = useAppStore(s => s.drawerOpen)
  const drawerTab = useAppStore(s => s.drawerTab)
  const closeDrawer = useAppStore(s => s.closeDrawer)
  const setDrawerTab = useAppStore(s => s.setDrawerTab)
  const notifications = useAppStore(s => s.notifications)
  const messageThreads = useAppStore(s => s.messageThreads)
  const user = useAppStore(s => s.user)
  const markNotificationsRead = useAppStore(s => s.markNotificationsRead)
  const pathname = usePathname()

  useEffect(() => {
    closeDrawer()
  }, [pathname, closeDrawer])

  const markTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (markTimerRef.current) {
      clearTimeout(markTimerRef.current)
      markTimerRef.current = null
    }
    if (!drawerOpen || drawerTab !== 'alerts') return

    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    markTimerRef.current = setTimeout(async () => {
      const supabase = createClient()
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
      markNotificationsRead(unreadIds)
    }, 2000)

    return () => {
      if (markTimerRef.current) clearTimeout(markTimerRef.current)
    }
  }, [drawerOpen, drawerTab, notifications, markNotificationsRead])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, closeDrawer])

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

  const unreadAlerts = notifications.filter(n => !n.is_read).length
  const unreadMessages = messageThreads.filter((t: any) => {
    const msgs = t.messages || []
    return msgs.some((m: any) => m.sender_id !== user?.id && !m.is_deleted)
  }).length

  return (
    <>
      <div
        onClick={closeDrawer}
        className="md:hidden fixed inset-0 z-50"
        style={{
          background: 'rgba(0,0,0,0.5)',
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      <aside
        className="md:hidden fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: '85%',
          maxWidth: 420,
          background: 'var(--card-bg)',
          boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-hidden={!drawerOpen}
      >
        <div className="flex-shrink-0" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Activity</h2>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-lg"
              style={{ background: 'var(--table-header-bg)' }}
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>

          <div className="flex px-4 gap-1">
            <button
              onClick={() => setDrawerTab('messages')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium relative"
              style={{
                color: drawerTab === 'messages' ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: '2px solid ' + (drawerTab === 'messages' ? 'var(--accent)' : 'transparent'),
              }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Messages</span>
              {unreadMessages > 0 && (
                <span
                  className="text-xs rounded-full px-1.5 py-0.5 font-bold"
                  style={{ background: '#dc2626', color: 'white', minWidth: 18, fontSize: 10 }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>
            <button
              onClick={() => setDrawerTab('alerts')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium relative"
              style={{
                color: drawerTab === 'alerts' ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: '2px solid ' + (drawerTab === 'alerts' ? 'var(--accent)' : 'transparent'),
              }}
            >
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
              {unreadAlerts > 0 && (
                <span
                  className="text-xs rounded-full px-1.5 py-0.5 font-bold"
                  style={{ background: '#dc2626', color: 'white', minWidth: 18, fontSize: 10 }}
                >
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--content-bg)' }}>
          {drawerTab === 'messages' ? (
            <div className="p-3">
              {messageThreads.length === 0 ? (
                <div className="text-center py-16">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No conversations yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {messageThreads.map((thread: any) => (
                      <Link
                        key={thread.id}
                        href="/dashboard/messages"
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{
                          background: 'var(--card-bg)',
                          border: '1px solid var(--card-border)',
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                          style={{
                            background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                            color: 'var(--accent)',
                            fontSize: 14,
                          }}
                        >
                          {getThreadName(thread).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                              {getThreadName(thread)}
                            </p>
                            <p className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                              {timeAgo(thread.last_message_at || thread.updated_at)}
                            </p>
                          </div>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {getLastMsg(thread)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/messages"
                    className="flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-xl text-sm font-medium"
                    style={{
                      background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                      color: 'var(--accent)',
                    }}
                  >
                    View all conversations <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="p-3">
              {notifications.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif: any) => {
                    const { icon: Icon, color } = getNotifIcon(notif.type)
                    return (
                      <div
                        key={notif.id}
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{
                          background: 'var(--card-bg)',
                          border: '1px solid var(--card-border)',
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: color + '20' }}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                              {notif.title}
                            </p>
                            {!notif.is_read && (
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                                style={{ background: 'var(--accent)' }}
                              />
                            )}
                          </div>
                          {notif.body && (
                            <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                              {notif.body}
                            </p>
                          )}
                          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
