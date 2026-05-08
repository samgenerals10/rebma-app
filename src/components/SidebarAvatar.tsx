'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SidebarAvatar({ userRole, userDepartment }: { userRole: string; userDepartment: string }) {
  const [user, setUser] = useState<any>(null)

  const loadUser = useCallback(async () => {
    const supabase = createClient()
    const { data: { user: auth } } = await supabase.auth.getUser()
    if (auth) {
      const { data } = await supabase
        .from('users')
        .select('full_name, avatar_url, role, department')
        .eq('id', auth.id)
        .single()
      if (data) setUser(data)
    }
  }, [])

  useEffect(() => {
    loadUser()
    const handler = () => setTimeout(() => loadUser(), 500)
    window.addEventListener('profile-updated', handler)
    return () => window.removeEventListener('profile-updated', handler)
  }, [loadUser])

  return (
    <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg" style={{ background: 'transparent' }}>
      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--accent)' }}>
        {user?.avatar_url ? (
          <img src={`${user.avatar_url}?t=${Date.now()}`} alt={user?.full_name} className="w-full h-full object-cover" />
        ) : (
          (user?.full_name || userRole)[0]?.toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate capitalize" style={{ color: 'var(--sidebar-text)' }}>
          {user?.full_name || userRole}
        </p>
        <p className="text-xs truncate capitalize" style={{ color: 'var(--sidebar-text-muted)' }}>
          {user?.department || userDepartment}
        </p>
      </div>
    </div>
  )
}
