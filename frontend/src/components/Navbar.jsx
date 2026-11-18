import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }
  const home = user?.role === 'support_staff' ? '/staff' : '/dashboard'

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to={home} className="brand">
          <span className="brand-icon">▣</span>
          <span className="brand-text">SupportDesk</span>
        </Link>

        {user && (
          <nav className="header-nav">
            <Link
              to="/tickets/new"
              className={`nav-btn nav-btn-primary ${pathname === '/tickets/new' ? 'active' : ''}`}
            >
              + New Ticket
            </Link>

            <div className="user-pill">
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <span className={`role-badge ${user.role === 'support_staff' ? 'role-staff' : 'role-employee'}`}>
                {user.role === 'support_staff' ? 'Staff' : 'Employee'}
              </span>
            </div>

            <button className="nav-btn nav-btn-ghost" onClick={handleLogout}>
              Sign out
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
