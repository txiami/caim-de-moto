<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <img src="@/assets/icon-logo.png" class="tab-icon" />
      </ion-buttons>
      <ion-buttons slot="end">
        <ion-button color="success" v-if="!user" @click="goToLogin">Entrar</ion-button>
        <ion-button color="danger" v-else @click="logout">Sair</ion-button>
      </ion-buttons>
      <div class="toolbar-title-center">{{ title }}</div>
    </ion-toolbar>
  </ion-header>
</template>

<script>
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default {
  name: "ToolsBar",
  data() {
    return {
      user: null,
    };
  },
  props:{
    title: String,
  },
  methods: {
    goToLogin() {
      this.$router.push("/login");
    },
    async logout() {
      try {
        await signOut(auth);
        alert("Deslogado com sucesso!");
      } catch (err) {
        console.error(err);
        alert("Erro ao deslogar");
      }
    },
  },
  mounted() {
    onAuthStateChanged(auth, (u) => {
      this.user = u;
    });
  },
};
</script>

<style>
ion-toolbar {
  --background: var(--cinza-medio);
  --color: var(--branco);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.toolbar-title-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 900;
  color: var(--preto-carvao);
  font-size: 26px;
}

.tab-icon {
  width: 55px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 4px;
}

</style>
