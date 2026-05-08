'use client'
import { Upload } from 'lucide-react'

interface Props {
  order: any
  cashAmount: string; setCashAmount: (v: string) => void
  chequeNumber: string; setChequeNumber: (v: string) => void
  chequeDate: string; setChequeDate: (v: string) => void
  bankName: string; setBankName: (v: string) => void
  bankAccountNumber: string; setBankAccountNumber: (v: string) => void
  accountName: string; setAccountName: (v: string) => void
  branch: string; setBranch: (v: string) => void
  momoNetwork: string; setMomoNetwork: (v: string) => void
  momoNumber: string; setMomoNumber: (v: string) => void
  momoAccountName: string; setMomoAccountName: (v: string) => void
  momoTransactionId: string; setMomoTransactionId: (v: string) => void
  setMomoScreenshot: (f: File | null) => void
  ghanaCardNumber: string; setGhanaCardNumber: (v: string) => void
  dueDate: string; setDueDate: (v: string) => void
  setGhanaCardFront: (f: File | null) => void
  setGhanaCardBack: (f: File | null) => void
  setCustomerPhoto: (f: File | null) => void
  financeNotes: string; setFinanceNotes: (v: string) => void
}

export default function PaymentForm(props: Props) {
  const { order } = props
  const input = "w-full px-3 py-2 rounded-lg text-sm outline-none"
  const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }
  const label = "block text-xs font-medium mb-1"
  const labelStyle = { color: 'var(--text-secondary)' }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enter Payment Details</p>

      {order.payment_mode === 'cash' && (
        <div className="max-w-xs">
          <label className={label} style={labelStyle}>Amount Received (GH₵) *</label>
          <input type="number" value={props.cashAmount} onChange={e => props.setCashAmount(e.target.value)}
            placeholder="0.00" step="0.01" className={input} style={inputStyle} />
        </div>
      )}

      {order.payment_mode === 'cheque' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Bank Name', value: props.bankName, set: props.setBankName, placeholder: 'e.g. GCB Bank' },
            { label: 'Cheque Number', value: props.chequeNumber, set: props.setChequeNumber, placeholder: 'CHQ-001' },
            { label: 'Cheque Date', value: props.chequeDate, set: props.setChequeDate, type: 'date', placeholder: '' },
            { label: 'Account Name', value: props.accountName, set: props.setAccountName, placeholder: 'Account holder' },
            { label: 'Account Number', value: props.bankAccountNumber, set: props.setBankAccountNumber, placeholder: '1234567890' },
            { label: 'Branch', value: props.branch, set: props.setBranch, placeholder: 'Branch name' },
          ].map(field => (
            <div key={field.label}>
              <label className={label} style={labelStyle}>{field.label} *</label>
              <input type={field.type || 'text'} value={field.value} onChange={e => field.set(e.target.value)}
                placeholder={field.placeholder} className={input} style={inputStyle} />
            </div>
          ))}
        </div>
      )}

      {order.payment_mode === 'mobile_money' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={label} style={labelStyle}>Network *</label>
            <select value={props.momoNetwork} onChange={e => props.setMomoNetwork(e.target.value)} className={input} style={inputStyle}>
              <option value="MTN">MTN Mobile Money</option>
              <option value="Vodafone">Vodafone Cash</option>
              <option value="AirtelTigo">AirtelTigo Money</option>
            </select>
          </div>
          {[
            { label: 'MoMo Number', value: props.momoNumber, set: props.setMomoNumber, placeholder: '024 XXX XXXX' },
            { label: 'Account Name', value: props.momoAccountName, set: props.setMomoAccountName, placeholder: 'Account name' },
            { label: 'Transaction ID', value: props.momoTransactionId, set: props.setMomoTransactionId, placeholder: 'TXN-001' },
          ].map(field => (
            <div key={field.label}>
              <label className={label} style={labelStyle}>{field.label} *</label>
              <input type="text" value={field.value} onChange={e => field.set(e.target.value)}
                placeholder={field.placeholder} className={input} style={inputStyle} />
            </div>
          ))}
          <div>
            <label className={label} style={labelStyle}>Screenshot</label>
            <input type="file" accept="image/*" onChange={e => props.setMomoScreenshot(e.target.files?.[0] || null)}
              className={input} style={inputStyle} />
          </div>
        </div>
      )}

      {order.payment_mode === 'credit' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={label} style={labelStyle}>Ghana Card Number *</label>
              <input type="text" value={props.ghanaCardNumber} onChange={e => props.setGhanaCardNumber(e.target.value)}
                placeholder="GHA-XXXXXXXXX-X" className={input} style={inputStyle} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Payment Due Date *</label>
              <input type="date" value={props.dueDate} onChange={e => props.setDueDate(e.target.value)}
                className={input} style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Ghana Card Front', set: props.setGhanaCardFront },
              { label: 'Ghana Card Back', set: props.setGhanaCardBack },
              { label: 'Customer Photo', set: props.setCustomerPhoto },
            ].map(field => (
              <div key={field.label}>
                <label className={label} style={labelStyle}>{field.label}</label>
                <label className="flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer hover:opacity-80"
                  style={{ background: 'var(--input-bg)', border: '2px dashed var(--card-border)' }}>
                  <Upload className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => field.set(e.target.files?.[0] || null)} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={label} style={labelStyle}>Finance Notes</label>
        <textarea value={props.financeNotes} onChange={e => props.setFinanceNotes(e.target.value)}
          placeholder="Optional notes..." rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={inputStyle} />
      </div>
    </div>
  )
}
