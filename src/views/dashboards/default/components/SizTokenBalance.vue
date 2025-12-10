<template>
  <v-card elevation="0" class="siz-token-balance-card">
    <v-card-title class="d-flex flex-column align-center justify-center pa-4 position-relative">
      <div class="d-flex align-center justify-center gap-2 w-100">
        <v-icon size="24" color="primary">mdi-coin</v-icon>
        <span class="text-h6 text-center">SIZ Token Balance</span>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="refreshBalance"
          :loading="loading"
          class="refresh-btn"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      <!-- Wallet Connected Badge -->
      <div v-if="isWalletConnected" class="wallet-badge-container">
        <v-chip
          size="small"
          color="success"
          variant="flat"
          prepend-icon="mdi-check-circle"
          class="wallet-status-badge"
        >
          Wallet Connected
        </v-chip>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Not Connected State -->
      <div v-if="!isWalletConnected" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-wallet-off</v-icon>
        <p class="text-body-1 text-medium-emphasis mb-4">
          Connect your wallet to view SIZ token balance
        </p>
        <v-btn color="primary" @click="handleOpenWallet">
          Connect Wallet
        </v-btn>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="text-body-2 text-medium-emphasis mt-4">Loading balance...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-4">
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>
        <v-btn color="primary" variant="outlined" @click="refreshBalance">
          Retry
        </v-btn>
      </div>

      <!-- Balance Display -->
      <div v-else-if="tokenBalance" class="balance-display">
        <!-- Wallet Connection Status & Network Badge -->
        <div class="mb-4 d-flex align-center justify-center gap-2 flex-wrap">
          <v-chip
            size="small"
            color="success"
            variant="flat"
            prepend-icon="mdi-wallet"
          >
            Connected: {{ shortenAddress(walletAddress) }}
          </v-chip>
          <v-chip
            size="small"
            :color="networkColor"
          >
            <v-icon start size="16">{{ networkIcon }}</v-icon>
            {{ networkLabel }}
          </v-chip>
        </div>

        <!-- Balance Amount -->
        <div class="text-center mb-4">
          <!-- SIZ Logo -->
          <div class="siz-logo-container mb-3">
            <img 
              src="/images/sizlogo.png" 
              alt="SIZ Logo" 
              class="siz-logo"
            />
          </div>
          <div class="text-h3 font-weight-bold mb-2" style="color: var(--erp-accent-green);">
            {{ tokenBalance.formattedAmount }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ tokenBalance.unitName }} Tokens
          </div>
        </div>

        <!-- Token Details -->
        <v-divider class="my-4"></v-divider>
        <div class="token-details text-center">
          <div class="token-detail-item">
            <span class="token-detail-label">Token Name:</span>
            <span class="token-detail-value">{{ tokenBalance.name }}</span>
          </div>
          <div class="token-detail-item">
            <span class="token-detail-label">Asset ID:</span>
            <span class="token-detail-value token-detail-value-mono">{{ tokenBalance.assetId }}</span>
          </div>
          <div class="token-detail-item">
            <span class="token-detail-label">Wallet Address:</span>
            <span class="token-detail-value token-detail-value-mono">
              {{ walletAddress.slice(0, 8) }}...{{ walletAddress.slice(-8) }}
            </span>
          </div>
        </div>

        <!-- No Tokens Message -->
        <v-alert
          v-if="!tokenBalance.found"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          <template v-slot:prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          No SIZ tokens found in this wallet. You may need to opt-in to the SIZ token.
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { NetworkId } from '@txnlab/use-wallet-vue';
import { connectedWallet, isWalletConnected, openWalletModal } from '@/stores/walletStore';
import { getSizTokenBalance, type SizTokenBalance } from '@/services/sizTokenService';

// State
const loading = ref(false);
const error = ref<string | null>(null);
const tokenBalance = ref<SizTokenBalance | null>(null);
const currentNetwork = ref<string>('testnet');

// Computed
const walletAddress = computed(() => connectedWallet.value || '');

// Convert string network to NetworkId
const networkId = computed<NetworkId>(() => {
  const network = currentNetwork.value || localStorage.getItem('algorand_network') || 'testnet';
  switch (network.toLowerCase()) {
    case 'mainnet':
      return NetworkId.MAINNET;
    case 'testnet':
      return NetworkId.TESTNET;
    case 'betanet':
      return NetworkId.BETANET;
    case 'fnet':
      return NetworkId.FNET;
    case 'localnet':
    case 'local':
      return NetworkId.LOCALNET;
    default:
      return NetworkId.TESTNET;
  }
});

const networkLabel = computed(() => {
  const network = currentNetwork.value || 'testnet';
  switch (network.toLowerCase()) {
    case 'mainnet':
      return 'Mainnet';
    case 'testnet':
      return 'Testnet';
    case 'betanet':
      return 'Betanet';
    case 'fnet':
      return 'Fnet';
    case 'localnet':
    case 'local':
      return 'Localnet';
    default:
      return 'Testnet';
  }
});

const networkColor = computed(() => {
  const network = currentNetwork.value || 'testnet';
  return network.toLowerCase() === 'mainnet' ? 'success' : 'warning';
});

const networkIcon = computed(() => {
  const network = currentNetwork.value || 'testnet';
  return network.toLowerCase() === 'mainnet' ? 'mdi-network' : 'mdi-test-tube';
});

