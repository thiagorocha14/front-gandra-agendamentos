/** Chave única do armazenamento local da sessão (token + usuário + saldo). */
export const USER_SESSION_STORAGE_KEY = 'gandra-user-session-v2'

export type PersistedAuthUser = {
  id: number | string
  name: string
  email: string
  userType: string
  phone?: string | null
}

export type PersistedSession = {
  accessToken: string
  user: PersistedAuthUser
  hoursBalance: number
}

export function loadUserSession(): PersistedSession | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_SESSION_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<PersistedSession>
    if (!data.accessToken || typeof data.accessToken !== 'string') return null
    if (!data.user || typeof data.user !== 'object') return null
    const u = data.user as Partial<PersistedAuthUser>
    if (typeof u.name !== 'string' || typeof u.email !== 'string' || u.id === undefined) return null
    if (typeof u.userType !== 'string') return null
    const hoursBalance = Number.isFinite(data.hoursBalance) ? Number(data.hoursBalance) : 0
    return {
      accessToken: data.accessToken,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        userType: u.userType,
        phone: u.phone ?? undefined,
      },
      hoursBalance,
    }
  } catch {
    return null
  }
}

export function saveUserSession(data: PersistedSession): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(data))
}

export function clearUserSessionStorage(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(USER_SESSION_STORAGE_KEY)
}
