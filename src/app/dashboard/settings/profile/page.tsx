'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Camera, Save, User, Mail, Phone, MapPin, Briefcase, X } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '', email: '', phone: '', department: '', role: '', address: '', bio: '', avatar_url: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: authUser.email || '',
          phone: data.phone || '',
          department: data.department || '',
          role: data.role || '',
          address: data.address || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        })
        if (data.avatar_url) setAvatarPreview(data.avatar_url)
      }
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setShowCamera(true)
    } catch (err) {
      console.error('Camera not available:', err)
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
      canvas.toBlob(blob => {
        if (blob) {
          setAvatarFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }))
          setAvatarPreview(URL.createObjectURL(blob))
        }
      })
      stopCamera()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { setLoading(false); return }

    let avatarUrl = profileData.avatar_url
    if (avatarFile) {
      const fileName = `${authUser.id}-${Date.now()}.${avatarFile.name.split('.').pop()}`
      const { data: uploadData, error } = await supabase.storage.from('avatars').upload(fileName, avatarFile)
      if (!error && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
        avatarUrl = publicUrl; console.log("Avatar URL:", publicUrl)
      }
    }

    await supabase.from('users').update({
      full_name: profileData.full_name,
      phone: profileData.phone,
      address: profileData.address,
      bio: profileData.bio,
      avatar_url: avatarUrl,
    }).eq('id', authUser.id)

    setLoading(false)
    setSaved(true); window.dispatchEvent(new Event('profile-updated'))
    setTimeout(() => setSaved(false), 2000)
  }

  const fields = [
    { label: 'Full Name', key: 'full_name', icon: User, type: 'text', disabled: false },
    { label: 'Email', key: 'email', icon: Mail, type: 'email', disabled: true },
    { label: 'Phone', key: 'phone', icon: Phone, type: 'tel', disabled: false },
    { label: 'Department', key: 'department', icon: Briefcase, type: 'text', disabled: true },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Avatar */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden" style={{ background: 'var(--accent)' }}>
                {showCamera ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {profileData.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <label
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition hover:opacity-80"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  <User className="w-4 h-4" />
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <button
                  type="button"
                  onClick={() => showCamera ? stopCamera() : startCamera()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
                >
                  {showCamera ? <X className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  {showCamera ? 'Stop' : 'Camera'}
                </button>
                {showCamera && (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
                    style={{ background: '#059669', color: 'white' }}
                  >
                    Capture
                  </button>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type={field.type}
                    value={(profileData as any)[field.key]}
                    disabled={field.disabled}
                    onChange={e => setProfileData({ ...profileData, [field.key]: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition"
                    style={{
                      background: field.disabled ? 'var(--table-header-bg)' : 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--input-text)',
                      opacity: field.disabled ? 0.6 : 1,
                      cursor: field.disabled ? 'not-allowed' : 'text',
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={profileData.address}
                  onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bio</label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/settings"
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
