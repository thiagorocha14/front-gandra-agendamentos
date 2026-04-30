import axios from 'axios'
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

  /** Tenta GET /bookings/:id; se 404, localiza na lista completa. */
  async buscarAgendamentoPorId(id: string): Promise<Booking | null> {
    try {
      const { data } = await apiClient.get<Booking>(`/bookings/${id}`)
      return data
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        const list = await AgendamentoService.buscarAgendamentos()
        return list.find((b) => b.id === id) ?? null
      }
      throw e
    }
  },

  async aprovarAgendamento(id: string): Promise<Booking> {
    const { data } = await apiClient.patch<Booking>(`/bookings/approve-booking/${id}`)
    return data
  },

  async cancelarAgendamento(id: string): Promise<Booking> {
    const { data } = await apiClient.patch<Booking>(`/bookings/cancel-booking/${id}`)
    return data
  },
}
