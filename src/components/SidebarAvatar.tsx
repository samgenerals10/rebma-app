'use client'

import { useAppStore } from '@/lib/store'

export function SidebarAvatar({ userRole, userDepartment }: { userRole: string; userDepartment: string }) {
  const { user } = useAppStore()

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
