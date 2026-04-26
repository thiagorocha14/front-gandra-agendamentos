import { computed, readonly, ref } from 'vue'
import { AuthService } from '@/services/AuthService'
import type { AuthResponse, AuthUser } from '@/types/auth'
import {
  loadUserSession,
  saveUserSession,
  type PersistedSession,
} from '@/session/userSessionStorage'

type UserCategory = 'admin' | 'user'

const isLoggedIn = ref(false)
const displayName = ref('')
const hoursBalance = ref(0)
const userCategory = ref<UserCategory>('user')
const accessToken = ref('')
const user = ref<AuthUser | null>(null)

let hydrated = false

const PACKAGE_HOURS: Record<string, number> = {
  basico: 8,
  plus: 12,
  trimestral: 36,
}

function userTypeToCategory(userType: string): UserCategory {
  const u = userType.toLowerCase()
  if (u === 'admin' || u === 'administrator') return 'admin'
  return 'user'
}

function applyPersistedSession(data: PersistedSession) {
  isLoggedIn.value = true
  accessToken.value = data.accessToken
  user.value = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    userType: data.user.userType,
    phone: data.user.phone,
  }
  displayName.value = data.user.name.trim() || 'Aluno'
  userCategory.value = userTypeToCategory(data.user.userType)
  hoursBalance.value = Number.isFinite(data.hoursBalance) ? data.hoursBalance : 0
}

function hydrate() {
  if (hydrated || typeof localStorage === 'undefined') return
  hydrated = true
  const data = loadUserSession()
  if (!data) return
  applyPersistedSession(data)
}

function persist() {
  if (typeof localStorage === 'undefined') return
  if (!isLoggedIn.value || !user.value || !accessToken.value) return
  saveUserSession({
    accessToken: accessToken.value,
    user: {
      id: user.value.id,
      name: user.value.name,
      email: user.value.email,
      userType: user.value.userType,
      phone: user.value.phone,
    },
    hoursBalance: hoursBalance.value,
  })
}

export function useUserSession() {
  hydrate()

  /** Persiste token e usuário após login ou cadastro bem-sucedido. */
  function setFromAuthResponse(response: AuthResponse) {
    isLoggedIn.value = true
    accessToken.value = response.accessToken
    user.value = { ...response.user }
    displayName.value = response.user.name.trim() || 'Aluno'
    userCategory.value = userTypeToCategory(response.user.userType)
    persist()
  }

  function logout() {
    AuthService.logOut()
  }

  /** Credita horas ao comprar um pacote (ids: basico, plus, trimestral). */
  function addPackageHours(packageId: string) {
    const h = PACKAGE_HOURS[packageId] ?? 0
    hoursBalance.value += h
    persist()
    return h
  }

  const hoursBadge = computed(() =>
    hoursBalance.value > 0 ? String(hoursBalance.value) : '8h',
  )

  return {
    isLoggedIn: readonly(isLoggedIn),
    displayName: readonly(displayName),
    hoursBalance: readonly(hoursBalance),
    userCategory: readonly(userCategory),
    accessToken: readonly(accessToken),
    user: readonly(user),
    hoursBadge,
    setFromAuthResponse,
    logout,
    addPackageHours,
  }
}
