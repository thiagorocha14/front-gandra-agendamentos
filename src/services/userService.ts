import { apiClient } from '@/api/apiClient'
import type { AppUser, AtualizarUsuarioPayload } from '@/types/user'

export const userService = {
  async buscarUsuario(id: string | number): Promise<AppUser> {
    const { data } = await apiClient.get<AppUser>(`/users/${id}`)
    return data
  },

  async buscarUsuarios(): Promise<AppUser[]> {
    const { data } = await apiClient.get<AppUser[]>('/users')
    return Array.isArray(data) ? data : []
  },

  async atualizarUsuario(
    id: string | number,
    payload: AtualizarUsuarioPayload,
  ): Promise<AppUser> {
    const { data } = await apiClient.patch<AppUser>(`/users/${id}`, payload)
    return data
  },
}
