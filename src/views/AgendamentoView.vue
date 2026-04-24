<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import { AgendamentoService } from '@/services/AgendamentoService'
import { QuadraService } from '@/services/QuadraService'
import type { Court } from '@/types/api'
import { getApiErrorMessage } from '@/utils/apiError'
import { addMinutesToDate, toBookingDateString, toTimeHHmm } from '@/utils/bookingFormat'

const VALOR_HORA_REAIS = 80

const durationOptions = [
  { label: '1h', value: 60 },
  { label: '1h 30min', value: 90 },
  { label: '2h', value: 120 },
  { label: '2h 30min', value: 150 },
  { label: '3h', value: 180 },
  { label: '3h 30min', value: 210 },
  { label: '4h', value: 240 },
] as const

/** Horários de início: 8h–12h e 14h–22h (funcionamento do clube). */
const horasInicioClube = [
  8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22,
] as const
const horaInicioOpcoes = horasInicioClube.map((h) => ({
  label: `${String(h).padStart(2, '0')}:00`,
  value: h,
}))

function dataHoraInicioReserva(hora: number): Date {
  return new Date(1970, 0, 1, hora, 0, 0, 0)
}

const courts = ref<Court[]>([])
const courtsLoading = ref(true)
const courtsLoadError = ref('')

const guestName = ref('')
const phone = ref('')
const courtId = ref<number | null>(null)
const bookingDate = ref<Date | null>(null)
const startHour = ref<number | null>(null)
const durationMinutes = ref<(typeof durationOptions)[number]['value']>(60)

const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

const horarioInicioDate = computed(() => {
  if (startHour.value == null) return null
  return dataHoraInicioReserva(startHour.value)
})

const horarioFim = computed(() => {
  if (!horarioInicioDate.value) return null
  return addMinutesToDate(horarioInicioDate.value, durationMinutes.value)
})

const nomeQuadraSelecionada = computed(() => {
  if (courtId.value == null) return ''
  return courts.value.find((c) => c.id === courtId.value)?.name ?? ''
})

const valorEstimadoReais = computed(
  () => (durationMinutes.value / 60) * VALOR_HORA_REAIS,
)

const textoInformativoResumo = computed(() => {
  if (!bookingDate.value || !horarioInicioDate.value || !horarioFim.value) {
    return ''
  }
  const quadraTxt = nomeQuadraSelecionada.value
    ? nomeQuadraSelecionada.value
    : 'não selecionada'
  const fmtData = bookingDate.value.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const fmtHora = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const valorFmt = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorEstimadoReais.value)
  return `Quadra: ${quadraTxt}. Data: ${fmtData}. Início: ${fmtHora(horarioInicioDate.value)}. Término: ${fmtHora(horarioFim.value)}. Valor: ${valorFmt} (R$ ${VALOR_HORA_REAIS.toFixed(2).replace('.', ',')} por hora).`
})

onMounted(async () => {
  courtsLoadError.value = ''
  courtsLoading.value = true
  try {
    courts.value = await QuadraService.getQuadras()
  } catch (e) {
    courtsLoadError.value = getApiErrorMessage(e)
  } finally {
    courtsLoading.value = false
  }
})

