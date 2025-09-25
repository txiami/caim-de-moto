<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="mapa" href="/tabs/mapa">
          <img src="@/assets/mapa.png" class="tab-icon" />
          <ion-label>Mapa</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="ranking" href="/tabs/ranking">
          <img src="@/assets/ranking.png" class="tab-icon" />
          <ion-label>Ranking</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from "@ionic/vue";
import { square, triangle } from "ionicons/icons";
</script>

<style scoped>
ion-tab-bar{
  --background: var(--cinza-medio);
  border: none;
}

ion-label{
  color: var(--preto-carvao);
  font-size: 15px;
}

.tab-icon {
  width: 30px;     
  height: 30px;
  object-fit: contain; 
  margin-bottom: 4px;  
}
</style>
