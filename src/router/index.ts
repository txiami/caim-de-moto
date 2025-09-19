import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../components/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/mapa'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/mapa'
      },
      {
        path: 'mapa',
        name: 'mapa',
        component: () => import('@/views/MapaPage.vue')
      },
      {
        path: 'novo-ponto',
        name: 'NovoPonto',
        component: () => import('@/views/NovoPontoPage.vue')
      },
      {
        path: 'Ranking',
        name: 'Ranking',
        component: () => import('@/views/RankingPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
