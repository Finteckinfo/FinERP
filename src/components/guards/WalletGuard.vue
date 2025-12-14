<template>
  <!-- Show loading while auth state is being determined -->
  <div v-if="!isLoaded" class="wallet-guard-loading">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card elevation="0" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" size="64" />
            <p class="mt-4 text-h6">Loading...</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
  
  <!-- Show wallet requirement only if loaded and no wallet -->
  <div 
    v-else-if="!walletConnected" 
    class="wallet-guard"
    :class="{ 'dark-theme': isDark }"
  >
    <v-container 
      fluid 
      class="fill-height"
      :class="{ 'dark-theme': isDark }"
    >
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card 
            elevation="0" 
            class="text-center pa-8"
            :class="{ 'dark-theme': isDark }"
          >
            <v-avatar size="80" color="warning" class="mb-6">
              <span class="text-h3">🔒</span>
            </v-avatar>
            
            <h2 class="text-h4 font-weight-bold mb-4">
              Wallet Required
            </h2>
            
            <p class="text-body-1 text-medium-emphasis mb-6">
              You need to be logged in with a wallet-connected account. Please log in to continue.
            </p>
            
            <!-- Debug info for development -->
            <div v-if="isDevelopment" class="text-left mb-4 p-3 bg-grey-lighten-4 rounded">
              <p class="text-caption font-weight-medium mb-2">Debug Info:</p>
              <p class="text-caption">SSO Wallet Address: {{ walletAddress || 'None' }}</p>
              <p class="text-caption">User Email: {{ user?.email || 'Not authenticated' }}</p>
              <p class="text-caption">Loaded: {{ isLoaded ? 'Yes' : 'No' }}</p>
              
              <!-- Test buttons for debugging -->
              <div class="mt-3">
                <v-btn size="small" variant="outlined" @click="checkWalletStatus" class="mr-2">
                  Check Status
                </v-btn>
                <v-btn size="small" variant="outlined" @click="forceRefresh" class="mr-2">
                  Re-login
                </v-btn>
                <v-btn size="small" variant="outlined" @click="clearWallet" color="error">
                  Logout
                </v-btn>
              </div>
            </div>
            
            <v-btn
              color="primary"
              size="large"
              @click="handleOpenWalletModal"
              class="mb-4"
            >
              Go to Login
            </v-btn>
            
            <div class="text-center">
              <v-btn
                color="secondary"
                variant="text"
                @click="$router.push('/dashboard/default')"
              >
                Back to Dashboard
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Connect Wallet Modal -->
    <ConnectWallet />
  </div>
  
  <!-- Show content if wallet is connected -->
  <div 
    v-else
    :class="{ 'dark-theme': isDark }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useNextAuth } from '@/composables/useNextAuth';
import ConnectWallet from '@/layouts/full/vertical-header/ConnectWallet.vue';

const { isDark } = useTheme();
const { user, isLoaded } = useNextAuth();

// Helper to check if a string looks like an Algorand wallet address
const isAlgorandAddress = (str: string | undefined): boolean => {
  if (!str) return false;
  // Algorand addresses are 58 characters, uppercase letters and numbers (Base32)
  return /^[A-Z2-7]{58}$/.test(str);
};

// Check if user has SSO wallet or their ID is a wallet address
const walletConnected = computed(() => {
  // First check explicit walletAddress field
  if (user.value?.walletAddress) {
    return true;
  }
  
  // Also check if user ID is a wallet address (common for wallet-authenticated users)
  if (isAlgorandAddress(user.value?.id)) {
    return true;
  }
  
  return false;
});

// Get wallet address from SSO for debugging
const walletAddress = computed(() => {
  // Return explicit wallet address if present
  if (user.value?.walletAddress) {
    return user.value.walletAddress;
  }
  
  // Return user ID if it looks like a wallet address
  if (user.value?.id && isAlgorandAddress(user.value.id)) {
    return user.value.id;
  }
  
  return '';
});

// Check if we're in development mode
const isDevelopment = computed(() => {
  return import.meta.env.DEV;
});

// Open wallet modal (redirect to login page)
const handleOpenWalletModal = () => {
  const ssoDomain = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
  window.location.href = `${ssoDomain}/login`;
};

// Debug logging
onMounted(() => {
  console.log('[WalletGuard] Component mounted');
  console.log('[WalletGuard] Initial SSO wallet state:', {
    connected: walletConnected.value,
    address: walletAddress.value,
    userEmail: user.value?.email,
    userId: user.value?.id,
    explicitWallet: user.value?.walletAddress,
    isUserIdWallet: isAlgorandAddress(user.value?.id),
    isLoaded: isLoaded.value
  });
});

// Debug functions
const checkWalletStatus = () => {
  console.log('[WalletGuard] Current SSO wallet status:', {
    connected: walletConnected.value,
    address: walletAddress.value,
    userEmail: user.value?.email,
    userId: user.value?.id,
    explicitWallet: user.value?.walletAddress,
    isUserIdWallet: isAlgorandAddress(user.value?.id),
    isLoaded: isLoaded.value
  });
  alert(`SSO Wallet Status:\nConnected: ${walletConnected.value}\nAddress: ${walletAddress.value || 'None'}\nUser ID: ${user.value?.id || 'None'}\nEmail: ${user.value?.email || 'Not authenticated'}`);
};

const forceRefresh = () => {
  console.log('[WalletGuard] Redirecting to login');
  const ssoDomain = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
  window.location.href = `${ssoDomain}/login`;
};

const clearWallet = () => {
  console.log('[WalletGuard] Logging out');
  const ssoDomain = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
  window.location.href = `${ssoDomain}/logout`;
};
</script>

<style scoped>
.wallet-guard {
  min-height: 100vh;
  background: rgb(var(--v-theme-surface));
}
</style>
