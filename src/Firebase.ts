import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCJFvkfOsvMJ3du24bu_op98rz6QpUK8n4",
  authDomain: "caimdemoto1.firebaseapp.com",
  projectId: "caimdemoto1",
  storageBucket: "caimdemoto1.firebasestorage.app",
  messagingSenderId: "857015826530",
  appId: "1:857015826530:web:48448aa3698ed8267bb93b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta serviços que vai usar no app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
