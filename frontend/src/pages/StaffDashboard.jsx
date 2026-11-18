import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ticketApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import TicketCard from '../components/TicketCard'
import FilterBar from '../components/FilterBar'

export default function StaffDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [filters, setFilters]   = useState({ status: 'All', category: 'All' })

  useEffect(() => {
    ticketApi.list()
      .then(setTickets)
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = tickets.filter(t =>
    (filters.status   === 'All' || t.status   === filters.status) &&
    (filters.category === 'All' || t.category === filters.category)
  )

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Tickets</h1>
          <p className="page-sub">Welcome back, <strong>{user?.name}</strong> — Support Staff</p>
        </div>
        <Link to="/tickets/new" className="btn-primary-action">+ New Ticket</Link>
      </div>

      <div className="stats-row">
        {[
          { label: 'Open',        count: tickets.filter(t => t.status === 'Open').length,        cls: 'stat-open'      },
          { label: 'In Progress', count: tickets.filter(t => t.status === 'In Progress').length, cls: 'stat-inprogress' },
          { label: 'Resolved',    count: tickets.filter(t => t.status === 'Resolved').length,    cls: 'stat-resolved'   },
          { label: 'Closed',      count: tickets.filter(t => t.status === 'Closed').length,      cls: 'stat-closed'     },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <span className="stat-count">{s.count}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && <div className="page-error">{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="auth-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◻</span>
          <p>No tickets match the current filters.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Category</th>
                <th>Priority</th><th>Status</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => <TicketCard key={t.id} ticket={t} index={i} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
