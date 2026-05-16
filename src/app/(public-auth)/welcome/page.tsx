'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function WelcomePage() {
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

        {/* LEFT PANEL */}
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

          {/* Illustration */}
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

        {/* WAVE DIVIDER */}
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

        {/* RIGHT PANEL */}
        <div style={{
          flex: '0.9',
          background: '#059669',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 40px 32px 60px',
        }}>
          {/* Content card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px 32px',
            width: '100%',
            maxWidth: '340px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontWeight: 800,
              fontSize: '30px',
              color: '#059669',
              margin: '0 0 12px 0',
              fontStyle: 'italic',
            }}>
              REBMA IMPEX
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 32px 0', lineHeight: 1.6 }}>
              Enterprise Management System for<br />REBMA IMPEX Ghana Limited
            </p>

            <Link href="/login" style={{
              display: 'block',
              width: '100%',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              padding: '15px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box',
              marginBottom: '14px',
              boxShadow: '0 8px 20px rgba(5,150,105,0.3)',
            }}>
              Log In
            </Link>

            <Link href="/register" style={{
              display: 'block',
              width: '100%',
              background: 'white',
              color: '#059669',
              border: '2px solid #059669',
              borderRadius: '50px',
              padding: '13px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}>
              Get Started
            </Link>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>
              &copy; 2024 REBMA IMPEX Ghana Limited
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
