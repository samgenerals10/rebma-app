'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Trash2, AlertTriangle, Clock } from 'lucide-react'

export default function SystemPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleDeleteRequest = async () => {
    if (!deleteReason.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('audit_log').insert({
        action: 'account_deletion_requested',
        user_id: user.id,
        details: { reason: deleteReason },
      })
    }
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Sign Out */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b15' }}>
            <LogOut className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Sign Out</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Sign out of your account on this device</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition hover:opacity-80 flex items-center justify-center gap-2"
          style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Delete Account */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#dc262615' }}>
            <Trash2 className="w-4 h-4" style={{ color: '#dc2626' }} />
          </div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Delete Account</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Permanently delete your account — requires HR approval</p>
          </div>
        </div>

        {!showDeleteConfirm && !submitted && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: '#dc262610', color: '#dc2626', border: '1px solid #dc262630' }}
          >
            Request Account Deletion
          </button>
        )}

        {showDeleteConfirm && !submitted && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: '#dc262610' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#dc2626' }}>This action is irreversible</p>
                <p className="text-xs mt-0.5" style={{ color: '#dc2626', opacity: 0.8 }}>
                  All your data will be permanently deleted after HR approval.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Reason for deletion
              </label>
              <textarea
                rows={3}
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteRequest}
                disabled={loading || !deleteReason.trim()}
                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#dc2626', color: 'white' }}
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80"
                style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: '#05966915' }}>
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#059669' }}>Request Submitted</p>
              <p className="text-xs mt-0.5" style={{ color: '#059669', opacity: 0.8 }}>
                Your account deletion request has been submitted for HR approval.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto mb-3">
          <img src="/rebma-logo.png" alt="REBMA" className="w-full h-full object-contain" />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>REBMA IMPEX Ghana Limited</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Operational Management System v1.0.0</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>© 2026 REBMA IMPEX Ghana Limited</p>
      </div>
    </div>
  )
}
