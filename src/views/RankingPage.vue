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

        <ion-row class="ion-justify-content-center">
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
                <ion-badge slot="end" color="primary">
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
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonBadge } from "@ionic/vue";
import ToolBar from "@/components/ToolBar.vue";

export default defineComponent({
  name: "RankingPage",
  components: {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    ToolBar,
  },
  data() {
    return {
      ranking: [
        { id: 1, name: "João", points: 25 },
        { id: 2, name: "Maria", points: 18 },
        { id: 3, name: "Carlos", points: 15 },
        { id: 4, name: "Ana", points: 12 },
        { id: 5, name: "Pedro", points: 10 },
      ],
    };
  },
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
