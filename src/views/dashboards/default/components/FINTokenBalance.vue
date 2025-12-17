<template>
  <div class="wallet-widget">
    <!-- Not Connected -->
    <div v-if="!isWalletConnected" class="connect-prompt">
      <div class="prompt-icon">
        <v-icon size="40">mdi-wallet-outline</v-icon>
      </div>
      <p>Connect wallet to view balance</p>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        @click="handleConnect"
      >
        Connect Wallet
      </v-btn>
    </div>

    <!-- Connected State -->
    <div v-else class="wallet-content">
      <!-- Account Info -->
      <div class="account-row">
        <div class="account-avatar">
          <v-icon>mdi-wallet</v-icon>
        </div>
        <div class="account-info">
          <span class="account-address">{{ shortAddress }}</span>
          <span class="network-badge" :class="networkClass">
            <span class="network-dot"></span>
            {{ networkName }}
          </span>
        </div>
        <v-btn
          icon
          size="x-small"
          variant="text"
          @click="copyAddress"
          class="copy-btn"
        >
          <v-icon size="16">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
        </v-btn>
      </div>

      <!-- Balances -->
      <div class="balances-section">
        <!-- FIN Token Balance -->
        <div class="balance-item main">
          <div class="balance-icon fin">
            <img src="/images/finerp-logo.png" alt="FIN" />
          </div>
          <div class="balance-info">
            <span class="balance-label">FIN Token</span>
            <span class="balance-value">{{ formatBalance(finBalance) }}</span>
            <span class="balance-usd">≈ ${{ formatUSD(finBalance) }}</span>
          </div>
        </div>

        <!-- ETH Balance -->
        <div class="balance-item">
          <div class="balance-icon eth">
            <v-icon>mdi-ethereum</v-icon>
          </div>
          <div class="balance-info">
            <span class="balance-label">ETH</span>
            <span class="balance-value">{{ formatBalance(ethBalance, 4) }}</span>
            <span class="balance-usd">≈ ${{ formatUSD(ethBalance, 2500) }}</span>
          </div>
          </div>
        </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <v-btn
          variant="tonal"
          size="small"
          color="primary"
          prepend-icon="mdi-arrow-down"
          class="action-btn"
        >
          Receive
        </v-btn>
        <v-btn
          variant="tonal"
          size="small"
          color="primary"
          prepend-icon="mdi-arrow-up"
          class="action-btn"
        >
          Send
        </v-btn>
        <v-btn
          variant="tonal"
          size="small"
          prepend-icon="mdi-water"
          class="action-btn"
          @click="requestTestTokens"
          :loading="requesting"
        >
          Faucet
        </v-btn>
      </div>

      <!-- Testnet Notice -->
      <div class="testnet-notice" v-if="isTestnet">
        <v-icon size="14">mdi-flask-outline</v-icon>
        <span>Testnet • Tokens have no real value</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useEVMWallet } from '@/composables/useEVMWallet';

const { user, isConnected, connect, chainId } = useEVMWallet();

// State
const finBalance = ref('10000.0000');
const ethBalance = ref('2.5432');
const copied = ref(false);
const requesting = ref(false);

// Computed
const isWalletConnected = computed(() => isConnected.value);
const walletAddress = computed(() => user.value?.address || '');

const shortAddress = computed(() => {
  if (!walletAddress.value) return '';
  return `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}`;
});

const networkName = computed(() => {
  const networks: Record<number, string> = {
    1: 'Ethereum',
    11155111: 'Sepolia',
    137: 'Polygon',
    80001: 'Mumbai',
    42161: 'Arbitrum',
    10: 'Optimism'
  };
  return networks[chainId.value || 1] || 'Unknown';
});

const networkClass = computed(() => {
  const id = chainId.value || 1;
  if (id === 1 || id === 137 || id === 42161 || id === 10) return 'mainnet';
  return 'testnet';
});

const isTestnet = computed(() => {
  const testnets = [11155111, 80001, 5, 4, 3];
  return testnets.includes(chainId.value || 0);
});

