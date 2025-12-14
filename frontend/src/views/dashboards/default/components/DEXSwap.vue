<template>
  <div class="dex-widget">
    <!-- Not Connected State -->
    <div v-if="!isWalletConnected" class="connect-prompt">
      <div class="prompt-icon">
        <v-icon size="40">mdi-wallet-outline</v-icon>
      </div>
      <p>Connect wallet to swap tokens</p>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        @click="handleConnect"
      >
        Connect
      </v-btn>
    </div>

    <!-- Swap Interface -->
    <div v-else class="swap-interface">
      <!-- From Token -->
      <div class="token-row from">
        <div class="token-label">
          <span>From</span>
          <span class="balance" @click="setMaxAmount">
            Balance: {{ formatAmount(fromBalance) }}
          </span>
        </div>
        <div class="token-input-group">
          <div class="token-selector" @click="toggleFromToken">
            <img :src="fromToken.icon" :alt="fromToken.symbol" class="token-icon" />
            <span>{{ fromToken.symbol }}</span>
            <v-icon size="16">mdi-chevron-down</v-icon>
          </div>
          <input
            v-model="fromAmount"
            type="number"
            placeholder="0.00"
            class="amount-input"
            @input="calculateOutput"
          />
        </div>
      </div>

      <!-- Swap Direction Button -->
      <div class="swap-direction">
        <button class="swap-btn" @click="swapDirection">
          <v-icon>mdi-swap-vertical</v-icon>
        </button>
      </div>

      <!-- To Token -->
      <div class="token-row to">
        <div class="token-label">
          <span>To</span>
          <span class="balance">Balance: {{ formatAmount(toBalance) }}</span>
        </div>
        <div class="token-input-group">
          <div class="token-selector" @click="toggleToToken">
            <img :src="toToken.icon" :alt="toToken.symbol" class="token-icon" />
            <span>{{ toToken.symbol }}</span>
            <v-icon size="16">mdi-chevron-down</v-icon>
          </div>
          <input
            v-model="toAmount"
            type="number"
            placeholder="0.00"
            class="amount-input"
            readonly
          />
        </div>
      </div>

      <!-- Rate Info -->
      <div class="rate-info" v-if="fromAmount && parseFloat(fromAmount) > 0">
        <span>1 {{ fromToken.symbol }} = {{ exchangeRate }} {{ toToken.symbol }}</span>
        <span class="fee">Fee: 0.3%</span>
      </div>

      <!-- Swap Button -->
      <v-btn
        color="primary"
        variant="flat"
        block
        class="swap-action-btn"
        :disabled="!canSwap"
        :loading="swapping"
        @click="executeSwap"
      >
        {{ swapButtonText }}
      </v-btn>

      <!-- Testnet Notice -->
      <div class="testnet-notice">
        <v-icon size="14">mdi-information-outline</v-icon>
        <span>Testnet mode • No real funds involved</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import finerpLogo from '@/assets/images/finerp-logo.svg';

const { user, isConnected, connect } = useMetaMaskWallet();

// Token definitions
const tokens = {
  FIN: {
    symbol: 'FIN',
    name: 'FinERP Token',
    icon: finerpLogo,
    decimals: 18
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=029',
    decimals: 6
  },
  USDC: {
    symbol: 'USDC', 
    name: 'USD Coin',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=029',
    decimals: 6
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029',
    decimals: 18
  }
};

// State
const fromTokenSymbol = ref('FIN');
const toTokenSymbol = ref('USDT');
const fromAmount = ref('');
const toAmount = ref('');
const swapping = ref(false);

// Mock balances (in real app, fetch from blockchain)
const balances = ref({
  FIN: '10000.00',
  USDT: '5000.00',
  USDC: '5000.00',
  ETH: '2.5'
});

// Exchange rates (1 FIN = 1 USDT, mock rates for demo)
const rates = {
  'FIN-USDT': 1.0,
  'FIN-USDC': 1.0,
  'FIN-ETH': 0.0004,
  'USDT-FIN': 1.0,
  'USDT-USDC': 1.0,
  'USDT-ETH': 0.0004,
  'USDC-FIN': 1.0,
  'USDC-USDT': 1.0,
  'USDC-ETH': 0.0004,
  'ETH-FIN': 2500,
  'ETH-USDT': 2500,
  'ETH-USDC': 2500
};

// Computed
const isWalletConnected = computed(() => isConnected.value);

const fromToken = computed(() => tokens[fromTokenSymbol.value as keyof typeof tokens]);
const toToken = computed(() => tokens[toTokenSymbol.value as keyof typeof tokens]);

const fromBalance = computed(() => balances.value[fromTokenSymbol.value as keyof typeof balances.value] || '0');
const toBalance = computed(() => balances.value[toTokenSymbol.value as keyof typeof balances.value] || '0');

const exchangeRate = computed(() => {
  const pair = `${fromTokenSymbol.value}-${toTokenSymbol.value}`;
  return rates[pair as keyof typeof rates]?.toFixed(4) || '1.0000';
});

const canSwap = computed(() => {
  const amount = parseFloat(fromAmount.value || '0');
  const balance = parseFloat(fromBalance.value || '0');
  return amount > 0 && amount <= balance && !swapping.value;
});

const swapButtonText = computed(() => {
  if (!fromAmount.value || parseFloat(fromAmount.value) === 0) {
    return 'Enter amount';
  }
  const amount = parseFloat(fromAmount.value);
  const balance = parseFloat(fromBalance.value);
  if (amount > balance) {
    return 'Insufficient balance';
  }
  return `Swap ${fromToken.value.symbol}`;
});

