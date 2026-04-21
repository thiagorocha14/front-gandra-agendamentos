<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Image from 'primevue/image'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useUserSession } from '@/composables/useUserSession'

const session = useUserSession()

interface Pacote {
  id: string
  titulo: string
  descricao: string
  preco: string
  destaque?: string
  imagem: string
  imagemAlt: string
  /** quando true, imagem (ex.: logo) usa object-fit contain */
  imagemContida?: boolean
}

const pacotes: Pacote[] = [
  {
    id: 'basico',
    titulo: 'Pacote Mensal Básico',
    descricao:
      'Ideal para quem está começando ou quer manter o ritmo com constância. Inclui 8 horas de quadra por mês em horários combinados, uso de equipamentos compartilhados e acesso ao grupo de treino leve.',
    preco: 'R$ 320,00',
    destaque: 'Popular',
    imagem: '/fundo.jpg',
    imagemAlt: 'Quadra de tênis ao ar livre',
  },
  {
    id: 'plus',
    titulo: 'Pacote Mensal Plus',
    descricao:
      'Para quem quer evoluir mais rápido: 12 horas de quadra, prioridade em horários nobres, bolas novas a cada sessão e uma avaliação técnica mensal com o professor.',
    preco: 'R$ 480,00',
    imagem: '/logo.png',
    imagemAlt: 'Logotipo Escola de Tênis Gandra',
    imagemContida: true,
  },
  {
    id: 'trimestral',
    titulo: 'Pacote Trimestral Econômico',
    descricao:
      'Compromisso de três meses com o melhor custo por aula. Inclui 36 horas no período, desconto em inscrição em torneios internos e camiseta oficial da escola.',
    preco: 'R$ 1.200,00',
    destaque: 'Melhor valor',
    imagem: '/fundo.jpg',
    imagemAlt: 'Treino em quadra de saibro',
  },
]

const feedback = ref<string | null>(null)

function comprar(p: Pacote) {
  if (!session.isLoggedIn.value) {
    feedback.value =
      'Faça login no topo da página para registrar a compra e creditar as horas do pacote no seu saldo.'
    return
  }
  const adicionadas = session.addPackageHours(p.id)
  feedback.value = `Pacote "${p.titulo}" (${p.preco}) registrado. Foram adicionadas ${adicionadas} h ao seu saldo. Total agora: ${session.hoursBalance.value} h.`
}
</script>

<template>
  <div class="pacotes-page">
    <main class="pacotes-page__main">
      <header class="pacotes-page__intro">
        <h1 class="pacotes-page__heading">Pacotes</h1>
        <p class="pacotes-page__lede">
          Planos pensados para cada nível. Escolha o pacote e avance na sua jornada no tênis.
        </p>
      </header>

      <Message v-if="feedback" severity="success" class="pacotes-page__msg" closable @close="feedback = null">
        {{ feedback }}
      </Message>

      <ul class="pacotes-list" role="list">
        <li v-for="p in pacotes" :key="p.id" class="pacotes-list__item">
          <Card class="pacote-card">
            <template #content>
              <div class="pacote-grid">
                <div class="pacote-media" :class="{ 'pacote-media--contida': p.imagemContida }">
                  <Image :src="p.imagem" :alt="p.imagemAlt" width="960" height="600" class="pacote-image" preview />
                </div>
                <div class="pacote-body">
                  <div class="pacote-body__head">
                    <h2 class="pacote-title">{{ p.titulo }}</h2>
                    <Tag v-if="p.destaque" severity="success" rounded :value="p.destaque" />
                  </div>
                  <p class="pacote-desc">{{ p.descricao }}</p>
                  <div class="pacote-actions">
                    <span class="pacote-preco">{{ p.preco }}</span>
                    <Button label="Comprar" icon="pi pi-shopping-cart" severity="success" class="pacote-btn"
                      @click="comprar(p)" />
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

@media (min-width: 768px) {
  .pacote-media {
    min-height: 100%;
  }
}

.pacote-media--contida {
  background: linear-gradient(160deg, var(--p-primary-950), var(--p-primary-800));
}

.pacote-media--contida .pacote-image :deep(img) {
  object-fit: contain;
  padding: clamp(1rem, 4vw, 2rem);
}

.pacote-image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: clamp(12rem, 38vw, 16rem);
}

.pacote-image :deep(.p-image),
.pacote-image :deep(img) {
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
  display: block;
}

@media (min-width: 768px) {

  .pacote-image :deep(.p-image),
  .pacote-image :deep(img) {
    min-height: 17rem;
  }
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

.pacote-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 0.25rem;
}

.pacote-preco {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--p-primary-700);
}

.pacote-btn {
  font-weight: 600;
  min-width: min(100%, 11rem);
}

@media (max-width: 480px) {
  .pacote-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .pacote-btn {
    width: 100%;
  }
}
</style>
