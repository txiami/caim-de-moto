<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Caim de Moto</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="goToLogin"> Entrar </ion-button>
        </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Caim de Moto</ion-title>
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
