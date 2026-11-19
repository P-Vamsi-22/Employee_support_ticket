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
  const [search, setSearch]     = useState('')

  useEffect(() => {
    ticketApi.list()
      .then(setTickets)
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleSearch = event => setSearch(event.detail.toLower())
    window.addEventListener('supportdesk-search', handleSearch)
    return () => window.removeEventListener('supportdesk-search', handleSearch)
  }, [])

  const filtered = tickets.filter(t =>
    (filters.status   === 'All' || t.status   === filters.status) &&
    (filters.category === 'All' || t.category === filters.category) &&
    (!search || `${t.title} ${t.category} ${t.status} ${t.description || ''}`.toLowerCase().includes(search))
  )

  return (
    <main className="page-wrapper dashboard-shell">
      <section className="welcome-banner">
        <div>
          <span>Welcome back,</span>
          <h1>{user?.name || 'Support Staff'} <b aria-hidden="true">👋</b></h1>
          <p>Manage requests, update statuses, and keep the team moving.</p>
        </div>
        <div className="welcome-art" aria-hidden="true"><span className="art-orbit orbit-one"/><span className="art-orbit orbit-two"/><span className="art-laptop"><i /></span></div>
      </section>

      <div className="stats-row">
        {[
          { label: 'Open', count: tickets.filter(t => t.status === 'Open').length, cls: 'stat-open', icon: 'ticket' },
          { label: 'In Progress', count: tickets.filter(t => t.status === 'In Progress').length, cls: 'stat-inprogress', icon: 'progress' },
          { label: 'Resolved', count: tickets.filter(t => t.status === 'Resolved').length, cls: 'stat-resolved', icon: 'check' },
          { label: 'Closed', count: tickets.filter(t => t.status === 'Closed').length, cls: 'stat-closed', icon: 'archive' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <span className="stat-icon" aria-hidden="true">
              {s.icon === 'ticket' && <svg viewBox="0 0 24 24"><path d="M3 8V5h18v3a3 3 0 000 6v5H3v-5a3 3 0 000-6z"/><path d="M12 5v14"/></svg>}
              {s.icon === 'progress' && <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 109 9"/><path d="M12 7v5l3 2"/></svg>}
              {s.icon === 'check' && <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>}
              {s.icon === 'archive' && <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M8 14h8"/></svg>}
            </span>
            <div><span className="stat-count">{s.count}</span><span className="stat-label">{s.label}</span></div>
          </div>
        ))}
      </div>

      <section className="tickets-section">
        <div className="tickets-heading">
          <h2>All Tickets</h2>
          <Link to="/tickets/new" className="btn-primary-action"><b>+</b> New Ticket</Link>
        </div>

        <div className="status-tabs" role="tablist" aria-label="Ticket status">
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
            <button key={status} type="button" role="tab" aria-selected={filters.status === status} className={filters.status === status ? 'active' : ''} onClick={() => setFilters({ ...filters, status })}>
              {status === 'All' ? 'All Tickets' : status}
              <span>{status === 'All' ? tickets.length : tickets.filter(t => t.status === status).length}</span>
            </button>
          ))}
        </div>

        <div className="ticket-toolbar">
          <FilterBar filters={filters} onChange={setFilters} />
          <label className="table-search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search tickets..." />
          </label>
        </div>

        {error && <div className="page-error">{error}</div>}

        {loading ? (
          <div className="loading-state"><div className="auth-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">◻</span><p>No tickets match the current filters.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="tickets-table">
              <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map((t, i) => <TicketCard key={t.id} ticket={t} index={i} />)}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
