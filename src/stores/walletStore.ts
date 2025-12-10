// src/stores/walletStore.ts
import { ref, computed, watch } from 'vue';
import { activeAccount } from '@/lib/walletManager';

// Helper to get active account from useWallet hook if available
function getUseWalletAccount() {
  try {
    // Check if useWallet is available (in components that use it)
    if (typeof window !== 'undefined' && (window as any).__useWalletActiveAccount) {
      return (window as any).__useWalletActiveAccount;
    }
  } catch (e) {
    // Silently fail if useWallet is not available
  }
  return null;
}

// Tracks the connected wallet address (synced with walletManager, with fallback to useWallet)
export const connectedWallet = computed(() => {
  // First check walletManager
  const walletManagerAddress = activeAccount.value?.address || '';
  
  // Fallback to useWallet if walletManager doesn't have it
  const useWalletAccount = getUseWalletAccount();
  const useWalletAddress = useWalletAccount?.address || '';
  
  const address = walletManagerAddress || useWalletAddress;
  console.log('[walletStore] connectedWallet computed:', { 
    address, 
    walletManager: activeAccount.value,
    useWallet: useWalletAccount
  });
  return address;
});

// Controls the Connect Wallet modal
export const isWalletModalOpen = ref(false);

// Computed property for wallet connection status
export const isWalletConnected = computed(() => {
  const connected = connectedWallet.value !== '';
  console.log('[walletStore] isWalletConnected computed:', { 
    connected, 
    address: connectedWallet.value 
  });
  return connected;
});

export function openWalletModal() {
  console.log('openWalletModal called');
  isWalletModalOpen.value = true;
}

export function closeWalletModal() {
  console.log('closeWalletModal called');
  isWalletModalOpen.value = false;
}

export function setConnectedWallet(address: string) {
  console.log('setConnectedWallet called with address:', address);
  // This function is now deprecated - use walletManager.addManualWallet instead
  // The computed property will automatically update when activeAccount changes
}

// Function to get current wallet status for debugging
export function getWalletStatus() {
  return {
    connectedWallet: connectedWallet.value,
    isWalletConnected: isWalletConnected.value,
    activeAccount: activeAccount.value,
    localStorage: localStorage.getItem('wallet_connection')
  };
}

// Watch for wallet connection changes and log them
watch(connectedWallet, (newAddress, oldAddress) => {
  if (newAddress !== oldAddress) {
    console.log('[walletStore] Wallet connection changed:', {
      from: oldAddress || 'disconnected',
      to: newAddress || 'disconnected'
    });
  }
});

// Watch activeAccount changes for debugging
watch(activeAccount, (newAccount, oldAccount) => {
  console.log('[walletStore] activeAccount changed:', {
    from: oldAccount?.address || 'null',
    to: newAccount?.address || 'null'
  });
});