import { createRouter, createWebHistory } from '@ionic/vue-router';
import TabsPage from '@/components/TabsPage.vue';
import Login from '../views/Login.vue';
import Cadastro from '../views/Cadastro.vue';
import MapaPage from '../views/MapaPage.vue';
import NovoPontoPage from '@/views/NovoPontoPage.vue';
import RankingPage from '@/views/RankingPage.vue';

const routes = [
  { path: '/', redirect: '/tabs/mapa' },
  {
    path: '/tabs',
    component: TabsPage,
    children: [
      { path: 'mapa', component: MapaPage },
      { path: 'novo-ponto', component: NovoPontoPage },
      { path: 'ranking', component: RankingPage }
    ]
  },
  { path: '/login', component: Login },
  { path: '/cadastro', component: Cadastro }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
