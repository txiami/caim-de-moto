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
        <img src="@/assets/icon-logo.png" class="tab-icon" />
      </div>

      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-input
              v-model="email"
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

        <ion-row class="ion-justify-content-center">
          <ion-col size="10" size-md="6">
            <ion-button expand="block" class="ion-margin" @click="login">
              Entrar
            </ion-button>
          </ion-col>
        </ion-row>

        <ion-row class="ion-justify-content-center">
          <ion-col size="10" size-md="6">
            <ion-button
              expand="block"
              class="btn-cadastre ion-margin"
              @click="goToCadastro"
            >
              Cadastre-se
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
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
  IonIcon,
} from "@ionic/vue";
import { addIcons } from "ionicons";
import { arrowBackOutline } from "ionicons/icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase"; // seu arquivo de configuração do Firebase

// Registra o ícone
addIcons({ "arrow-back-outline": arrowBackOutline });

const router = useRouter();
const email = ref("");
const senha = ref("");

const goBack = () => {
  router.push("/tabs/mapa"); // rota de retorno
};

const goToCadastro = () => {
  router.push("/cadastro");
};

const login = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      senha.value
    );
    alert("Login realizado com sucesso!");
    router.push("/tabs/mapa"); // rota pós-login
  } catch (error) {
    console.error(error);
    alert("Verifique seu email e senha e tente novamente.");
  }
};
</script>

<style scoped>
ion-input {
  color: var(--preto-carvao);
}

ion-buttons {
  color: var(--preto-carvao);
}

ion-title {
  color: var(--preto-carvao);
}

ion-content {
  --background: var(--branco);
}

.link-cadastro { 
  background: transparent;
  border: 0;
  padding: 0;
}

.btn-cadastre {
  --background: var(--vermelho-queimado);                 
  --background-hover: var(--vermelho-queimado-500, #c7473b);
  --background-activated: var(--vermelho-queimado-700, #b13c32);
  --color: var(--branco);                              
  --border-radius: 5px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 12px;                                  
  --padding-end: 12px;

  font-weight: 500;                                        
  text-transform: uppercase;                               
  letter-spacing: 0.5px;
  box-shadow: none;                                      
}

.tab-icon {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-top: 5px;
  margin-bottom: 2px;
}
</style>
