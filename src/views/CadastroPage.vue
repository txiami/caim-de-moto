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

      <!-- Loading spinner -->
      <div v-if="loading" class="ion-text-center ion-margin">
        <ion-spinner></ion-spinner>
        <p>Criando sua conta...</p>
      </div>

      <ion-grid v-else>
        <ion-row>
          <ion-col size="12">
            <ion-input
                v-model="nome"
                label="Nome Completo"
                label-placement="floating"
                fill="outline"
                placeholder="Digite seu nome"
                class="ion-margin-top"
                :class="{ 'ion-invalid': nomeError }"
            ></ion-input>
            <ion-note v-if="nomeError" color="danger">{{ nomeError }}</ion-note>
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
                :class="{ 'ion-invalid': emailError }"
            ></ion-input>
            <ion-note v-if="emailError" color="danger">{{ emailError }}</ion-note>
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
                :class="{ 'ion-invalid': senhaError }"
            ></ion-input>
            <ion-note v-if="senhaError" color="danger">{{ senhaError }}</ion-note>
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
                :class="{ 'ion-invalid': confirmarSenhaError }"
            ></ion-input>
            <ion-note v-if="confirmarSenhaError" color="danger">{{ confirmarSenhaError }}</ion-note>
          </ion-col>
        </ion-row>

        <ion-row class="ion-justify-content-center">
          <ion-col size="10" size-md="6">
            <ion-button 
              expand="block" 
              class="ion-margin" 
              @click="cadastrar"
              :disabled="loading || !isFormValid"
            >
              {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
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
  IonImg,
  IonSpinner,
  IonNote,
  alertController,
  toastController
} from '@ionic/vue';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';

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
    IonImg,
    IonSpinner,
    IonNote
  },
  data() {
    return {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      loading: false,
      // Campos de erro para validação
      nomeError: '',
      emailError: '',
      senhaError: '',
      confirmarSenhaError: ''
    };
  },
  computed: {
    isFormValid() {
      return this.nome.trim() !== '' && 
             this.email.trim() !== '' && 
             this.senha.length >= 6 && 
             this.senha === this.confirmarSenha &&
             !this.nomeError &&
             !this.emailError &&
             !this.senhaError &&
             !this.confirmarSenhaError;
    }
  },
  watch: {
    nome() {
      this.validateNome();
    },
    email() {
      this.validateEmail();
    },
    senha() {
      this.validateSenha();
    },
    confirmarSenha() {
      this.validateConfirmarSenha();
    }
  },
  methods: {
    goBack() {
      this.$router.push('/login');
    },
    
    validateNome() {
      if (this.nome.trim().length < 2) {
        this.nomeError = 'Nome deve ter pelo menos 2 caracteres';
      } else {
        this.nomeError = '';
      }
    },
    
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.emailError = 'Email inválido';
      } else {
        this.emailError = '';
      }
    },
    
    validateSenha() {
      if (this.senha.length < 6) {
        this.senhaError = 'Senha deve ter pelo menos 6 caracteres';
      } else {
        this.senhaError = '';
      }
    },
    
    validateConfirmarSenha() {
      if (this.senha !== this.confirmarSenha) {
        this.confirmarSenhaError = 'Senhas não conferem';
      } else {
        this.confirmarSenhaError = '';
      }
    },

    async showAlert(header, message) {
      const alert = await alertController.create({
        header,
        message,
        buttons: ['OK']
      });
      await alert.present();
    },

    async showToast(message, color = 'success') {
      const toast = await toastController.create({
        message,
        duration: 3000,
        color,
        position: 'top'
      });
      await toast.present();
    },

    async cadastrar() {
      // Validar formulário
      this.validateNome();
      this.validateEmail();
      this.validateSenha();
      this.validateConfirmarSenha();

      if (!this.isFormValid) {
        await this.showAlert('Erro', 'Por favor, corrija os erros no formulário');
        return;
      }

      this.loading = true;

      try {
        // 1. Criar usuário no Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          this.email, 
          this.senha
        );
        
        const user = userCredential.user;
        console.log('Usuário criado no Authentication:', user.uid);

        // 2. Atualizar o perfil do usuário com o nome
        await updateProfile(user, {
          displayName: this.nome
        });

        // 3. Criar documento do usuário no Firestore
        await this.criarPerfilFirestore(user.uid, user.email, this.nome);

        // 4. Sucesso
        await this.showToast('Cadastro realizado com sucesso!');
        console.log('Usuário cadastrado com sucesso!');
        
        // Redirecionar para login
        this.$router.push('/login');

      } catch (error) {
        console.error('Erro no cadastro:', error);
        await this.handleCadastroError(error);
      } finally {
        this.loading = false;
      }
    },

    async criarPerfilFirestore(userId, email, nome) {
      try {
        const userRef = doc(db, 'usuarios', userId);
        await setDoc(userRef, {
          email: email,
          displayName: nome,
          pontosRisco: 0,
          criadoEm: serverTimestamp(),
          ultimaAtualizacao: serverTimestamp()
        });
        
        console.log('Perfil criado no Firestore para usuário:', userId);
      } catch (error) {
        console.error('Erro ao criar perfil no Firestore:', error);
        throw error; // Re-throw para ser capturado pelo método principal
      }
    },

    async handleCadastroError(error) {
      let message = 'Erro desconhecido';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Este email já está em uso';
          break;
        case 'auth/weak-password':
          message = 'Senha muito fraca';
          break;
        case 'auth/invalid-email':
          message = 'Email inválido';
          break;
        case 'auth/operation-not-allowed':
          message = 'Operação não permitida';
          break;
        case 'auth/network-request-failed':
          message = 'Erro de conexão. Verifique sua internet';
          break;
        default:
          message = error.message || 'Erro ao criar conta';
      }
      
      await this.showAlert('Erro no Cadastro', message);
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

.ion-invalid {
  --border-color: var(--ion-color-danger);
}

ion-note {
  padding-left: 16px;
  font-size: 12px;
}
</style>