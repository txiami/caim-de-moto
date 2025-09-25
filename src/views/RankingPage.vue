<template>
  <ion-page>
    <ToolBar title="RANKING" />
    <ion-content :fullscreen="true" class="ranking-content">
      <ion-grid class="ion-padding-top">
        <ion-row
          class="ion-justify-content-center ion-margin-bottom ion-margin-top"
        >
          <ion-col size="12" size-md="8" class="ion-text-center">
            <!-- <strong class="ranking-title">Ranking</strong> -->
          </ion-col>
        </ion-row>

        <!-- Loading -->
        <ion-row v-if="loading" class="ion-justify-content-center">
          <ion-col size="12" class="ion-text-center">
            <ion-spinner></ion-spinner>
          </ion-col>
        </ion-row>

        <!-- Lista de usuários -->
        <ion-row v-else class="ion-justify-content-center">
          <ion-col size="12" size-md="8">
            <div
              v-for="(user, index) in ranking"
              :key="user.id"
              class="ranking-card"
            >
              <!-- Ícone de usuário -->
              <div class="ranking-avatar">
                <img src="@/assets/user-icon.png" />
              </div>

              <!-- Nome + pontos -->
              <div class="ranking-info">
                <h2 class="ranking-name">{{ user.name }}</h2>
                <p class="ranking-points">
                  {{ user.points }} locais adicionados
                </p>
              </div>

              <!-- Posição + troféu -->
              <div class="ranking-position">
                <img src="@/assets/trofeu-icon.png" class="trophy" />
                <span>{{ index + 1 }}º</span>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonPage, IonContent, IonSpinner, IonIcon } from "@ionic/vue";
import ToolBar from "@/components/ToolBar.vue";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default defineComponent({
  name: "RankingPage",
  components: {
    IonPage,
    IonContent,
    IonSpinner,
    IonIcon,
    ToolBar,
  },
  data() {
    return {
      ranking: [],
      loading: true,
    };
  },
  async mounted() {
    await this.loadRanking();
  },
  methods: {
    getTrophyColor(index: number) {
      if (index === 0) return "gold";
      if (index === 1) return "silver";
      if (index === 2) return "bronze";
      return "default";
    },
    async loadRanking() {
      try {
        this.loading = true;
        const collectionRef = collection(db, "pontos_de_risco");
        const querySnapshot = await getDocs(collectionRef);

        const userCount = {};
        querySnapshot.docs.forEach((doc) => {
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

        this.ranking = Object.entries(userCount)
          .map(([userId, userData]) => ({
            id: userId,
            name: userData.name,
            points: userData.count,
          }))
          .sort((a, b) => b.points - a.points)
          .slice(0, 10);
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        this.ranking = [
          { id: 1, name: "João", points: 25 },
          { id: 2, name: "Maria", points: 18 },
          { id: 3, name: "Carlos", points: 15 },
        ];
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>

<style scoped>
.ranking-content {
  --background: var(--branco);
}

.ranking-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--preto-carvao);
}

.ranking-card {
  background: var(--branco);
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  padding: 14px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ranking-avatar img {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.ranking-info {
  flex: 1;
}
.ranking-name {
  margin: 0;
  font-weight: bold;
  color: var(--preto-carvao);
  font-size: 1rem;
}
.ranking-points {
  margin: 0;
  font-size: 0.85rem;
  color: var(--azul-petroleo);
}

.ranking-position {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  font-size: 1.5rem;
  color: var(--preto-carvao);
}
.trophy {
  width: 30px;
  height: 30px;
}
</style>
