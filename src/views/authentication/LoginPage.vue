<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';
import Logo from '@/assets/images/logos/Logo.vue';

const router = useRouter();
const authStore = useAuthStore();
const { isDark } = useTheme();

const error = ref('');
const loading = ref(false);

const handleWalletLogin = async () => {
    loading.value = true;
    error.value = '';
    
    try {
        await authStore.signIn();
        // Redirect handled inside authStore upon success
    } catch (err: any) {
        console.error('Wallet login failed:', err);
        error.value = err.message || 'Failed to connect wallet';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    // If already authenticated, redirect
    if (authStore.isAuthenticated) {
        router.push('/dashboard/default');
    }
});
</script>

<template>
  <div :class="{ 'dark-theme': isDark }" class="login-page">
    <!-- Theme Toggle -->
    <div class="theme-toggle-container">
      <ThemeToggle :show-label="false" size="small" />
    </div>
    
    <div class="login-container">
      <div class="form-container">
        <div class="logo-section">
          <Logo />
        </div>

        <div class="form-header">
          <h1 class="form-title">FinPro</h1>
          <p class="form-subtitle">Connect your wallet to access the dashboard</p>
        </div>

        <!-- Error Message -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- Wallet Connect Action -->
        <div class="wallet-action-container">
          <v-btn
            size="x-large"
            block
            :loading="loading"
            :disabled="loading"
            class="wallet-button"
            color="primary"
            @click="handleWalletLogin"
            elevation="2"
          >
            <v-icon start icon="mdi-wallet" class="mr-2"></v-icon>
            Connect Wallet
          </v-btn>
          
          <p class="mt-4 text-center text-medium-emphasis text-caption">
            Supported Wallets: MetaMask, Coinbase, WalletConnect
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: var(--v-theme-surface);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-container {
  position: fixed;
  top: 28px;
  right: 56px;
  z-index: 1000;
}

.login-container {
  width: 100%;
  max-width: 480px;
  padding: 24px;
}

.form-container {
  width: 100%;
  background: var(--v-theme-surface);
  padding: 40px;
  border-radius: 16px;
  // Optional: Add card effect if desired, otherwise keep flat as requested "minimalistic"
  // box-shadow: 0 4px 24px rgba(0,0,0,0.05);
}

.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--v-theme-on-surface);
}

.form-subtitle {
  font-size: 1.1rem;
  color: var(--v-theme-on-surface-variant);
  opacity: 0.8;
}

.wallet-button {
  height: 56px !important;
  font-size: 1.1rem !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  font-weight: 600 !important;
}

// Responsive
@media (max-width: 768px) {
  .theme-toggle-container {
    top: 20px;
    right: 20px;
  }
  
  .form-container {
    padding: 24px;
  }

  .form-title {
    font-size: 2rem;
  }
}
</style>
