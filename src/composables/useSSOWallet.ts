/**
 * Composable to automatically connect wallet from SSO session
 * This bridges the SSO authentication with the wallet system
 */

import { onMounted, watch } from 'vue';
import { addManualWallet, clearWalletConnection, activeAccount } from '@/lib/walletManager';
import { logger } from '@/services/logger';

interface SSOUser {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  authMethod?: string;
}

/**
 * Get user data from SSO session storage
 */
function getSSOUser(): SSOUser | null {
  try {
    const userJson = sessionStorage.getItem('erp_user');
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    logger.debug('[useSSOWallet] Retrieved SSO user', { 
      email: user.email,
      hasWallet: !!user.walletAddress 
    });
    
    return user;
  } catch (error) {
    logger.error('[useSSOWallet] Failed to parse SSO user', error);
    return null;
  }
}

/**
 * Auto-connect wallet from SSO session if available
 */
export function useSSOWallet() {
  
  const connectWalletFromSSO = () => {
    const user = getSSOUser();
    
    if (!user) {
      logger.debug('[useSSOWallet] No SSO user found');
      return false;
    }
    
    // Check if user has a wallet address in their SSO session
    if (user.walletAddress) {
      logger.info('[useSSOWallet] Auto-connecting wallet from SSO', { 
        address: user.walletAddress.substring(0, 8) + '...' 
      });
      
      // Connect the wallet using the manual wallet function
      addManualWallet(user.walletAddress);
      
      return true;
    } else {
      logger.debug('[useSSOWallet] SSO user has no wallet address');
      return false;
    }
  };
  
  // Auto-connect on mount
  onMounted(() => {
    logger.debug('[useSSOWallet] Component mounted, checking for SSO wallet');
    
    // Only auto-connect if wallet is not already connected
    if (!activeAccount.value) {
      const connected = connectWalletFromSSO();
      if (connected) {
        logger.info('[useSSOWallet] Successfully auto-connected wallet from SSO');
      }
    } else {
      logger.debug('[useSSOWallet] Wallet already connected, skipping SSO auto-connect');
    }
  });
  
  // Watch for SSO session changes
  watch(() => sessionStorage.getItem('erp_user'), (newUser) => {
    if (newUser && !activeAccount.value) {
      logger.debug('[useSSOWallet] SSO session detected, attempting auto-connect');
      connectWalletFromSSO();
    } else if (!newUser && activeAccount.value) {
      logger.debug('[useSSOWallet] SSO session cleared, disconnecting wallet');
      clearWalletConnection();
    }
  });
  
  return {
    connectWalletFromSSO,
    getSSOUser
  };
}
