import { apiClient } from '@/api/apiClient'
import type { Booking, CreateBookingPayload } from '@/types/api'

export const AgendamentoService = {
  async salvarAgendamento(payload: CreateBookingPayload): Promise<Booking> {
    const { data } = await apiClient.post<Booking>('/bookings', payload)
    return data
  },

  async buscarAgendamentos(): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>('/bookings')
    return Array.isArray(data) ? data : []
  },
}
