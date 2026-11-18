import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ticketApi, commentApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import TicketForm from '../components/TicketForm'
import CommentThread from '../components/CommentThread'

const STATUSES       = ['Open', 'In Progress', 'Resolved', 'Closed']
const STATUS_CLASS   = { Open: 'open', 'In Progress': 'inprogress', Resolved: 'resolved', Closed: 'closed' }
const PRIORITY_CLASS = { Low: 'low', Medium: 'medium', High: 'high' }

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [ticket,       setTicket]       = useState(null)
  const [comments,     setComments]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [editing,      setEditing]      = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusError,  setStatusError]  = useState('')

  const home = user?.role === 'support_staff' ? '/staff' : '/dashboard'

  useEffect(() => {
    Promise.all([ticketApi.get(id), commentApi.list(id)])
      .then(([t, c]) => { setTicket(t); setComments(c) })
      .catch(() => navigate(home, { replace: true }))
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = async data => {
    const updated = await ticketApi.update(id, data)
    setTicket(updated)
    setEditing(false)
  }

  const handleStatusChange = async newStatus => {
    setSavingStatus(true)
    setStatusError('')
    try {
      const updated = await ticketApi.update(id, { status: newStatus })
      setTicket(updated)
    } catch (err) {
      setStatusError(err.response?.data?.detail || 'Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) return <div className="loading-state"><div className="auth-spinner" /></div>
  if (!ticket) return null

  const isStaff  = user?.role === 'support_staff'
  const isOwner  = ticket.created_by === user?.id
  const isClosed = ticket.status === 'Closed'
  const canEdit  = isOwner && ticket.status === 'Open'

  // Form is editable only when: (staff on non-closed) OR (owner and Open)
  const formReadOnly = isClosed || (!isStaff && !canEdit)

  return (
    <div className="page-wrapper">
      {/* Back link */}
      <Link to={home} className="back-link">← Back to Dashboard</Link>

      <div className="detail-layout">
        {/* ── Left: ticket content ───────────────────────────────── */}
        <div className="detail-main">
          <div className="detail-card">
            <div className="detail-card-header">
              <div className="detail-id-row">
                <span className="detail-ticket-id">#{String(ticket.id).padStart(4, '0')}</span>
                <span className={`status-badge status-${STATUS_CLASS[ticket.status]}`}>{ticket.status}</span>
                <span className={`priority-badge priority-${PRIORITY_CLASS[ticket.priority]}`}>{ticket.priority}</span>
              </div>
              <h2 className="detail-title">{ticket.title}</h2>
            </div>

            <div className="detail-card-body">
              {editing ? (
                <>
                  <TicketForm initial={ticket} onSubmit={handleEdit} loading={false} />
                  <button className="btn-ghost-sm" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <TicketForm initial={ticket} onSubmit={handleEdit} loading={false} readOnly={formReadOnly} />

                  {canEdit && !editing && (
                    <button className="btn-ghost-sm" onClick={() => setEditing(true)}>Edit Ticket</button>
                  )}

                  {isClosed && (
                    <div className="info-banner info-banner-muted">
                      This ticket is closed and cannot be edited. Comments are still allowed.
                    </div>
                  )}
                  {!isStaff && isOwner && ticket.status !== 'Open' && !isClosed && (
                    <div className="info-banner info-banner-info">
                      Tickets can only be edited while status is <strong>Open</strong>.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="detail-card">
            <CommentThread ticketId={ticket.id} comments={comments} currentUser={user} />
          </div>
        </div>

        {/* ── Right: metadata + status panel ─────────────────────── */}
        <aside className="detail-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-card-title">Ticket Info</div>
            <dl className="meta-list">
              <dt>Submitted by</dt>
              <dd>{ticket.creator.name}</dd>
              <dt>Category</dt>
              <dd>{ticket.category}</dd>
              <dt>Created</dt>
              <dd>{new Date(ticket.created_at).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</dd>
              <dt>Last updated</dt>
              <dd>{new Date(ticket.updated_at).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</dd>
            </dl>
          </div>

          {isStaff && (
            <div className="sidebar-card">
              <div className="sidebar-card-title">Change Status</div>
              {statusError && <div className="form-error-banner"><span>⚠</span> {statusError}</div>}

              <div className="status-action-list">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    className={`status-action-btn status-action-${STATUS_CLASS[s]} ${s === ticket.status ? 'is-current' : ''}`}
                    disabled={s === ticket.status || savingStatus || isClosed}
                    onClick={() => handleStatusChange(s)}
                  >
                    {s === ticket.status ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>

              {isClosed && <p className="sidebar-note">This ticket is closed.</p>}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
