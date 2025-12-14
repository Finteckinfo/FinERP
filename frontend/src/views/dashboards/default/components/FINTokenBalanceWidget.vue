<template>
  <v-card elevation="0" class="token-balance-card">
    <v-card-title class="d-flex flex-column align-center justify-center pa-4 position-relative">
      <div class="d-flex align-center justify-center gap-2 w-100">
        <v-icon size="24" color="primary">mdi-coin</v-icon>
        <span class="text-h6 text-center">FIN Token Balance</span>
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
          Connect your wallet to view FIN token balance
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
          <!-- Token Logo -->
          <div class="token-logo-container mb-3">
            <img 
              src="/images/banner3.png" 
              alt="FinERP Logo" 
              class="token-logo"
            />
          </div>
          <div class="text-h3 font-weight-bold mb-2" style="color: var(--erp-accent-green);">
            {{ tokenBalance.formattedBalance }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ tokenBalance.symbol || 'FIN' }} Tokens
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
            <span class="token-detail-value token-detail-value-mono">{{ tokenBalance.contractAddress }}</span>
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
          No FIN tokens found in this wallet. Connect your wallet to view your balance.
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import { getFINTokenBalance, getFINTokenAddress, getRPCUrl, type FINTokenBalance } from '@/services/finTokenService';

// State
const loading = ref(false);
const error = ref<string | null>(null);
const tokenBalance = ref<FINTokenBalance | null>(null);

// EVM Wallet
const { user: walletUser, isConnected, chainId, provider } = useMetaMaskWallet();

// Computed
const walletAddress = computed(() => walletUser.value?.address || '');
const isWalletConnected = computed(() => isConnected.value && !!walletAddress.value);

const networkLabel = computed(() => {
  const chain = chainId.value;
  if (chain === 1) return 'Ethereum';
  if (chain === 137) return 'Polygon';
  if (chain === 11155111) return 'Sepolia';
  return `Chain ${chain}`;
});

const networkColor = computed(() => {
  const chain = chainId.value;
  return chain === 1 || chain === 137 ? 'success' : 'warning';
});

const networkIcon = computed(() => {
  const chain = chainId.value;
  return chain === 1 || chain === 137 ? 'mdi-network' : 'mdi-test-tube';
});

// Functions
const refreshBalance = async () => {
  if (!isConnected.value || !walletAddress.value || !chainId.value) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const tokenAddress = getFINTokenAddress(chainId.value);
    const rpcUrl = getRPCUrl(chainId.value);
    
    if (!tokenAddress || !rpcUrl) {
      error.value = 'FIN token not configured for this network.';
      return;
    }
    
    const balance = await getFINTokenBalance(walletAddress.value, rpcUrl, tokenAddress);
    if (balance) {
      tokenBalance.value = balance;
    } else {
      error.value = 'Failed to fetch balance. Please check your network connection.';
    }
  } catch (err: any) {
    console.error('Error fetching FIN token balance:', err);
    error.value = err.message || 'Failed to load FIN token balance. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleOpenWallet = () => {
  // MetaMask connection is handled globally
  console.log('[FINTokenBalance] Wallet connection handled by MetaMask');
};

// Helper to shorten wallet address for display
const shortenAddress = (address: string) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Watch for wallet connection changes
watch(isConnected, (connected) => {
  if (connected && walletAddress.value && chainId.value) {
    refreshBalance();
  } else {
    tokenBalance.value = null;
    error.value = null;
  }
}, { immediate: true });

// Watch for chain changes
watch(chainId, () => {
  if (isConnected.value && walletAddress.value) {
    refreshBalance();
  }
});

// Refresh on mount if wallet is already connected
onMounted(() => {
  if (isConnected.value && walletAddress.value && chainId.value) {
    refreshBalance();
  }
});
</script>

<style scoped>
.fin-token-balance-card {
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

.fin-token-balance-card :deep(.v-card-title) {
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

.fin-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.fin-logo {
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

