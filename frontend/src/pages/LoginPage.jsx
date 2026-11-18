import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate(user.role === 'support_staff' ? '/staff' : '/dashboard', { replace: true })
  }, [user, navigate])

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-icon">▣</span>
          <span className="login-brand-name">SupportDesk</span>
        </div>
        <div className="login-tagline">
          <h1>IT support,<br />without the chaos.</h1>
          <p>Submit tickets, track progress, communicate with your IT team — all in one place.</p>
        </div>
        <div className="login-features">
          {['Track every ticket in real time', 'Support staff see the full picture', 'Comments keep everyone aligned'].map(f => (
            <div key={f} className="login-feature-item">
              <span className="login-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-card-title">Sign in</h2>
          <p className="login-card-sub">Use your company Google account to continue.</p>
          <a href={`${API_BASE}/auth/login`} className="google-signin-btn">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.1-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.9 0-14.7 4.5-18.7 11.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.5-1.9 14.4-5.2l-6.7-5.5C29.5 36.1 26.9 37 24 37c-6.1 0-10.7-3.1-11.8-7.5l-7 5.4C9.3 40.5 16.1 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.6 2.1-1.9 3.9-3.6 5.3l6.7 5.5C42.5 36.1 45 30.4 45 24c0-1.4-.1-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </a>
          <p className="login-disclaimer">
            Your role is determined by your email address.<br />
            Contact your administrator if you have access issues.
          </p>
        </div>
      </div>
    </div>
  )
}
