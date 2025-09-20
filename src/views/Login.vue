<template>

    <ion-header>
    <ion-toolbar>
      <ion-title slot="end">Login</ion-title>
          <ion-buttons slot="start">
            <ion-button  @click="goBack">Voltar </ion-button>
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
                      label="Login"
                      label-placement="floating"
                      fill="outline"
                      placeholder="Digite seu login"
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

          <ion-row class="ion-justify-content-center">
            <ion-col size="10" size-md="6">
              <ion-button expand="block" class="ion-margin">
                Entrar
              </ion-button>
            </ion-col>
          </ion-row>

          <ion-row class="ion-justify-content-center">
            <ion-col size="12" class="ion-text-center">
          
            <p>
                Não possui cadastro ainda?
                <ion-button @click="goToCadastro" fill="clear" size="small" class="link-cadastro">
                  Clique aqui
                </ion-button>
                e se cadastre
              </p>              
            </ion-col>
          </ion-row>

        </ion-grid>


  </ion-content>

</template>


<style>

.link-cadastro {
  color: var(--ion-color-primary);
  font-weight: 600;
  cursor: pointer;
}

.logo {
  width: 120px;  
  height: auto;   
  margin: 0 auto; 
}

</style>

<script>

  export default {
    name: 'Login',
    methods: {
      goBack() {
        this.$router.push('/tabs/mapa'); 
      },
      goToCadastro() {
        this.$router.push('/cadastro');
      }
    }
  }

</script>