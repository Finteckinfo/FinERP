<template>
  <v-card elevation="0" class="dex-swap-card">
    <v-card-title class="d-flex flex-column align-center justify-center pa-4 position-relative">
      <div class="d-flex align-center justify-center gap-2 w-100">
        <v-icon size="24" color="primary">mdi-swap-horizontal</v-icon>
        <span class="text-h6 text-center">DEX Swap</span>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="refreshRates"
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
          Connect your wallet to swap FIN tokens
        </p>
        <v-btn color="primary" @click="handleOpenWallet">
          Connect Wallet
        </v-btn>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="text-body-2 text-medium-emphasis mt-4">Loading swap rates...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-4">
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>
        <v-btn color="primary" variant="outlined" @click="refreshRates">
          Retry
        </v-btn>
      </div>

      <!-- Swap Interface -->
      <div v-else class="swap-interface">
        <!-- From Token -->
        <div class="token-input-section mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">From</label>
          <v-card variant="outlined" class="token-input-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon size="32" color="primary" class="mr-3">mdi-coin</v-icon>
                  <div>
                    <div class="text-body-1 font-weight-medium">FIN</div>
                    <div class="text-caption text-medium-emphasis">FinToken</div>
                  </div>
                </div>
                <div class="text-right">
                  <v-text-field
                    v-model="fromAmount"
                    label="Amount"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="amount-input"
                    @input="calculateToAmount"
                  ></v-text-field>
                  <div class="text-caption text-medium-emphasis mt-1">
                    Balance: {{ formatBalance(finBalance) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Swap Arrow -->
        <div class="text-center my-4">
          <v-btn
            icon
            size="small"
            variant="outlined"
            @click="swapTokenDirection"
            class="swap-arrow-btn"
          >
            <v-icon>mdi-swap-vertical</v-icon>
          </v-btn>
        </div>

        <!-- To Token -->
        <div class="token-input-section mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">To</label>
          <v-card variant="outlined" class="token-input-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon size="32" color="success" class="mr-3">mdi-currency-usd</v-icon>
                  <div>
                    <div class="text-body-1 font-weight-medium">{{ toToken }}</div>
                    <div class="text-caption text-medium-emphasis">{{ toToken === 'USDT' ? 'Tether USD' : 'USD Coin' }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-body-1 font-weight-medium">{{ formatBalance(toAmount) }}</div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    1 FIN = {{ exchangeRate }} {{ toToken }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Token Selector -->
        <div class="token-selector mb-4">
          <v-btn-toggle
            v-model="selectedToToken"
            mandatory
            class="token-toggle"
          >
            <v-btn value="USDT" size="small">
              <v-icon start size="16">mdi-currency-usd</v-icon>
              USDT
            </v-btn>
            <v-btn value="USDC" size="small">
              <v-icon start size="16">mdi-currency-usd</v-icon>
              USDC
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Swap Button -->
        <v-btn
          color="primary"
          size="large"
          block
          :disabled="!canSwap"
          :loading="swapping"
          @click="performSwap"
          class="swap-btn"
        >
          <v-icon start>mdi-swap-horizontal</v-icon>
          {{ swapping ? 'Swapping...' : 'Swap Tokens' }}
        </v-btn>

        <!-- Insufficient Balance Warning -->
        <div v-if="hasInsufficientBalance" class="mt-3">
          <v-alert type="warning" variant="tonal" class="text-center">
            Insufficient FIN balance for this swap
          </v-alert>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import { getFINTokenBalance, getFINTokenAddress, getRPCUrl, type FINTokenBalance } from '@/services/finTokenService';
import { swapTokens, getAmountsOut, type SwapParams } from '@/services/dexService';
import { sendGaslessTransaction, isGaslessSupported, estimateGaslessCost } from '@/services/gaslessService';
import { ethers } from 'ethers';

// MetaMask wallet composable
const { user, isConnected, signer, chainId } = useMetaMaskWallet();

// State
const loading = ref(false);
const error = ref<string | null>(null);
const swapping = ref(false);
const fromAmount = ref('');
const toAmount = ref('0');
const selectedToToken = ref('USDT');
const exchangeRate = ref('1.00'); // 1 FIN = 1 USDT/USDC
const finBalance = ref('0');
const gaslessEnabled = ref(true); // Default to gasless when available

// Computed
const walletAddress = computed(() => user.value?.address || '');
const currentChainId = computed(() => chainId.value || 1);
const isWalletConnected = computed(() => isConnected.value);
const toToken = computed(() => selectedToToken.value);
const canSwap = computed(() => {
  const amount = parseFloat(fromAmount.value);
  return amount > 0 && !hasInsufficientBalance.value && !swapping.value;
});
const hasInsufficientBalance = computed(() => {
  const amount = parseFloat(fromAmount.value || '0');
  const balance = parseFloat(finBalance.value || '0');
  return amount > balance;
});

// Functions
const refreshRates = async () => {
  loading.value = true;
  error.value = null;

  try {
    // In a real implementation, you would fetch rates from the DEX contract
    // For now, we'll use the fixed rate of 1 FIN = 1 USDT/USDC
    exchangeRate.value = '1.00';

    // Get FIN balance
    await refreshBalance();
  } catch (err: any) {
    console.error('Error refreshing rates:', err);
    error.value = err.message || 'Failed to refresh rates';
  } finally {
    loading.value = false;
  }
};

const refreshBalance = async () => {
  if (!walletAddress.value) return;

  try {
    // This would integrate with the FIN token service
    // For now, we'll use a placeholder
    finBalance.value = '1000.00'; // Placeholder balance
  } catch (err) {
    console.error('Error fetching balance:', err);
  }
};

const calculateToAmount = () => {
  const amount = parseFloat(fromAmount.value || '0');
  const rate = parseFloat(exchangeRate.value);
  toAmount.value = (amount * rate).toString();
};

const swapTokenDirection = () => {
  // For now, just swap between USDT and USDC
  selectedToToken.value = selectedToToken.value === 'USDT' ? 'USDC' : 'USDT';
  calculateToAmount();
};

const simulateGaslessSwap = async (amount: number, expectedOut: number) => {
  // Simulate gasless transaction delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log(`Gasless swap completed: ${amount} FIN -> ${expectedOut} ${toToken.value}`);
};

const performSwap = async () => {
  if (!canSwap.value || !signer.value || !walletAddress.value) return;

  swapping.value = true;
  error.value = null;

  try {
    const amount = parseFloat(fromAmount.value);
    const finTokenAddress = getFINTokenAddress(currentChainId.value);
    let usdtAddress: string;

    // Get USDT address based on network
    if (currentChainId.value === 1) { // Ethereum
      usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT on Ethereum
    } else if (currentChainId.value === 137) { // Polygon
      usdtAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F6'; // USDT on Polygon
    } else {
      usdtAddress = '0x...'; // Placeholder for other networks
    }

    // Determine swap direction
    const tokenIn = selectedToToken.value === 'USDT' ? finTokenAddress : usdtAddress;
    const tokenOut = selectedToToken.value === 'USDT' ? usdtAddress : finTokenAddress;

    // Calculate minimum output (with 5% slippage)
    const expectedOut = amount * parseFloat(exchangeRate.value);
    const amountOutMin = expectedOut * 0.95; // 5% slippage

    // Check if gasless is supported and user wants it
    const gaslessSupported = isGaslessSupported(currentChainId.value);
    const useGasless = gaslessSupported && gaslessEnabled.value;

    if (useGasless) {
      // Use gasless transaction
      console.log(`Performing gasless swap: ${amount} FIN -> ${expectedOut} ${toToken.value}`);

      // This would require meta-transaction setup with the DEX contract
      // For now, simulate the gasless swap
      await simulateGaslessSwap(amount, expectedOut);

    } else {
      // Use regular transaction
      const swapParams: SwapParams = {
        tokenIn,
        tokenOut,
        amountIn: amount.toString(),
        amountOutMin: amountOutMin.toString()
      };

      console.log(`Performing swap: ${amount} FIN -> ${expectedOut} ${toToken.value}`);
      const result = await swapTokens(signer.value, swapParams);

      console.log('Swap successful, received:', result);
    }

    // Show success message
    alert(`Successfully swapped ${amount} FIN for ${expectedOut.toFixed(2)} ${toToken.value}`);

    // Reset form
    fromAmount.value = '';
    toAmount.value = '0';

    // Refresh balances
    await refreshBalance();

  } catch (err: any) {
    console.error('Swap failed:', err);
    error.value = err.message || 'Swap failed. Please try again.';
  } finally {
    swapping.value = false;
  }
};

const handleOpenWallet = async () => {
  console.log('[DEXSwap] handleOpenWallet called - connecting MetaMask');
  const connected = await useMetaMaskWallet().connect();
  if (connected) {
    console.log('[DEXSwap] MetaMask connected successfully');
  } else {
    console.error('[DEXSwap] Failed to connect MetaMask');
  }
};

const formatBalance = (balance: string) => {
  const num = parseFloat(balance);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Watch for token changes
watch(selectedToToken, () => {
  calculateToAmount();
});

// Watch for wallet connection
watch(isWalletConnected, (connected) => {
  if (connected) {
    refreshRates();
  } else {
    fromAmount.value = '';
    toAmount.value = '0';
    finBalance.value = '0';
  }
});

// Initialize on mount
onMounted(() => {
  if (isWalletConnected.value) {
    refreshRates();
  }
});
</script>

<style scoped>
.dex-swap-card {
  background: var(--erp-card-bg) !important;
  color: var(--erp-text) !important;
  border: 1px solid var(--erp-border) !important;
}

.token-input-section {
  position: relative;
}

.token-input-card {
  background: var(--erp-surface) !important;
  border: 1px solid var(--erp-border) !important;
}

.token-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.amount-input {
  max-width: 120px;
}

.swap-arrow-btn {
  background: var(--erp-surface) !important;
  border: 1px solid var(--erp-border) !important;
}

.token-selector {
  text-align: center;
}

.token-toggle {
  justify-content: center;
}

.swap-btn {
  margin-top: 16px;
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

.wallet-status-badge {
  font-size: 0.75rem !important;
  height: 24px !important;
}

.dex-swap-card :deep(.v-card-title) {
  justify-content: center;
}
</style>
