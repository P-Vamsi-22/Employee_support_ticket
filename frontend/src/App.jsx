import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import EmployeeDashboard from './pages/EmployeeDashboard'
import StaffDashboard from './pages/StaffDashboard'
import TicketDetail from './pages/TicketDetail'
import CreateTicket from './pages/CreateTicket'

const HIDE_NAV = ['/login', '/auth/callback']

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  if (loading) return <FullSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'support_staff' ? '/staff' : '/dashboard'} replace />
  }
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) return <FullSpinner />

  return (
    <>
      {!HIDE_NAV.includes(pathname) && <Navbar />}
      <Routes>
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute requiredRole="support_staff"><StaffDashboard /></ProtectedRoute>
        } />
        <Route path="/tickets/new" element={
          <ProtectedRoute><CreateTicket /></ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={
          <ProtectedRoute><TicketDetail /></ProtectedRoute>
        } />

        <Route path="/" element={
          user
            ? <Navigate to={user.role === 'support_staff' ? '/staff' : '/dashboard'} replace />
            : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function FullSpinner() {
  return (
    <div className="auth-callback-page">
      <div className="auth-spinner" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
