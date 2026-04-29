<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import { getUserTypeChipClass, getUserTypeLabel } from '@/enums/userType'
import { useUserSession } from '@/composables/useUserSession'
import { userService } from '@/services/userService'
import type { AppUser } from '@/types/user'
import { getApiErrorMessage } from '@/utils/apiError'

const router = useRouter()
const session = useUserSession()

const loading = ref(true)
const loadError = ref('')
const users = ref<AppUser[]>([])

function ensureAdminOrHome(): boolean {
  if (session.userCategory.value !== 'admin') {
    void router.replace({ name: 'home' })
    return false
  }
  return true
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function irParaEdicao(row: AppUser) {
  void router.push({
    name: 'admin-usuario-editar',
    params: { id: String(row.id) },
  })
}

async function carregar() {
  if (!ensureAdminOrHome()) return
  loading.value = true
  loadError.value = ''
  try {
    users.value = await userService.buscarUsuarios()
  } catch (e) {
    loadError.value = getApiErrorMessage(e)
    users.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!ensureAdminOrHome()) return
  void carregar()
})
</script>

<template>
  <div class="admin-users-page">
    <main class="admin-users-page__main">
      <Card class="admin-users-card">
        <template #title>Usuários cadastrados</template>
        <template #subtitle>Listagem de todos os usuários do sistema.</template>
        <template #content>
          <Message v-if="loading" severity="secondary" :closable="false">Carregando…</Message>
          <Message v-else-if="loadError" severity="error" :closable="false">{{ loadError }}</Message>
          <template v-else>
            <Message
              v-if="!users.length"
              severity="secondary"
              :closable="false"
              class="admin-users-empty"
            >
              Nenhum usuário encontrado.
            </Message>
            <DataTable
              v-else
              :value="users"
              data-key="id"
              striped-rows
              :paginator="users.length > 10"
              :rows="10"
              :rows-per-page-options="[10, 25, 50]"
              responsive-layout="scroll"
              class="admin-users-table"
            >
              <Column field="id" header="ID" :sortable="true" style="min-width: 5rem" />
              <Column field="name" header="Nome" :sortable="true" style="min-width: 10rem" />
              <Column field="email" header="E-mail" :sortable="true" style="min-width: 12rem" />
              <Column field="phone" header="Telefone" style="min-width: 8rem">
                <template #body="slotProps">
                  {{ formatCell(slotProps.data.phone) }}
                </template>
              </Column>
              <Column field="userType" header="Tipo" :sortable="true" style="min-width: 9rem">
                <template #body="slotProps">
                  <Chip
                    :label="getUserTypeLabel(slotProps.data.userType)"
                    :class="getUserTypeChipClass(slotProps.data.userType)"
                  />
                </template>
              </Column>
              <Column
                v-if="users.some((u) => u.createdAt)"
                field="createdAt"
                header="Criado em"
                style="min-width: 9rem"
              >
                <template #body="slotProps">
                  {{ formatCell(slotProps.data.createdAt) }}
                </template>
              </Column>
              <Column
                v-if="users.some((u) => u.updatedAt)"
                field="updatedAt"
                header="Atualizado em"
                style="min-width: 9rem"
              >
                <template #body="slotProps">
                  {{ formatCell(slotProps.data.updatedAt) }}
                </template>
              </Column>
              <Column header="Ações" style="width: 5rem; text-align: end">
                <template #body="slotProps">
                  <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="secondary"
                    aria-label="Editar usuário"
                    title="Editar"
                    @click="irParaEdicao(slotProps.data)"
                  />
                </template>
              </Column>
            </DataTable>
          </template>
        </template>
      </Card>
    </main>
  </div>
</template>

<style scoped>
.admin-users-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--app-header-height, 3.5rem));
  background: linear-gradient(180deg, var(--p-surface-50), var(--p-surface-100));
}

.admin-users-page__main {
  flex: 1;
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 3vw, 1.5rem) 2rem;
  max-width: min(72rem, 100%);
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.admin-users-card {
  border-radius: var(--p-content-border-radius);
  box-shadow:
    0 4px 6px -1px color-mix(in srgb, var(--p-primary-950) 12%, transparent),
    0 2px 4px -2px color-mix(in srgb, var(--p-primary-950) 10%, transparent);
}

.admin-users-empty {
  margin-top: 1rem;
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

:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-card-title) {
  color: var(--p-primary-800);
}

:deep(.p-card-subtitle) {
  color: var(--p-surface-600);
}
</style>