// Functions
function handleConnect() {
  connect();
}

function formatBalance(value: string, decimals = 2) {
  const num = parseFloat(value || '0');
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
  }

function formatUSD(value: string, rate = 1) {
  const num = parseFloat(value || '0') * rate;
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

async function copyAddress() {
  if (!walletAddress.value) return;
  
  try {
    await navigator.clipboard.writeText(walletAddress.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch (err) {
    console.error('Failed to copy address:', err);
  }
}

async function requestTestTokens() {
  requesting.value = true;
  
  try {
    // Simulate faucet request
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add test tokens
    finBalance.value = (parseFloat(finBalance.value) + 1000).toFixed(4);
    ethBalance.value = (parseFloat(ethBalance.value) + 0.1).toFixed(4);
    
    console.log('Test tokens received!');
  } catch (err) {
    console.error('Faucet request failed:', err);
  } finally {
    requesting.value = false;
  }
}

// Watch for wallet changes
watch(isWalletConnected, async (connected) => {
  if (connected && walletAddress.value) {
    // In real app, fetch actual balances here
  }
});

onMounted(() => {
  if (isWalletConnected.value) {
    // Fetch balances
  }
});
</script>

<style scoped>
.wallet-widget {
  padding: 20px;
}

.connect-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.prompt-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--erp-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--erp-text-muted);
}

.connect-prompt p {
  color: var(--erp-text-muted);
  margin-bottom: 16px;
}

/* Connected State */
.wallet-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Account Row */
.account-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
}

.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--erp-accent-indigo), #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-address {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--erp-text);
}

.network-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  width: fit-content;
}

.network-badge.mainnet {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.network-badge.testnet {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.network-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.copy-btn {
  opacity: 0.5;
  transition: opacity 0.2s;
}

.copy-btn:hover {
  opacity: 1;
}

/* Balances */
.balances-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  transition: all 0.2s;
}

.balance-item.main {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-color: rgba(99, 102, 241, 0.3);
}

.balance-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.balance-icon.fin {
  background: linear-gradient(135deg, var(--erp-accent-indigo), #8b5cf6);
}

.balance-icon.fin img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.balance-icon.eth {
  background: rgba(98, 126, 234, 0.15);
  color: #627eea;
}

.balance-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 0.75rem;
  color: var(--erp-text-muted);
}

.balance-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--erp-text);
}

.balance-usd {
  font-size: 0.75rem;
  color: var(--erp-text-muted);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  text-transform: none;
  font-weight: 500;
}

/* Testnet Notice */
.testnet-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  font-size: 0.75rem;
  color: #f59e0b;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .wallet-widget {
    padding: 16px;
  }

  .account-row {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .account-avatar {
    width: 36px;
    height: 36px;
  }

  .account-info {
    width: 100%;
  }

  .account-address {
    font-size: 0.85rem;
  }

  .network-badge {
    font-size: 0.65rem;
    padding: 1px 6px;
  }

  .balances-section {
    gap: 10px;
  }
  
  .balance-item {
    padding: 10px;
  }

  .balance-icon {
    width: 36px;
    height: 36px;
  }

  .balance-icon.fin img {
    width: 20px;
    height: 20px;
  }

  .balance-value {
    font-size: 1rem;
  }
  
  .balance-usd {
    font-size: 0.7rem;
  }

  .quick-actions {
    flex-direction: column;
    gap: 6px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .connect-prompt {
    padding: 32px 16px;
  }

  .prompt-icon {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .wallet-widget {
    padding: 12px;
  }

  .account-row {
    padding: 10px;
  }
  
  .balance-item {
    padding: 8px;
  }

  .balance-value {
    font-size: 0.9rem;
  }

  .balance-usd {
    font-size: 0.65rem;
  }
  
  .testnet-notice {
    font-size: 0.7rem;
    padding: 6px;
  }

  .action-btn {
    font-size: 0.85rem;
  }
}
</style>
