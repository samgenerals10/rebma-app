export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Documents</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Company documents and files</p>
      </div>
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
        <p className="text-4xl mb-3">📁</p>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Document management coming in Sprint 4</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Store and manage company documents, contracts and reports</p>
      </div>
    </div>
  )
}
