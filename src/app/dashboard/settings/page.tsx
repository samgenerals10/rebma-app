'use client'

import Link from 'next/link'
import {
  User, Key, Shield, Palette, RefreshCw, ChevronRight, Settings as SettingsIcon
} from 'lucide-react'

const menuSections = [
  {
    title: 'Account',
    items: [
      { id: 'profile', title: 'Profile', description: 'View and edit your profile', icon: User, href: '/dashboard/settings/profile', color: '#1a73e8', bg: '#1a73e815' },
      { id: 'password', title: 'Change Password', description: 'Update your password', icon: Key, href: '/dashboard/settings/password', color: '#8b5cf6', bg: '#8b5cf615' },
      { id: 'security', title: 'Security', description: '2FA and login history', icon: Shield, href: '/dashboard/settings/security', color: '#059669', bg: '#05966915' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'appearance', title: 'Appearance', description: 'Theme, colors and animations', icon: Palette, href: '/dashboard/settings/appearance', color: '#f59e0b', bg: '#f59e0b15' },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'system', title: 'System', description: 'Sign out and account management', icon: RefreshCw, href: '/dashboard/settings/system', color: '#dc2626', bg: '#dc262615' },
    ]
  },
]

export default function SettingsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left menu */}
      <div className="lg:col-span-1 space-y-4">
        {menuSections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
          >
            <div
              className="px-5 py-3"
              style={{ borderBottom: '1px solid var(--card-border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                {section.title}
              </p>
            </div>
            <div className="p-2 space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                  style={{ background: 'transparent' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bg }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right welcome panel */}
      <div className="lg:col-span-2">
        <div
          className="rounded-xl h-full flex flex-col items-center justify-center min-h-96 p-8"
          style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <SettingsIcon className="w-10 h-10" style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome to Settings
          </h2>
          <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-secondary)' }}>
            Select an option from the menu to configure your account settings, preferences, and more.
          </p>

          {/* Quick links */}
          <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
            {[
              { label: 'Edit Profile', href: '/dashboard/settings/profile', color: '#1a73e8' },
              { label: 'Change Theme', href: '/dashboard/settings/appearance', color: '#f59e0b' },
              { label: 'Change Password', href: '/dashboard/settings/password', color: '#8b5cf6' },
              { label: 'Security', href: '/dashboard/settings/security', color: '#059669' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition hover:opacity-80"
                style={{
                  background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
                  color: 'var(--accent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                }}
              >
                {link.label}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
