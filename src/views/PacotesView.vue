<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import { API_BASE_URL } from '@/api/apiClient'
import { useUserSession } from '@/composables/useUserSession'
import { PacotesAgendamentosService } from '@/services/PacotesAgendamentosService'
import type { BookingBundle } from '@/types/api'

const router = useRouter()
const session = useUserSession()

const loading = ref(true)
const loadError = ref('')
const pacotes = ref<BookingBundle[]>([])

const confirmDesativarVisible = ref(false)
const pacoteParaDesativar = ref<BookingBundle | null>(null)
const desativando = ref(false)
const desativarError = ref('')

const hasData = computed(() => pacotes.value.length > 0)
const isAdmin = computed(() => session.userCategory.value === 'admin')

function coverImageUrl(coverImage: string): string {
  if (!coverImage.trim()) return ''
  if (/^https?:\/\//i.test(coverImage)) return coverImage
  if (coverImage.startsWith('/uploads/')) {
    const base = API_BASE_URL.replace(/\/$/, '')
    return `${base}${coverImage}`
  }
  return coverImage
}

async function carregarPacotes() {
  loading.value = true
  loadError.value = ''
  try {
    pacotes.value = await PacotesAgendamentosService.buscarPacotes()
  } catch {
    loadError.value =
      'Nao foi possivel carregar os pacotes agora. Tente novamente em alguns instantes.'
    pacotes.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void carregarPacotes()
})

function comprar(pacote: BookingBundle) {
  session.addPackageHours(String(pacote.id))
}

function irEditarPacote(pacote: BookingBundle) {
  void router.push({ name: 'editar-pacote', params: { id: String(pacote.id) } })
}

function abrirConfirmarDesativar(pacote: BookingBundle) {
  desativarError.value = ''
  pacoteParaDesativar.value = pacote
  confirmDesativarVisible.value = true
}

function fecharConfirmarDesativar() {
  if (desativando.value) return
  confirmDesativarVisible.value = false
  pacoteParaDesativar.value = null
  desativarError.value = ''
}

async function confirmarDesativar() {
  if (!pacoteParaDesativar.value) return
  desativando.value = true
  desativarError.value = ''
  try {
    await PacotesAgendamentosService.desativarPacote(pacoteParaDesativar.value.id)
    confirmDesativarVisible.value = false
    pacoteParaDesativar.value = null
    await carregarPacotes()
  } catch {
    desativarError.value = 'Não foi possível desativar o pacote. Tente novamente.'
  } finally {
    desativando.value = false
  }
}
</script>

<template>
  <div class="pacotes-page">
    <main class="pacotes-page__main">
      <header class="pacotes-page__intro">
        <h1 class="pacotes-page__heading">Pacotes de Agendamento</h1>
        <p class="pacotes-page__lede">
          Confira os pacotes disponiveis e escolha o plano ideal para sua rotina.
        </p>
      </header>

      <Dialog
        v-model:visible="confirmDesativarVisible"
        modal
        header="Desativar pacote"
        class="pacotes-dialog"
        :style="{ width: 'min(22rem, 100vw)' }"
        :closable="!desativando"
        :dismissable-mask="!desativando"
        @hide="fecharConfirmarDesativar"
      >
        <p class="pacotes-dialog__text">
          Deseja realmente desativar o pacote
          <strong v-if="pacoteParaDesativar">{{ pacoteParaDesativar.name }}</strong
          >? Ele deixará de aparecer como disponível para compra.
        </p>
        <Message v-if="desativarError" severity="error" class="pacotes-dialog__err" :closable="false">
          {{ desativarError }}
        </Message>
        <template #footer>
          <Button
            label="Cancelar"
            severity="secondary"
            text
            :disabled="desativando"
            @click="fecharConfirmarDesativar"
          />
          <Button
            label="Desativar"
            severity="danger"
            :loading="desativando"
            @click="confirmarDesativar"
          />
        </template>
      </Dialog>

      <Message v-if="loadError" severity="error" class="pacotes-page__msg" :closable="false">
        {{ loadError }}
        <Button label="Tentar novamente" class="pacotes-page__retry" text @click="carregarPacotes" />
      </Message>

      <ul v-if="loading" class="pacotes-list" role="list">
        <li v-for="idx in 3" :key="`skeleton-${idx}`" class="pacotes-list__item">
          <Card class="pacote-card">
            <template #content>
              <div class="pacote-grid">
                <Skeleton class="pacote-media" height="14rem" />
                <div class="pacote-body">
                  <Skeleton width="80%" height="1.5rem" />
                  <Skeleton width="100%" height="1rem" />
                  <Skeleton width="90%" height="1rem" />
                  <Skeleton width="70%" height="1.75rem" />
                </div>
              </div>
            </template>
          </Card>
        </li>
      </ul>

      <Message v-else-if="!hasData && !loadError" severity="secondary" :closable="false">
        Nenhum pacote cadastrado no momento.
      </Message>

      <ul v-else class="pacotes-list" role="list">
        <li v-for="pacote in pacotes" :key="pacote.id" class="pacotes-list__item">
          <Card
            class="pacote-card"
            :class="{ 'pacote-card--inactive': !pacote.active }"
          >
            <template #content>
              <div class="pacote-grid">
                <div
                  class="pacote-media"
                  :class="{ 'pacote-media--inactive': !pacote.active }"
                >
                  <span v-if="!pacote.active" class="pacote-inactive-ribbon" aria-hidden="true"
                    >Desativado</span
                  >
                  <img
                    v-if="coverImageUrl(pacote.coverImage)"
                    :src="coverImageUrl(pacote.coverImage)"
                    :alt="`Imagem de capa do pacote ${pacote.name}`"
                    class="pacote-image"
                    loading="lazy"
                  />
                  <div v-else class="pacote-placeholder">Sem imagem</div>
                </div>
                <div class="pacote-body">
                  <div class="pacote-body__head">
                    <h2 class="pacote-title">{{ pacote.name }}</h2>
                    <Tag
                      :severity="pacote.active ? 'success' : 'secondary'"
                      rounded
                      :value="pacote.active ? 'Ativo' : 'Inativo'"
                    />
                  </div>
                  <p class="pacote-desc">{{ pacote.description }}</p>
                  <div class="pacotes-actions">
                    <div class="pacote-meta">
                      <span><strong>Horas:</strong> {{ pacote.totalHours }}</span>
                      <span><strong>Preço:</strong> {{ pacote.price }}</span>
                    </div>
                    <div v-if="isAdmin" class="pacote-admin-actions">
                      <Button
                        label="Editar"
                        icon="pi pi-pencil"
                        severity="secondary"
                        outlined
                        class="pacote-btn pacote-btn--admin"
                        @click="irEditarPacote(pacote)"
                      />
                      <Button
                        v-if="pacote.active"
                        label="Desativar"
                        icon="pi pi-ban"
                        severity="danger"
                        outlined
                        class="pacote-btn pacote-btn--admin"
                        @click="abrirConfirmarDesativar(pacote)"
                      />
                    </div>
                    <Button
                      v-else
                      label="Comprar"
                      icon="pi pi-shopping-cart"
                      severity="success"
                      class="pacote-btn"
                      @click="comprar(pacote)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.pacotes-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--app-header-height, 3.5rem));
  min-height: calc(100vh - var(--app-header-height, 3.5rem));
  background: linear-gradient(180deg, var(--p-surface-50), var(--p-surface-100));
}

