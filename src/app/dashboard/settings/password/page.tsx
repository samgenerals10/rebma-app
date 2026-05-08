'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const requirements = [
    { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
    { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
    { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
    { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
    { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (!requirements.every(r => r.test(formData.newPassword))) {
      setMessage({ type: 'error', text: 'Password does not meet all requirements' })
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: formData.newPassword })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setFormData({ newPassword: '', confirmPassword: '' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl p-6 space-y-4" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Change Password</h2>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <input
                type={showNew ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showNew ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showConfirm ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
              </button>
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-lg p-4" style={{ background: 'var(--table-header-bg)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Password Requirements</p>
            <div className="grid grid-cols-2 gap-2">
              {requirements.map((req, i) => {
                const passed = req.test(formData.newPassword)
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {passed
                      ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#059669' }} />
                      : <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                    }
                    <span style={{ color: passed ? '#059669' : 'var(--text-muted)' }}>{req.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {message && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: message.type === 'success' ? '#05966915' : '#dc262615',
                color: message.type === 'success' ? '#059669' : '#dc2626',
              }}
            >
              {message.text}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/settings" className="px-5 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90 disabled:opacity-50" style={{ background: 'var(--accent)', color: 'white' }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
