<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { UserType, getUserTypeChipClass, getUserTypeLabel } from '@/enums/userType'
import { useUserSession } from '@/composables/useUserSession'
import { userService } from '@/services/userService'
import type { AppUser } from '@/types/user'
import { getApiErrorMessage } from '@/utils/apiError'

const route = useRoute()
const router = useRouter()
const session = useUserSession()

const userId = computed(() => String(route.params.id ?? ''))

const loading = ref(true)
const loadError = ref('')
const saveError = ref('')
const saving = ref(false)

const loadedUser = ref<AppUser | null>(null)

const name = ref('')
const email = ref('')
const phone = ref('')
/** Valores permitidos no select: apenas Padrão / Mensalista */
const userTypeSelecionado = ref<string>(UserType.Regular)

const opcoesTipoUsuario = [
  { label: 'Padrão', value: UserType.Regular },
  { label: 'Mensalista', value: UserType.Member },
]

const isEditingSelf = computed(
  () =>
    session.user.value != null &&
    String(session.user.value.id) === userId.value,
)

const isTargetAdmin = computed(() => {
  const t = loadedUser.value?.userType?.toLowerCase() ?? ''
  return t === 'admin' || t === 'administrator'
})

/** Select só para não-admin alvo; administrador do sistema não altera o próprio tipo. */
const mostrarSelectTipo = computed(
  () => !isTargetAdmin.value && !isEditingSelf.value,
)

const tipoSomenteLeituraLabel = computed(() => {
  if (!loadedUser.value) return ''
  return getUserTypeLabel(loadedUser.value.userType)
})

function ensureAdminOrHome(): boolean {
  if (session.userCategory.value !== 'admin') {
    void router.replace({ name: 'home' })
    return false
  }
  return true
}

function preencherForm(u: AppUser) {
  name.value = u.name ?? ''
  email.value = u.email ?? ''
  phone.value = u.phone ?? ''
  const t = u.userType?.toLowerCase() ?? ''
  if (t === UserType.Member) userTypeSelecionado.value = UserType.Member
  else userTypeSelecionado.value = UserType.Regular
}

async function carregar() {
  if (!ensureAdminOrHome()) return
  const id = userId.value
  if (!id) {
    loadError.value = 'Usuário inválido.'
    loading.value = false
    return
  }
  loadError.value = ''
  loading.value = true
  loadedUser.value = null
  try {
    const u = await userService.buscarUsuario(id)
    loadedUser.value = u
    preencherForm(u)
  } catch (e) {
    loadError.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}

async function salvar() {
  if (!loadedUser.value || saving.value) return
  saveError.value = ''
  saving.value = true
  try {
    const id = userId.value
    const payload: {
      name: string
      email: string
      phone?: string | null
      userType?: string
    } = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim() || null,
    }
    if (mostrarSelectTipo.value) {
      payload.userType = userTypeSelecionado.value
    }
    await userService.atualizarUsuario(id, payload)
    await router.push({ name: 'admin-usuarios' })
  } catch (e) {
    saveError.value = getApiErrorMessage(e)
  } finally {
    saving.value = false
  }
}

function voltarLista() {
  void router.push({ name: 'admin-usuarios' })
}

onMounted(() => {
  if (!ensureAdminOrHome()) return
  void carregar()
})

watch(
  () => route.params.id,
  () => {
    if (ensureAdminOrHome()) void carregar()
  },
)
</script>

<template>
  <div class="admin-user-edit-page">
    <main class="admin-user-edit-page__main">
      <Card class="admin-user-edit-card">
        <template #title>Editar usuário</template>
        <template #subtitle>Atualize os dados do cadastro.</template>
        <template #content>
          <Message v-if="loading" severity="secondary" :closable="false">Carregando…</Message>
          <Message v-else-if="loadError" severity="error" :closable="false">{{ loadError }}</Message>
          <template v-else-if="loadedUser">
            <div class="form-grid">
              <FloatLabel variant="in">
                <InputText id="edit-nome" v-model="name" class="w-full" fluid maxlength="120" />
                <label for="edit-nome">Nome</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText
                  id="edit-email"
                  v-model="email"
                  class="w-full"
                  fluid
                  maxlength="120"
                  type="email"
                  autocomplete="email"
                />
                <label for="edit-email">E-mail</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText id="edit-phone" v-model="phone" class="w-full" fluid maxlength="30" type="tel" />
                <label for="edit-phone">Telefone</label>
              </FloatLabel>

              <div v-if="mostrarSelectTipo" class="field-tipo">
                <FloatLabel variant="in">
                  <Select
                    v-model="userTypeSelecionado"
                    input-id="edit-usertype"
                    :options="opcoesTipoUsuario"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                    fluid
                  />
                  <label for="edit-usertype">Tipo de usuário</label>
                </FloatLabel>
              </div>
              <div v-else class="field-tipo field-tipo--readonly">
                <span class="field-tipo__label">Tipo de usuário</span>
                <Chip
                  :label="tipoSomenteLeituraLabel"
                  :class="getUserTypeChipClass(loadedUser.userType)"
                />
                <p v-if="isEditingSelf" class="field-tipo__hint">
                  Você não pode alterar o seu próprio tipo de usuário.
                </p>
              </div>

              <Message v-if="saveError" severity="error" :closable="false">{{ saveError }}</Message>

              <div class="form-actions">
                <Button label="Cancelar" severity="secondary" outlined @click="voltarLista" />
                <Button label="Salvar usuário" :loading="saving" :disabled="saving" @click="salvar" />
              </div>
            </div>
          </template>
        </template>
      </Card>
    </main>
  </div>
</template>

<style scoped>
.admin-user-edit-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--app-header-height, 3.5rem));
  background: linear-gradient(180deg, var(--p-surface-50), var(--p-surface-100));
}

.admin-user-edit-page__main {
  flex: 1;
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 3vw, 1.5rem) 2rem;
  max-width: min(36rem, 100%);
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.admin-user-edit-card {
  border-radius: var(--p-content-border-radius);
  box-shadow:
    0 4px 6px -1px color-mix(in srgb, var(--p-primary-950) 12%, transparent),
    0 2px 4px -2px color-mix(in srgb, var(--p-primary-950) 10%, transparent);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.field-tipo--readonly {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.field-tipo__label {
  font-size: 0.75rem;
  color: var(--p-surface-600);
  font-weight: 600;
}

.field-tipo__hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-surface-600);
}

:deep(.user-type-chip) {
  font-weight: 600;
  border-radius: var(--p-content-border-radius);
}

:deep(.user-type-chip--regular) {
  background: var(--p-green-500) !important;
  color: var(--p-primary-50) !important;
}

:deep(.user-type-chip--admin) {
  background: var(--p-surface-500) !important;
  color: var(--p-primary-50) !important;
}

:deep(.user-type-chip--member) {
  background: var(--p-orange-500) !important;
  color: var(--p-primary-950) !important;
}

:deep(.user-type-chip--unknown) {
  background: var(--p-surface-400) !important;
  color: var(--p-primary-950) !important;
}

:deep(.p-card-title) {
  color: var(--p-primary-800);
}

:deep(.p-card-subtitle) {
  color: var(--p-surface-600);
}
</style>
