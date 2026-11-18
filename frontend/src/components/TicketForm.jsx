import { useState } from 'react'

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other']
const PRIORITIES  = ['Low', 'Medium', 'High']

export default function TicketForm({ initial = {}, onSubmit, loading, readOnly = false }) {
  const [form, setForm] = useState({
    title:       initial.title       || '',
    description: initial.description || '',
    category:    initial.category    || 'Hardware',
    priority:    initial.priority    || 'Medium',
  })
  const [error, setError] = useState('')

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '))
      } else {
        setError(detail || 'Something went wrong. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      {error && (
        <div className="form-error-banner">
          <span>⚠</span> {error}
        </div>
      )}

      <div className="form-field">
        <label className="form-label">
          Title <span className="required">*</span>
        </label>
        <input
          className="form-input"
          value={form.title}
          onChange={set('title')}
          maxLength={100}
          required
          disabled={readOnly}
          placeholder="Brief, specific description of the issue"
        />
        <span className="char-count">{form.title.length} / 100</span>
      </div>

      <div className="form-field">
        <label className="form-label">
          Description <span className="required">*</span>
        </label>
        <textarea
          className="form-input form-textarea"
          rows={5}
          value={form.description}
          onChange={set('description')}
          required
          disabled={readOnly}
          placeholder="What happened? When did it start? What have you already tried?"
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Category</label>
          <select className="form-input form-select" value={form.category} onChange={set('category')} disabled={readOnly}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Priority</label>
          <select className="form-input form-select" value={form.priority} onChange={set('priority')} disabled={readOnly}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {!readOnly && (
        <button type="submit" className="btn-primary-action" disabled={loading}>
          {loading
            ? <><span className="btn-spinner" /> Submitting…</>
            : initial.title ? 'Save Changes' : 'Submit Ticket'}
        </button>
      )}
    </form>
  )
}
