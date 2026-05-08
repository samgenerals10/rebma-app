'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function UserAvatar() {
  const [user, setUser] = useState<any>(null)
  const [cacheBust, setCacheBust] = useState(Date.now())

  const loadUser = useCallback(async () => {
    const supabase = createClient()
    const { data: { user: auth } } = await supabase.auth.getUser()
    if (auth) {
      const { data } = await supabase
        .from('users')
        .select('full_name, avatar_url, role')
        .eq('id', auth.id)
        .single()
      if (data) {
        setUser(data)
        setCacheBust(Date.now())
      }
    }
  }, [])

  useEffect(() => {
    loadUser()
    const handler = () => {
      setTimeout(() => loadUser(), 500)
    }
    window.addEventListener('profile-updated', handler)
    return () => window.removeEventListener('profile-updated', handler)
  }, [loadUser])

  const avatarUrl = user?.avatar_url ? `${user.avatar_url}?t=${cacheBust}` : null

  return (
    <Link
      href="/dashboard/settings/profile"
      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:opacity-80 transition"
    >
      <div
        className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: 'var(--accent)' }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.full_name || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          user?.full_name?.[0]?.toUpperCase() || 'U'
        )}
      </div>
      <span
        className="text-sm font-medium hidden lg:inline"
        style={{ color: 'var(--header-text)' }}
      >
        {user?.full_name}
      </span>
    </Link>
  )
}
