<template>
  <v-card class="earnings-widget" elevation="0">
    <v-card-text>
      <div class="widget-header">
        <div class="header-icon">
          <v-icon color="success" size="32">mdi-cash-multiple</v-icon>
        </div>
        <div class="header-content">
          <h3 class="widget-title text-center">My Earnings</h3>
          <!-- Wallet Connected Badge -->
          <div v-if="isWalletConnected" class="wallet-badge-container">
            <v-chip
              size="small"
              color="success"
              variant="flat"
              prepend-icon="mdi-wallet"
              class="wallet-status-badge"
            >
              Wallet Connected
            </v-chip>
          </div>
          <p class="widget-subtitle text-center">
            <span v-if="isWalletConnected && walletAddress">
              Wallet: {{ shortenAddress(walletAddress) }}
            </span>
            <span v-else>
              Track your completed task payments
            </span>
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <v-skeleton-loader type="list-item-three-line" />
      </div>

      <!-- Earnings Summary -->
      <div v-else class="earnings-summary">
        <div class="earnings-grid">
          <!-- Wallet Balance -->
          <div class="earning-card wallet-balance" v-if="isWalletConnected">
            <div class="earning-icon">
              <v-icon color="primary">mdi-wallet</v-icon>
              <v-icon 
                size="14" 
                color="success" 
                class="connected-indicator"
                title="Wallet Connected"
              >
                mdi-check-circle
              </v-icon>
            </div>
            <div class="earning-content">
              <span class="earning-label text-center">
                Wallet Balance
                <v-chip size="x-small" color="success" variant="text" class="ml-1">
                  Connected
                </v-chip>
              </span>
              <div v-if="walletBalanceLoading" class="loading-balance">
                <v-progress-circular indeterminate size="16" width="2"></v-progress-circular>
              </div>
              <div v-else-if="walletBalance && walletBalance.found" class="wallet-balance-display">
                <img 
                  src="/images/banner3.png" 
                  alt="FinERP Logo" 
                  class="token-logo-small"
                />
                <span class="earning-value">
                  {{ formatAmount(parseFloat(walletBalance.formattedBalance || '0')) }} {{ walletBalance.symbol || 'FIN' }}
                </span>
              </div>
              <span v-else-if="walletBalanceError" class="earning-value error-text">
                Error
              </span>
              <div v-else class="wallet-balance-display">
                <img 
                  src="/images/banner3.png" 
                  alt="FinERP Logo" 
                  class="token-logo-small"
                />
                <span class="earning-value">
                  0.00 FIN
                </span>
              </div>
            </div>
          </div>

          <!-- Total Earned -->
          <div class="earning-card total-earned">
            <div class="earning-icon">
              <v-icon color="success">mdi-check-circle</v-icon>
            </div>
            <div class="earning-content">
              <span class="earning-label text-center">Total Earned</span>
              <span class="earning-value text-center">{{ formatAmount(totalEarned) }} FIN</span>
            </div>
          </div>

          <!-- Pending -->
          <div class="earning-card pending-earned">
            <div class="earning-icon">
              <v-icon color="warning">mdi-clock-outline</v-icon>
            </div>
            <div class="earning-content">
              <span class="earning-label text-center">Pending</span>
              <span class="earning-value text-center">{{ formatAmount(pendingEarned) }} FIN</span>
            </div>
          </div>

          <!-- Processing -->
          <div class="earning-card processing-earned">
            <div class="earning-icon">
              <v-icon color="info">mdi-sync</v-icon>
            </div>
            <div class="earning-content">
              <span class="earning-label text-center">Processing</span>
              <span class="earning-value text-center">{{ formatAmount(processingEarned) }} FIN</span>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div v-if="recentTransactions.length > 0" class="recent-transactions">
          <div class="transactions-header">
            <h4 class="transactions-title">Recent Payments</h4>
            <v-btn 
              variant="text" 
              size="small"
              @click="viewAllTransactions"
            >
              View All
            </v-btn>
          </div>

          <div class="transactions-list">
            <div 
              v-for="tx in recentTransactions.slice(0, 3)" 
              :key="tx.id"
              class="transaction-item"
            >
              <div class="tx-icon">
                <v-icon 
                  :color="tx.status === 'CONFIRMED' ? 'success' : 'warning'" 
                  size="20"
                >
                  {{ tx.status === 'CONFIRMED' ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                </v-icon>
              </div>
              <div class="tx-content">
                <div class="tx-task">{{ tx.taskTitle }}</div>
                <div class="tx-date">{{ formatDate(tx.submittedAt) }}</div>
              </div>
              <div class="tx-amount">
                <span class="amount">+{{ tx.amount.toFixed(2) }} FIN</span>
                <a 
                  :href="getExplorerUrl(tx.txHash)" 
                  target="_blank"
                  class="tx-link"
                  @click.stop
                >
                  <v-icon size="14">mdi-open-in-new</v-icon>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <v-icon size="48" color="grey-lighten-2">mdi-cash-clock</v-icon>
          <p class="text-body-2 text-medium-emphasis mt-2">
            Complete tasks to start earning FIN
          </p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useNextAuth } from '@/composables/useNextAuth';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import { getUserEarnings, type BlockchainTransaction } from '@/services/paymentService';
import { getFINTokenBalance, getFINTokenAddress, getRPCUrl, type FINTokenBalance } from '@/services/finTokenService';

// Composables
const { user } = useNextAuth();

// Reactive data
const loading = ref(true);
const totalEarned = ref(0);
const pendingEarned = ref(0);
const processingEarned = ref(0);
const recentTransactions = ref<BlockchainTransaction[]>([]);

// Wallet balance state
const walletBalance = ref<FINTokenBalance | null>(null);
const walletBalanceLoading = ref(false);
const walletBalanceError = ref<string | null>(null);

// Get wallet from MetaMask
const { user: walletUser, isConnected, chainId } = useMetaMaskWallet();
const walletAddress = computed(() => walletUser.value?.address || '');
const isWalletConnected = computed(() => isConnected.value && !!walletAddress.value);

// Load wallet balance
const loadWalletBalance = async () => {
  if (!isConnected.value || !walletAddress.value || !chainId.value) {
    walletBalance.value = null;
    return;
  }

  try {
    walletBalanceLoading.value = true;
    walletBalanceError.value = null;
    
    const tokenAddress = getFINTokenAddress(chainId.value);
    const rpcUrl = getRPCUrl(chainId.value);
    
    if (!tokenAddress || !rpcUrl) {
      walletBalanceError.value = 'FIN token not configured for this network';
      return;
    }
    
    const balance = await getFINTokenBalance(walletAddress.value, rpcUrl, tokenAddress);
    walletBalance.value = balance;
  } catch (error: any) {
    console.error('Failed to load wallet balance:', error);
    walletBalanceError.value = error.message || 'Failed to load wallet balance';
    walletBalance.value = null;
  } finally {
    walletBalanceLoading.value = false;
  }
};

// Load earnings data
const loadEarnings = async () => {
  if (!user.value?.id) return;
  
  try {
    loading.value = true;
    const data = await getUserEarnings(user.value.id);
    
    totalEarned.value = data.paid;
    pendingEarned.value = data.pending;
    processingEarned.value = data.processing;
    recentTransactions.value = data.transactions;
  } catch (error) {
    console.error('Failed to load earnings:', error);
  } finally {
    loading.value = false;
  }
};


// Helper to shorten wallet address for display
const shortenAddress = (address: string) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper functions
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const viewAllTransactions = () => {
  router.push('/payments');
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getExplorerUrl = (txId: string) => {
  const chain = chainId.value;
  if (chain === 1) return `https://etherscan.io/tx/${txId}`;
  if (chain === 137) return `https://polygonscan.com/tx/${txId}`;
  if (chain === 11155111) return `https://sepolia.etherscan.io/tx/${txId}`;
  return `#`;
};

// Import router for navigation
import { useRouter } from 'vue-router';
const router = useRouter();

// Watch for wallet connection changes
watch([isConnected, walletAddress, chainId], () => {
  loadWalletBalance();
}, { immediate: true });

// Lifecycle
onMounted(() => {
  loadEarnings();
  if (isConnected.value) {
    loadWalletBalance();
  }
});
</script>

<style scoped>
.earnings-widget {
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  height: 100%;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-radius: 12px;
}

.header-content {
  flex: 1;
}

.widget-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.widget-subtitle {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.wallet-badge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px 0;
}

.wallet-status-badge {
  font-size: 0.75rem !important;
  height: 24px !important;
}

.earnings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.earning-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: var(--erp-page-bg);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  transition: all 0.3s ease;
  text-align: center;
}

.earning-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.earning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--erp-surface);
  border-radius: 8px;
  position: relative;
}

