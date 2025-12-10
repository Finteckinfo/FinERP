<template>
  <div class="modern-settings">
    <!-- Hero Section -->
    <div class="settings-hero">
      <RetroGrid />
      <div class="hero-content">
        <div class="hero-icon">
          <v-icon size="48" color="white">mdi-cog</v-icon>
        </div>
        <h1 class="hero-title">Settings</h1>
        <p class="hero-subtitle">Customize your experience and manage your account</p>
      </div>
    </div>

    <!-- Modern Tab Navigation -->
    <div class="settings-nav">
      <div class="nav-container">
        <div class="tab-nav">
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            <v-icon size="20">mdi-account-circle</v-icon>
            <span>Account</span>
            <div class="tab-indicator"></div>
          </button>
          
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'preferences' }"
            @click="activeTab = 'preferences'"
          >
            <v-icon size="20">mdi-tune</v-icon>
            <span>Preferences</span>
            <div class="tab-indicator"></div>
          </button>
          
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'wallet' }"
            @click="activeTab = 'wallet'"
          >
            <v-icon size="20">mdi-wallet</v-icon>
            <span>Wallet Account</span>
            <div class="tab-indicator"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="settings-content">
      <transition name="fade-slide" mode="out-in">
        <div v-if="activeTab === 'account'" key="account" class="content-panel">
          <div class="panel-header">
            <h2>Account Management</h2>
            <p>Manage your profile, security settings, and connected accounts</p>
          </div>
          <div class="clerk-wrapper">
            <UserProfile
              routing="hash"
              :appearance="clerkAppearance"
            />
          </div>
        </div>

        <div v-else-if="activeTab === 'preferences'" key="preferences" class="content-panel">
          <div class="panel-header">
            <h2>Preferences</h2>
            <p>Customize how the app looks and behaves for you</p>
          </div>
          
          <div class="preferences-grid">
            <!-- Theme Settings -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-palette</v-icon>
                <h3>Appearance</h3>
              </div>
              <div class="theme-options">
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'system' }"
                  @click="prefs.theme = 'system'"
                >
                  <v-icon size="32">mdi-monitor</v-icon>
                  <span>System</span>
                  <p>Follow system theme</p>
                </div>
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'light' }"
                  @click="prefs.theme = 'light'"
                >
                  <v-icon size="32">mdi-white-balance-sunny</v-icon>
                  <span>Light</span>
                  <p>Always light mode</p>
                </div>
                <div 
                  class="theme-option"
                  :class="{ active: prefs.theme === 'dark' }"
                  @click="prefs.theme = 'dark'"
                >
                  <v-icon size="32">mdi-weather-night</v-icon>
                  <span>Dark</span>
                  <p>Always dark mode</p>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-bell</v-icon>
                <h3>Notifications</h3>
              </div>
              <div class="notification-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Receive updates via email</p>
                  </div>
                  <v-switch 
                    v-model="prefs.notifyEmail" 
                    color="primary"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>In-App Notifications</h4>
                    <p>Show notifications within the app</p>
                  </div>
                  <v-switch 
                    v-model="prefs.notifyInApp" 
                    color="primary"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>

            <!-- Dashboard Settings -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-view-dashboard</v-icon>
                <h3>Dashboard</h3>
              </div>
              <div class="dashboard-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Default Start Page</h4>
                    <p>Choose your landing page</p>
                  </div>
                  <v-select
                    v-model="prefs.startPage"
                    :items="startPages"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>

            <!-- Date & Time -->
            <div class="preference-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-calendar-clock</v-icon>
                <h3>Date & Time</h3>
              </div>
              <div class="datetime-settings">
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Date Format</h4>
                    <p>How dates are displayed</p>
                  </div>
                  <v-select
                    v-model="prefs.dateFormat"
                    :items="dateFormats"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <h4>Time Format</h4>
                    <p>12-hour or 24-hour format</p>
                  </div>
                  <v-select
                    v-model="prefs.timeFormat"
                    :items="timeFormats"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="savePrefs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'wallet'" key="wallet" class="content-panel">
          <div class="panel-header">
            <h2>Wallet Account</h2>
            <p>Manage your EVM wallet and FIN token balance</p>
          </div>

          <div class="wallet-grid">
            <!-- Wallet Connection Status -->
            <div class="wallet-section">
              <div class="section-header">
                <v-icon size="24" color="primary">mdi-wallet</v-icon>
                <h3>Wallet Connection</h3>
              </div>

              <div v-if="isWalletConnected" class="wallet-connected">
                <v-alert type="success" variant="tonal" class="mb-4">
                  <div class="d-flex align-items-center justify-space-between">
                    <div class="d-flex align-items-center">
                      <v-icon class="mr-2">mdi-check-circle</v-icon>
                      <span>Wallet Connected</span>
                    </div>
                    <v-chip size="small" color="success" variant="flat" prepend-icon="mdi-wallet">
                      Active
                    </v-chip>
                  </div>
                </v-alert>

                <div class="wallet-details">
                  <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <div class="detail-value">
                      <code class="wallet-address">{{ shortenAddress(walletAddress) }}</code>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        @click="copyAddress"
                        :title="copied ? 'Copied!' : 'Copy address'"
                      >
                        <v-icon size="18" :color="copied ? 'success' : 'default'">
                          {{ copied ? 'mdi-check' : 'mdi-content-copy' }}
                        </v-icon>
                      </v-btn>
                    </div>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Full Address:</span>
                    <div class="detail-value">
                      <code class="wallet-address-full">{{ walletAddress }}</code>
                    </div>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">Network:</span>
                    <span class="detail-value">
                      <v-chip :color="chainId === 1 || chainId === 137 ? 'success' : 'warning'" size="small">
                        <v-icon start size="16">
                          {{ chainId === 1 || chainId === 137 ? 'mdi-network' : 'mdi-test-tube' }}
                        </v-icon>
                        {{ chainId === 1 ? 'Ethereum' : chainId === 137 ? 'Polygon' : chainId === 11155111 ? 'Sepolia' : `Chain ${chainId}` }}
                      </v-chip>
                    </span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Wallet Type:</span>
                    <span class="detail-value">
                      <v-chip size="small" variant="text" :color="walletType === 'metamask' ? 'primary' : walletType === 'walletconnect' ? 'info' : 'secondary'">
                        <v-icon start size="16">
                          {{ walletType === 'metamask' ? 'mdi-wallet' : walletType === 'walletconnect' ? 'mdi-qrcode' : 'mdi-wallet-outline' }}
                        </v-icon>
                        {{ walletType === 'metamask' ? 'MetaMask' : walletType === 'walletconnect' ? 'WalletConnect' : walletType === 'coinbase' ? 'Coinbase' : 'Injected' }}
                      </v-chip>
                    </span>
                  </div>
                </div>

                <div class="wallet-actions mt-4">
                  <v-btn color="error" variant="elevated" @click="handleDisconnect" block>
                    <v-icon start>mdi-logout</v-icon>
                    Disconnect Wallet
                  </v-btn>
                </div>
              </div>

              <div v-else class="wallet-disconnected">
                <v-alert type="info" variant="tonal" class="mb-4">
                  <div class="d-flex align-items-center">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    <span>No wallet connected</span>
                  </div>
                </v-alert>

                <p class="text-body-2 mb-4">
                  Connect your EVM wallet (MetaMask, WalletConnect, Coinbase, etc.) to view your FIN token balance and manage transactions.
                </p>

                <v-btn color="primary" variant="elevated" @click="handleConnect">
                  <v-icon start>mdi-wallet-plus</v-icon>
                  Connect Wallet
                </v-btn>
              </div>
            </div>

            <!-- FIN Token Balance (shown only when connected) -->
            <div v-if="isWalletConnected" class="wallet-section">
              <div class="section-header">
                <v-icon size="24" color="success">mdi-cash-multiple</v-icon>
                <h3>FIN Token Balance</h3>
              </div>

              <div class="balance-display">
                <div v-if="balanceLoading" class="text-center py-6">
                  <v-progress-circular indeterminate color="primary" />
                  <p class="text-body-2 mt-3">Loading balance...</p>
                </div>

                <div v-else-if="balanceError" class="text-center py-6">
                  <v-icon size="48" color="error">mdi-alert-circle</v-icon>
                  <p class="text-body-2 mt-3 text-error">{{ balanceError }}</p>
                  <v-btn size="small" variant="outlined" class="mt-3" @click="loadBalance">
                    <v-icon start>mdi-refresh</v-icon>
                    Retry
                  </v-btn>
                </div>

                <div v-else-if="finBalance" class="balance-content">
                  <!-- FIN Logo -->
                  <div class="fin-logo-container mb-3">
                    <v-icon size="64" color="primary">mdi-coin</v-icon>
                  </div>
                  
                  <div class="balance-main">
                    <span class="balance-amount">
                      {{ finBalance.found ? formatAmount(parseFloat(finBalance.formattedBalance)) : '0.00' }}
                    </span>
                    <span class="balance-currency">FIN</span>
                  </div>
                  
                  <div v-if="!finBalance.found" class="text-center mt-2">
                    <v-alert type="info" variant="tonal" size="small" class="text-left">
                      No FIN tokens found in this wallet. You may need to receive FIN tokens first.
                    </v-alert>
                  </div>
                  
                  <div v-if="finBalance.found" class="balance-info mt-3">
                    <div class="balance-detail">
                      <span class="detail-label">Token Name:</span>
                      <span class="detail-value">{{ finBalance.name }}</span>
                    </div>
                    <div class="balance-detail">
                      <span class="detail-label">Contract:</span>
                      <span class="detail-value" style="font-family: 'Courier New', monospace;">{{ finBalance.contractAddress.slice(0, 8) }}...{{ finBalance.contractAddress.slice(-6) }}</span>
                    </div>
                  </div>

                  <div class="balance-actions mt-4">
                    <v-btn size="small" variant="outlined" @click="loadBalance" :loading="balanceLoading">
                      <v-icon start>mdi-refresh</v-icon>
                      Refresh
                    </v-btn>
                    <v-btn size="small" variant="outlined" color="primary" :href="getExplorerAddressUrl(walletAddress)" target="_blank">
                      <v-icon start>mdi-open-in-new</v-icon>
                      View on Explorer
                    </v-btn>
                  </div>
                </div>
                
                <div v-else class="balance-content">
                  <div class="text-center py-4">
                    <v-icon size="48" color="grey-lighten-2">mdi-wallet</v-icon>
                    <p class="text-body-2 mt-3">Unable to load balance</p>
                    <v-btn size="small" variant="outlined" class="mt-3" @click="loadBalance" :loading="balanceLoading">
                      <v-icon start>mdi-refresh</v-icon>
                      Retry
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent FIN Transactions (shown only when connected) -->
            <div v-if="isWalletConnected" class="wallet-section full-width">
              <div class="section-header">
                <v-icon size="24" color="info">mdi-history</v-icon>
                <h3>Recent FIN Token Transactions</h3>
              </div>

              <div v-if="transactionsLoading" class="text-center py-6">
                <v-progress-circular indeterminate color="primary" />
                <p class="text-body-2 mt-3">Loading transactions...</p>
              </div>

              <div v-else-if="transactions.length === 0" class="text-center py-6">
                <v-icon size="48" color="grey-lighten-2">mdi-receipt-text-outline</v-icon>
                <p class="text-body-2 mt-3">No FIN token transactions found</p>
                <p class="text-caption mt-2 text-medium-emphasis">Transaction history will appear here once you make FIN token transfers</p>
              </div>

              <div v-else class="transactions-list">
                <div v-for="tx in transactions.slice(0, 5)" :key="tx.id" class="transaction-item">
                  <div class="tx-icon">
                    <v-icon :color="tx.type === 'receive' ? 'success' : 'error'" size="20">
                      {{ tx.type === 'receive' ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
                    </v-icon>
                  </div>
                  <div class="tx-details">
                    <div class="tx-type">{{ tx.type === 'receive' ? 'Received' : 'Sent' }}</div>
                    <div class="tx-date">{{ formatDate(tx.timestamp) }}</div>
                  </div>
                  <div class="tx-amount">
                    <span :class="tx.type === 'receive' ? 'text-success' : 'text-error'">
                      {{ tx.type === 'receive' ? '+' : '-' }}{{ tx.amount.toFixed(2) }} FIN
                    </span>
                  </div>
                  <div class="tx-action">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      :href="getExplorerTxUrl(tx.hash)"
                      target="_blank"
                      title="View on Explorer"
                    >
                      <v-icon size="18">mdi-open-in-new</v-icon>
                    </v-btn>
                  </div>
                </div>

                <div class="text-center mt-4">
                  <v-btn variant="outlined" size="small" @click="navigateToPayments">
                    View All Transactions
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>

  <!-- Connect Wallet Modal -->
  <ConnectWallet />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useTheme } from 'vuetify';
import { useRouter } from 'vue-router';
import { RetroGrid } from '@/components/ui/retro-grid';
import { isWalletModalOpen } from '@/stores/walletStore';
import { getAddressExplorerUrl, getExplorerUrl } from '@/services/paymentService';
import { getFINTokenBalance, getFINTokenAddress, getRPCUrl, type FINTokenBalance } from '@/services/finTokenService';
import { useEVMWallet } from '@/composables/useEVMWallet';
import ConnectWallet from '@/layouts/full/vertical-header/ConnectWallet.vue';

const router = useRouter();
const activeTab = ref('account');

// EVM Wallet (multi-wallet support)
const { 
  user: walletUser, 
  isConnected: isWalletConnected, 
  chainId, 
  disconnect: disconnectWallet,
  walletType,
  detectAvailableWallets
} = useEVMWallet();
const walletAddress = computed(() => walletUser.value?.address || '');
const availableWallets = ref<string[]>([]);

// Listen for wallet connection/disconnection events
const walletEventListener = (event: Event) => {
  const customEvent = event as CustomEvent;
  console.log('[Settings/Wallet] Wallet event received:', customEvent.type);
  if (customEvent.type === 'wallet-connected' || customEvent.type === 'wallet-disconnected') {
    // Refresh balance and transactions when wallet connection changes
    if (activeTab.value === 'wallet' && isWalletConnected.value) {
      loadBalance();
      loadTransactions();
    }
  }
};

// Wallet tab state
const copied = ref(false);
const finBalance = ref<FINTokenBalance | null>(null);
const balanceLoading = ref(false);
const balanceError = ref('');
const transactions = ref<Array<{
  id: string;
  type: 'send' | 'receive';
  amount: number;
  timestamp: string;
  hash: string;
}>>([]);
const transactionsLoading = ref(false);

const dateFormats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];
const timeFormats = ['24h', '12h'];
const startPages = [
  { title: 'Default Dashboard', value: '/dashboard/default' },
  { title: 'Projects', value: '/projects' },
  { title: 'Analytics', value: '/analytics' }
];

