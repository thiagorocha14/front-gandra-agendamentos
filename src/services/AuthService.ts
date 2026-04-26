import { apiClient } from '@/api/apiClient'
import { clearUserSessionStorage } from '@/session/userSessionStorage'
import type { AuthResponse, SignInPayload, SignUpPayload } from '@/types/auth'

export const AuthService = {
  async signIn(payload: SignInPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/sign-in', payload)
    return data
  },

  async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/sign-up', payload)
    return data
  },

  /** Remove a sessão persistida e recarrega a aplicação. */
  logOut(): void {
    clearUserSessionStorage()
    window.location.reload()
  },
}
