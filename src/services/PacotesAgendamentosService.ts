import { apiClient } from '@/api/apiClient'
import type { BookingBundle, CreateBookingBundleInput } from '@/types/api'

export const PacotesAgendamentosService = {
  async buscarPacotes(): Promise<BookingBundle[]> {
    const { data } = await apiClient.get<BookingBundle[]>('/booking-bundles')
    return Array.isArray(data) ? data : []
  },

  async criarPacote(payload: CreateBookingBundleInput): Promise<BookingBundle> {
    const formData = new FormData()
    formData.append('name', payload.name)
    formData.append('description', payload.description)
    formData.append('totalHours', String(payload.totalHours))
    formData.append('price', payload.price)
    formData.append('active', String(payload.active ?? true))
    formData.append('coverImage', payload.coverImage)

    const { data } = await apiClient.post<BookingBundle>('/booking-bundles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return data
  },
}
