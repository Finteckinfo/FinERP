import { ref, watch } from 'vue';
import { secureStorage } from '@/utils/secureStorage';
import { logger } from '@/services/logger';

// Initialize wallet connection from encrypted localStorage
async function getInitialWalletState() {
  try {
    const saved = await secureStorage.getItem('wallet_connection');
    if (saved) {
      logger.debug('Restored wallet connection from secure storage');
      return saved;
    }
  } catch (e) {
    logger.warn('Failed to restore wallet connection from secure storage');
    secureStorage.removeItem('wallet_connection');
  }
  return null;
}

// Tracks currently active wallet with persistence
export const activeAccount = ref<{ address: string } | null>(null);

// Initialize wallet state asynchronously
getInitialWalletState().then(state => {
  if (state) {
    activeAccount.value = state;
  }
});

// Log changes automatically and persist to encrypted localStorage
watch(activeAccount, async (val) => {
  if (val) {
    logger.info('Wallet connected');
    logger.security('Wallet connected', { address: val.address });
    try {
      await secureStorage.setItem('wallet_connection', val);
    } catch (error) {
      logger.error('Failed to save wallet connection', error);
    }
  } else {
    logger.info('Wallet disconnected');
    secureStorage.removeItem('wallet_connection');
  }
}, { immediate: false });

// Manual wallet management
export function addManualWallet(address: string) {
  logger.debug('addManualWallet called', { address });
  activeAccount.value = { address };
}

export function removeManualWallet() {
  logger.debug('removeManualWallet called');
  activeAccount.value = null;
}
