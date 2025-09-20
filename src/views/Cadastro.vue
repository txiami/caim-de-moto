<template>

        <ion-header>
            <ion-toolbar>
            <ion-title slot="end">Cadastro</ion-title>
                <ion-buttons slot="start">
                    <ion-button  @click="goBack">Voltar</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">

            <div class="ion-text-center ion-margin-bottom">
                <ion-img src="/src/assets/Logo.svg" alt="Logo" class="logo"></ion-img>
            </div>

            <ion-grid>

                <ion-row>
                    <ion-col size="12">
                        <ion-input
                            label="Nome Completo"
                            label-placement="floating"
                            fill="outline"
                            placeholder="Digite seu nome"
                            class="ion-margin-top"
                        ></ion-input>
                    </ion-col>
                </ion-row>

                <ion-row>
                    <ion-col size="12">
                        <ion-input
                            type="email"
                            label="Email"
                            label-placement="floating"
                            fill="outline"
                            placeholder="Digite seu email"
                            class="ion-margin-top"
                        ></ion-input>
                    </ion-col>
                </ion-row>

                <ion-row>
                    <ion-col size="12">
                        <ion-input
                            type="password"
                            label="Senha"
                            label-placement="floating"
                            fill="outline"
                            placeholder="Digite sua senha"
                            class="ion-margin-top"
                        ></ion-input>
                    </ion-col>
                </ion-row>

                    <ion-row>
                    <ion-col size="12">
                        <ion-input
                            type="password"
                            label="Confirme sua senha"
                            label-placement="floating"
                            fill="outline"
                            placeholder="Confirme sua senha"
                            class="ion-margin-top"
                        ></ion-input>
                    </ion-col>
                </ion-row>

                <ion-row class="ion-justify-content-center">
                    <ion-col size="10" size-md="6">
                        <ion-button expand="block" class="ion-margin">
                            Cadastrar
                        </ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
</template>




<style>
.logo {
  width: 120px;  
  height: auto;   
  margin: 0 auto; 
}


</style>

<script>

export default {
  name: "Cadastro",
  methods: {
    goBack() {
      this.$router.push('/login')  
    }
  }
}


</script>