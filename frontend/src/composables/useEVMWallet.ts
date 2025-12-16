import { ref, computed, onMounted, watch } from 'vue';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Type for EthereumProvider instance
type EthereumProviderInstance = InstanceType<typeof EthereumProvider>;

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'injected';

export interface WalletUser {
  id: string;
  address: string;
  chainId: number;
  balance: string;
  ensName?: string;
  connected: boolean;
  walletType: WalletType;
}

export interface WalletState {
  user: WalletUser | null;
  provider: any;
  signer: any;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  chainId: number;
  walletType: WalletType | null;
}

// Reactive state
const walletState = ref<WalletState>({
  user: null,
  provider: null,
  signer: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  chainId: 1,
  walletType: null
});

// Supported networks
export const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum Mainnet', symbol: 'ETH', rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL },
  137: { name: 'Polygon Mainnet', symbol: 'MATIC', rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL },
  11155111: { name: 'Sepolia Testnet', symbol: 'ETH', rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL }
};

// WalletConnect provider instance
let walletConnectProvider: EthereumProviderInstance | null = null;

export function useEVMWallet() {
  // Computed properties
  const user = computed(() => walletState.value.user);
  const isConnected = computed(() => walletState.value.isConnected);
  const isConnecting = computed(() => walletState.value.isConnecting);
  const error = computed(() => walletState.value.error);
  const chainId = computed(() => walletState.value.chainId);
  const provider = computed(() => walletState.value.provider);
  const signer = computed(() => walletState.value.signer);
  const walletType = computed(() => walletState.value.walletType);

  // Detect available wallets
  const detectAvailableWallets = async () => {
    const available: WalletType[] = [];
    
    // Check MetaMask
    const ethereum = await detectEthereumProvider();
    if (ethereum && (ethereum as any).isMetaMask) {
      available.push('metamask');
    }
    
    // Check Coinbase Wallet
    if (ethereum && (ethereum as any).isCoinbaseWallet) {
      available.push('coinbase');
    }
    
    // Check other injected wallets
    if (ethereum && !(ethereum as any).isMetaMask && !(ethereum as any).isCoinbaseWallet) {
      available.push('injected');
    }
    
    // WalletConnect is always available (mobile wallets)
    available.push('walletconnect');
    
    return available;
  };

  // Connect via MetaMask
  const connectMetaMask = async (): Promise<boolean> => {
    try {
      walletState.value.isConnecting = true;
      walletState.value.error = null;

      const ethereum = await detectEthereumProvider();
      if (!ethereum || !(ethereum as any).isMetaMask) {
        throw new Error('MetaMask not detected. Please install MetaMask extension.');
      }

      const accounts = await (ethereum as any).request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      return await setupProvider(accounts[0], ethereum, 'metamask');
    } catch (err: any) {
      walletState.value.error = err.message || 'Failed to connect MetaMask';
      console.error('MetaMask connection error:', err);
      return false;
    } finally {
      walletState.value.isConnecting = false;
    }
  };

  // Connect via WalletConnect
  const connectWalletConnect = async (): Promise<boolean> => {
    try {
      walletState.value.isConnecting = true;
      walletState.value.error = null;

      const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
      if (!projectId) {
        throw new Error('WalletConnect Project ID not configured');
      }

      // Initialize WalletConnect provider
      walletConnectProvider = await EthereumProvider.init({
        projectId,
        chains: [1, 137, 11155111],
        optionalChains: [1, 137, 11155111],
        showQrModal: true,
        metadata: {
          name: 'FinPro',
          description: 'Enterprise Resource Planning on EVM',
          url: window.location.origin,
          icons: [`${window.location.origin}/favicon.ico`]
        }
      });

      // Enable session
      await walletConnectProvider.enable();

      const accounts = walletConnectProvider.accounts;
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found.');
      }

      // Create ethers provider from WalletConnect
      const ethersProvider = new ethers.BrowserProvider(walletConnectProvider as any);
      const ethersSigner = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      const balance = await ethersProvider.getBalance(accounts[0]);

      const walletUser: WalletUser = {
        id: accounts[0].toLowerCase(),
        address: accounts[0].toLowerCase(),
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        connected: true,
        walletType: 'walletconnect'
      };

      walletState.value.user = walletUser;
      walletState.value.provider = ethersProvider;
      walletState.value.signer = ethersSigner;
      walletState.value.isConnected = true;
      walletState.value.chainId = Number(network.chainId);
      walletState.value.walletType = 'walletconnect';

      sessionStorage.setItem('FinPro_wallet_connected', 'true');
      sessionStorage.setItem('FinPro_wallet_address', accounts[0]);
      sessionStorage.setItem('FinPro_wallet_chainId', network.chainId.toString());
      sessionStorage.setItem('FinPro_wallet_type', 'walletconnect');

      return true;
    } catch (err: any) {
      walletState.value.error = err.message || 'Failed to connect WalletConnect';
      console.error('WalletConnect connection error:', err);
      return false;
    } finally {
      walletState.value.isConnecting = false;
    }
  };

  // Connect via Coinbase Wallet
  const connectCoinbase = async (): Promise<boolean> => {
    try {
      walletState.value.isConnecting = true;
      walletState.value.error = null;

      const ethereum = await detectEthereumProvider();
      if (!ethereum || !(ethereum as any).isCoinbaseWallet) {
        throw new Error('Coinbase Wallet not detected. Please install Coinbase Wallet extension.');
      }

      const accounts = await (ethereum as any).request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      return await setupProvider(accounts[0], ethereum, 'coinbase');
    } catch (err: any) {
      walletState.value.error = err.message || 'Failed to connect Coinbase Wallet';
      console.error('Coinbase Wallet connection error:', err);
      return false;
    } finally {
      walletState.value.isConnecting = false;
    }
  };

  // Connect via any injected wallet
  const connectInjected = async (): Promise<boolean> => {
    try {
      walletState.value.isConnecting = true;
      walletState.value.error = null;

      const ethereum = await detectEthereumProvider();
      if (!ethereum) {
        throw new Error('No injected wallet detected.');
      }

      const accounts = await (ethereum as any).request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      return await setupProvider(accounts[0], ethereum, 'injected');
    } catch (err: any) {
      walletState.value.error = err.message || 'Failed to connect wallet';
      console.error('Injected wallet connection error:', err);
      return false;
    } finally {
      walletState.value.isConnecting = false;
    }
  };

  // Setup provider helper
  const setupProvider = async (address: string, ethereum: any, type: WalletType): Promise<boolean> => {
    try {
      const ethersProvider = new ethers.BrowserProvider(ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      const balance = await ethersProvider.getBalance(address);

      const walletUser: WalletUser = {
        id: address.toLowerCase(),
        address: address.toLowerCase(),
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        connected: true,
        walletType: type
      };

      walletState.value.user = walletUser;
      walletState.value.provider = ethersProvider;
      walletState.value.signer = ethersSigner;
      walletState.value.isConnected = true;
      walletState.value.chainId = Number(network.chainId);
      walletState.value.walletType = type;

      sessionStorage.setItem('FinPro_wallet_connected', 'true');
      sessionStorage.setItem('FinPro_wallet_address', address);
      sessionStorage.setItem('FinPro_wallet_chainId', network.chainId.toString());
      sessionStorage.setItem('FinPro_wallet_type', type);

      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to setup provider');
    }
  };

  // Generic connect - tries all available wallets
  const connect = async (preferredType?: WalletType): Promise<boolean> => {
    if (preferredType) {
      switch (preferredType) {
        case 'metamask':
          return await connectMetaMask();
        case 'walletconnect':
          return await connectWalletConnect();
        case 'coinbase':
          return await connectCoinbase();
        case 'injected':
          return await connectInjected();
      }
    }

    // Auto-detect and connect
    const available = await detectAvailableWallets();
    
    // Try MetaMask first
    if (available.includes('metamask')) {
      const connected = await connectMetaMask();
      if (connected) return true;
    }
    
    // Try Coinbase
    if (available.includes('coinbase')) {
      const connected = await connectCoinbase();
      if (connected) return true;
    }
    
    // Try other injected
    if (available.includes('injected')) {
      const connected = await connectInjected();
      if (connected) return true;
    }
    
    // Fallback to WalletConnect
    return await connectWalletConnect();
  };

  // Disconnect wallet
  const disconnect = async (): Promise<void> => {
    // Disconnect WalletConnect if active
    if (walletConnectProvider && walletState.value.walletType === 'walletconnect') {
      try {
        await walletConnectProvider.disconnect();
      } catch (err) {
        console.warn('WalletConnect disconnect error:', err);
      }
      walletConnectProvider = null;
    }

    walletState.value.user = null;
    walletState.value.provider = null;
    walletState.value.signer = null;
    walletState.value.isConnected = false;
    walletState.value.error = null;
    walletState.value.walletType = null;

    sessionStorage.removeItem('FinPro_wallet_connected');
    sessionStorage.removeItem('FinPro_wallet_address');
    sessionStorage.removeItem('FinPro_wallet_chainId');
    sessionStorage.removeItem('FinPro_wallet_type');
  };

  // Switch network
  const switchNetwork = async (targetChainId: number): Promise<boolean> => {
    if (!walletState.value.provider) return false;

    try {
      if (walletState.value.walletType === 'walletconnect' && walletConnectProvider) {
        await walletConnectProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }]
        });
      } else {
        await walletState.value.provider.send('wallet_switchEthereumChain', [
          { chainId: `0x${targetChainId.toString(16)}` }
        ]);
      }
      
      // Update chain ID
      walletState.value.chainId = targetChainId;
      if (walletState.value.user) {
        walletState.value.user.chainId = targetChainId;
      }
      
      return true;
    } catch (err: any) {
      // If network doesn't exist, try to add it
      if (err.code === 4902) {
        return await addNetwork(targetChainId);
      }
      console.error('Failed to switch network:', err);
      return false;
    }
  };

  // Add network
  const addNetwork = async (chainId: number): Promise<boolean> => {
    const chain = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
    if (!chain) return false;

    const chainParams = {
      chainId: `0x${chainId.toString(16)}`,
      chainName: chain.name,
      nativeCurrency: {
        name: chain.symbol,
        symbol: chain.symbol,
        decimals: 18
      },
      rpcUrls: [chain.rpcUrl || ''],
      blockExplorerUrls: chainId === 1 
        ? ['https://etherscan.io']
        : chainId === 137
        ? ['https://polygonscan.com']
        : ['https://sepolia.etherscan.io']
    };

    try {
      if (walletState.value.walletType === 'walletconnect' && walletConnectProvider) {
        await walletConnectProvider.request({
          method: 'wallet_addEthereumChain',
          params: [chainParams]
        });
      } else if (walletState.value.provider) {
        await walletState.value.provider.send('wallet_addEthereumChain', [chainParams]);
      }
      return true;
    } catch (err) {
      console.error('Failed to add network:', err);
      return false;
    }
  };

  // Sign message
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

    const wasConnected = sessionStorage.getItem('FinPro_wallet_connected') === 'true';
    const storedAddress = sessionStorage.getItem('FinPro_wallet_address');
    const storedType = sessionStorage.getItem('FinPro_wallet_type') as WalletType | null;

    if (wasConnected && storedAddress) {
      try {
        if (storedType === 'walletconnect') {
          // Reconnect WalletConnect
          const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
          if (projectId) {
            walletConnectProvider = await EthereumProvider.init({
              projectId,
              chains: [1, 137, 11155111],
              showQrModal: false, // Don't show modal on reconnect
              metadata: {
                name: 'FinPro',
                description: 'Enterprise Resource Planning on EVM',
                url: window.location.origin,
                icons: [`${window.location.origin}/favicon.ico`]
              }
            });
            if (walletConnectProvider.session) {
              const accounts = walletConnectProvider.accounts;
              if (accounts && accounts[0]?.toLowerCase() === storedAddress.toLowerCase()) {
                const ethersProvider = new ethers.BrowserProvider(walletConnectProvider as any);
                const ethersSigner = await ethersProvider.getSigner();
                const network = await ethersProvider.getNetwork();
                const balance = await ethersProvider.getBalance(accounts[0]);

                walletState.value.user = {
                  id: accounts[0].toLowerCase(),
                  address: accounts[0].toLowerCase(),
                  chainId: Number(network.chainId),
                  balance: ethers.formatEther(balance),
                  connected: true,
                  walletType: 'walletconnect'
                };
                walletState.value.provider = ethersProvider;
                walletState.value.signer = ethersSigner;
                walletState.value.isConnected = true;
                walletState.value.chainId = Number(network.chainId);
                walletState.value.walletType = 'walletconnect';
              }
            }
          }
        } else {
          // Reconnect other wallets
          const ethereum = await detectEthereumProvider();
          if (ethereum) {
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
                connected: true,
                walletType: storedType || 'injected'
              };
              walletState.value.provider = ethersProvider;
              walletState.value.signer = ethersSigner;
              walletState.value.isConnected = true;
              walletState.value.chainId = Number(network.chainId);
              walletState.value.walletType = storedType || 'injected';
            }
          }
        }
      } catch (err) {
        console.warn('Failed to reconnect wallet:', err);
        await disconnect();
      }
    }
  };

  // Watch for account/chain changes
  onMounted(async () => {
    if (typeof window !== 'undefined') {
      const ethereum = await detectEthereumProvider();
      if (ethereum) {
        ethereum.on('accountsChanged', async (accounts: string[]) => {
          if (accounts.length === 0) {
            await disconnect();
          } else {
            await initialize();
          }
        });

        ethereum.on('chainChanged', async (chainId: string) => {
          walletState.value.chainId = parseInt(chainId, 16);
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
    walletType,

    // Methods
    connect,
    connectMetaMask,
    connectWalletConnect,
    connectCoinbase,
    connectInjected,
    disconnect,
    switchNetwork,
    addNetwork,
    signMessage,
    sendTransaction,
    detectAvailableWallets,

    // Constants
    SUPPORTED_CHAINS
  };
}