async function enviar() {
  submitError.value = ''
  submitSuccess.value = ''

  if (!guestName.value.trim()) {
    submitError.value = 'Informe o nome.'
    return
  }

  if (courtId.value == null || !bookingDate.value || startHour.value == null) {
    submitError.value = 'Preencha quadra, data e horário.'
    return
  }

  const inicio = horarioInicioDate.value
  const fim = horarioFim.value
  if (!inicio || !fim) {
    submitError.value = 'Não foi possível calcular o horário de término.'
    return
  }

  const precoCalculado = valorEstimadoReais.value.toFixed(2)

  const payload = {
    courtId: courtId.value,
    bookingDate: toBookingDateString(bookingDate.value),
    startTime: toTimeHHmm(inicio),
    endTime: toTimeHHmm(fim),
    guestName: guestName.value.trim().slice(0, 100),
    price: precoCalculado,
    ...(phone.value.trim() ? { phone: phone.value.trim().slice(0, 30) } : {}),
  }

  submitting.value = true
  try {
    const booking = await AgendamentoService.salvarAgendamento(payload)
    submitSuccess.value = `Agendamento registrado (nº ${booking.id}, status: ${booking.status}).`
    guestName.value = ''
    phone.value = ''
    courtId.value = null
    bookingDate.value = null
    startHour.value = null
    durationMinutes.value = 60
  } catch (e) {
    submitError.value = getApiErrorMessage(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <main class="page__main">
      <Card class="form-card">
        <template #title>Novo agendamento</template>
        <template #subtitle>Preencha os dados para reservar sua quadra.</template>

        <template #content>
          <div class="form-grid">
            <Message v-if="courtsLoadError" severity="error" :closable="false">
              {{ courtsLoadError }}
            </Message>

            <Message v-if="submitError" severity="error" closable @close="submitError = ''">
              {{ submitError }}
            </Message>

            <Message v-if="submitSuccess" severity="success" closable @close="submitSuccess = ''">
              {{ submitSuccess }}
            </Message>

            <FloatLabel>
              <InputText
                id="nome"
                v-model="guestName"
                class="w-full"
                fluid
                maxlength="100"
                autocomplete="name"
              />
              <label for="nome">Nome</label>
            </FloatLabel>

            <FloatLabel>
              <InputText
                id="telefone"
                v-model="phone"
                class="w-full"
                fluid
                maxlength="30"
                type="tel"
                autocomplete="tel"
              />
              <label for="telefone">Telefone</label>
            </FloatLabel>

            <FloatLabel>
              <Select
                v-model="courtId"
                inputId="campo-quadra"
                :options="courts"
                option-label="name"
                option-value="id"
                class="w-full"
                fluid
                :loading="courtsLoading"
                :disabled="courtsLoading || !!courtsLoadError"
              />
              <label for="campo-quadra">Quadra</label>
            </FloatLabel>

            <FloatLabel>
              <DatePicker
                id="data-reserva"
                v-model="bookingDate"
                input-id="data-reserva"
                date-format="dd/mm/yy"
                fluid
                show-icon
                class="w-full"
              />
              <label for="data-reserva">Data</label>
            </FloatLabel>

            <FloatLabel>
              <Select
                v-model="startHour"
                inputId="hora-inicio"
                :options="horaInicioOpcoes"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                fluid
              />
              <label for="hora-inicio">Horário</label>
            </FloatLabel>

            <FloatLabel>
              <Select
                v-model="durationMinutes"
                input-id="campo-duracao"
                :options="[...durationOptions]"
                option-label="label"
                option-value="value"
                class="w-full"
                fluid
              />
              <label for="campo-duracao">Duração</label>
            </FloatLabel>

            <p v-if="textoInformativoResumo" class="form-summary" role="status">
              {{ textoInformativoResumo }}
            </p>

            <Button
              label="Confirmar agendamento"
              class="form-submit"
              :loading="submitting"
              :disabled="courtsLoading || !!courtsLoadError"
              @click="enviar"
            />
          </div>
        </template>
      </Card>
    </main>
  </div>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--app-header-height, 3.5rem));
  min-height: calc(100vh - var(--app-header-height, 3.5rem));
  background: linear-gradient(180deg, var(--p-surface-50), var(--p-surface-100));
}

.page__main {
  flex: 1;
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 3vw, 1.5rem) 2rem;
  max-width: min(36rem, 100%);
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.form-card {
  border-radius: var(--p-content-border-radius);
  box-shadow:
    0 4px 6px -1px color-mix(in srgb, var(--p-primary-950) 12%, transparent),
    0 2px 4px -2px color-mix(in srgb, var(--p-primary-950) 10%, transparent);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding-top: 0.5rem;
}

.form-summary {
  margin: 0;
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--p-surface-700);
  background: var(--p-surface-100);
  border-radius: var(--p-content-border-radius);
  border: 1px solid var(--p-surface-200);
}

.form-submit {
  margin-top: 0.25rem;
  align-self: stretch;
  font-weight: 600;
}

:deep(.p-card-title) {
  color: var(--p-primary-800);
}

:deep(.p-card-subtitle) {
  color: var(--p-surface-600);
}
</style>
