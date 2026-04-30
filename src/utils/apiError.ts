import axios from 'axios'

function normalizeMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) return message.trim()
  if (Array.isArray(message)) {
    const parts = message.filter(
      (m): m is string => typeof m === 'string' && m.trim().length > 0,
    )
    if (parts.length) return parts.join(', ')
  }
  return null
}

/** Extrai mensagem amigável de erros Nest/axios (400, 404, 409, etc.). */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const body = error.response?.data as { message?: unknown } | undefined
    const fromBody = normalizeMessage(body?.message)
    if (fromBody) return fromBody
    if (status === 404) return 'Quadra não encontrada ou inativa.'
    if (status === 409) return 'Já existe agendamento para esta quadra neste horário.'
  }
  return 'Não foi possível concluir a operação. Tente novamente.'
}
