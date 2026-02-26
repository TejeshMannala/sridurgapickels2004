import axios from 'axios'

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
export const AUTH_EXPIRED_EVENT = 'pickles:auth-expired'
const AUTH_STORAGE_KEY = 'pickles_auth'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

let handlingAuthError = false

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = String(error?.config?.url || '')
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem(AUTH_STORAGE_KEY)

      if (!handlingAuthError) {
        handlingAuthError = true
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
        setTimeout(() => {
          handlingAuthError = false
        }, 0)
      }
    }

    return Promise.reject(error)
  }
)

export const authHeaders = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {}