// Functions
const refreshBalance = async () => {
  if (!isWalletConnected.value || !walletAddress.value) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Get current network from localStorage
    currentNetwork.value = localStorage.getItem('algorand_network') || 'testnet';
    
    const balance = await getSizTokenBalance(walletAddress.value, networkId.value);
    if (balance) {
      tokenBalance.value = balance;
    } else {
      error.value = 'Failed to fetch balance. Please check your network connection.';
    }
  } catch (err: any) {
    console.error('Error fetching SIZ token balance:', err);
    error.value = err.message || 'Failed to load SIZ token balance. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleOpenWallet = () => {
  console.log('[SizTokenBalance] handleOpenWallet called - opening wallet modal');
  openWalletModal();
  console.log('[SizTokenBalance] openWalletModal function executed');
};

// Helper to shorten wallet address for display
const shortenAddress = (address: string) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const handleNetworkChange = () => {
  currentNetwork.value = localStorage.getItem('algorand_network') || 'testnet';
  if (isWalletConnected.value) {
    refreshBalance();
  }
};

// Watch for wallet connection changes
watch(isWalletConnected, (connected) => {
  if (connected) {
    currentNetwork.value = localStorage.getItem('algorand_network') || 'testnet';
    refreshBalance();
  } else {
    tokenBalance.value = null;
    error.value = null;
  }
}, { immediate: true });

// Listen for wallet connection/disconnection events from other components
const walletEventListener = (event: Event) => {
  const customEvent = event as CustomEvent;
  console.log('[SizTokenBalance] Wallet event received:', customEvent.type);
  if (customEvent.type === 'wallet-connected') {
    // Refresh balance when wallet is connected from another component
    if (isWalletConnected.value) {
      currentNetwork.value = localStorage.getItem('algorand_network') || 'testnet';
      refreshBalance();
    }
  } else if (customEvent.type === 'wallet-disconnected') {
    // Clear balance when wallet is disconnected
    tokenBalance.value = null;
    error.value = null;
  }
};

// Watch for network changes in localStorage
watch(() => localStorage.getItem('algorand_network'), () => {
  handleNetworkChange();
});

// Listen for network-changed event
const networkChangeListener = () => {
  handleNetworkChange();
};

// Refresh on mount if wallet is already connected
onMounted(() => {
  currentNetwork.value = localStorage.getItem('algorand_network') || 'testnet';
  
  // Listen for network changes
  window.addEventListener('network-changed', networkChangeListener);
  
  // Listen for wallet connection/disconnection events
  window.addEventListener('wallet-connected', walletEventListener);
  window.addEventListener('wallet-disconnected', walletEventListener);
  
  if (isWalletConnected.value) {
    refreshBalance();
  }
});

// Cleanup listener on unmount
onUnmounted(() => {
  window.removeEventListener('network-changed', networkChangeListener);
  window.removeEventListener('wallet-connected', walletEventListener);
  window.removeEventListener('wallet-disconnected', walletEventListener);
});
</script>

<style scoped>
.siz-token-balance-card {
  background: var(--erp-card-bg) !important;
  color: var(--erp-text) !important;
  border: 1px solid var(--erp-border) !important;
}

.balance-display {
  min-height: 200px;
}

.token-details {
  padding: 8px 0;
}

.wallet-status-badge {
  font-size: 0.75rem !important;
  height: 24px !important;
}

.siz-token-balance-card :deep(.v-card-title) {
  justify-content: center;
}

.refresh-btn {
  position: absolute;
  right: 16px;
}

.wallet-badge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  width: 100%;
}

.siz-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.siz-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.token-details {
  text-align: center;
  padding: 16px;
  background: var(--erp-surface);
  border-radius: 8px;
  border: 1px solid var(--erp-border);
}

.token-detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--erp-page-bg);
  border-radius: 6px;
  border: 1px solid var(--erp-border);
}

.token-detail-item:last-child {
  margin-bottom: 0;
}

.token-detail-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.token-detail-value {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  word-break: break-all;
}

.token-detail-value-mono {
  font-family: 'Courier New', 'Courier', monospace;
  background: rgba(33, 150, 243, 0.1);
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid rgba(33, 150, 243, 0.3);
  color: #1565c0;
  font-weight: 600;
  display: inline-block;
  min-width: 120px;
}

/* Dark mode adjustments */
.v-theme--dark .token-detail-label {
  color: rgba(255, 255, 255, 0.87);
}

.v-theme--dark .token-detail-value {
  color: rgba(255, 255, 255, 0.87);
}

.v-theme--dark .token-detail-value-mono {
  background: rgba(33, 150, 243, 0.2);
  border-color: rgba(33, 150, 243, 0.4);
  color: #64b5f6;
}

/* Light mode specific enhancements for better contrast */
.v-theme--light .token-detail-label {
  color: var(--erp-accent-green, #4caf50);
  font-weight: 700;
}

.v-theme--light .token-detail-value {
  color: #212121;
  font-weight: 700;
}

.v-theme--light .token-detail-value-mono {
  background: rgba(33, 150, 243, 0.12);
  border-color: rgba(33, 150, 243, 0.35);
  color: #0d47a1;
  font-weight: 700;
}

/* Fallback for theme detection */
@media (prefers-color-scheme: light) {
  .token-detail-label {
    color: var(--erp-accent-green, #4caf50);
  }
  
  .token-detail-value {
    color: #212121;
  }
  
  .token-detail-value-mono {
    background: rgba(33, 150, 243, 0.12);
    border-color: rgba(33, 150, 243, 0.35);
    color: #0d47a1;
  }
}

@media (prefers-color-scheme: dark) {
  .token-detail-label {
    color: rgba(255, 255, 255, 0.87);
  }
  
  .token-detail-value {
    color: rgba(255, 255, 255, 0.87);
  }
  
  .token-detail-value-mono {
    background: rgba(33, 150, 243, 0.2);
    border-color: rgba(33, 150, 243, 0.4);
    color: #64b5f6;
  }
}
</style>

