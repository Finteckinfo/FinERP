// EVM Network utility functions
import { useEVMWallet } from '@/composables/useEVMWallet';

export function getCurrentNetwork(): number {
  const { chainId } = useEVMWallet();
  return chainId.value || 1; // Default to Ethereum mainnet
}

export function isMainNet(): boolean {
  return getCurrentNetwork() === 1; // Ethereum mainnet
}

export function isTestnet(): boolean {
  const chainId = getCurrentNetwork();
  return chainId === 11155111; // Sepolia testnet
}

export function setNetwork(chainId: number): Promise<boolean> {
  const { switchNetwork } = useEVMWallet();
  return switchNetwork(chainId);
}

export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 137:
      return 'Polygon Mainnet';
    case 11155111:
      return 'Sepolia Testnet';
    default:
      return `Chain ${chainId}`;
  }
}
