import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  console.warn(
    '[apiClient] VITE_API_URL não está definido. Configure a variável no arquivo .env.',
  )
}

export const apiClient = axios.create({
  baseURL: baseURL || undefined,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