.wallet-balance .earning-icon {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
}

.connected-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: var(--erp-surface);
  border-radius: 50%;
  padding: 2px;
}

.earning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
}

.earning-label {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.earning-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--erp-text);
}

.total-earned .earning-value {
  color: var(--erp-accent-green);
}

.pending-earned .earning-value {
  color: var(--erp-accent-orange);
}

.processing-earned .earning-value {
  color: var(--erp-accent-blue);
}

.wallet-balance .earning-value {
  color: var(--erp-accent-indigo);
}

.loading-balance {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
}

.error-text {
  color: var(--erp-error) !important;
  font-size: 0.875rem;
}

.wallet-balance-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.token-logo-small {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.recent-transactions {
  margin-top: 24px;
}

.transactions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.transactions-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--erp-page-bg);
  border: 1px solid var(--erp-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: var(--erp-surface);
}

.tx-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tx-content {
  flex: 1;
}

.tx-task {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
}

.tx-date {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.6;
}

.tx-amount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--erp-accent-green);
}

.tx-link {
  display: flex;
  align-items: center;
  color: var(--erp-accent-blue);
  text-decoration: none;
}

.tx-link:hover {
  opacity: 0.8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-state {
  padding: 24px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .earnings-grid {
    grid-template-columns: 1fr;
  }

  .earning-card {
    padding: 12px;
  }

  .earning-value {
    font-size: 1rem;
  }

  .widget-header {
    gap: 12px;
    margin-bottom: 16px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tx-amount {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

