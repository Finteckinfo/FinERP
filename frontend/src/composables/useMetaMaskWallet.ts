import { ref, computed, onMounted, watch } from 'vue';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export interface WalletUser {
  id: string;
  address: string;
  chainId: number;
  balance: string;
  ensName?: string;
  connected: boolean;
}

export interface WalletState {
  user: WalletUser | null;
  provider: any;
  signer: any;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  chainId: number;
}

// Reactive state
const walletState = ref<WalletState>({
  user: null,
  provider: null,
  signer: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  chainId: 1
});

// Supported networks
const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum Mainnet', symbol: 'ETH' },
  137: { name: 'Polygon Mainnet', symbol: 'MATIC' },
  11155111: { name: 'Sepolia Testnet', symbol: 'ETH' }
};

export function useMetaMaskWallet() {
  // Computed properties
  const user = computed(() => walletState.value.user);
  const isConnected = computed(() => walletState.value.isConnected);
  const isConnecting = computed(() => walletState.value.isConnecting);
  const error = computed(() => walletState.value.error);
  const chainId = computed(() => walletState.value.chainId);
  const provider = computed(() => walletState.value.provider);
  const signer = computed(() => walletState.value.signer);

  // Check if MetaMask is available
  const isMetaMaskAvailable = async (): Promise<boolean> => {
    const ethereum = await detectEthereumProvider();
    return !!(ethereum && ethereum.isMetaMask);
  };

  // Connect to MetaMask
  const connect = async (): Promise<boolean> => {
    try {
      walletState.value.isConnecting = true;
      walletState.value.error = null;

      const ethereum = await detectEthereumProvider();
      if (!ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask extension.');
      }

      // Request account access
      const accounts = await (ethereum as any).request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const address = accounts[0];
      const ethersProvider = new ethers.BrowserProvider(ethereum as any);
      const ethersSigner = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      const balance = await ethersProvider.getBalance(address);

      // Create user object
      const walletUser: WalletUser = {
        id: address.toLowerCase(),
        address: address.toLowerCase(),
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        connected: true
      };

      // Update state
      walletState.value.user = walletUser;
      walletState.value.provider = ethersProvider;
      walletState.value.signer = ethersSigner;
      walletState.value.isConnected = true;
      walletState.value.chainId = Number(network.chainId);

      // Store in sessionStorage for persistence
      sessionStorage.setItem('FinPro_wallet_connected', 'true');
      sessionStorage.setItem('FinPro_wallet_address', address);
      sessionStorage.setItem('FinPro_wallet_chainId', network.chainId.toString());

      return true;
    } catch (err: any) {
      walletState.value.error = err.message || 'Failed to connect wallet';
      console.error('Wallet connection error:', err);
      return false;
    } finally {
      walletState.value.isConnecting = false;
    }
  };

  // Disconnect wallet
  const disconnect = async (): Promise<void> => {
    walletState.value.user = null;
    walletState.value.provider = null;
    walletState.value.signer = null;
    walletState.value.isConnected = false;
    walletState.value.error = null;

    // Clear session storage
    sessionStorage.removeItem('FinPro_wallet_connected');
    sessionStorage.removeItem('FinPro_wallet_address');
    sessionStorage.removeItem('FinPro_wallet_chainId');
  };

  // Switch network
  const switchNetwork = async (targetChainId: number): Promise<boolean> => {
    if (!walletState.value.provider) return false;

    try {
      await walletState.value.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${targetChainId.toString(16)}` }
      ]);
      return true;
    } catch (err: any) {
      // If network doesn't exist, we would add it here
      console.error('Failed to switch network:', err);
      return false;
    }
  };

  // Sign message for authentication
  const signMessage = async (message: string): Promise<string | null> => {
    if (!walletState.value.signer) return null;

    try {
      const signature = await walletState.value.signer.signMessage(message);
      return signature;
    } catch (err) {
      console.error('Failed to sign message:', err);
      return null;
    }
  };

  // Send transaction
  const sendTransaction = async (tx: any): Promise<any> => {
    if (!walletState.value.signer) throw new Error('Wallet not connected');

    try {
      const transaction = await walletState.value.signer.sendTransaction(tx);
      return await transaction.wait();
    } catch (err) {
      console.error('Transaction failed:', err);
      throw err;
    }
  };

  // Initialize on mount
  const initialize = async () => {
    if (typeof window === 'undefined') return;

    // Check if previously connected
    const wasConnected = sessionStorage.getItem('FinPro_wallet_connected') === 'true';
    const storedAddress = sessionStorage.getItem('FinPro_wallet_address');

    if (wasConnected && storedAddress) {
      // Try to reconnect
      const ethereum = await detectEthereumProvider();
      if (ethereum) {
        try {
          const ethersProvider = new ethers.BrowserProvider(ethereum as any);
          const accounts = await (ethereum as any).request({ method: 'eth_accounts' });

          if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === storedAddress.toLowerCase()) {
            const ethersSigner = await ethersProvider.getSigner();
            const network = await ethersProvider.getNetwork();
            const balance = await ethersProvider.getBalance(accounts[0]);

            walletState.value.user = {
              id: accounts[0].toLowerCase(),
              address: accounts[0].toLowerCase(),
              chainId: Number(network.chainId),
              balance: ethers.formatEther(balance),
              connected: true
            };
            walletState.value.provider = ethersProvider;
            walletState.value.signer = ethersSigner;
            walletState.value.isConnected = true;
            walletState.value.chainId = Number(network.chainId);
          }
        } catch (err) {
          console.warn('Failed to reconnect wallet:', err);
          // Clear stored data if reconnection fails
          sessionStorage.removeItem('FinPro_wallet_connected');
          sessionStorage.removeItem('FinPro_wallet_address');
          sessionStorage.removeItem('FinPro_wallet_chainId');
        }
      }
    }
  };

  // Watch for account changes
  onMounted(async () => {
    if (typeof window !== 'undefined') {
      const ethereum = await detectEthereumProvider();
      if (ethereum) {
        ethereum.on('accountsChanged', async (accounts: string[]) => {
          if (accounts.length === 0) {
            await disconnect();
          } else {
            // Reinitialize with new account
            await initialize();
          }
        });

        ethereum.on('chainChanged', async (chainId: string) => {
          walletState.value.chainId = parseInt(chainId, 16);
          // Reinitialize to update balance and other chain-specific data
          await initialize();
        });
      }
    }

    await initialize();
  });

  return {
    // State
    user,
    isConnected,
    isConnecting,
    error,
    chainId,
    provider,
    signer,

    // Methods
    connect,
    disconnect,
    switchNetwork,
    signMessage,
    sendTransaction,
    isMetaMaskAvailable,

    // Constants
    SUPPORTED_CHAINS
  };
}
