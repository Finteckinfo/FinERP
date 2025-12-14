<!-- src/components/AuthGuard.vue -->
<script setup lang="ts">
import { useNextAuth } from '@/composables/useNextAuth';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();
const { isLoaded, isSignedIn } = useNextAuth();
const { isDark } = useTheme();

onMounted(() => {
  if (isLoaded.value && !isSignedIn.value) {
    // Redirect to primary domain for authentication
    const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `${ssoUrl}/login?redirect=${redirectUrl}`;
  }
});
</script>

<template>
  <div 
    v-if="isLoaded && isSignedIn"
    :class="{ 'dark-theme': isDark }"
  >
    <slot />
  </div>
</template>
