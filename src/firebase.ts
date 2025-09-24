import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Funções do Firebase (Cloud Functions)
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const adminDb = admin.firestore();

exports.getRanking = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await adminDb
      .collection("usuarios")
      .orderBy("pontosRisco", "desc")
      .limit(10)
      .get();

    const ranking = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(ranking);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar ranking");
  }
});

// Exporta serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
