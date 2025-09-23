<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title slot="end">Login</ion-title>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="start" name="arrow-back-outline"></ion-icon>
            Voltar
          </ion-button>
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
                v-model="email"
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

        <ion-row class="ion-justify-content-center">
          <ion-col size="10" size-md="6">
            <ion-button expand="block" class="ion-margin" @click="login">
              Entrar
            </ion-button>
          </ion-col>
        </ion-row>

        <ion-row class="ion-justify-content-center">
          <ion-col size="12" class="ion-text-center">
            <p class="link-cadastro">
              <ion-button @click="goToCadastro" fill="clear" size="small">
                Não possui cadastro ainda? Clique aqui e se cadastre!
              </ion-button>
            </p>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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
  IonImg,
  IonIcon
} from '@ionic/vue';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase'; // seu arquivo de configuração do Firebase

// Registra o ícone
addIcons({ 'arrow-back-outline': arrowBackOutline });

const router = useRouter();
const email = ref('');
const senha = ref('');

const goBack = () => {
  router.push('/tabs/mapa'); // rota de retorno
};

const goToCadastro = () => {
  router.push('/cadastro');
};

const login = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, senha.value);
    console.log('Usuário logado:', userCredential.user);
    alert('Login realizado com sucesso!');
    router.push('/tabs/mapa'); // rota pós-login
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};
</script>

<style scoped>
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
