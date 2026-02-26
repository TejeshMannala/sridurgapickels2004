import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { AUTH_EXPIRED_EVENT } from '../services/api'

const AuthContext = createContext(null)

const normalizeApiBaseUrl = (value) => {
  const raw = String(value || '').trim().replace(/\/+$/, '')
  if (!raw) return 'http://localhost:5000/api/v1'
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)
const AUTH_STORAGE_KEY = 'pickles_auth'

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
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: String(email || '').trim().toLowerCase(),
      password: String(password || '')
    })
    const payload = response?.data?.data
    if (!payload?.token) {
      throw new Error('Invalid login response from server')
    }
    setAuth(payload)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    return payload
  }

  const register = async (name, email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password })
    const payload = response?.data?.data
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
