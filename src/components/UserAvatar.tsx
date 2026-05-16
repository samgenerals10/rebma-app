'use client'

import { useAppStore } from '@/lib/store'
import Link from 'next/link'

export function UserAvatar() {
  const { user } = useAppStore()

  const avatarUrl = user?.avatar_url ? `${user.avatar_url}?t=${Date.now()}` : null

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
