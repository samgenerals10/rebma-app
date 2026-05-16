'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DEPARTMENTS = [
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'dispatch', label: 'Dispatch' },
  { value: 'production', label: 'Production' },
  { value: 'receptionist', label: 'Receptionist' },
]

const EMPLOYMENT_TYPES = [
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Intern', label: 'Intern' },
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    ghana_card_id: '',
    date_of_birth: '',
    home_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    department_requested: '',
    role_requested: '',
    employment_type: 'Permanent',
    start_date: '',
    referred_by: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit registration')
      }

      setSuccess(true)
      setTimeout(() => router.push('/welcome'), 3000)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (success) {
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
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#059669', marginBottom: '10px' }}>Request Submitted</h2>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
            Your registration request has been sent to HR for review. You will receive an email once your account is approved.
          </p>
          <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>Redirecting to welcome page...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#059669',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      <style>{`
        .auth-input:focus + .auth-input-line { width: 100% !important; }
      `}</style>
      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        background: 'white',
        borderRadius: '32px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
        position: 'relative',
      }}>

        {/* FORM PANEL */}
        <div style={{
          flex: '1.2',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
          position: 'relative',
          zIndex: 2,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
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

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>Staff Registration</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>Fill in your details to request system access.</p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', padding: '12px 16px',
              borderRadius: '12px', fontSize: '13px', marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* PERSONAL INFO */}
            <div style={{ gridColumn: 'span 2', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="John Doe"
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@rebma.com"
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+233..."
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Ghana Card ID *</label>
              <div style={{ position: 'relative' }}>
                <input type="text" name="ghana_card_id" value={formData.ghana_card_id} onChange={handleChange} required placeholder="GHA-..."
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Date of Birth</label>
              <div style={{ position: 'relative' }}>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Home Address</label>
              <div style={{ position: 'relative' }}>
                <input type="text" name="home_address" value={formData.home_address} onChange={handleChange} placeholder="Street, City"
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            {/* EMERGENCY CONTACT */}
            <div style={{ gridColumn: 'span 2', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Contact</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Contact Name</label>
              <div style={{ position: 'relative' }}>
                <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange}
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Contact Phone</label>
              <div style={{ position: 'relative' }}>
                <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange}
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            {/* EMPLOYMENT INFO */}
            <div style={{ gridColumn: 'span 2', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employment Details</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Department Requested *</label>
              <div style={{ position: 'relative' }}>
                <select name="department_requested" value={formData.department_requested} onChange={handleChange} required
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Role Requested</label>
              <div style={{ position: 'relative' }}>
                <input type="text" name="role_requested" value={formData.role_requested} onChange={handleChange} placeholder="e.g. Sales Officer"
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Employment Type</label>
              <div style={{ position: 'relative' }}>
                <select name="employment_type" value={formData.employment_type} onChange={handleChange}
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }}>
                  {EMPLOYMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Start Date</label>
              <div style={{ position: 'relative' }}>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange}
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}>Referred By</label>
              <div style={{ position: 'relative' }}>
                <input type="text" name="referred_by" value={formData.referred_by} onChange={handleChange} placeholder="Name of referrer"
                  className="auth-input"
                  style={{ width: '100%', background: '#f3f4f6', border: 'none', borderRadius: '10px 10px 0 0', padding: '12px 14px', fontSize: '14px', outline: 'none', borderBottom: '2px solid transparent', transition: 'all 0.3s' }} />
                <div className="auth-input-line" style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: '2px', background: '#059669', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? '#6ee7b7' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  boxShadow: '0 8px 20px rgba(5,150,105,0.2)',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
              <Link href="/welcome" style={{ color: '#666', fontSize: '14px', textDecoration: 'none' }}>Cancel</Link>
            </div>
          </form>
          
          <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '13px', color: '#888' }}>
            Already registered? <Link href="/login" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>Log in here</Link>
          </p>
        </div>

        {/* ILLUSTRATION PANEL */}
        <div style={{
          flex: '0.8',
          background: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          borderLeft: '1px solid #f3f4f6',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginBottom: '10px' }}>Welcome to REBMA</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
              Your professional journey starts here. Join our integrated enterprise ecosystem.
            </p>
          </div>
          <Image
            src="/auth-illustration.png"
            alt="REBMA Registration"
            width={380}
            height={300}
            style={{ objectFit: 'contain' }}
          />
        </div>

      </div>
    </div>
  )
}
