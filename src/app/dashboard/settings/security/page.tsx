'use client'

import { useState } from 'react'
import { Shield, Smartphone, Key, Clock, CheckCircle, RefreshCw } from 'lucide-react'

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  const sessions = [
    { id: '1', device: 'Chrome — MacBook Pro', location: 'Accra, Ghana', lastActive: 'Active now', current: true },
    { id: '2', device: 'Safari — iPhone 14', location: 'Accra, Ghana', lastActive: '2 hours ago', current: false },
    { id: '3', device: 'Firefox — Windows PC', location: 'Kumasi, Ghana', lastActive: '3 days ago', current: false },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* 2FA */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#05966915' }}>
              <Shield className="w-5 h-5" style={{ color: '#059669' }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Add an extra layer of security</p>
            </div>
          </div>
          <button
            onClick={() => { setTwoFactorEnabled(!twoFactorEnabled); setShowSetup(!twoFactorEnabled) }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{
              background: twoFactorEnabled ? '#05966915' : 'var(--input-bg)',
              color: twoFactorEnabled ? '#059669' : 'var(--text-primary)',
              border: '1px solid var(--card-border)',
            }}
          >
            {twoFactorEnabled ? 'Enabled' : 'Enable'}
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#05966910' }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} />
            <span className="text-sm" style={{ color: '#059669' }}>2FA is active on your account</span>
            <button onClick={() => setShowSetup(true)} className="ml-auto flex items-center gap-1 text-xs" style={{ color: '#059669' }}>
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        )}

        {showSetup && (
          <div className="mt-4 p-4 rounded-lg" style={{ border: '1px solid var(--card-border)' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Enter the 6-digit code from your authenticator app</p>
            <div className="flex gap-2 mb-4">
              {[0,1,2,3,4,5].map(i => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  id={`2fa-${i}`}
                  className="w-11 h-11 text-center text-lg font-bold rounded-lg outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
                  onChange={e => { if (e.target.value && i < 5) document.getElementById(`2fa-${i+1}`)?.focus() }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSetup(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90" style={{ background: 'var(--accent)', color: 'white' }}>
                Verify & Enable
              </button>
              <button onClick={() => setShowSetup(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80" style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1a73e815' }}>
            <Smartphone className="w-4 h-4" style={{ color: '#1a73e8' }} />
          </div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Active Sessions</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Manage your logged in devices</p>
          </div>
        </div>
        <div>
          {sessions.map((session, i) => (
            <div
              key={session.id}
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderTop: i > 0 ? '1px solid var(--card-border)' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--input-bg)' }}>
                  <Smartphone className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{session.device}</p>
                    {session.current && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#05966915', color: '#059669' }}>Current</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80" style={{ color: '#dc2626', background: '#dc262610' }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#8b5cf615' }}>
            <Key className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Login History</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Recent account activity</p>
          </div>
        </div>
        <div className="py-6 flex flex-col items-center gap-2">
          <Clock className="w-10 h-10" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No suspicious activity detected</p>
        </div>
      </div>
    </div>
  )
}
