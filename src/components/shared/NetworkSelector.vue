<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-chip
        v-bind="props"
        :color="networkColor"
        variant="outlined"
        size="small"
        class="network-chip"
      >
        <v-icon start size="16">mdi-access-point-network</v-icon>
        {{ networkLabel }}
      </v-chip>
    </template>
    
    <v-list class="network-list">
      <v-list-item
        v-for="network in networks"
        :key="network.id"
        :active="currentNetwork === network.id"
        @click="selectNetwork(network.id)"
      >
        <template v-slot:prepend>
          <v-icon :color="network.color">{{ network.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ network.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ network.description }}</v-list-item-subtitle>
        <template v-slot:append v-if="currentNetwork === network.id">
          <v-icon color="success">mdi-check-circle</v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';

const { chainId, switchNetwork, SUPPORTED_CHAINS } = useMetaMaskWallet();

// Current network based on EVM chainId
const currentNetwork = computed(() => {
  if (chainId.value === 1) return 'ethereum';
  if (chainId.value === 137) return 'polygon';
  if (chainId.value === 11155111) return 'sepolia';
  return 'ethereum';
});

// Available EVM networks
const networks = [
  {
    id: 'ethereum',
    chainId: 1,
    name: 'Ethereum',
    description: 'Ethereum Mainnet',
    icon: 'mdi-shield-check',
    color: 'success'
  },
  {
    id: 'polygon',
    chainId: 137,
    name: 'Polygon',
    description: 'Polygon Mainnet',
    icon: 'mdi-shield-check',
    color: 'success'
  },
  {
    id: 'sepolia',
    chainId: 11155111,
    name: 'Sepolia',
    description: 'Sepolia Testnet',
    icon: 'mdi-flask',
    color: 'warning'
  }
];

// Computed properties
const networkLabel = computed(() => {
  return networks.find(n => n.id === currentNetwork.value)?.name || 'Ethereum';
});

const networkColor = computed(() => {
  return networks.find(n => n.id === currentNetwork.value)?.color || 'success';
});

// Select network (EVM chain switching)
async function selectNetwork(networkId: string) {
  const network = networks.find(n => n.id === networkId);
  if (network && network.chainId) {
    const success = await switchNetwork(network.chainId);
    if (success) {
      // Emit event for other components to react
      window.dispatchEvent(new CustomEvent('network-changed', { 
        detail: { network: networkId, chainId: network.chainId } 
      }));
      
      console.log(`Switched to ${networkLabel.value}`);
    }
  }
}
</script>

<style scoped>
.network-chip {
  cursor: pointer;
  transition: all 0.3s ease;
}

.network-chip:hover {
  transform: scale(1.05);
}

.network-list {
  min-width: 280px;
}
</style>

