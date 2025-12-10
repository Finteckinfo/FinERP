<template>
  <v-tooltip location="bottom">
    <template v-slot:activator="{ props: tooltipProps }">
      <v-chip
        v-bind="tooltipProps"
        :color="color"
        :size="size"
        :variant="variant"
        class="sizcoin-badge"
        @click="openAssetExplorer"
      >
        <v-icon v-if="showIcon" start :size="iconSize">mdi-coin</v-icon>
        <span class="badge-text">{{ formattedAmount }} SIZ</span>
        <v-icon v-if="showLink" end size="12" class="ml-1">mdi-open-in-new</v-icon>
      </v-chip>
    </template>
    
    <div class="asset-tooltip">
      <div class="tooltip-header">
        <strong>SIZCOIN (SIZ)</strong>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="label">Asset ID:</span>
          <span class="value">{{ SIZCOIN_CONFIG.ASSET_ID }}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">Decimals:</span>
          <span class="value">{{ SIZCOIN_CONFIG.DECIMALS }}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">Network:</span>
          <span class="value">{{ currentNetwork === 'mainnet' ? 'MainNet' : 'TestNet' }}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">Amount:</span>
          <span class="value">{{ formattedAmount }} SIZ</span>
        </div>
      </div>
      <div class="tooltip-footer">
        <small>Click to view asset on explorer</small>
      </div>
    </div>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SIZCOIN_CONFIG, formatSIZCOIN, getExplorerUrl } from '@/services/paymentService';

interface Props {
  amount: number; // Amount in SIZ (not micro units)
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

// Get current network
const currentNetwork = computed(() => {
  return (localStorage.getItem('algorand_network') || 'testnet') as 'mainnet' | 'testnet';
});

// Format amount with proper decimals
const formattedAmount = computed(() => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: SIZCOIN_CONFIG.DECIMALS,
    maximumFractionDigits: SIZCOIN_CONFIG.DECIMALS
  }).format(props.amount);
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

// Open asset page on Algorand explorer
const openAssetExplorer = () => {
  const baseUrl = currentNetwork.value === 'mainnet'
    ? 'https://explorer.perawallet.app/asset/'
    : 'https://testnet.explorer.perawallet.app/asset/';
  const url = baseUrl + SIZCOIN_CONFIG.ASSET_ID;
  window.open(url, '_blank');
};
</script>

<style scoped>
.sizcoin-badge {
  cursor: pointer;
  transition: all 0.2s ease;
}

.sizcoin-badge:hover {
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

