import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_EXPIRED_EVENT } from '../services/api'

const AuthContext = createContext(null)

const normalizeApiBaseUrl = (value) => {
  let raw = String(value || '').trim()
  raw = raw.replace(/^['"]|['"]$/g, '')
  raw = raw.replace(/^\/?VITE_API_URL\s*=\s*/i, '')
  raw = raw.replace(/^\/+(https?:\/\/)/i, '$1')
  raw = raw.replace(/\/+$/, '')

  const hostAliases = {
    'kanakadurgapickels2004.onrender.com': 'sridurgapickels2004.onrender.com',
    'kanakdurgapickels2004.onrender.com': 'sridurgapickels2004.onrender.com',
    'srikanakadurgapickels2004.onrender.com': 'sridurgapickels2004.onrender.com',
  }
  for (const [from, to] of Object.entries(hostAliases)) {
    raw = raw.replace(from, to)
  }

  if (!raw) return 'http://localhost:5000/api/v1'
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)
const AUTH_STORAGE_KEY = 'pickles_auth'

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
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
  })

  const login = async (email, password) => {
    const response = await postJson('/auth/login', {
      email: String(email || '').trim().toLowerCase(),
      password: String(password || '')
    })
    const payload = response?.data
    if (!payload?.token) {
      throw new Error('Invalid login response from server')
    }
    setAuth(payload)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    return payload
  }

  const register = async (name, email, password) => {
    const response = await postJson('/auth/register', { name, email, password })
    const payload = response?.data
    if (!payload?.token) {
      throw new Error('Invalid register response from server')
    }
    setAuth(payload)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    return payload
  }

  const logout = () => {
    setAuth(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  useEffect(() => {
    const onAuthExpired = () => {
      setAuth(null)
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired)
  }, [])

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.token),
      isAdmin: auth?.role === 'admin',
      login,
      register,
      logout
    }),
    [auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
