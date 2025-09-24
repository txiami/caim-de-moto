<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-img src="/public/assets/icons/Logo.svg" alt="Logo" class="logo"></ion-img>
      </ion-buttons>
      <ion-title>Caim de Moto</ion-title>
      <ion-buttons slot="end">
        <ion-button v-if="!user" @click="goToLogin">Entrar</ion-button>
        <ion-button v-else @click="logout">Sair</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script>
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default {
  name: 'ToolsBar',
  data() {
    return {
      user: null
    };
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    },
    async logout() {
      try {
        await signOut(auth);
        alert('Deslogado com sucesso!');
      } catch (err) {
        console.error(err);
        alert('Erro ao deslogar');
      }
    }
  },
  mounted() {
    onAuthStateChanged(auth, (u) => {
      this.user = u;
    });
  }
};
</script>

<style>
ion-toolbar {
  --background: #191919;
  --color: #ffffff;
}

.logo {
  width: 50px;
  height: auto;
  margin: 0 auto;
}
</style>
