import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { navigate('/login', { replace: true }); return }

    login(token)
      .then(userData => {
        navigate(userData.role === 'support_staff' ? '/staff' : '/dashboard', { replace: true })
      })
      .catch(() => navigate('/login', { replace: true }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="auth-callback-page">
      <div className="auth-callback-inner">
        <div className="auth-spinner" />
        <p className="auth-callback-text">Signing you in…</p>
      </div>
    </div>
  )
}
