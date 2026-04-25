import { computed, readonly, ref } from 'vue'

const STORAGE_KEY = 'gandra-user-session-v1'
type UserCategory = 'admin' | 'user'

const isLoggedIn = ref(false)
const displayName = ref('')
const hoursBalance = ref(0)
const userCategory = ref<UserCategory>('admin')

let hydrated = false

const PACKAGE_HOURS: Record<string, number> = {
  basico: 8,
  plus: 12,
  trimestral: 36,
};

function hydrate() {
  if (hydrated || typeof localStorage === 'undefined') return
  hydrated = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as {
      isLoggedIn?: boolean
      displayName?: string
      hoursBalance?: number
      userCategory?: UserCategory
    }
    isLoggedIn.value = !!data.isLoggedIn
    displayName.value = typeof data.displayName === 'string' ? data.displayName : ''
    hoursBalance.value = Number.isFinite(data.hoursBalance) ? Number(data.hoursBalance) : 0
    userCategory.value = data.userCategory === 'admin' ? 'admin' : 'user'
  } catch {
    /* ignore */
  }
}

function persist() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      isLoggedIn: isLoggedIn.value,
      displayName: displayName.value,
      hoursBalance: hoursBalance.value,
      userCategory: userCategory.value,
    }),
  )
}

export function useUserSession() {
  hydrate()

  function login(name: string, category?: UserCategory) {
    isLoggedIn.value = true
    const normalizedName = name.trim() || 'Aluno'
    displayName.value = normalizedName
    userCategory.value =
      category ?? (normalizedName.toLowerCase() === 'admin' ? 'admin' : 'user')
    persist()
  }

  function logout() {
    isLoggedIn.value = false
    displayName.value = ''
    userCategory.value = 'user'
    persist()
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
  );

  console.log(userCategory.value);

  return {
    isLoggedIn: readonly(isLoggedIn),
    displayName: readonly(displayName),
    hoursBalance: readonly(hoursBalance),
    userCategory: readonly(userCategory),
    hoursBadge,
    login,
    logout,
    addPackageHours,
  }
}
