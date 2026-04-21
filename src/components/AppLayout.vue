<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Drawer from 'primevue/drawer'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import { useUserSession } from '@/composables/useUserSession'

const route = useRoute()
const router = useRouter()
const session = useUserSession()

const drawerVisible = ref(false)
const sidebarOpen = ref(true)

const mqDesktop =
  typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)') : null
const isDesktop = ref(mqDesktop?.matches ?? false)

function syncMq() {
  if (mqDesktop) {
    isDesktop.value = mqDesktop.matches
  }
}

function toggleMenu() {
  if (isDesktop.value) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    drawerVisible.value = !drawerVisible.value
  }
}

const menuIsOpen = computed(() =>
  isDesktop.value ? sidebarOpen.value : drawerVisible.value,
)

const menuButtonIcon = computed(() => (menuIsOpen.value ? 'pi pi-times' : 'pi pi-bars'))

const menuButtonLabel = computed(() => (menuIsOpen.value ? 'Fechar menu' : 'Abrir menu'))

const navItems = [
  { label: 'Início', to: '/', name: 'home' },
  { label: 'Agendar', to: '/agendamento', name: 'agendamento' },
  { label: 'Calendário', to: '/calendario', name: 'calendario' },
  { label: 'Pacotes', to: '/pacotes', name: 'pacotes' },
] as const

const loginVisible = ref(false)
const loginName = ref('')

function openLogin() {
  loginVisible.value = true
}

function closeLogin() {
  loginVisible.value = false
  loginName.value = ''
}

function submitLogin() {
  session.login(loginName.value)
  closeLogin()
}

const userChipTitle = computed(() => session.displayName.value)
const saldoBtnTitle = computed(
  () => `Saldo de horas: ${session.hoursBalance.value} h — ir para agendar`,
)
const saldoBadgeStr = computed(() => session.hoursBadge.value)

function closeDrawer() {
  drawerVisible.value = false
}

onMounted(() => {
  syncMq()
  mqDesktop?.addEventListener('change', syncMq)
})

onUnmounted(() => {
  mqDesktop?.removeEventListener('change', syncMq)
})

watch(
  () => route.fullPath,
  () => {
    closeDrawer()
  },
)
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <Button class="app-header__menu-btn" :icon="menuButtonIcon" severity="secondary" text rounded
        :aria-label="menuButtonLabel" :aria-expanded="menuIsOpen" @click="toggleMenu" />

      <RouterLink :to="{ name: 'home' }" class="app-header__brand" @click="closeDrawer">
        <img src="/logo.png" alt="Escola de Tênis Gandra" class="app-header__logo" width="200" height="60" />
      </RouterLink>

      <div class="app-header__actions">
        <Button icon="pi pi-calendar" severity="secondary" text rounded class="app-header__saldo" :badge="saldoBadgeStr"
          badge-severity="success" aria-label="Horas disponíveis para agendamentos" :title="saldoBtnTitle"
          @click="router.push({ name: 'agendamento' })" />
        <template v-if="!session.isLoggedIn.value">
          <Button label="Entrar" icon="pi pi-sign-in" severity="primary" size="small" class="app-header__login"
            @click="openLogin" />
        </template>
        <template v-else>
          <div class="app-header__user" :title="userChipTitle">
            <i class="pi pi-user app-header__user-icon" aria-hidden="true" />
            <span class="app-header__user-name">{{ session.displayName }}</span>
            <Button icon="pi pi-sign-out" severity="secondary" text rounded size="small" class="app-header__logout"
              aria-label="Sair" title="Sair" @click="session.logout()" />
          </div>
        </template>
      </div>
    </header>

    <Dialog v-model:visible="loginVisible" modal header="Entrar" class="app-login-dialog"
      :style="{ width: 'min(22rem, 92vw)' }" :draggable="false" @hide="loginName = ''">
      <p class="app-login-dialog__hint">Use um nome para identificar sua sessão neste dispositivo.</p>
      <FloatLabel class="app-login-dialog__field">
        <InputText id="login-nome" v-model="loginName" class="w-full" fluid autocomplete="username"
          @keyup.enter="submitLogin" />
        <label for="login-nome">Nome</label>
      </FloatLabel>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="closeLogin" />
        <Button label="Entrar" icon="pi pi-check" @click="submitLogin" />
      </template>
    </Dialog>

    <div class="app-frame">
      <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': isDesktop && !sidebarOpen }"
        aria-label="Navegação principal">
        <nav class="side-nav">
          <RouterLink v-for="item in navItems" :key="item.name" :to="item.to" class="side-nav__link"
            active-class="side-nav__link--active">
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <main class="app-main">
        <RouterView />
      </main>
    </div>

    <Drawer v-model:visible="drawerVisible" position="left" class="app-drawer" :block-scroll="true">
      <template #header>
        <div class="app-drawer__head">
          <img src="/logo.png" alt="Escola de Tênis Gandra" class="app-drawer__logo" width="168" height="50" />
        </div>
      </template>

      <nav class="drawer-nav" aria-label="Menu">
        <RouterLink v-for="item in navItems" :key="`d-${item.name}`" :to="item.to" class="drawer-nav__link"
          active-class="drawer-nav__link--active" @click="closeDrawer">
          {{ item.label }}
        </RouterLink>
        <Divider />
        <div class="drawer-account">
          <template v-if="!session.isLoggedIn.value">
            <Button label="Entrar" icon="pi pi-sign-in" fluid severity="secondary"
              @click="openLogin(); closeDrawer()" />
          </template>
          <template v-else>
            <p class="drawer-account__name">{{ session.displayName }}</p>
            <p class="drawer-account__saldo">Saldo: <strong>{{ session.hoursBalance }} h</strong></p>
            <Button label="Sair" icon="pi pi-sign-out" fluid severity="secondary" text @click="session.logout()" />
          </template>
        </div>
        <Divider />
        <Button label="Fechar menu" severity="secondary" fluid outlined class="drawer-nav__close"
          @click="closeDrawer" />
      </nav>
    </Drawer>
  </div>
