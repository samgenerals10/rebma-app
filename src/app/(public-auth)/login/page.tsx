'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Invalid email or password' : error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      alert('Password reset link sent to your email!')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#059669',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Add inline style for animated inputs */}
      <style>{`
        .auth-input:focus + .auth-input-line { width: 100% !important; }
        .auth-input:focus { background: white !important; }
      `}</style>
      
      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '960px',
        minHeight: '560px',
        background: 'white',
        borderRadius: '32px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
        position: 'relative',
      }}>

        {/* LEFT PANEL — white with illustration */}
        <div style={{
          flex: '1.1',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image 
              src="/rebma-logo.jpg" 
              alt="REBMA Logo" 
              width={40} 
              height={40} 
              style={{ borderRadius: '8px', objectFit: 'cover' }}
            />
            <div>
              <p style={{ fontWeight: 900, fontSize: '15px', color: '#059669', margin: 0, lineHeight: 1 }}>REBMA</p>
              <p style={{ fontSize: '10px', color: '#6b7280', margin: 0, lineHeight: 1 }}>IMPEX GHANA</p>
            </div>
          </div>

          {/* Illustration fills the rest */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
            <Image
              src="/auth-illustration.png"
              alt="REBMA Team"
              width={420}
              height={360}
              style={{ objectFit: 'contain', width: '100%', maxWidth: '420px' }}
            />
          </div>
        </div>

        {/* WAVE DIVIDER — white curve that bleeds into the right panel */}
        <div style={{
          position: 'absolute',
          left: '42%',
          top: 0,
          bottom: 0,
          width: '120px',
          zIndex: 3,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 120 560" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,0 L0,560 Q120,280 0,0" fill="white" />
          </svg>
        </div>

        {/* RIGHT PANEL — emerald green with form card */}
        <div style={{
          flex: '0.9',
          background: '#059669',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 40px 32px 60px',
          position: 'relative',
        }}>

          {/* White floating form card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '36px 32px',
            width: '100%',
            maxWidth: '340px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '28px',
              color: '#059669',
              margin: '0 0 24px 0',
              fontStyle: 'italic',
            }}>
              Welcome Back
            </h2>

            {/* Google Button */}
            <button 
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
                fontWeight: 500,
                marginBottom: '20px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Google G icon */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Log in with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                OR LOG IN WITH USERNAME
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', padding: '10px 14px',
                borderRadius: '10px', fontSize: '13px', marginBottom: '14px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email field */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Username or Email"
                  required
                  className="auth-input"
                  style={{
                    width: '100%',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '12px 12px 0 0',
                    padding: '13px 16px 13px 40px',
                    fontSize: '14px',
                    color: '#374151',
                    outline: 'none',
                    boxSizing: 'border-box',
                    borderBottom: '2px solid transparent',
                    transition: 'all 0.3s'
                  }}
                />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>

              {/* Password field */}
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="auth-input"
                  style={{
                    width: '100%',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '12px 12px 0 0',
                    padding: '13px 40px 13px 40px',
                    fontSize: '14px',
                    color: '#374151',
                    outline: 'none',
                    boxSizing: 'border-box',
                    borderBottom: '2px solid transparent',
                    transition: 'all 0.3s'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>

              {/* Keep me logged in + Forget Password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    style={{ accentColor: '#059669' }} 
                  />
                  Keep me logged in
                </label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  style={{ fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
                >
                  Forget Password
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#6ee7b7' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  boxShadow: '0 8px 20px rgba(5,150,105,0.3)',
                }}
              >
                {loading ? 'Signing in...' : 'Log in'}
              </button>
            </form>
          </div>

          {/* Bottom help text */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600 }}>
              Need Help?
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
              You are not a member?{' '}
              <Link href="/register" style={{ color: 'white', fontWeight: 700, textDecoration: 'underline' }}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
