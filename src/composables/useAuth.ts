import { ref, onMounted } from "vue";
import { auth } from "@/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

const user = ref<User | null>(null); // <-- tipado corretamente
const loading = ref(true);

export function useAuth() {
    onMounted(() => {
        onAuthStateChanged(auth, (u) => {
            user.value = u; // agora aceita User | null
            loading.value = false;
        });
    });

    const isLoggedIn = () => !!user.value;

    return { user, loading, isLoggedIn };
}
