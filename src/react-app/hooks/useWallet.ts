import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { supabase } from '@/react-app/lib/supabase';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      checkConnection();

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const syncUserWithSupabase = async (walletAddress: string) => {
    try {
      // Upsert user based on wallet address
      const { error } = await supabase
        .from('users')
        .upsert({
          id: walletAddress.toLowerCase(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing user with Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to sync user:', err);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      const addr = accounts[0];
      setAccount(addr);
      await syncUserWithSupabase(addr);
    }
  };

  const checkConnection = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const addr = accounts[0].address;
        setAccount(addr);
        setProvider(provider);

        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));

        await syncUserWithSupabase(addr);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask to use Web3 features');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      const addr = accounts[0];
      setAccount(addr);
      setProvider(provider);

      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));

      await syncUserWithSupabase(addr);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
      throw err;
    }
  };

  return {
    account,
    provider,
    chainId,
    loading,
    error,
    connect,
    disconnect,
    switchNetwork,
    isConnected: !!account,
  };
}

export function useContract(contractAddress: string, abi: any[]) {
  const { provider, account } = useWallet();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (provider && account && contractAddress) {
      const signer = provider.getSigner();
      signer.then(s => {
        const contractInstance = new Contract(contractAddress, abi, s);
        setContract(contractInstance);
      });
    } else {
      setContract(null);
    }
  }, [provider, account, contractAddress, abi]);

  return contract;
}

export { formatEther, parseEther };
