import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    axios
      .get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = token => {
    localStorage.setItem('token', token)
    return axios
      .get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setUser(res.data); return res.data })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
