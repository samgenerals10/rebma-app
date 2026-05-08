'use client'
import { useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { Check } from 'lucide-react'

const THEMES = [
  { id: 'google-drive', name: 'Google Drive', description: 'Blue sidebar, clean white content', sidebar: '#1a73e8', content: '#f8f9fa', accent: '#1a73e8' },
  { id: 'insight-hub', name: 'Insight Hub', description: 'Minimal white sidebar, light blue accent', sidebar: '#ffffff', content: '#f3f4f6', accent: '#3b82f6' },
  { id: 'purple-pro', name: 'Purple Pro', description: 'Deep purple sidebar, clean content', sidebar: '#4f46e5', content: '#f5f3ff', accent: '#4f46e5' },
  { id: 'emerald', name: 'Emerald (REBMA)', description: 'Dark green brand sidebar', sidebar: '#065f46', content: '#ecfdf5', accent: '#059669' },
  { id: 'slate', name: 'Slate Dark', description: 'Full dark mode experience', sidebar: '#1e293b', content: '#0f172a', accent: '#38bdf8' },
]

const PALETTES = [
  { id: 'rebma', name: 'REBMA Green', color: '#059669' },
  { id: 'ocean', name: 'Ocean Blue', color: '#0077b6' },
  { id: 'forest', name: 'Forest', color: '#2d6a4f' },
  { id: 'sunset', name: 'Sunset', color: '#e76f51' },
  { id: 'royal', name: 'Royal Purple', color: '#7b2d8b' },
  { id: 'gold', name: 'Gold', color: '#f4a261' },
]

const ANIMATIONS = [
  { id: 'smooth', name: 'Smooth', description: 'Elegant ease transitions' },
  { id: 'snappy', name: 'Snappy', description: 'Fast, crisp responses' },
  { id: 'bouncy', name: 'Bouncy', description: 'Playful spring effect' },
  { id: 'fade', name: 'Fade', description: 'Subtle opacity transitions' },
  { id: 'none', name: 'None', description: 'No animations' },
]

const BUTTON_STYLES = [
  {
    id: 'filled',
    name: 'Filled',
    description: 'Solid background buttons',
    preview: { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', boxShadow: 'none' }
  },
  {
    id: 'outlined',
    name: 'Outlined',
    description: 'Border only, transparent background',
    preview: { background: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: '8px', boxShadow: 'none' }
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Neumorphic soft shadow style',
    preview: { background: 'var(--card-bg)', color: 'var(--accent)', border: 'none', borderRadius: '12px', boxShadow: '4px 4px 8px rgba(0,0,0,0.12), -2px -2px 6px rgba(255,255,255,0.8)' }
  },
]

export default function AppearancePage() {
  const { config, setTheme, setPalette, setAnimation, setButtonStyle, toggleDarkMode } = useTheme()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Appearance</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Customize how REBMA looks and feels</p>
      </div>

      {/* Dark Mode */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dark Mode</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Switch between light and dark</p>
          </div>
          <button onClick={toggleDarkMode}
            className="relative w-12 h-6 rounded-full transition-all duration-300"
            style={{ background: config.darkMode ? 'var(--accent)' : 'var(--card-border)' }}>
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: config.darkMode ? '26px' : '4px' }} />
          </button>
        </div>
      </div>

      {/* Themes */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEMES.map(theme => (
            <button key={theme.id} onClick={() => setTheme(theme.id)}
              className="flex items-center gap-3 p-3 rounded-xl text-left transition hover:opacity-90"
              style={{ border: '2px solid ' + (config.theme === theme.id ? 'var(--accent)' : 'var(--card-border)'), background: config.theme === theme.id ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'var(--table-header-bg)' }}>
              <div className="flex gap-1 flex-shrink-0">
                <div className="w-8 h-10 rounded-lg" style={{ background: theme.sidebar }} />
                <div className="w-12 h-10 rounded-lg" style={{ background: theme.content, border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{theme.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{theme.description}</p>
              </div>
              {config.theme === theme.id && <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Accent Color</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {PALETTES.map(palette => (
            <button key={palette.id} onClick={() => setPalette(palette.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition hover:opacity-90"
              style={{ border: '2px solid ' + (config.palette === palette.id ? palette.color : 'var(--card-border)'), background: config.palette === palette.id ? palette.color + '15' : 'var(--table-header-bg)' }}>
              <div className="w-8 h-8 rounded-full" style={{ background: palette.color }} />
              <p className="text-xs font-medium text-center" style={{ color: 'var(--text-primary)' }}>{palette.name}</p>
              {config.palette === palette.id && <Check className="w-3 h-3" style={{ color: palette.color }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Button Style */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <h2 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Button Style</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Choose how buttons look across the app</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BUTTON_STYLES.map(style => (
            <button key={style.id} onClick={() => setButtonStyle(style.id)}
              className="flex flex-col items-center gap-4 p-4 rounded-xl transition hover:opacity-90"
              style={{ border: '2px solid ' + (config.buttonStyle === style.id ? 'var(--accent)' : 'var(--card-border)'), background: config.buttonStyle === style.id ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'var(--table-header-bg)' }}>
              {/* Button preview */}
              <div className="w-full space-y-2">
                <div className="px-4 py-2 text-xs font-medium text-center transition-all duration-200 hover:opacity-80 active:scale-95"
                  style={{ ...style.preview, display: 'block' }}>
                  Submit
                </div>
                <div className="px-4 py-2 text-xs font-medium text-center"
                  style={{ ...style.preview, background: style.id === 'filled' ? '#dc2626' : style.id === 'outlined' ? 'transparent' : 'var(--card-bg)', color: style.id === 'filled' ? 'white' : '#dc2626', border: style.id === 'outlined' ? '2px solid #dc2626' : style.id === 'soft' ? 'none' : 'none', display: 'block' }}>
                  Delete
                </div>
                <div className="px-4 py-2 text-xs font-medium text-center"
                  style={{ ...style.preview, background: style.id === 'filled' ? '#059669' : style.id === 'outlined' ? 'transparent' : 'var(--card-bg)', color: style.id === 'filled' ? 'white' : '#059669', border: style.id === 'outlined' ? '2px solid #059669' : style.id === 'soft' ? 'none' : 'none', display: 'block' }}>
                  Approve
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{style.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{style.description}</p>
              </div>
              {config.buttonStyle === style.id && <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Animations */}
      <div className="rounded-xl p-6" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Animation Style</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ANIMATIONS.map(anim => (
            <button key={anim.id} onClick={() => setAnimation(anim.id)}
              className="flex flex-col gap-1 p-3 rounded-xl text-center transition hover:opacity-90"
              style={{ border: '2px solid ' + (config.animation === anim.id ? 'var(--accent)' : 'var(--card-border)'), background: config.animation === anim.id ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'var(--table-header-bg)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{anim.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{anim.description}</p>
              {config.animation === anim.id && <Check className="w-3 h-3 mx-auto" style={{ color: 'var(--accent)' }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition active:scale-95"
          style={{ background: saved ? '#059669' : 'var(--accent)', color: 'white' }}>
          {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