</template>

<style scoped>
.app-layout {
  --app-header-height: 4.125rem;
  min-height: 100dvh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--p-surface-ground);
}

.app-header {
  flex-shrink: 0;
  height: var(--app-header-height);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem 0 0.25rem;
  background: var(--p-primary-950);
  border-bottom: 1px solid color-mix(in srgb, var(--p-primary-500), transparent 65%);
  position: sticky;
  top: 0;
  z-index: 1100;
  box-sizing: border-box;
}

.app-header__menu-btn {
  color: var(--p-primary-100) !important;
  flex-shrink: 0;
}

.app-header__brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
  border-radius: var(--p-content-border-radius);
  overflow: hidden;
  line-height: 0;
}

.app-header__logo {
  display: block;
  height: clamp(2.85rem, 6.5vw, 3.45rem);
  width: auto;
  max-width: min(58vw, 15rem);
  object-fit: contain;
  object-position: left center;
}

.app-header__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 1;
  min-width: 0;
  padding-right: 0.35rem;
}

.app-header__login {
  color: var(--p-primary-100) !important;
  border-color: color-mix(in srgb, var(--p-primary-100), transparent 55%) !important;
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  max-width: min(42vw, 11rem);
  padding: 0.15rem 0.35rem 0.15rem 0.5rem;
  border-radius: var(--p-content-border-radius);
  background: color-mix(in srgb, var(--p-primary-100), transparent 92%);
}

@media (min-width: 640px) {
  .app-header__user {
    max-width: min(36vw, 14rem);
  }
}

.app-header__user-icon {
  color: var(--p-primary-200);
  font-size: 0.95rem;
  flex-shrink: 0;
}

.app-header__user-name {
  font-size: clamp(0.78rem, 2.2vw, 0.9rem);
  font-weight: 600;
  color: var(--p-primary-50);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.app-header__logout {
  color: var(--p-primary-100) !important;
  flex-shrink: 0;
}

.app-header__saldo {
  color: var(--p-primary-100) !important;
  flex-shrink: 0;
}

.app-login-dialog__hint {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--p-surface-600);
  line-height: 1.45;
}

.app-login-dialog__field {
  width: 100%;
}

.drawer-account {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0 0.25rem;
}

.drawer-account__name {
  margin: 0;
  font-weight: 700;
  color: var(--p-surface-800);
  font-size: 0.95rem;
}

.drawer-account__saldo {
  margin: 0;
  font-size: 0.88rem;
  color: var(--p-surface-600);
}

.app-frame {
  flex: 1;
  display: flex;
  min-height: 0;
}

.app-sidebar {
  display: none;
  width: min(16rem, 28vw);
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--p-surface-50), var(--p-surface-100));
  border-right: 1px solid var(--p-surface-200);
  padding: 1rem 0;
  box-sizing: border-box;
  transition:
    width 0.25s ease,
    padding 0.25s ease,
    opacity 0.2s ease,
    border-width 0.25s ease;
  overflow: hidden;
}

.app-sidebar--collapsed {
  width: 0 !important;
  padding-left: 0;
  padding-right: 0;
  border-right-width: 0;
  opacity: 0;
  pointer-events: none;
}

@media (min-width: 1024px) {
  .app-sidebar {
    display: flex;
    flex-direction: column;
  }
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 0.75rem;
}

.side-nav__link {
  display: block;
  padding: 0.65rem 1rem;
  border-radius: var(--p-content-border-radius);
  text-decoration: none;
  color: var(--p-surface-700);
  font-weight: 600;
  font-size: 0.9375rem;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.side-nav__link:hover {
  background: color-mix(in srgb, var(--p-primary-500), transparent 88%);
  color: var(--p-primary-900);
}

.side-nav__link--active {
  background: color-mix(in srgb, var(--p-primary-500), transparent 78%);
  color: var(--p-primary-950);
  border-left: 3px solid var(--p-primary-500);
  padding-left: calc(1rem - 3px);
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.app-drawer__head {
  display: flex;
  align-items: center;
}

.app-drawer__logo {
  object-fit: contain;
  object-position: left;
  max-height: 3.15rem;
  width: auto;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.drawer-nav__link {
  display: block;
  padding: 0.85rem 1rem;
  border-radius: var(--p-content-border-radius);
  text-decoration: none;
  color: var(--p-surface-800);
  font-weight: 600;
}

.drawer-nav__link:hover {
  background: var(--p-surface-100);
}

.drawer-nav__link--active {
  background: color-mix(in srgb, var(--p-primary-500), transparent 85%);
  color: var(--p-primary-900);
}

.drawer-nav__close {
  margin-top: 0.5rem;
}
</style>
