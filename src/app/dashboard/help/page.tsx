export default function HelpPage() {
  const faqs = [
    { q: 'How do I register a new staff member?', a: 'Go to /register and fill in the registration form. HR will review and approve.' },
    { q: 'How do I create an order?', a: 'Go to Marketing → New Order. Select a customer and add products.' },
    { q: 'How do I record a payment?', a: 'Go to Finance → Payments → Record Payment. Select the order and enter amount.' },
    { q: 'How do I approve an import request?', a: 'Only the CEO can approve imports. Go to Management → Approval Queue.' },
    { q: 'How do I change my theme?', a: 'Go to Settings → Appearance to change theme, colors and animations.' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Help Center</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Frequently asked questions and guides</p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{faq.q}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
