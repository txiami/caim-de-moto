import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import type { PontoRisco } from "@/types";

const colecaoRiscos = collection(db, "pontos_de_risco");

export const cadastrarPontoRisco = async (ponto: Omit<PontoRisco, 'id'>): Promise<string> => {
    const docRef = await addDoc(colecaoRiscos, ponto);
    return docRef.id;
};

export const buscarTodosPontosRisco = async (): Promise<PontoRisco[]> => {
    const q = query(colecaoRiscos, orderBy("dataCadastro", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<PontoRisco, "id">)
    }));
};
