interface RebmaLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function RebmaLogo({ size = 40, className = '', showText = true }: RebmaLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="rounded-xl overflow-hidden flex-shrink-0 bg-white flex items-center justify-center"
        style={{ width: size, height: size, padding: 2 }}
      >
        <img
          src="/rebma-logo.png"
          alt="Rebma Ghana"
          style={{ width: size - 4, height: size - 4, objectFit: 'contain' }}
        />
      </div>
      {showText && (
        <div>
          <p className="font-bold leading-tight" style={{ fontSize: size * 0.38, color: 'var(--sidebar-text)' }}>REBMA</p>
          <p className="leading-tight" style={{ fontSize: size * 0.28, color: 'var(--sidebar-text-muted)' }}>IMPEX GHANA</p>
        </div>
      )}
    </div>
  )
}
