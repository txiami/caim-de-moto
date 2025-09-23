import { createRouter, createWebHistory } from '@ionic/vue-router';
import TabsPage from '@/components/TabsPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import CadastroPage from '@/views/CadastroPage.vue';
import MapaPage from '@/views/MapaPage.vue';
import RankingPage from '@/views/RankingPage.vue';

const routes = [
  { path: '/', redirect: '/tabs/mapa' },
  {
    path: '/tabs',
    component: TabsPage,
    children: [
      { path: 'mapa', component: MapaPage },
      { path: 'ranking', component: RankingPage }
    ]
  },
  { path: '/login', component: LoginPage },
  { path: '/cadastro', component: CadastroPage }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
