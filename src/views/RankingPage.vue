<template>
  <ion-page>
    <ToolBar />
    <ion-content :fullscreen="true">
      <ion-grid class="ion-padding-top">
        <ion-row class="ion-justify-content-center ion-margin-bottom ion-margin-top">
          <ion-col size="12" size-md="8" class="ion-text-center">
            <strong class="ranking-title">Ranking</strong>
          </ion-col>
        </ion-row>

        <!-- Loading simples -->
        <ion-row v-if="loading" class="ion-justify-content-center">
          <ion-col size="12" class="ion-text-center">
            <ion-spinner></ion-spinner>
          </ion-col>
        </ion-row>

        <ion-row v-else class="ion-justify-content-center">
          <ion-col size="12" size-md="8">
            <ion-list>
              <ion-item v-for="(user, index) in ranking" :key="user.id">
                <ion-label>
                  <h2>
                    <span v-if="index === 0">🥇</span>
                    <span v-else-if="index === 1">🥈</span>
                    <span v-else-if="index === 2">🥉</span>
                    {{ index + 1 }}º - {{ user.name }}
                  </h2>
                  <p>{{ user.points }} locais adicionados</p>
                </ion-label>
                <ion-badge slot="end" :color="getBadgeColor(index)">
                  {{ user.points }}
                </ion-badge>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonBadge, IonSpinner } from "@ionic/vue";
import ToolBar from "@/components/ToolBar.vue";
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default defineComponent({
  name: "RankingPage",
  components: {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    ToolBar,
  },
  data() {
    return {
      ranking: [],
      loading: true
    };
  },
  async mounted() {
    await this.loadRanking();
  },
  methods: {
    getBadgeColor(index: number) {
      if (index === 0) return "warning";  // Ouro
      if (index === 1) return "medium";   // Prata
      if (index === 2) return "tertiary"; // Bronze
      return "primary";
    },

    async loadRanking() {
      try {
        this.loading = true;

        console.log('Buscando pontos de risco...');

        // Buscar todos os pontos de risco
        const collectionRef = collection(db, 'pontos_de_risco');
        const querySnapshot = await getDocs(collectionRef);

        console.log(`Encontrados ${querySnapshot.size} pontos de risco`);

        // Contar pontos por usuário
        const userCount = {};

        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          const userId = data.usuario_id;
          const userName = data.nomeUsuario;

          if (userId) {
            if (!userCount[userId]) {
              userCount[userId] = { count: 0, name: userName || userId };
            }
            userCount[userId].count++;
          }
        });

        console.log('Contagem por usuário:', userCount);

        // Converter para array e ordenar
        this.ranking = Object.entries(userCount)
            .map(([userId, userData]) => ({
              id: userId,
              name: userData.name,
              points: userData.count
            }))
            .sort((a, b) => b.points - a.points) // Ordenar por pontos (decrescente)
            .slice(0, 5); // Top 5

        console.log('Ranking final:', this.ranking);

      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        // Fallback para dados estáticos se der erro
        this.ranking = [
          { id: 1, name: "João", points: 25 },
          { id: 2, name: "Maria", points: 18 },
          { id: 3, name: "Carlos", points: 15 },
          { id: 4, name: "Ana", points: 12 },
          { id: 5, name: "Pedro", points: 10 },
        ];
      } finally {
        this.loading = false;
      }
    }
  }
});
</script>

<style scoped>
#container {
  text-align: center;
  margin-top: 20px;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

.ranking-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
</style>