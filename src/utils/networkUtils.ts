// Network utility functions
import { NetworkId } from '@txnlab/use-wallet-vue';

export function getCurrentNetwork(): NetworkId {
  const network = localStorage.getItem('algorand_network') || 'testnet';
  return network as NetworkId;
}

export function isMainNet(): boolean {
  return getCurrentNetwork() === 'mainnet';
}

export function setNetwork(network: NetworkId): void {
  localStorage.setItem('algorand_network', network);
  
  // Emit event for other components to react
  window.dispatchEvent(new CustomEvent('network-changed', { 
    detail: { network } 
  }));
}

