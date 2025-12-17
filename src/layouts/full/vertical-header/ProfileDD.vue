<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { 
  UserIcon, 
  LogoutIcon, 
  SettingsIcon,
  CopyIcon
} from 'vue-tabler-icons';

const authStore = useAuthStore();
const copied = ref(false);

onMounted(() => {
  // Ensure auth store is initialized
  authStore.initialize();
});

const shortenedAddress = computed(() => {
  const addr = authStore.profile.walletAddress;
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
});

const walletBalance = computed(() => {
  const bal = authStore.profile.walletBalance;
  if (!bal) return '0.00';
  return parseFloat(bal).toFixed(4);
});

async function handleCopyAddress() {
  if (authStore.profile.walletAddress) {
    await navigator.clipboard.writeText(authStore.profile.walletAddress);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  }
}

async function handleSignOut() {
  await authStore.signOut();
}
</script>

<template>
  <div class="pa-4 profile-dd">
    <!-- AUTHENTICATED OR WALLET CONNECTED STATE -->
    <div v-if="authStore.isAuthenticated || authStore.profile.walletConnected">
      
      <!-- User Profile Section -->
      <div v-if="authStore.isAuthenticated" class="d-flex align-center mb-4">
        <div class="user-avatar mr-3">
          <v-img 
            v-if="authStore.profile.avatar" 
            :src="authStore.profile.avatar" 
            alt="Avatar"
            cover
          />
          <UserIcon v-else size="24" class="text-primary" />
        </div>
        <div class="overflow-hidden">
          <h4 class="text-h6 font-weight-bold mb-0 text-truncate">{{ authStore.profile.name }}</h4>
          <span class="text-caption text-medium-emphasis text-truncate d-block">{{ authStore.profile.email }}</span>
        </div>
      </div>

      <!-- Wallet Section -->
      <div v-if="authStore.profile.walletConnected" class="wallet-section mb-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-caption font-weight-bold text-medium-emphasis">WALLET CONNECTED</span>
          <span class="text-caption text-primary cursor-pointer" @click="handleCopyAddress">
            {{ copied ? 'Copied!' : shortenedAddress }}
          </span>
        </div>
        
        <div class="balance-card pa-3 rounded-lg">
          <div class="d-flex align-baseline">
            <h3 class="text-h5 font-weight-bold mr-1">{{ walletBalance }}</h3>
            <span class="text-caption font-weight-medium text-medium-emphasis">ETH</span>
          </div>
        </div>
      </div>

      <!-- Connect Wallet Call-to-Action (if logged in but not connected) -->
      <div v-else class="mb-4">
        <v-btn
          block
          variant="tonal"
          color="primary"
          class="rounded-lg"
          @click="authStore.connectWallet()"
        >
          <v-icon start icon="mdi-wallet" />
          Connect Wallet
        </v-btn>
      </div>

      <v-divider class="mb-3"></v-divider>

      <v-list class="pa-0" density="compact">
        <!-- Settings -->
        <v-list-item rounded="md" class="mb-1 ActionItem" ripple to="/settings">
          <template v-slot:prepend>
            <SettingsIcon size="20" class="mr-2 text-medium-emphasis" />
          </template>
          <v-list-item-title class="text-body-2">Settings</v-list-item-title>
        </v-list-item>

        <!-- Sign Out (Unified) -->
        <v-list-item 
          rounded="md" 
          class="ActionItem mt-2" 
          @click="handleSignOut"
          ripple
        >
          <template v-slot:prepend>
            <LogoutIcon size="20" class="mr-2 text-error" />
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium text-error">
            Sign Out
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </div>

    <!-- GUEST STATE (Should generally not be visible if protected, but good fallback) -->
    <div v-else class="text-center py-6">
      <div class="user-avatar mb-4 mx-auto bg-surface-variant">
        <UserIcon size="32" class="text-medium-emphasis" />
      </div>
      
      <h3 class="text-h6 font-weight-bold mb-2">Welcome</h3>
      <p class="text-body-2 text-medium-emphasis mb-6 px-4">
        Sign in to access your projects and assets.
      </p>

      <v-btn 
        block 
        color="primary" 
        size="large" 
        class="rounded-lg font-weight-bold"
        to="/login"
      >
        Sign In
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.05);
  overflow: hidden;
}

.wallet-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  padding: 12px;
}

.balance-card {
  background: var(--v-theme-surface);
  border: 1px solid rgba(var(--v-theme-border), 0.5);
}

.ActionItem {
  transition: all 0.2s;
  cursor: pointer;
}

.ActionItem:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.text-error {
  color: rgb(var(--v-theme-error)) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
