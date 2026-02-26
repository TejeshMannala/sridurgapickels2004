import axios from 'axios'

const normalizeApiBaseUrl = (value) => {
  const raw = String(value || '').trim().replace(/\/+$/, '')
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
