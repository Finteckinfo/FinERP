import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase, isSupabaseOnly } from '@/services/supabase';
import { useEVMWallet } from '@/composables/useEVMWallet';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();
    const { user: walletUser, isConnected: isWalletConnected, disconnect: disconnectWallet, connect: connectWallet } = useEVMWallet();

    // State
    const session = ref<any>(null);
    const user = ref<any>(null);
    const loading = ref(true);
    const initialized = ref(false);

    // Computed
    const isAuthenticated = computed(() => !!session.value?.user);
    const userEmail = computed(() => user.value?.email || '');
    const userDisplayName = computed(() => {
        if (user.value?.user_metadata?.full_name) return user.value.user_metadata.full_name;
        if (user.value?.email) return user.value.email.split('@')[0];
        return 'User';
    });

    // Unified Profile Data
    const profile = computed(() => ({
        name: userDisplayName.value,
        email: userEmail.value,
        avatar: user.value?.user_metadata?.avatar_url || null,
        walletAddress: walletUser.value?.address || null,
        walletBalance: walletUser.value?.balance || null,
        walletConnected: isWalletConnected.value
    }));

    // Actions
    async function initialize() {
        if (initialized.value) return;
        loading.value = true;

        try {
            if (isSupabaseOnly && supabase) {
                // Check Supabase Session
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                session.value = currentSession;
                user.value = currentSession?.user || null;

                // Listen for Auth Changes
                supabase.auth.onAuthStateChange((_event, _session) => {
                    session.value = _session;
                    user.value = _session?.user || null;

                    if (_event === 'SIGNED_OUT') {
                        session.value = null;
                        user.value = null;
                        // Optional: Clear any local app state here
                    }
                });
            }
        } catch (error) {
            console.error('[AuthStore] Initialization error:', error);
        } finally {
            loading.value = false;
            initialized.value = true;
        }
    }

    async function signOut() {
        loading.value = true;
        try {
            // 1. Sign out of Supabase
            if (isSupabaseOnly && supabase) {
                await supabase.auth.signOut();
            }

            // 2. Disconnect Wallet
            if (isWalletConnected.value) {
                await disconnectWallet();
            }

            // 3. Clear State
            session.value = null;
            user.value = null;

            // 4. Clear Storage (Add any other specific keys if needed)
            sessionStorage.clear(); // Careful with this if you store other things, but usually safe for full logout
            localStorage.removeItem('FinPro_wallet_connected'); // Ensure wallet doesn't auto-reconnect

            // 5. Redirect
            if (router) {
                router.push('/login');
            } else {
                window.location.href = '/login';
            }

        } catch (error) {
            console.error('[AuthStore] Sign out error:', error);
        } finally {
            loading.value = false;
        }
    }

    return {
        // State
        session,
        user,
        loading,
        initialized,

        // Computed
        isAuthenticated,
        profile,

        // Actions
        initialize,
        signOut,
        connectWallet // Expose wallet connect for convenience
    };
});