.pacotes-page__main {
  flex: 1;
  width: 100%;
  max-width: min(52rem, 100%);
  margin: 0 auto;
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 3vw, 1.5rem) 2.5rem;
  box-sizing: border-box;
}

.pacotes-page__intro {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.pacotes-page__heading {
  margin: 0 0 0.35rem;
  font-size: clamp(1.5rem, 4vw, 1.85rem);
  font-weight: 700;
  color: var(--p-primary-900);
  letter-spacing: -0.02em;
}

.pacotes-page__lede {
  margin: 0;
  max-width: 36rem;
  font-size: clamp(0.95rem, 2.2vw, 1.05rem);
  line-height: 1.55;
  color: var(--p-surface-600);
}

.pacotes-page__msg {
  margin-bottom: 1.25rem;
}

.pacotes-page__retry {
  margin-left: 0.5rem;
}

.pacotes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3vw, 1.75rem);
}

.pacote-card {
  overflow: hidden;
  border-radius: var(--p-content-border-radius);
  box-shadow:
    0 4px 6px -1px color-mix(in srgb, var(--p-primary-950) 10%, transparent),
    0 2px 4px -2px color-mix(in srgb, var(--p-primary-950) 8%, transparent);
}

.pacote-card--inactive {
  opacity: 0.97;
}

.pacote-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

@media (min-width: 768px) {
  .pacote-grid {
    grid-template-columns: minmax(240px, 42%) 1fr;
    gap: 0;
    align-items: stretch;
  }
}

.pacote-media {
  position: relative;
  min-height: clamp(12rem, 38vw, 16rem);
  background: var(--p-surface-200);
}

.pacote-media--inactive .pacote-image,
.pacote-media--inactive .pacote-placeholder {
  filter: grayscale(1);
}

.pacote-inactive-ribbon {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--p-surface-0);
  background: color-mix(in srgb, var(--p-surface-900) 88%, transparent);
  border-radius: var(--p-content-border-radius);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--p-primary-950) 25%, transparent);
  pointer-events: none;
}

@media (min-width: 768px) {
  .pacote-media {
    min-height: 100%;
  }
}

.pacote-image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: clamp(12rem, 38vw, 16rem);
  object-fit: cover;
}

.pacote-placeholder {
  width: 100%;
  min-height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--p-surface-600);
  font-weight: 600;
}

.pacote-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: clamp(1.1rem, 2.5vw, 1.5rem);
  justify-content: center;
}

.pacote-body__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.pacote-title {
  margin: 0;
  flex: 1;
  min-width: min(100%, 12rem);
  font-size: clamp(1.2rem, 2.8vw, 1.45rem);
  font-weight: 700;
  color: var(--p-primary-900);
  line-height: 1.25;
}

.pacote-desc {
  margin: 0;
  font-size: clamp(0.9rem, 2vw, 1rem);
  line-height: 1.6;
  color: var(--p-surface-700);
}

.pacote-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  color: var(--p-surface-800);
  font-size: 0.95rem;
}

.pacote-btn {
  font-weight: 600;
  min-width: min(100%, 11rem);
}

.pacote-admin-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.pacote-btn--admin {
  min-width: auto;
}

.pacotes-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 0.25rem;
}

@media (max-width: 480px) {
  .pacote-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .pacote-btn {
    width: 100%;
  }

  .pacote-admin-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .pacote-btn--admin {
    width: 100%;
  }
}

.pacotes-dialog__text {
  margin: 0 0 1rem;
  line-height: 1.55;
  color: var(--p-surface-700);
}

.pacotes-dialog__err {
  margin-bottom: 0.75rem;
}
</style>
