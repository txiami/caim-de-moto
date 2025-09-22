import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDSSuZIRUBd1yq7XRyExLVKQTt_0OKGjBA",
  authDomain: "caimdemotodb.firebaseapp.com",
  projectId: "caimdemotodb",
  storageBucket: "caimdemotodb.firebasestorage.app",
  messagingSenderId: "1050215525365",
  appId: "1:1050215525365:web:56827652cdcf0f2363cebc",
  measurementId: "G-0Y60TH6M8D"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta serviços que vai usar no app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
