import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')

  const handleLogout = () => { logout(); navigate('/login') }
  const home = user?.role === 'support_staff' ? '/staff' : '/dashboard'
  const initials = user?.name?.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const updateSearch = value => {
    setQuery(value)
    window.dispatchEvent(new CustomEvent('supportdesk-search', { detail: value }))
  }

  return (
    <>
      {user && (
        <>
          <aside className="app-sidebar">
            <Link to={home} className="brand" aria-label="SupportDesk dashboard">
              <span className="brand-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12h8M12 8v8"/></svg>
              </span>
              <span className="brand-text">SupportDesk</span>
            </Link>

            <nav className="sidebar-nav" aria-label="Primary navigation">
              <Link to={home} className={`sidebar-link ${pathname === home ? 'active' : ''}`}>
                <svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>
                <span>My Tickets</span>
              </Link>
              <Link to="/tickets/new" className={`sidebar-link ${pathname === '/tickets/new' ? 'active' : ''}`}>
                <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
                <span>Create Ticket</span>
              </Link>
              <span className="sidebar-link muted-link">
                <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M12 5v14"/></svg>
                <span>Knowledge Base</span>
              </span>
              <span className="sidebar-link muted-link">
                <svg viewBox="0 0 24 24"><path d="M4 13h3l2-3 3 7 3-9 2 5h3"/><path d="M5 20h14"/></svg>
                <span>Announcements</span>
              </span>
              <span className="sidebar-link muted-link">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a3 3 0 015.4 1.8c0 2-2.9 2.2-2.9 4.2M12 18h.01"/></svg>
                <span>Help &amp; Support</span>
              </span>
            </nav>

            <div className="support-card">
              <div className="support-icon">
                <svg viewBox="0 0 24 24"><path d="M4 13v-2a8 8 0 0116 0v2"/><path d="M4 13a2 2 0 012-2h1v6H6a2 2 0 01-2-2v-2zm16 0a2 2 0 00-2-2h-1v6h1a2 2 0 002-2v-2z"/><path d="M17 17c0 2-2 3-5 3"/></svg>
              </div>
              <strong>Need immediate help?</strong>
              <span>Contact the IT support team</span>
              <a href="mailto:support@supportdesk.local">Contact Support <b>↗</b></a>
            </div>
          </aside>

          <header className="app-header">
            <div className="header-inner">
              <label className="top-search">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>
                <input
                  value={query}
                  onChange={event => updateSearch(event.target.value)}
                  placeholder="Search tickets, categories..."
                  aria-label="Search tickets"
                />
                <span>Ctrl + K</span>
              </label>

              <div className="header-actions">
                <button className="notification-btn" type="button" aria-label="Notifications">
                  <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
                  <i />
                </button>
                <button className="profile-button" type="button" onClick={handleLogout} title="Sign out">
                  <span className="profile-avatar">{initials}</span>
                  <span className="profile-copy">
                    <strong>{user.name}</strong>
                    <small>{user.role === 'support_staff' ? 'Support Staff' : 'Employee'}</small>
                  </span>
                  <svg viewBox="0 0 24 24"><path d="M8 10l4 4 4-4"/></svg>
                </button>
              </div>
            </div>
          </header>
        </>
      )}
    </>
  )
}
