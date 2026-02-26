import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_EXPIRED_EVENT } from '../services/api'

const AuthContext = createContext(null)
const KEY = 'pickles_admin_auth'
const normalizeApiBaseUrl = (value) => {
  let raw = String(value || '').trim()
  raw = raw.replace(/^['"]|['"]$/g, '')
  raw = raw.replace(/^\/?VITE_API_URL\s*=\s*/i, '')
  raw = raw.replace(/^\/+(https?:\/\/)/i, '$1')
  raw = raw.replace(/\/+$/, '')

  const hostAliases = {
    'kanakadurgapickels2004.onrender.com': 'sridurgapickels2004.onrender.com',
    'kanakdurgapickels2004.onrender.com': 'sridurgapickels2004.onrender.com',
  }
  for (const [from, to] of Object.entries(hostAliases)) {
    raw = raw.replace(from, to)
  }

  if (!raw) return 'http://localhost:5000/api/v1'
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)

const postJson = async (path, payload) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(json?.message || `Request failed with status ${response.status}`)
  }
  return json
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  })

  const login = async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPassword = String(password || '')
    const response = await postJson('/auth/login', {
      email: normalizedEmail,
      password: normalizedPassword
    })
    const payload = response?.data
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
