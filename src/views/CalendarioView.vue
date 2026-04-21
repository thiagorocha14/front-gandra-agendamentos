<script setup lang="ts">
import { ref } from 'vue'
import { VueCal, type VueCalEvent } from 'vue-cal'
import Card from 'primevue/card'

function exemploEventos(): VueCalEvent[] {
  const inicio = new Date()
  inicio.setHours(9, 0, 0, 0)
  const fim = new Date(inicio)
  fim.setHours(10, 30, 0, 0)
  const tarde = new Date(inicio)
  tarde.setHours(15, 0, 0, 0)
  const tardeFim = new Date(tarde)
  tardeFim.setHours(16, 0, 0, 0)
  return [
    { start: inicio, end: fim, title: 'Reserva — exemplo', schedule: 1 },
    { start: tarde, end: tardeFim, title: 'Aula — exemplo', schedule: 2 },
  ]
}

function exemploSchedules() {
  return [
    { id: 1, class: 'quadra-1', label: 'Quadra 1' },
    { id: 2, class: 'quadra-2', label: 'Quadra 2' },
    { id: 3, class: 'quadra-3', label: 'Quadra 3' },
    { id: 4, class: 'quadra-4', label: 'Quadra 4' },
  ]
}

const events = ref<VueCalEvent[]>(exemploEventos())
const schedules = ref(exemploSchedules())

</script>

<template>
  <div class="calendario-page">
    <main class="calendario-page__main">
      <Card class="calendario-card">
        <template #title>Calendário</template>
        <template #subtitle>Visualização semanal dos horários e eventos.</template>
        <template #content>
          <div class="cal-wrap">
            <VueCal v-model:events="events" locale="pt-br" :views="['week', 'day']" view="day" :time="true"
              :views-bar="true" :today-button="true" :twelve-hour="false" :time-from="7 * 60" :time-to="22 * 60"
              :time-step="30" :time-cell-height="25" :start-week-on-sunday="true" :schedules="schedules"
              class="vuecal-height" />
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
</style>
