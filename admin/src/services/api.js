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
  }
  for (const [from, to] of Object.entries(hostAliases)) {
    raw = raw.replace(from, to)
  }

  if (!raw) return 'http://localhost:5000/api/v1'
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`
}

const baseURL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)
export const AUTH_EXPIRED_EVENT = 'pickles_admin:auth-expired'

export const api = axios.create({ baseURL })

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
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
