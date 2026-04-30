import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AgendamentoView from '@/views/AgendamentoView.vue'
import CalendarioView from '@/views/CalendarioView.vue'
import PacotesView from '@/views/PacotesView.vue'
import NovoPacoteView from '@/views/NovoPacoteView.vue'
import AdminAgendamentoDetalheView from '@/views/AdminAgendamentoDetalheView.vue'
import AdminUsuariosView from '@/views/AdminUsuariosView.vue'
import AdminUsuarioEditarView from '@/views/AdminUsuarioEditarView.vue'

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
      path: '/calendario/agendamento/:id',
      name: 'admin-agendamento-detalhe',
      component: AdminAgendamentoDetalheView,
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
    {
      path: '/pacotes/:id/editar',
      name: 'editar-pacote',
      component: NovoPacoteView,
    },
    {
      path: '/admin/usuarios',
      name: 'admin-usuarios',
      component: AdminUsuariosView,
    },
    {
      path: '/admin/usuarios/:id/editar',
      name: 'admin-usuario-editar',
      component: AdminUsuarioEditarView,
    },
    {
      path: '/cadastro',
      redirect: { name: 'home' },
    },
  ],
})

export default router
