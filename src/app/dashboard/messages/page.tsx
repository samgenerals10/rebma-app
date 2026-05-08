'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Plus, Send, Phone, Video, MoreVertical, Smile,
  Paperclip, X, CheckCheck, Users, User, MessageCircle, Trash2, Reply, ArrowLeft
} from 'lucide-react'

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✅']
const DEPARTMENTS = ['management', 'finance', 'marketing', 'operations', 'production', 'dispatch', 'hr']

export default function MessagesPage() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [threads, setThreads] = useState<any[]>([])
  const [activeThread, setActiveThread] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [showEmoji, setShowEmoji] = useState<string | null>(null)
  const [newChatType, setNewChatType] = useState<'person' | 'department'>('person')
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (!currentUser) return
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        if (activeThread && payload.new.thread_id === activeThread.id) loadMessages(activeThread.id)
        loadThreads(currentUser)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUser, activeThread])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
    setCurrentUser(userData)
    await supabase.from('users').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', user.id)
    const { data: users } = await supabase.from('users').select('id, full_name, department, role, avatar_url, is_online, last_seen').eq('status', 'active')
    if (users) setAllUsers(users)
    await loadThreads(userData)
  }

  const loadThreads = async (user: any) => {
    const { data: recipients } = await supabase
      .from('message_recipients')
      .select('thread_id')
      .or(`recipient_id.eq.${user.id},recipient_department.eq.${user.department}`)
    if (!recipients?.length) return
    const threadIds = [...new Set(recipients.map((r: any) => r.thread_id))]
    const { data } = await supabase
      .from('message_threads')
      .select('*, message_recipients(recipient_id, recipient_department, users:recipient_id(id, full_name, department, avatar_url, is_online)), messages(id, body, created_at, sender_id, is_deleted, users:sender_id(full_name))')
      .in('id', threadIds)
      .order('last_message_at', { ascending: false })
    if (data) setThreads(data)
  }

  const loadMessages = async (threadId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, users:sender_id(id, full_name, avatar_url, department), reply:reply_to_id(id, body, users:sender_id(full_name)), message_reactions(*)')
      .eq('thread_id', threadId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
    await supabase.from('message_recipients').update({ is_read: true, last_read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .or(`recipient_id.eq.${currentUser?.id},recipient_department.eq.${currentUser?.department}`)
  }

  const openThread = async (thread: any) => {
    setActiveThread(thread)
    setMobileShowChat(true)
    await loadMessages(thread.id)
  }

  const getThreadName = (thread: any) => {
    if (thread.thread_type === 'department') {
      const dept = thread.department || ''
      return dept.charAt(0).toUpperCase() + dept.slice(1) + ' Department'
    }
    const recipients = thread.message_recipients || []
    const other = recipients.find((r: any) => r.recipient_id && r.recipient_id !== currentUser?.id)
    if (other?.users?.full_name) return other.users.full_name
    return thread.subject || 'Direct Message'
  }

  const getThreadSub = (thread: any) => {
    if (thread.thread_type === 'department') return 'Department group'
    const recipients = thread.message_recipients || []
    const other = recipients.find((r: any) => r.recipient_id && r.recipient_id !== currentUser?.id)
    return other?.users?.department ? other.users.department.charAt(0).toUpperCase() + other.users.department.slice(1) : 'Direct message'
  }

  const getThreadOnline = (thread: any) => {
    if (thread.thread_type === 'department') return false
    const recipients = thread.message_recipients || []
    const other = recipients.find((r: any) => r.recipient_id && r.recipient_id !== currentUser?.id)
    return other?.users?.is_online || false
  }

  const getLastMessage = (thread: any) => {
    const msgs = thread.messages || []
    if (!msgs.length) return 'No messages yet'
    const last = msgs[msgs.length - 1]
    if (last.is_deleted) return 'Message deleted'
    const name = last.sender_id === currentUser?.id ? 'You' : last.users?.full_name?.split(' ')[0] || 'Someone'
    return name + ': ' + last.body
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread || !currentUser) return
    setSending(true)
    await supabase.from('messages').insert({ thread_id: activeThread.id, sender_id: currentUser.id, body: newMessage.trim(), reply_to_id: replyTo?.id || null })
    await supabase.from('message_threads').update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', activeThread.id)
    const { data: recipients } = await supabase.from('message_recipients').select('*').eq('thread_id', activeThread.id)
    for (const r of recipients || []) {
      if (r.recipient_id && r.recipient_id !== currentUser.id) {
        await supabase.from('notifications').insert({ recipient_id: r.recipient_id, sender_id: currentUser.id, title: currentUser.full_name + ': ' + newMessage.trim().slice(0, 60), body: newMessage.trim(), type: 'message', reference_id: activeThread.id, reference_type: 'message_thread', is_read: false })
      }
      if (r.recipient_department && r.recipient_department !== currentUser.department) {
        await supabase.from('notifications').insert({ recipient_department: r.recipient_department, sender_id: currentUser.id, title: currentUser.full_name + ': ' + newMessage.trim().slice(0, 60), body: newMessage.trim(), type: 'message', reference_id: activeThread.id, reference_type: 'message_thread', is_read: false })
      }
    }
    setNewMessage(''); setReplyTo(null); setSending(false)
    await loadMessages(activeThread.id)
    await loadThreads(currentUser)
  }

  const startNewChat = async (recipientId?: string, dept?: string) => {
    // Check if thread already exists
    if (recipientId) {
      const existing = threads.find(t => {
        if (t.thread_type !== "direct") return false
        const recipients = t.message_recipients || []
        return recipients.some((r: any) => r.recipient_id === recipientId)
      })
      if (existing) { openThread(existing); setShowNewChat(false); setUserSearch(""); return }
    }
    if (!currentUser || (!recipientId && !dept)) return
    const { data: thread } = await supabase.from('message_threads').insert({ subject: dept ? dept + ' department' : 'Direct message', created_by: currentUser.id, thread_type: dept ? 'department' : 'direct', department: dept || null, last_message_at: new Date().toISOString() }).select('id').single()
    if (!thread) return
    if (dept) await supabase.from('message_recipients').insert({ thread_id: thread.id, recipient_department: dept })
    else await supabase.from('message_recipients').insert({ thread_id: thread.id, recipient_id: recipientId })
    await supabase.from('message_recipients').insert({ thread_id: thread.id, recipient_id: currentUser.id, is_read: true })
    await loadThreads(currentUser)
    const { data: newThread } = await supabase.from('message_threads').select('*, message_recipients(recipient_id, recipient_department, users:recipient_id(id, full_name, department, avatar_url, is_online)), messages(id, body, created_at, sender_id, is_deleted, users:sender_id(full_name))').eq('id', thread.id).single()
    if (newThread) openThread(newThread)
    setShowNewChat(false); setUserSearch('')
  }

  const deleteMessage = async (msgId: string) => {
    await supabase.from('messages').update({ is_deleted: true }).eq('id', msgId)
    await loadMessages(activeThread.id)
  }

  const addReaction = async (msgId: string, emoji: string) => {
    const { data: existing } = await supabase.from('message_reactions').select('*').eq('message_id', msgId).eq('user_id', currentUser.id).eq('emoji', emoji).single()
    if (existing) await supabase.from('message_reactions').delete().eq('id', existing.id)
    else await supabase.from('message_reactions').insert({ message_id: msgId, user_id: currentUser.id, emoji })
    setShowEmoji(null)
    await loadMessages(activeThread.id)
  }

  const timeStr = (date: string) => {
    const d = new Date(date)
    const isToday = d.toDateString() === new Date().toDateString()
    if (isToday) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }

  const filteredThreads = threads.filter(t => getThreadName(t).toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredUsers = allUsers.filter(u => u.id !== currentUser?.id && (u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || u.department?.toLowerCase().includes(userSearch.toLowerCase())))

  return (
    <div className="flex h-[calc(100vh-120px)] rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--card-border)' }}>
      {/* LEFT */}
      <div className={`flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`} style={{ width: 300, borderRight: '1px solid var(--card-border)', flexShrink: 0 }}>
        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Messages</h2>
          <button onClick={() => setShowNewChat(true)} className="p-2 rounded-lg" style={{ background: 'var(--accent)', color: 'white' }}><Plus className="w-4 h-4" /></button>
        </div>
        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search conversations..." className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No conversations yet</p>
              <button onClick={() => setShowNewChat(true)} className="mt-3 px-4 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--accent)', color: 'white' }}>New Message</button>
            </div>
          )}
          {filteredThreads.map((thread, i) => {
            const isActive = activeThread?.id === thread.id
            const isDept = thread.thread_type === 'department'
            const isOnline = getThreadOnline(thread)
            const msgs = thread.messages || []
            const lastTime = msgs.length ? msgs[msgs.length - 1].created_at : thread.updated_at
            return (
              <div key={thread.id} onClick={() => openThread(thread)} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:opacity-80"
                style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none', background: isActive ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent', borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent' }}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: isDept ? '#8b5cf620' : '#1a73e820', color: isDept ? '#8b5cf6' : '#1a73e8' }}>
                    {isDept ? <Users className="w-5 h-5" /> : getThreadName(thread).charAt(0).toUpperCase()}
                  </div>
                  {!isDept && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: isOnline ? '#059669' : 'var(--text-muted)', borderColor: 'var(--card-bg)' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{getThreadName(thread)}</p>
                    <p className="text-xs flex-shrink-0 ml-1" style={{ color: 'var(--text-secondary)' }}>{lastTime ? timeStr(lastTime) : ''}</p>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{getLastMessage(thread)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT */}
      <div className={`flex flex-col flex-1 ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeThread ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageCircle className="w-16 h-16 opacity-10" style={{ color: 'var(--text-secondary)' }} />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Select a conversation</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>or start a new one</p>
            <button onClick={() => setShowNewChat(true)} className="px-4 py-2 rounded-lg text-sm font-medium mt-2" style={{ background: 'var(--accent)', color: 'white' }}>New Message</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <button onClick={() => { setMobileShowChat(false); setActiveThread(null) }} className="md:hidden p-1"><ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: activeThread.thread_type === 'department' ? '#8b5cf620' : '#1a73e820', color: activeThread.thread_type === 'department' ? '#8b5cf6' : '#1a73e8' }}>
                  {activeThread.thread_type === 'department' ? <Users className="w-4 h-4" /> : getThreadName(activeThread).charAt(0).toUpperCase()}
                </div>
                {activeThread.thread_type !== 'department' && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: getThreadOnline(activeThread) ? '#059669' : 'var(--text-muted)', borderColor: 'var(--card-bg)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{getThreadName(activeThread)}</p>
                <p className="text-xs capitalize" style={{ color: getThreadOnline(activeThread) ? '#059669' : 'var(--text-muted)' }}>
                  {getThreadOnline(activeThread) ? 'Online' : getThreadSub(activeThread)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg" style={{ background: 'var(--table-header-bg)', color: '#059669' }} title="Audio call (coming soon)"><Phone className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg" style={{ background: 'var(--table-header-bg)', color: '#1a73e8' }} title="Video call (coming soon)"><Video className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg" style={{ background: 'var(--table-header-bg)', color: 'var(--text-secondary)' }}><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <MessageCircle className="w-10 h-10 opacity-10" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No messages yet. Say hello!</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === currentUser?.id
                const showAvatar = !isMe && (i === 0 || messages[i-1]?.sender_id !== msg.sender_id)
                const reactions = msg.message_reactions || []
                const grouped = reactions.reduce((acc: any, r: any) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc }, {})
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mr-2 mt-5" style={{ background: '#1a73e820', color: '#1a73e8', visibility: showAvatar ? 'visible' : 'hidden' }}>
                        {msg.users?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className={`max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {showAvatar && !isMe && <p className="text-xs mb-1 ml-1" style={{ color: 'var(--text-secondary)' }}>{msg.users?.full_name} · <span className="capitalize">{msg.users?.department}</span></p>}
                      {msg.reply && (
                        <div className="px-3 py-1.5 rounded-lg mb-1 text-xs border-l-2 max-w-full" style={{ background: 'var(--table-header-bg)', borderColor: 'var(--accent)', color: 'var(--text-secondary)' }}>
                          <p className="font-medium" style={{ color: 'var(--accent)' }}>{msg.reply.users?.full_name}</p>
                          <p className="truncate">{msg.reply.body}</p>
                        </div>
                      )}
                      <div className="relative">
                        <div className="px-3 py-2 text-sm" style={{ background: isMe ? 'var(--accent)' : 'var(--table-header-bg)', color: isMe ? 'white' : 'var(--text-primary)', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}>
                          {msg.body}
                        </div>
                        <div className={`absolute top-1 ${isMe ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'} hidden group-hover:flex items-center gap-0.5`}>
                          <button onClick={() => setShowEmoji(showEmoji === msg.id ? null : msg.id)} className="p-1 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}><Smile className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} /></button>
                          <button onClick={() => setReplyTo(msg)} className="p-1 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}><Reply className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} /></button>
                          {isMe && <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}><Trash2 className="w-3 h-3" style={{ color: '#dc2626' }} /></button>}
                        </div>
                        {showEmoji === msg.id && (
                          <div className="absolute bottom-8 left-0 z-50 flex gap-1 p-2 rounded-xl shadow-lg" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                            {EMOJIS.map(emoji => <button key={emoji} onClick={() => addReaction(msg.id, emoji)} className="text-lg hover:scale-125 transition-transform">{emoji}</button>)}
                          </div>
                        )}
                      </div>
                      {Object.keys(grouped).length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {Object.entries(grouped).map(([emoji, count]: any) => (
                            <button key={emoji} onClick={() => addReaction(msg.id, emoji)} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)' }}>
                              {emoji} <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-xs mt-0.5 mx-1" style={{ color: 'var(--text-secondary)' }}>
                        {timeStr(msg.created_at)}
                        {isMe && <CheckCheck className="w-3 h-3 inline ml-1" style={{ color: 'var(--accent)' }} />}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {replyTo && (
              <div className="px-4 py-2 flex items-center gap-3 flex-shrink-0" style={{ borderTop: '1px solid var(--card-border)', background: 'var(--table-header-bg)' }}>
                <div className="flex-1 border-l-2 pl-2" style={{ borderColor: 'var(--accent)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Replying to {replyTo.users?.full_name || 'message'}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{replyTo.body}</p>
                </div>
                <button onClick={() => setReplyTo(null)}><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button>
              </div>
            )}

            <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--card-border)' }}>
              <button className="p-2 rounded-lg flex-shrink-0" style={{ color: 'var(--text-secondary)' }} onClick={() => fileInputRef.current?.click()}><Paperclip className="w-4 h-4" /></button>
              <input ref={fileInputRef} type="file" className="hidden" />
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
              <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="p-2.5 rounded-full flex-shrink-0 disabled:opacity-50" style={{ background: 'var(--accent)', color: 'white' }}><Send className="w-4 h-4" /></button>
            </div>
          </>
        )}
      </div>

      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>New Message</h3>
              <button onClick={() => { setShowNewChat(false); setUserSearch('') }}><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setNewChatType('person')} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5" style={{ background: newChatType === 'person' ? 'var(--accent)' : 'var(--table-header-bg)', color: newChatType === 'person' ? 'white' : 'var(--text-secondary)', border: '1px solid var(--card-border)' }}><User className="w-3.5 h-3.5" /> Person</button>
                <button onClick={() => setNewChatType('department')} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5" style={{ background: newChatType === 'department' ? 'var(--accent)' : 'var(--table-header-bg)', color: newChatType === 'department' ? 'white' : 'var(--text-secondary)', border: '1px solid var(--card-border)' }}><Users className="w-3.5 h-3.5" /> Department</button>
              </div>
              {newChatType === 'person' ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                    <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or department..." className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-lg" style={{ border: '1px solid var(--card-border)' }}>
                    {filteredUsers.map((u, i) => (
                      <button key={u.id} onClick={() => startNewChat(u.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:opacity-80 transition" style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}>
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#1a73e820', color: '#1a73e8' }}>{u.full_name?.charAt(0) || '?'}</div>
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: u.is_online ? '#059669' : 'var(--card-border)', borderColor: 'var(--card-bg)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.full_name}</p>
                          <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{u.department} · {u.role}</p>
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && <div className="p-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>No users found</div>}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {DEPARTMENTS.map(dept => (
                    <button key={dept} onClick={() => startNewChat(undefined, dept)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:opacity-80 transition" style={{ background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#8b5cf620', color: '#8b5cf6' }}><Users className="w-4 h-4" /></div>
                      <p className="text-sm font-medium capitalize">{dept}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
