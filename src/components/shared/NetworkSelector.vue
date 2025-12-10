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
import { NetworkId } from '@txnlab/use-wallet-vue';

// Current network (stored in localStorage)
const currentNetwork = ref<string>(
  localStorage.getItem('algorand_network') || 'testnet'
);

// Available networks
const networks = [
  {
    id: 'mainnet',
    name: 'MainNet',
    description: 'Production network with real SIZCOIN',
    icon: 'mdi-shield-check',
    color: 'success'
  },
  {
    id: 'testnet',
    name: 'TestNet',
    description: 'Testing network with test tokens',
    icon: 'mdi-flask',
    color: 'warning'
  },
  {
    id: 'betanet',
    name: 'BetaNet',
    description: 'Beta testing network',
    icon: 'mdi-beta',
    color: 'info'
  },
  {
    id: 'localnet',
    name: 'LocalNet',
    description: 'Local development network',
    icon: 'mdi-laptop',
    color: 'secondary'
  }
];

// Computed properties
const networkLabel = computed(() => {
  return networks.find(n => n.id === currentNetwork.value)?.name || 'TestNet';
});

const networkColor = computed(() => {
  return networks.find(n => n.id === currentNetwork.value)?.color || 'warning';
});

// Select network
function selectNetwork(networkId: string) {
  currentNetwork.value = networkId;
  localStorage.setItem('algorand_network', networkId);
  
  // Emit event for other components to react
  window.dispatchEvent(new CustomEvent('network-changed', { 
    detail: { network: networkId } 
  }));
  
  // Show notification
  console.log(`Switched to ${networkLabel.value}`);
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

