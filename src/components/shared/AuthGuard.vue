<!-- src/components/AuthGuard.vue -->
<script setup lang="ts">
import { useNextAuth } from '@/composables/useNextAuth';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { isSupabaseOnly } from '@/services/supabase';

const router = useRouter();
const { isLoaded, isSignedIn } = useNextAuth();
const { isConnected, user } = useMetaMaskWallet();
const { isDark } = useTheme();

// Check if user is authenticated (either NextAuth or wallet + Supabase)
const isAuthenticated = computed(() => {
  // SUPABASE-ONLY MODE: Check wallet connection
  if (isSupabaseOnly) {
    return isConnected.value && !!user.value?.address;
  }

  // NEXTAUTH MODE: Check NextAuth session
  return isSignedIn.value;
});

onMounted(() => {
  if (isLoaded.value && !isAuthenticated.value) {
    // SUPABASE-ONLY MODE: Redirect to login page
    if (isSupabaseOnly) {
      router.push('/login');
      return;
    }

    // NEXTAUTH MODE: Redirect to SSO
    const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `${ssoUrl}/login?redirect=${redirectUrl}`;
  }
});
</script>

<template>
  <div
    v-if="isLoaded && isAuthenticated"
    :class="{ 'dark-theme': isDark }"
  >
    <slot />
  </div>
</template>
