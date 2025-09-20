<template>
  <ion-app>
    <ToolBar/>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import ToolBar from "@/components/ToolBar.vue";
</script>
