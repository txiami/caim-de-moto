<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title slot="end">Cadastro</ion-title>
        <ion-buttons slot="start">
          <ion-button @click="goBack">Voltar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="ion-text-center ion-margin-bottom">
        <ion-img src="/assets/icons/Logo.svg" alt="Logo" class="logo"></ion-img>
      </div>

      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-input
                v-model="nome"
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
                v-model="email"
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
                v-model="senha"
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
                v-model="confirmarSenha"
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
            <ion-button expand="block" class="ion-margin" @click="cadastrar">
              Cadastrar
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonImg
} from '@ionic/vue';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase'; // seu arquivo de configuração do Firebase

export default {
  name: "Cadastro",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonImg
  },
  data() {
    return {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: ''
    };
  },
  methods: {
    goBack() {
      this.$router.push('/login');
    },
    async cadastrar() {
      if (this.senha !== this.confirmarSenha) {
        alert('Senhas não conferem!');
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.senha);
        console.log('Usuário criado:', userCredential.user);
        alert('Cadastro realizado com sucesso!');
        this.$router.push('/login');
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    }
  }
}
</script>

<style scoped>
.logo {
  width: 120px;
  height: auto;
  margin: 0 auto;
}
</style>
