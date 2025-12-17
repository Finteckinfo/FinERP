<!-- src/components/AuthGuard.vue -->
<script setup lang="ts">
import { useNextAuth } from '@/composables/useNextAuth';
import { useEVMWallet } from '@/composables/useEVMWallet';
import { onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { isSupabaseOnly } from '@/services/supabase';

const router = useRouter();
const { isLoaded, isSignedIn } = useNextAuth();
const { isConnected, user } = useEVMWallet();
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

// Watch for authentication state changes and handle redirects
watch([isLoaded, isAuthenticated], ([loaded, authenticated]) => {
  if (loaded && !authenticated) {
    // SUPABASE-ONLY MODE: Redirect to login page
    if (isSupabaseOnly) {
      router.push('/login');
      return;
    }

    // NEXTAUTH MODE: Redirect to SSO
    const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
    // Ensure we handle the base path correctly if we are on the same domain but strictly need SSO
    // However, if VITE_SSO_PRIMARY_DOMAIN is not set, it defaults to origin.
    // If we are deploying to /FinERP/, origin is just the domain.
    
    // Check if we are incorrectly redirecting to root /login on GH Pages
    // If ssoUrl is just the origin, we might want to stay within the app if no external SSO is actually configured.
    // But assuming the error is "GET .../login", we should check if we really mean to go to /FinERP/login (internal) or external.
    
    // If VITE_SSO_PRIMARY_DOMAIN is NOT set, we generally assume we are using internal auth or local dev.
    if (!import.meta.env.VITE_SSO_PRIMARY_DOMAIN) {
       router.push('/login');
       return;
    }

    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `${ssoUrl}/login?redirect=${redirectUrl}`;
  }
}, { immediate: true });

// Also check on mount as a fallback
onMounted(() => {
  // Small delay to allow composables to initialize
  setTimeout(() => {
    if (isLoaded.value && !isAuthenticated.value) {
      // SUPABASE-ONLY MODE: Redirect to login page
      if (isSupabaseOnly) {
        router.push('/login');
        return;
      }

      // NEXTAUTH MODE: Redirect to SSO
      if (!import.meta.env.VITE_SSO_PRIMARY_DOMAIN) {
         router.push('/login');
         return;
      }

      const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
      const redirectUrl = encodeURIComponent(window.location.href);
      window.location.href = `${ssoUrl}/login?redirect=${redirectUrl}`;
    }
  }, 100);
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