// Functions
function handleConnect() {
  connect();
}

function formatAmount(value: string) {
  const num = parseFloat(value || '0');
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function setMaxAmount() {
  fromAmount.value = fromBalance.value;
  calculateOutput();
}

function calculateOutput() {
  if (!fromAmount.value || parseFloat(fromAmount.value) === 0) {
    toAmount.value = '';
    return;
  }
  
  const pair = `${fromTokenSymbol.value}-${toTokenSymbol.value}`;
  const rate = rates[pair as keyof typeof rates] || 1;
  const amount = parseFloat(fromAmount.value);
  const fee = amount * 0.003; // 0.3% fee
  const output = (amount - fee) * rate;
  toAmount.value = output.toFixed(4);
}

function swapDirection() {
  const tempSymbol = fromTokenSymbol.value;
  fromTokenSymbol.value = toTokenSymbol.value;
  toTokenSymbol.value = tempSymbol;
  
  const tempAmount = fromAmount.value;
  fromAmount.value = toAmount.value;
  calculateOutput();
}

function toggleFromToken() {
  // Cycle through available tokens
  const tokenList = Object.keys(tokens);
  const currentIndex = tokenList.indexOf(fromTokenSymbol.value);
  let nextIndex = (currentIndex + 1) % tokenList.length;
  
  // Skip if it would be same as toToken
  if (tokenList[nextIndex] === toTokenSymbol.value) {
    nextIndex = (nextIndex + 1) % tokenList.length;
  }
  
  fromTokenSymbol.value = tokenList[nextIndex];
  calculateOutput();
}

function toggleToToken() {
  const tokenList = Object.keys(tokens);
  const currentIndex = tokenList.indexOf(toTokenSymbol.value);
  let nextIndex = (currentIndex + 1) % tokenList.length;
  
  if (tokenList[nextIndex] === fromTokenSymbol.value) {
    nextIndex = (nextIndex + 1) % tokenList.length;
  }
  
  toTokenSymbol.value = tokenList[nextIndex];
  calculateOutput();
}

async function executeSwap() {
  if (!canSwap.value) return;
  
  swapping.value = true;
  
  try {
    // Simulate swap delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update mock balances
    const fromAmt = parseFloat(fromAmount.value);
    const toAmt = parseFloat(toAmount.value);
    
    balances.value[fromTokenSymbol.value as keyof typeof balances.value] = 
      (parseFloat(fromBalance.value) - fromAmt).toFixed(4);
    balances.value[toTokenSymbol.value as keyof typeof balances.value] = 
      (parseFloat(toBalance.value) + toAmt).toFixed(4);
    
    // Show success
    console.log(`Swapped ${fromAmt} ${fromTokenSymbol.value} for ${toAmt} ${toTokenSymbol.value}`);
    
    // Reset form
    fromAmount.value = '';
    toAmount.value = '';
    
  } catch (err) {
    console.error('Swap failed:', err);
  } finally {
    swapping.value = false;
  }
}

// Watch for changes
watch(fromAmount, calculateOutput);

onMounted(() => {
  if (isWalletConnected.value) {
    // In real app, fetch balances from blockchain
  }
});
</script>

<style scoped>
.dex-widget {
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

/* Swap Interface */
.swap-interface {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.token-row {
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  padding: 16px;
}

.token-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: var(--erp-text-muted);
}

.token-label .balance {
  cursor: pointer;
  transition: color 0.2s;
}

.token-label .balance:hover {
  color: var(--erp-accent-indigo);
}

.token-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 110px;
}

.token-selector:hover {
  border-color: var(--erp-accent-indigo);
}

.token-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.token-selector span {
  font-weight: 600;
  color: var(--erp-text);
}

.amount-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: right;
  color: var(--erp-text);
  width: 100%;
}

.amount-input::placeholder {
  color: var(--erp-text-muted);
}

.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Swap Direction */
.swap-direction {
  display: flex;
  justify-content: center;
  margin: -12px 0;
  position: relative;
  z-index: 1;
}

.swap-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--erp-accent-indigo);
  border: 3px solid var(--erp-card-bg);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.swap-btn:hover {
  transform: rotate(180deg);
  background: #5b5de5;
}

/* Rate Info */
.rate-info {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--erp-surface);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--erp-text-muted);
}

.rate-info .fee {
  color: var(--erp-accent-green);
}

/* Swap Button */
.swap-action-btn {
  margin-top: 8px;
  height: 48px;
  font-weight: 600;
  text-transform: none;
  font-size: 1rem;
}

/* Testnet Notice */
.testnet-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  font-size: 0.75rem;
  color: #f59e0b;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .dex-widget {
    padding: 16px;
  }

  .token-row {
    padding: 14px;
  }

  .token-input-group {
    flex-direction: column;
    gap: 10px;
  }

  .token-selector {
    width: 100%;
    justify-content: center;
  }

  .amount-input {
    text-align: center;
    font-size: 1.2rem;
    padding: 8px;
  }

  .swap-direction {
    margin: -10px 0;
  }

  .swap-btn {
    width: 40px;
    height: 40px;
  }

  .rate-info {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }

  .swap-action-btn {
    height: 48px;
    font-size: 1rem;
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
  .dex-widget {
    padding: 12px;
  }

  .token-row {
    padding: 12px;
  }

  .amount-input {
    font-size: 1.1rem;
    padding: 6px;
  }

  .token-selector {
    padding: 6px 10px;
    font-size: 0.9rem;
  }

  .swap-action-btn {
    height: 46px;
    font-size: 0.95rem;
  }

  .testnet-notice {
    font-size: 0.7rem;
    padding: 6px;
  }
}
</style>
