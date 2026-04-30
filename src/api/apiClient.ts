import axios from 'axios'
import { USER_SESSION_STORAGE_KEY } from '@/session/userSessionStorage'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

if (!API_BASE_URL) {
  console.warn(
    '[apiClient] VITE_API_URL não está definido. Configure a variável no arquivo .env.',
  )
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof localStorage === 'undefined') return config
  try {
    const raw = localStorage.getItem(USER_SESSION_STORAGE_KEY)
    if (!raw) return config
    const parsed = JSON.parse(raw) as { accessToken?: string }
    if (typeof parsed.accessToken === 'string' && parsed.accessToken) {
      config.headers.Authorization = `Bearer ${parsed.accessToken}`
    }
  } catch {
    /* ignore */
  }
  return config
})
