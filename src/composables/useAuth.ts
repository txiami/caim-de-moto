import { ref, onMounted } from 'vue';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const user = ref(null);
const loading = ref(true);

export function useAuth() {
    onMounted(() => {
        onAuthStateChanged(auth, (u) => {
            user.value = u;
            loading.value = false;
        });
    });

    const isLoggedIn = () => !!user.value;

    return { user, loading, isLoggedIn };
}
