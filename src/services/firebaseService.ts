import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface RankingUser {
    id: string;
    name: string;
    points: number;
}

export async function fetchRankingData(): Promise<RankingUser[]> {
    try {
        // Substitua por sua collection e campo do índice
        const collectionRef = collection(db, 'usuarios'); // sua collection
        const q = query(
            collectionRef,
            orderBy('pontosRisco', 'desc'), // seu campo indexado
            limit(5) // top 5
        );

        const querySnapshot = await getDocs(q);

        const ranking = querySnapshot.docs.map((doc, index) => ({
            id: doc.id,
            name: doc.data().name || doc.data().nome || `Usuário ${index + 1}`,
            points: doc.data().pontosRisco || 0
        }));

        return ranking;
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        throw new Error('Não foi possível carregar o ranking');
    }
}