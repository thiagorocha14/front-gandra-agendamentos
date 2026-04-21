<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'
import InputMask from 'primevue/inputmask'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

const quadras = [
  { label: 'Quadra 1', value: 'quadra-1' },
  { label: 'Quadra 2', value: 'quadra-2' },
  { label: 'Quadra 3', value: 'quadra-3' },
  { label: 'Quadra 4', value: 'quadra-4' },
]

const nome = ref('')
const quadra = ref<string | null>(null)
const dataHora = ref<Date | null>(null)
const telefone = ref('')

function enviar() {
  // Integração com API pode ser adicionada aqui
  console.info({
    nome: nome.value,
    quadra: quadra.value,
    dataHora: dataHora.value,
    telefone: telefone.value,
  })
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
            <FloatLabel>
              <InputText id="nome" v-model="nome" class="w-full" autocomplete="name" fluid />
              <label for="nome">Nome</label>
            </FloatLabel>

            <FloatLabel>
              <Select v-model="quadra" input-id="campo-quadra" :options="quadras" option-label="label"
                option-value="value" class="w-full" fluid placeholder="Selecione a quadra" />
            </FloatLabel>

            <FloatLabel>
              <DatePicker id="data-hora" v-model="dataHora" input-id="data-hora" show-time hour-format="24"
                date-format="dd/mm/yy" fluid show-icon class="w-full" />
              <label for="data-hora">Data e hora</label>
            </FloatLabel>

            <FloatLabel>
              <InputMask id="telefone" v-model="telefone" mask="(99) 99999-9999" class="w-full" fluid autocomplete="tel"
                inputmode="tel" />
              <label for="telefone">Telefone</label>
            </FloatLabel>

            <Button label="Confirmar agendamento" class="form-submit" @click="enviar" />
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