const prefs = ref({
  theme: 'system',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  notifyEmail: true,
  notifyInApp: true,
  startPage: '/dashboard/default'
});

const saveKey = 'app-user-preferences-v1';

onMounted(() => {
  try {
    const raw = localStorage.getItem(saveKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      prefs.value = { ...prefs.value, ...parsed };
    }
  } catch {}
  applyTheme();
  // React to OS theme changes when set to system
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', () => prefs.value.theme === 'system' && applyTheme());
  } catch {}
  
  // Check URL params for tab selection
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam === 'wallet') {
    activeTab.value = 'wallet';
    // Load wallet data if connected
    if (isWalletConnected.value) {
      loadBalance();
      loadTransactions();
    }
  }
  
  // Detect available wallets
  detectAvailableWallets().then(wallets => {
    availableWallets.value = wallets;
  });
  
  // Listen for wallet connection/disconnection events
  window.addEventListener('wallet-connected', walletEventListener);
  window.addEventListener('wallet-disconnected', walletEventListener);
});

onUnmounted(() => {
  window.removeEventListener('wallet-connected', walletEventListener);
  window.removeEventListener('wallet-disconnected', walletEventListener);
});

const savePrefs = () => {
  try {
    localStorage.setItem(saveKey, JSON.stringify(prefs.value));
  } catch {}
};

