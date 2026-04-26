<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { AgendamentoService } from '@/services/AgendamentoService'
import { QuadraService } from '@/services/QuadraService'
import type { Booking } from '@/types/api'
import { useUserSession } from '@/composables/useUserSession'
import { getApiErrorMessage } from '@/utils/apiError'
import { fromBookingDateAndTime } from '@/utils/bookingFormat'

const route = useRoute()
const router = useRouter()
const session = useUserSession()

const bookingId = computed(() => String(route.params.id ?? ''))

const booking = ref<Booking | null>(null)
const courtName = ref('')
const loadError = ref('')
const loading = ref(true)
const actionError = ref('')
const actionLoading = ref(false)

const statusNormalizado = computed(() => booking.value?.status.toLowerCase() ?? '')
const isApproved = computed(() => statusNormalizado.value === 'approved')
const isCancelled = computed(
  () => statusNormalizado.value === 'cancelled' || statusNormalizado.value === 'canceled',
)
const mostrarBotaoAprovar = computed(() => !!booking.value && !isApproved.value && !isCancelled.value)
const mostrarBotaoCancelar = computed(() => !!booking.value && !isCancelled.value)

function ensureAdminOrHome() {
  if (session.userCategory.value !== 'admin') {
    void router.replace({ name: 'home' })
    return false
  }
  return true
}

function formatarDataHora(bookingDate: string, time: string): string {
  try {
    const d = fromBookingDateAndTime(bookingDate, time)
    return d.toLocaleString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return `${bookingDate} ${time}`
  }
}

function labelStatus(status: string): string {
  const s = status.toLowerCase()
  if (s === 'pending') return 'Pendente'
  if (s === 'approved') return 'Aprovado'
  if (s === 'cancelled' || s === 'canceled') return 'Cancelado'
  return status
}

async function carregar() {
  if (!ensureAdminOrHome()) return
  const id = bookingId.value
  if (!id) {
    loadError.value = 'Agendamento inválido.'
    loading.value = false
    return
  }
  loadError.value = ''
  loading.value = true
  booking.value = null
  try {
    const b = await AgendamentoService.buscarAgendamentoPorId(id)
    if (!b) {
      loadError.value = 'Agendamento não encontrado.'
      return
    }
    booking.value = b
    const courts = await QuadraService.getQuadras()
    courtName.value = courts.find((c) => c.id === b.courtId)?.name ?? `Quadra #${b.courtId}`
  } catch (e) {
    loadError.value = getApiErrorMessage(e)
  } finally {
    loading.value = false
  }
}

async function onAprovar() {
  if (!booking.value || actionLoading.value) return
  actionError.value = ''
  actionLoading.value = true
  try {
    await AgendamentoService.aprovarAgendamento(booking.value.id)
    await router.push({ name: 'calendario' })
  } catch (e) {
    actionError.value = getApiErrorMessage(e)
  } finally {
    actionLoading.value = false
  }
}

async function onCancelar() {
  if (!booking.value || actionLoading.value) return
  actionError.value = ''
  actionLoading.value = true
  try {
    await AgendamentoService.cancelarAgendamento(booking.value.id)
    await router.push({ name: 'calendario' })
  } catch (e) {
    actionError.value = getApiErrorMessage(e)
  } finally {
    actionLoading.value = false
  }
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
  <div class="admin-ag-page">
    <main class="admin-ag-page__main">
      <Card class="admin-ag-card">
        <template #title>Detalhe do agendamento</template>
        <template #subtitle>Aprovação ou cancelamento da reserva.</template>
        <template #content>
          <Message v-if="loading" severity="secondary" :closable="false">Carregando…</Message>
          <Message v-else-if="loadError" severity="error" :closable="false">{{ loadError }}</Message>
          <template v-else-if="booking">
            <dl class="admin-ag-dl">
              <dt>Convidado / nome</dt>
              <dd>{{ booking.guestName?.trim() || '—' }}</dd>
              <dt>Quadra</dt>
              <dd>{{ courtName }}</dd>
              <dt>Data</dt>
              <dd>{{ booking.bookingDate }}</dd>
              <dt>Início</dt>
              <dd>{{ formatarDataHora(booking.bookingDate, booking.startTime) }}</dd>
              <dt>Término</dt>
              <dd>{{ formatarDataHora(booking.bookingDate, booking.endTime) }}</dd>
              <dt>Status</dt>
              <dd>{{ labelStatus(booking.status) }}</dd>
              <dt>Valor</dt>
              <dd>
                {{
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    Number(booking.price) || 0,
                  )
                }}
              </dd>
              <dt v-if="booking.userId">Usuário (id)</dt>
              <dd v-if="booking.userId">{{ booking.userId }}</dd>
              <dt>Criado em</dt>
              <dd>{{ booking.createdAt }}</dd>
              <template v-if="booking.approvedAt">
                <dt>Aprovado em</dt>
                <dd>{{ booking.approvedAt }}</dd>
              </template>
            </dl>
            <Message v-if="actionError" severity="error" class="admin-ag-msg" :closable="false">
              {{ actionError }}
            </Message>
            <div v-if="mostrarBotaoAprovar || mostrarBotaoCancelar" class="admin-ag-actions">
              <Button
                v-if="mostrarBotaoCancelar"
                label="Cancelar"
                severity="danger"
                outlined
                :disabled="actionLoading"
                @click="onCancelar"
              />
              <Button
                v-if="mostrarBotaoAprovar"
                label="Aprovar"
                :loading="actionLoading"
                :disabled="actionLoading"
                @click="onAprovar"
              />
            </div>
          </template>
        </template>
      </Card>
    </main>
  </div>
</template>

<style scoped>
.admin-ag-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--app-header-height, 3.5rem));
  background: linear-gradient(180deg, var(--p-surface-50), var(--p-surface-100));
}

.admin-ag-page__main {
  flex: 1;
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 3vw, 1.5rem) 2rem;
  max-width: min(40rem, 100%);
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.admin-ag-card {
  border-radius: var(--p-content-border-radius);
  box-shadow:
    0 4px 6px -1px color-mix(in srgb, var(--p-primary-950) 12%, transparent),
    0 2px 4px -2px color-mix(in srgb, var(--p-primary-950) 10%, transparent);
}

.admin-ag-dl {
  display: grid;
  grid-template-columns: minmax(6rem, 10rem) 1fr;
  gap: 0.5rem 1rem;
  margin: 0 0 1.25rem;
}

.admin-ag-dl dt {
  margin: 0;
  font-weight: 600;
  color: var(--p-surface-600);
  font-size: 0.875rem;
}

.admin-ag-dl dd {
  margin: 0;
  color: var(--p-surface-900);
}

.admin-ag-msg {
  margin-bottom: 1rem;
}

.admin-ag-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--p-content-border-color);
}

:deep(.p-card-title) {
  color: var(--p-primary-800);
}

:deep(.p-card-subtitle) {
  color: var(--p-surface-600);
}
</style>
