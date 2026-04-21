import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import { gandraPreset } from '@/theme/gandraPreset'
import { ptBR } from '@/locale/ptBR'

import 'primeicons/primeicons.css'
import 'vue-cal/style'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  ripple: true,
  locale: ptBR,
  theme: {
    preset: gandraPreset,
    options: {
      darkModeSelector: '.p-dark',
    },
  },
})

app.mount('#app')
