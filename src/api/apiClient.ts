import axios from 'axios'

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
