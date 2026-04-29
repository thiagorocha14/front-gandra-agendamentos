<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Textarea from 'primevue/textarea'
import { API_BASE_URL } from '@/api/apiClient'
import { PacotesAgendamentosService } from '@/services/PacotesAgendamentosService'
import type { CreateBookingBundleInput, UpdateBookingBundleInput } from '@/types/api'

const router = useRouter()
const route = useRoute()

const bundleId = computed(() => {
  const raw = route.params.id
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined
})

const isEditMode = computed(() => Boolean(bundleId.value))

const form = reactive({
  name: '',
  description: '',
  totalHours: null as number | null,
  price: '',
  active: true,
  coverImage: null as File | null,
})

const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')
const loadingBundle = ref(false)
const loadBundleError = ref('')
const existingCoverImagePath = ref('')

const fileInputRef = ref<HTMLInputElement | null>(null)

function coverImageUrl(coverImage: string): string {
  if (!coverImage.trim()) return ''
  if (/^https?:\/\//i.test(coverImage)) return coverImage
  if (coverImage.startsWith('/uploads/')) {
    const base = API_BASE_URL.replace(/\/$/, '')
    return `${base}${coverImage}`
  }
  return coverImage
}

function limparFormulario() {
  form.name = ''
  form.description = ''
  form.totalHours = null
  form.price = ''
  form.active = true
  form.coverImage = null
  existingCoverImagePath.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function validarFormulario(): string | null {
  const nome = form.name.trim()
  if (!nome) return 'O nome do pacote é obrigatório.'
  if (nome.length > 50) return 'O nome deve ter no máximo 50 caracteres.'

  const descricao = form.description.trim()
  if (!descricao) return 'A descrição do pacote e obrigatória.'
  if (descricao.length > 300) return 'A descrição deve ter no máximo 300 caracteres.'

  if (!Number.isInteger(form.totalHours) || (form.totalHours ?? 0) < 1) {
    return 'As horas totais devem ser um número inteiro maior ou igual a 1.'
  }

  if (!form.price.trim()) return 'O preço é obrigatório.'

  if (!isEditMode.value) {
    if (!form.coverImage) return 'Selecione uma imagem de capa.'
    if (!form.coverImage.type.startsWith('image/')) {
      return 'Arquivo inválido: selecione um arquivo de imagem.'
    }
  } else if (form.coverImage && !form.coverImage.type.startsWith('image/')) {
    return 'Arquivo inválido: selecione um arquivo de imagem.'
  }

  return null
}

function onCoverImageChange(event: Event) {
  submitError.value = ''
  const target = event.target as HTMLInputElement
  const arquivo = target.files?.[0] ?? null
  form.coverImage = arquivo
  if (arquivo && !arquivo.type.startsWith('image/')) {
    form.coverImage = null
    submitError.value = 'Arquivo inválido: selecione um arquivo de imagem.'
    target.value = ''
  }
}

async function carregarPacote() {
  if (!bundleId.value) return
  loadingBundle.value = true
  loadBundleError.value = ''
  try {
    const p = await PacotesAgendamentosService.buscarPacotePorId(bundleId.value)
    form.name = p.name
    form.description = p.description
    form.totalHours = p.totalHours
    form.price = p.price
    form.active = p.active
    form.coverImage = null
    existingCoverImagePath.value = p.coverImage ?? ''
    if (fileInputRef.value) fileInputRef.value.value = ''
  } catch {
    loadBundleError.value =
      'Não foi possível carregar o pacote. Verifique o link ou tente novamente.'
  } finally {
    loadingBundle.value = false
  }
}

onMounted(() => {
  void carregarPacote()
})

async function enviarPacote() {
  submitError.value = ''
  submitSuccess.value = ''

  const erro = validarFormulario()
  if (erro) {
    submitError.value = erro
    return
  }

  submitting.value = true
  try {
    if (isEditMode.value && bundleId.value) {
      const payload: UpdateBookingBundleInput = {
        name: form.name.trim(),
        description: form.description.trim(),
        totalHours: form.totalHours!,
        price: form.price.trim(),
        active: form.active,
        coverImage: form.coverImage ?? undefined,
      }
      await PacotesAgendamentosService.atualizarPacote(bundleId.value, payload)
      submitSuccess.value = 'Pacote atualizado com sucesso.'
      existingCoverImagePath.value = ''
      form.coverImage = null
      if (fileInputRef.value) fileInputRef.value.value = ''
      await carregarPacote()
    } else {
      const payload: CreateBookingBundleInput = {
        name: form.name.trim(),
        description: form.description.trim(),
        totalHours: form.totalHours!,
        price: form.price.trim(),
        active: form.active,
        coverImage: form.coverImage!,
      }
      await PacotesAgendamentosService.criarPacote(payload)
      submitSuccess.value = 'Pacote criado com sucesso.'
      limparFormulario()
    }
  } catch {
    submitError.value = isEditMode.value
      ? 'Não foi possível atualizar o pacote agora. Verifique os dados e tente novamente.'
      : 'Não foi possível criar o pacote agora. Verifique os dados e tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <main class="page__main">
      <Card class="form-card">
        <template #title>{{
          isEditMode ? 'Editar Pacote de Agendamento' : 'Novo Pacote de Agendamento'
        }}</template>
        <template #subtitle>{{
          isEditMode
            ? 'Altere os dados do pacote e salve as mudanças.'
            : 'Cadastre um novo pacote para disponibilizar na vitrine.'
        }}</template>
        <template #content>
          <div v-if="loadingBundle" class="form-grid">
            <Skeleton height="2.5rem" />
            <Skeleton height="6rem" />
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
          </div>

          <Message
            v-else-if="loadBundleError"
            severity="error"
            class="form-msg"
            :closable="false"
          >
            {{ loadBundleError }}
            <Button
              label="Voltar para pacotes"
              class="form-msg__btn"
              text
              @click="router.push({ name: 'pacotes' })"
            />
          </Message>

          <div v-else class="form-grid">
            <Message v-if="submitError" severity="error" closable @close="submitError = ''">
              {{ submitError }}
            </Message>

            <Message v-if="submitSuccess" severity="success" closable @close="submitSuccess = ''">
              {{ submitSuccess }}
            </Message>

            <FloatLabel variant="in">
              <InputText
                id="pacote-name"
                v-model="form.name"
                class="w-full"
                fluid
                maxlength="50"
                autocomplete="off"
              />
              <label for="pacote-name">Nome</label>
            </FloatLabel>

            <FloatLabel variant="in">
              <Textarea
                id="pacote-description"
                v-model="form.description"
                class="w-full"
                fluid
                rows="5"
                maxlength="300"
                auto-resize
              />
              <label for="pacote-description">Descrição</label>
            </FloatLabel>

            <FloatLabel variant="in">
              <InputNumber
                input-id="pacote-total-hours"
                v-model="form.totalHours"
                class="w-full"
                fluid
                :min="1"
                :min-fraction-digits="0"
                :max-fraction-digits="0"
                :use-grouping="false"
              />
              <label for="pacote-total-hours">Horas totais</label>
            </FloatLabel>

            <FloatLabel variant="in">
              <InputText
                id="pacote-price"
                v-model="form.price"
                class="w-full"
                fluid
                autocomplete="off"
                maxlength="40"
              />
              <label for="pacote-price">Preco</label>
            </FloatLabel>

            <div class="form-row">
              <label for="pacote-active" class="form-row__label">Pacote ativo</label>
              <Checkbox id="pacote-active" v-model="form.active" binary />
            </div>

            <div class="form-file">
              <label for="pacote-cover" class="form-file__label">
                Imagem de capa{{ isEditMode ? ' (opcional — mantém a atual se vazio)' : '' }}
              </label>
              <div
                v-if="isEditMode && existingCoverImagePath && coverImageUrl(existingCoverImagePath)"
                class="form-file__preview-wrap"
              >
                <p class="form-file__preview-label">Imagem atual</p>
                <img
                  :src="coverImageUrl(existingCoverImagePath)"
                  alt="Capa atual do pacote"
                  class="form-file__preview-img"
                />
              </div>
              <input
                id="pacote-cover"
                ref="fileInputRef"
                type="file"
                class="form-file__input"
                accept="image/*"
                @change="onCoverImageChange"
              />
              <small v-if="form.coverImage" class="form-file__hint">
                Novo arquivo: {{ form.coverImage.name }}
              </small>
            </div>

            <div class="form-actions">
              <Button
                label="Voltar para pacotes"
                severity="secondary"
                text
                @click="router.push({ name: 'pacotes' })"
              />
              <Button
                :label="isEditMode ? 'Salvar alterações' : 'Criar pacote'"
                :loading="submitting"
                @click="enviarPacote"
              />
            </div>
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
  max-width: min(42rem, 100%);
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.form-msg {
  margin-bottom: 0.5rem;
}

.form-msg__btn {
  margin-left: 0.5rem;
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
  gap: 1.25rem;
  padding-top: 0.5rem;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--p-surface-300);
  border-radius: var(--p-content-border-radius);
  background: var(--p-surface-0);
}

.form-row__label {
  font-size: 0.95rem;
  color: var(--p-surface-700);
  font-weight: 600;
}

.form-file {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-file__label {
  font-size: 0.95rem;
  color: var(--p-surface-700);
  font-weight: 600;
}

.form-file__input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--p-surface-300);
  border-radius: var(--p-content-border-radius);
  background: var(--p-surface-0);
}

.form-file__hint {
  color: var(--p-surface-600);
}

.form-file__preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-file__preview-label {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-surface-600);
}

.form-file__preview-img {
  max-width: 100%;
  max-height: 12rem;
  object-fit: contain;
  border-radius: var(--p-content-border-radius);
  border: 1px solid var(--p-surface-300);
  background: var(--p-surface-100);
}

.form-actions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}

:deep(.p-card-title) {
  color: var(--p-primary-800);
}

:deep(.p-card-subtitle) {
  color: var(--p-surface-600);
}
</style>
