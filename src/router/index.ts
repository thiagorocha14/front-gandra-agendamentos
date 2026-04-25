import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AgendamentoView from '@/views/AgendamentoView.vue'
import CalendarioView from '@/views/CalendarioView.vue'
import PacotesView from '@/views/PacotesView.vue'
import NovoPacoteView from '@/views/NovoPacoteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/agendamento',
      name: 'agendamento',
      component: AgendamentoView,
    },
    {
      path: '/calendario',
      name: 'calendario',
      component: CalendarioView,
    },
    {
      path: '/pacotes',
      name: 'pacotes',
      component: PacotesView,
    },
    {
      path: '/pacotes/novo',
      name: 'novo-pacote',
      component: NovoPacoteView,
    },
  ],
})

export default router
