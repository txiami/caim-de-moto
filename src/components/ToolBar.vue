<template>
    <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-img src="/public/assets/Logo.svg" alt="Logo" class="logo"></ion-img>
      </ion-buttons>
      <ion-title>Caim de Moto</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="goToLogin">Entrar</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script>

export default {
  name: 'ToolsBar',
  methods: {
    goToLogin() {
      this.$router.push('/login');
    }
  }
}

</script>


<style>

.logo {
  width: 50px;  
  height: auto;   
  margin: 0 auto; 
}


</style>