// Theme application
const theme = useTheme();
const setVuetifyTheme = (mode: 'light' | 'dark') => {
  try {
    theme.global.name.value = mode; // expects themes named 'light' and 'dark'
    document.documentElement.dataset.theme = mode;
  } catch {
    document.documentElement.dataset.theme = mode;
  }
};

const applyTheme = () => {
  if (prefs.value.theme === 'light') return setVuetifyTheme('light');
  if (prefs.value.theme === 'dark') return setVuetifyTheme('dark');
  // system
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return setVuetifyTheme(prefersDark ? 'dark' : 'light');
};

watch(() => prefs.value.theme, () => {
  applyTheme();
  savePrefs();
});

// Wallet tab functions
const handleConnect = () => {
  isWalletModalOpen.value = true;
};

const handleDisconnect = async () => {
  if (confirm('Are you sure you want to disconnect your wallet?')) {
    try {
      await disconnectWallet();
      finBalance.value = null;
      transactions.value = [];
      console.log('[Settings/Wallet] Wallet disconnected successfully');
    } catch (error) {
      console.error('[Settings/Wallet] Error disconnecting wallet:', error);
      finBalance.value = null;
      transactions.value = [];
    }
  }
};

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(walletAddress.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

// Helper to shorten wallet address for display
const shortenAddress = (address: string) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getExplorerAddressUrl = (address: string) => {
  return getAddressExplorerUrl(address);
};

const getExplorerTxUrl = (txHash: string) => {
  return getExplorerUrl(txHash);
};

const navigateToPayments = () => {
  router.push('/payments');
};

// Get network name
const getNetworkName = () => {
  const chain = chainId.value;
  if (chain === 1) return 'Ethereum Mainnet';
  if (chain === 137) return 'Polygon Mainnet';
  if (chain === 11155111) return 'Sepolia Testnet';
  return `Chain ${chain}`;
};

// Load FIN balance from EVM using finTokenService
const loadBalance = async () => {
  if (!walletAddress.value || !chainId.value) return;
  
  try {
    balanceLoading.value = true;
    balanceError.value = '';
    
    const tokenAddress = getFINTokenAddress(chainId.value);
    const rpcUrl = getRPCUrl(chainId.value);
    
    if (!tokenAddress || !rpcUrl) {
      balanceError.value = 'FIN token not configured for this network';
      return;
    }
    
    const balance = await getFINTokenBalance(walletAddress.value, rpcUrl, tokenAddress);
    
    if (balance) {
      finBalance.value = balance;
      console.log('[Settings/Wallet] FIN Token balance loaded:', {
        found: balance.found,
        amount: balance.formattedBalance,
        contractAddress: balance.contractAddress
      });
    } else {
      balanceError.value = 'Failed to fetch balance';
      finBalance.value = null;
    }
    
  } catch (error: any) {
    console.error('[Settings/Wallet] Failed to load balance:', error);
    balanceError.value = error.message || 'Failed to load balance';
    finBalance.value = null;
  } finally {
    balanceLoading.value = false;
  }
};

// Load FIN token transactions from EVM blockchain
const loadTransactions = async () => {
  if (!walletAddress.value || !chainId.value) return;
  
  try {
    transactionsLoading.value = true;
    
    // Get explorer API based on chain
    let apiUrl = '';
    if (chainId.value === 1) {
      apiUrl = `https://api.etherscan.io/api?module=account&action=tokentx&address=${walletAddress.value}&startblock=0&endblock=99999999&sort=desc&apikey=${import.meta.env.VITE_ETHERSCAN_API_KEY || ''}`;
    } else if (chainId.value === 137) {
      apiUrl = `https://api.polygonscan.com/api?module=account&action=tokentx&address=${walletAddress.value}&startblock=0&endblock=99999999&sort=desc&apikey=${import.meta.env.VITE_POLYGONSCAN_API_KEY || ''}`;
    } else if (chainId.value === 11155111) {
      apiUrl = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&address=${walletAddress.value}&startblock=0&endblock=99999999&sort=desc&apikey=${import.meta.env.VITE_ETHERSCAN_API_KEY || ''}`;
    } else {
      transactions.value = [];
      return;
    }
    
    const finTokenAddress = getFINTokenAddress(chainId.value);
    if (!finTokenAddress) {
      transactions.value = [];
      return;
    }
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      // Filter for FIN token transactions only
      const finTransactions = data.result
        .filter((tx: any) => tx.contractAddress.toLowerCase() === finTokenAddress.toLowerCase())
        .slice(0, 10)
        .map((tx: any) => {
          const isSender = tx.from.toLowerCase() === walletAddress.value.toLowerCase();
          // Convert from wei (18 decimals)
          const amount = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal || '18'));
          
          return {
            id: tx.hash,
            type: isSender ? 'send' : 'receive',
            amount,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            hash: tx.hash
          };
        });
      
      transactions.value = finTransactions;
      console.log('[Settings/Wallet] FIN token transactions loaded:', transactions.value.length);
    } else {
      transactions.value = [];
    }
    
  } catch (error: any) {
    console.error('[Settings/Wallet] Failed to load transactions:', error);
    transactions.value = [];
  } finally {
    transactionsLoading.value = false;
  }
};

// Watch wallet connection to load data
watch(isWalletConnected, (connected) => {
  if (connected && activeTab.value === 'wallet') {
    loadBalance();
    loadTransactions();
  } else if (!connected) {
    finBalance.value = null;
    transactions.value = [];
  }
});

// Watch active tab to load data when switching to wallet
watch(activeTab, (newTab) => {
  if (newTab === 'wallet' && isWalletConnected.value) {
    loadBalance();
    loadTransactions();
  }
});

// Watch for chain changes
watch(chainId, () => {
  if (isWalletConnected.value && activeTab.value === 'wallet') {
    loadBalance();
    loadTransactions();
  }
});

// Clerk appearance - responsive styling with mobile popup behavior
const clerkAppearance = {
  variables: {
    colorBackground: 'transparent',
    colorText: 'var(--erp-text)',
    colorTextSecondary: 'var(--erp-text)',
    colorPrimary: 'var(--erp-accent-green)',
    borderRadius: '12px',
    fontFamily: 'inherit'
  },
  elements: {
    rootBox: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    card: {
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: 'none',
      background: 'transparent',
      border: 'none'
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: 'var(--erp-text)'
    },
    scrollBox: {
      maxWidth: '100%'
    },
    formFieldInput: {
      borderRadius: '8px',
      border: '1px solid var(--erp-border)',
      backgroundColor: 'var(--erp-surface)',
      color: 'var(--erp-text)'
    },
    formFieldLabel: {
      color: 'var(--erp-text)'
    },
    socialButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    socialButton: {
      borderRadius: '8px',
      backgroundColor: 'var(--erp-surface)',
      color: 'var(--erp-text)',
      border: '1px solid var(--erp-border)'
    }
  }
} as any;
</script>

<style scoped>
.modern-settings {
  min-height: 100vh;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
}

/* Hero Section */
.settings-hero {
  background: transparent;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  margin-bottom: 2rem;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 1.5rem;
}

.hero-icon .v-icon {
  color: var(--erp-accent-green);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0 0 1rem 0;
  letter-spacing: -0.025em;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--erp-text);
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
}

/* Modern Tab Navigation */
.settings-nav {
  background: var(--erp-card-bg);
  border-bottom: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
}

.tab-nav {
  display: flex;
  gap: 0;
  position: relative;
  justify-content: center;
  width: 100%;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--erp-text);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 140px;
  justify-content: center;
}

.tab-button:hover {
  color: var(--erp-text);
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.tab-button.active {
  color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 8%, var(--erp-surface));
  border-bottom-color: var(--erp-accent-green);
}

.tab-button .v-icon {
  transition: all 0.3s ease;
}

.tab-button.active .v-icon {
  color: var(--erp-accent-green);
  transform: scale(1.1);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--erp-accent-green);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px 2px 0 0;
}

.tab-button.active .tab-indicator {
  width: 100%;
}

.tab-button span {
  transition: all 0.3s ease;
  font-weight: inherit;
}

.tab-button.active span {
  font-weight: 600;
}

/* Content Area */
.settings-content {
  padding: 2rem;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: center;
}

.content-panel {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.panel-header {
  text-align: center;
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.panel-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--erp-text);
  text-align: center;
}

.panel-header p {
  font-size: 1.125rem;
  color: var(--erp-text);
  margin: 0;
  text-align: center;
}

/* Clerk Wrapper */
.clerk-wrapper {
  background: var(--erp-surface);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Preferences Grid */
.preferences-grid {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.preference-section {
  background: var(--erp-surface);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
  text-align: center;
}

/* Theme Options */
.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.theme-option {
  padding: 1.5rem;
  border: 2px solid var(--erp-border);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--erp-card-bg);
}

.theme-option:hover {
  border-color: var(--erp-accent-green);
  transform: translateY(-2px);
}

.theme-option.active {
  border-color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 10%, var(--erp-surface));
}

.theme-option .v-icon {
  margin-bottom: 0.75rem;
  color: var(--erp-accent-green);
}

.theme-option span {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--erp-text);
}

.theme-option p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--erp-text);
}

/* Setting Items */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--erp-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--erp-text);
}

.setting-info p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--erp-text);
  opacity: 0.7;
}

/* Form Input Styling */
.modern-settings :deep(.v-field) {
  background-color: var(--erp-surface) !important;
  border: 1px solid var(--erp-border) !important;
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-field__input) {
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-field__input::placeholder) {
  color: var(--erp-text) !important;
  opacity: 0.5 !important;
}

.modern-settings :deep(.v-field__outline) {
  border-color: var(--erp-border) !important;
}

.modern-settings :deep(.v-field--focused .v-field__outline) {
  border-color: var(--erp-accent-green) !important;
  border-width: 2px !important;
}

.modern-settings :deep(.v-label) {
  color: var(--erp-text) !important;
  opacity: 0.7 !important;
}

.modern-settings :deep(.v-field--focused .v-label) {
  color: var(--erp-accent-green) !important;
  opacity: 1 !important;
}

.modern-settings :deep(.v-list) {
  background-color: var(--erp-card-bg) !important;
  border: 1px solid var(--erp-border) !important;
}

.modern-settings :deep(.v-list-item) {
  color: var(--erp-text) !important;
}

.modern-settings :deep(.v-list-item:hover) {
  background-color: var(--erp-surface) !important;
}

/* Wallet Tab Styles */
.wallet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
  justify-items: stretch;
}

.wallet-section {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 100%;
}

.wallet-section.full-width {
  grid-column: 1 / -1;
  width: 100%;
}

.wallet-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  opacity: 0.7;
  flex: 0 0 auto;
  min-width: 100px;
}

.detail-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--erp-text);
  flex: 1 1 auto;
  text-align: right;
  word-break: break-word;
}

.wallet-address {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  padding: 4px 8px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 6px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-address-full {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  padding: 4px 8px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 6px;
  word-break: break-all;
  max-width: 100%;
  display: block;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--erp-surface);
  border-radius: 8px;
  border: 1px solid var(--erp-border);
  width: 100%;
}

.balance-info .balance-detail {
  width: 100%;
}

.balance-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  width: 100%;
  gap: 8px;
  min-height: 50px;
  text-align: center;
}

.balance-detail .detail-label {
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
  text-align: center;
  width: 100%;
}

.balance-detail .detail-value {
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  font-size: 0.875rem;
  text-align: center;
  width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Dark mode adjustments */
.v-theme--dark .balance-detail .detail-label {
  color: rgba(255, 255, 255, 0.87);
}

.v-theme--dark .balance-detail .detail-value {
  color: rgba(255, 255, 255, 0.87);
}

/* Light mode specific enhancements */
.v-theme--light .balance-detail .detail-label {
  color: var(--erp-accent-green, #4caf50);
  font-weight: 700;
}

.v-theme--light .balance-detail .detail-value {
  color: #212121;
  font-weight: 700;
}

/* Fallback for theme detection */
@media (prefers-color-scheme: light) {
  .balance-detail .detail-label {
    color: var(--erp-accent-green, #4caf50);
  }
  
  .balance-detail .detail-value {
    color: #212121;
  }
}

.fin-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.wallet-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.balance-display {
  min-height: 150px;
}

.balance-content {
  text-align: center;
  padding: 24px;
}

.balance-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.balance-amount {
  font-size: 3rem;
  font-weight: 700;
  color: var(--erp-accent-green);
  line-height: 1;
}

.balance-currency {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--erp-text);
  opacity: 0.6;
}

.balance-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: var(--erp-page-bg);
  transform: translateX(4px);
}

.tx-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--erp-card-bg);
  border-radius: 8px;
}

.tx-details {
  flex: 1;
}

.tx-type {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
}

.tx-date {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.6;
}

.tx-amount {
  font-size: 0.9375rem;
  font-weight: 700;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-settings {
    background: transparent !important;
  }
  
  .settings-hero {
    padding: 1.5rem 1rem;
    margin-bottom: 1rem;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .settings-nav {
    background: transparent !important;
    border: none !important;
    margin-bottom: 1rem;
  }
  
  .nav-container {
    padding: 0 1rem;
    justify-content: center;
  }
  
  .tab-nav {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    min-width: auto;
    flex: 0 0 auto;
    font-size: 0.9rem;
    background: var(--erp-surface) !important;
    border-radius: 8px;
    margin-right: 0;
  }
  
  .settings-content {
    padding: 0;
    background: transparent !important;
  }
  
  .content-panel {
    max-width: 100%;
  }
  
  .panel-header { 
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .preferences-grid {
    width: 100%;
    max-width: 100%;
  }
  
  .preference-section {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    width: 100%;
  }
  
  .theme-options {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  
  .wallet-grid {
    grid-template-columns: 1fr;
    justify-items: stretch;
    width: 100%;
    gap: 16px;
  }
  
  .wallet-section {
    width: 100% !important;
    max-width: 100% !important;
    padding: 16px;
  }
  
  .wallet-section.full-width {
    grid-column: 1;
    width: 100% !important;
  }
  
  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .section-header h3 {
    text-align: center;
    width: 100%;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .detail-label {
    min-width: auto;
    width: 100%;
  }
  
  .detail-value {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
  }
  
  .wallet-address-full {
    font-size: 0.65rem;
    word-break: break-all;
  }
  
  .wallet-actions {
    width: 100%;
  }
  
  .balance-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .balance-actions .v-btn {
    width: 100%;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  /* Clerk mobile full-width */
  .clerk-wrapper {
    padding: 0;
    margin: 0;
    background: transparent !important;
    border: none !important;
    border-radius: 0;
  }
  
  .clerk-wrapper :deep(.cl-card) {
    max-width: 100% !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .clerk-wrapper :deep(.cl-formField) {
    margin-bottom: 1rem;
  }
  
  .clerk-wrapper :deep(.cl-formFieldInput) {
    width: 100% !important;
    min-width: auto !important;
  }
}

@media (max-width: 480px) {
  .settings-hero {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.85rem;
  }
  
  .nav-container {
    padding: 0 0.5rem;
    justify-content: center;
  }
  
  .tab-nav {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .tab-button {
    padding: 0.5rem 0.75rem;
    min-width: auto;
    flex: 0 0 auto;
    font-size: 0.8rem;
    gap: 0.25rem;
    margin-right: 0;
  }
  
  .tab-button .v-icon {
    font-size: 16px;
  }
  
  .preferences-grid {
    gap: 1rem;
    width: 100%;
  }
  
  .preference-section {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    width: 100%;
  }
  
  .theme-option {
    padding: 0.75rem;
    width: 100%;
  }
  
  .wallet-grid {
    gap: 12px;
    width: 100%;
    grid-template-columns: 1fr;
  }
  
  .wallet-section {
    width: 100% !important;
    max-width: 100% !important;
    padding: 12px;
    border-radius: 12px;
  }
  
  .wallet-section.full-width {
    grid-column: 1;
    width: 100% !important;
  }
  
  .section-header {
    margin-bottom: 1rem;
    flex-direction: column;
  }
  
  .section-header h3 {
    font-size: 1rem;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-label {
    font-size: 0.75rem;
    min-width: auto;
  }
  
  .detail-value {
    font-size: 0.75rem;
    text-align: left;
    width: 100%;
  }
  
  .wallet-address {
    font-size: 0.65rem;
    max-width: 100%;
  }
  
  .wallet-address-full {
    font-size: 0.6rem;
    padding: 4px 6px;
  }
  
  .balance-content {
    padding: 16px;
  }
  
  .balance-amount {
    font-size: 2rem;
  }
  
  .balance-currency {
    font-size: 1.25rem;
  }
  
  .siz-logo {
    width: 60px;
    height: 60px;
  }
  
  .balance-info {
    padding: 10px;
    width: 100%;
  }
  
  .balance-detail {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    min-height: 45px;
    text-align: center;
  }
  
  .balance-detail .detail-label {
    font-size: 0.7rem;
    text-align: center;
    width: 100%;
  }
  
  .balance-detail .detail-value {
    font-size: 0.75rem;
    text-align: center;
    width: 100%;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  
  .balance-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .balance-actions .v-btn {
    width: 100%;
  }
  
  .transactions-list {
    gap: 8px;
  }
  
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 10px;
  }
  
  .tx-icon {
    align-self: center;
  }
  
  .tx-details {
    width: 100%;
  }
  
  .tx-amount {
    width: 100%;
    justify-content: space-between;
  }
  
  .tx-action {
    align-self: flex-end;
  }
  
  /* Clerk full-bleed on very small screens */
  .clerk-wrapper {
    padding: 0;
    margin: 0;
    border-radius: 0;
  }
  
  .clerk-wrapper :deep(.cl-card) {
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  
  .clerk-wrapper :deep(.cl-headerTitle) {
    font-size: 18px !important;
    text-align: center;
  }
  
  .clerk-wrapper :deep(.cl-formFieldLabel) {
    font-size: 14px !important;
  }
  
  .clerk-wrapper :deep(.cl-formFieldInput) {
    font-size: 16px !important; /* Prevents zoom on iOS */
    padding: 12px !important;
  }
  
  .clerk-wrapper :deep(.cl-socialButtons) {
    gap: 8px !important;
  }
  
  .clerk-wrapper :deep(.cl-socialButton) {
    padding: 12px !important;
    font-size: 14px !important;
  }
  
  .clerk-wrapper :deep(.cl-button) {
    padding: 12px 16px !important;
    font-size: 14px !important;
    border-radius: 8px !important;
  }
}
</style>

