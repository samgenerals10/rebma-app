export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Business reports and analytics</p>
      </div>
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
        <p className="text-4xl mb-3">📊</p>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Reports coming in Sprint 4</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Executive dashboard, GRA reports and more</p>
      </div>
    </div>
  )
}
