import { apiClient } from '@/api/apiClient'
import type { Court } from '@/types/api'

export const QuadraService = {
  async getQuadras(): Promise<Court[]> {
    const { data } = await apiClient.get<Court[]>('/courts')
    return data
  },
}
