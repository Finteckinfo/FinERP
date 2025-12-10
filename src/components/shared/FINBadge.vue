<template>
  <v-tooltip location="bottom">
    <template v-slot:activator="{ props: tooltipProps }">
      <v-chip
        v-bind="tooltipProps"
        :color="color"
        :size="size"
        :variant="variant"
        class="fin-badge"
        @click="openTokenExplorer"
      >
        <v-icon v-if="showIcon" start :size="iconSize">mdi-coin</v-icon>
        <span class="badge-text">{{ formattedAmount }} FIN</span>
        <v-icon v-if="showLink" end size="12" class="ml-1">mdi-open-in-new</v-icon>
      </v-chip>
    </template>
    
    <div class="asset-tooltip">
      <div class="tooltip-header">
        <strong>FIN Token</strong>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="label">Contract:</span>
          <span class="value">{{ contractAddress.slice(0, 8) }}...{{ contractAddress.slice(-6) }}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">Decimals:</span>
          <span class="value">18</span>
        </div>
        <div class="tooltip-row">
          <span class="label">Network:</span>
          <span class="value">{{ networkName }}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">Amount:</span>
          <span class="value">{{ formattedAmount }} FIN</span>
        </div>
      </div>
      <div class="tooltip-footer">
        <small>Click to view token on explorer</small>
      </div>
    </div>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import { getFinTokenAddress } from '@/lib/finTokenConfig';

interface Props {
  amount: string; // Amount in FIN (formatted string)
  color?: string;
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large';
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain';
  showIcon?: boolean;
  showLink?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'success',
  size: 'small',
  variant: 'tonal',
  showIcon: true,
  showLink: false
});

const { chainId } = useMetaMaskWallet();

// Get current network info
const networkName = computed(() => {
  const chain = chainId.value;
  if (chain === 1) return 'Ethereum';
  if (chain === 137) return 'Polygon';
  if (chain === 11155111) return 'Sepolia';
  return `Chain ${chain}`;
});

const contractAddress = computed(() => {
  return getFinTokenAddress(chainId.value || 1) || '';
});

// Format amount
const formattedAmount = computed(() => {
  const num = parseFloat(props.amount);
  if (isNaN(num)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
});

// Icon size based on badge size
const iconSize = computed(() => {
  switch (props.size) {
    case 'x-small': return 12;
    case 'small': return 14;
    case 'large': return 18;
    case 'x-large': return 20;
    default: return 16;
  }
});

// Open token page on EVM explorer
const openTokenExplorer = () => {
  const chain = chainId.value;
  let baseUrl = '';
  
  if (chain === 1) {
    baseUrl = 'https://etherscan.io/token/';
  } else if (chain === 137) {
    baseUrl = 'https://polygonscan.com/token/';
  } else if (chain === 11155111) {
    baseUrl = 'https://sepolia.etherscan.io/token/';
  } else {
    return; // Unknown chain
  }
  
  const url = baseUrl + contractAddress.value;
  window.open(url, '_blank');
};
</script>

<style scoped>
.fin-badge {
  cursor: pointer;
  transition: all 0.2s ease;
}

.fin-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.badge-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.asset-tooltip {
  padding: 8px;
  max-width: 280px;
}

.tooltip-header {
  font-size: 0.875rem;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-body {
  margin-bottom: 8px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

.tooltip-row .label {
  opacity: 0.8;
}

.tooltip-row .value {
  font-weight: 600;
}

.tooltip-footer {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  font-style: italic;
}
</style>

