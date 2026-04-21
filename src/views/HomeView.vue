<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const heroBackgroundImage = '/fundo.jpg'
</script>

<template>
  <section class="hero" :style="{ '--hero-img': `url(${heroBackgroundImage})` }">
    <div class="hero__media" aria-hidden="true" />
    <div class="hero__shade" aria-hidden="true" />
    <div class="hero__inner">
      <div class="hero__stack">
        <img
          src="/logo.png"
          alt="Escola de Tênis Gandra"
          class="hero__logo"
          width="640"
          height="240"
        />
        <Button
          label="Agendar"
          size="large"
          rounded
          class="hero__cta"
          @click="router.push({ name: 'agendamento' })"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  flex: 1;
  min-height: calc(100dvh - var(--app-header-height, 3.5rem));
  min-height: calc(100vh - var(--app-header-height, 3.5rem));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero__media {
  position: absolute;
  inset: 0;
  background-color: var(--p-primary-950);
  background-image: var(--hero-img);
  background-size: cover;
  background-position: center;
  filter: brightness(0.52);
}

.hero__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    165deg,
    rgba(2, 34, 13, 0.78) 0%,
    rgba(0, 0, 0, 0.42) 42%,
    rgba(3, 16, 9, 0.85) 100%
  );
}

.hero__shade::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(3, 16, 9, 0.35);
}

.hero__inner {
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  width: 100%;
  max-width: min(64rem, 96vw);
  display: flex;
  justify-content: center;
}

.hero__stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.25rem, 4vw, 2rem);
  width: 100%;
}

.hero__logo {
  display: block;
  width: min(90vw, 44rem);
  height: auto;
  max-height: min(64vh, 26rem);
  object-fit: contain;
  filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.45));
}

.hero__cta {
  min-width: min(100%, 16rem);
  font-weight: 600;
  letter-spacing: 0.02em;
  padding-left: 2rem;
  padding-right: 2rem;
}
</style>
