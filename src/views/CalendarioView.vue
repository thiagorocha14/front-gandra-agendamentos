<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VueCal, type VueCalEvent } from 'vue-cal'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Button from 'primevue/button'
import { AgendamentoService } from '@/services/AgendamentoService'
import { QuadraService } from '@/services/QuadraService'
import type { Booking, Court } from '@/types/api'
import { getApiErrorMessage } from '@/utils/apiError'
import { fromBookingDateAndTime } from '@/utils/bookingFormat'

const QUADRA_CLASSES = ['quadra-1', 'quadra-2', 'quadra-3', 'quadra-4'] as const

const events = ref<VueCalEvent[]>([])
const schedules = ref<{ id: number; class: string; label: string }[]>([])

const loadError = ref('')
const loading = ref(true)

function courtClassForIndex(index: number): string {
  return QUADRA_CLASSES[index % QUADRA_CLASSES.length]!
}

function schedulesFromCourts(courts: Court[]): { id: number; class: string; label: string }[] {
  return courts.map((c, i) => ({
    id: c.id,
    class: courtClassForIndex(i),
    label: c.name,
  }))
}

function bookingToEvent(
  booking: Booking,
  courtNameById: Map<number, string>,
): VueCalEvent | null {
  try {
    const start = fromBookingDateAndTime(booking.bookingDate, booking.startTime)
    const end = fromBookingDateAndTime(booking.bookingDate, booking.endTime)
    if (!(start.getTime() < end.getTime())) return null
    const nome = booking.guestName?.trim() || 'Reserva'
    const quadra = courtNameById.get(booking.courtId) ?? `Quadra #${booking.courtId}`
    return {
      id: booking.id,
      start,
      end,
      title: `${nome} — ${quadra}`,
      schedule: booking.courtId,
      ...(booking.status === 'pending' ? { class: 'booking-status--pending' } : {}),
      draggable: false,
      resizable: false,
      deletable: false,
    }
  } catch {
    return null
  }
}

async function carregarCalendario() {
  loadError.value = ''
  loading.value = true
  try {
    const [courtsRaw, bookings] = await Promise.all([
      QuadraService.getQuadras(),
      AgendamentoService.buscarAgendamentos(),
    ])

    const courtIdsInBookings = new Set(bookings.map((b) => b.courtId))
    const courts = courtsRaw.filter((c) => c.active || courtIdsInBookings.has(c.id))

    schedules.value = schedulesFromCourts(courts)
    const courtNameById = new Map(courts.map((c) => [c.id, c.name]))

    events.value = bookings
      .map((b) => bookingToEvent(b, courtNameById))
      .filter((e): e is VueCalEvent => e != null)
  } catch (e) {
    loadError.value = getApiErrorMessage(e)
    events.value = []
    schedules.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void carregarCalendario()
})
</script>

<template>
  <div class="calendario-page">
    <main class="calendario-page__main">
      <Card class="calendario-card">
        <template #title>Calendário</template>
        <template #subtitle>Visualização semanal dos horários e eventos.</template>
        <template #content>
          <div class="cal-wrap">
            <Message v-if="loading && !loadError" severity="secondary" class="cal-msg" :closable="false">
              Carregando agendamentos…
            </Message>
            <Message v-if="loadError" severity="error" class="cal-msg" :closable="false">
              {{ loadError }}
              <Button label="Tentar novamente" class="cal-retry" text @click="carregarCalendario" />
            </Message>
            <VueCal
              v-model:events="events"
              locale="pt-br"
              :views="['week', 'day']"
              view="day"
              :time="true"
              :views-bar="true"
              :today-button="true"
              :twelve-hour="false"
              :time-from="7 * 60"
              :time-to="22 * 60"
              :time-step="30"
              :time-cell-height="25"
              :start-week-on-sunday="true"
              :schedules="schedules"
              class="vuecal-height"
            />
          </div>
        </template>
      </Card>
    </main>
  </div>
</template>

<style scoped>
.calendario-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--app-header-height, 3.5rem));
  min-height: calc(100vh - var(--app-header-height, 3.5rem));
  background: linear-gradient(180deg, var(--p-surface-50), var(--p-surface-100));
}

.vuecal {
  --vuecal-primary-color: var(--p-primary-500);
}

.vuecal-height {
  height: 80dvh;
}


.calendario-page__main {
  flex: 1;
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 3vw, 1.5rem) 2rem;
  /* max-width: min(72rem, 100%); */
  width: 100%;
  height: 80dvh;
  margin: 0 auto;
  box-sizing: border-box;
}

.calendario-card {
  height: 100%;
  border-radius: var(--p-content-border-radius);
  box-shadow:
    0 4px 6px -1px color-mix(in srgb, var(--p-primary-950) 12%, transparent),
    0 2px 4px -2px color-mix(in srgb, var(--p-primary-950) 10%, transparent);
}

.cal-wrap {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.cal-msg {
  margin-bottom: 0.75rem;
}

.cal-retry {
  margin-left: 0.5rem;
  vertical-align: middle;
}

.cal-gandra {
  min-width: min(100%, 520px);
  --vuecal-primary-color: var(--p-primary-500);
  --vuecal-secondary-color: var(--p-surface-0);
  --vuecal-base-color: var(--p-surface-900);
  --vuecal-contrast-color: var(--p-surface-0);
  --vuecal-height: clamp(26rem, calc(100dvh - 14rem), 52rem);
}

:deep(.p-card-title) {
  color: var(--p-primary-800);
}

:deep(.p-card-subtitle) {
  color: var(--p-surface-600);
}

/**
 * Pendente: amarelo com croma/luminosidade próximos ao verde primário do tema
 * (verde ≈ oklch(0.45 0.12 150); amarelo no mesmo “peso” cromático).
 */
.vuecal-height :deep(.vuecal__event.booking-status--pending) {
  background: var(--p-secondary-500) !important;
  color: var(--p-surface-0) !important;
}
</style>
