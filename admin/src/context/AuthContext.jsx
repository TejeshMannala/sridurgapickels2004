import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, AUTH_EXPIRED_EVENT } from '../services/api'

const AuthContext = createContext(null)
const KEY = 'pickles_admin_auth'

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  })

  const login = async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPassword = String(password || '')
    const response = await api.post('/auth/login', {
      email: normalizedEmail,
      password: normalizedPassword
    })
    const payload = response?.data?.data
    if (!payload?.token || payload?.role !== 'admin') {
      throw new Error('Admin access required')
    }
    setAuth(payload)
    localStorage.setItem(KEY, JSON.stringify(payload))
    return payload
  }

  const logout = () => {
    setAuth(null)
    localStorage.removeItem(KEY)
  }

  useEffect(() => {
    const handleAuthExpired = () => {
      setAuth(null)
      localStorage.removeItem(KEY)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
  }, [])

  const value = useMemo(
    () => ({
      auth,
      token: auth?.token,
      isAuthenticated: Boolean(auth?.token),
      login,
      logout
    }),
    [auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
