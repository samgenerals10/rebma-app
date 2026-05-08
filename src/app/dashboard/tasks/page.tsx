export default function TasksPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Tasks</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your assigned tasks and to-dos</p>
      </div>
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
        <p className="text-4xl mb-3">✅</p>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Task management coming in Sprint 2</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Assign, track and complete tasks across departments</p>
      </div>
    </div>
  )
}
