<script setup lang="ts">
import { onMounted } from 'vue';
import Logo from '@/assets/images/logos/Logo.vue';

// Redirect to main SSO domain for registration
onMounted(() => {
  const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'http://localhost:3000';
  const currentUrl = window.location.href;
  window.location.href = `${ssoUrl}/signup?redirect=${encodeURIComponent(currentUrl)}`;
});
</script>

<template>
  <div class="auth-form-wrapper">
    <div class="logo-section">
      <Logo />
    </div>
    <div class="redirect-message">
      <p>Redirecting to signup...</p>
    </div>
  </div>
</template>

<style scoped>
.auth-form-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
}

.logo-section {
  margin-bottom: 1rem;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
