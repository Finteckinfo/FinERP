import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther, parseEther } from 'ethers';
import { supabase } from '@/react-app/lib/supabase';
import { switchToLocalNetwork } from '@/react-app/lib/localNetworkConfig';

interface WalletContextType {
    account: string | null;
    address: string | null; // Alias for account
    provider: BrowserProvider | null;
    chainId: number | null;
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    isMobile: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    switchNetwork: (targetChainId: number) => Promise<void>;
    connectToLocal: () => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile] = useState(() =>
        typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );

    const syncUserWithSupabase = useCallback(async (walletAddress: string) => {
        try {
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
    }, []);

    const handleAccountsChanged = useCallback(async (accounts: string[]) => {
        if (accounts.length === 0) {
            setAccount(null);
            setProvider(null);
        } else {
            const addr = accounts[0];
            setAccount(addr);
            await syncUserWithSupabase(addr);
        }
    }, [syncUserWithSupabase]);

    const checkConnection = useCallback(async () => {
        // Give mobile dApp browsers a moment to inject their provider
        if (isMobile) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (typeof window.ethereum === 'undefined') {
            setLoading(false);
            return;
        }

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
        } finally {
            setLoading(false);
        }
    }, [isMobile, syncUserWithSupabase]);

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            checkConnection();

            const handleChainChanged = () => window.location.reload();

            window.ethereum?.on('accountsChanged', handleAccountsChanged);
            window.ethereum?.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum?.removeListener('chainChanged', handleChainChanged);
            };
        } else {
            // Even if not initially detected, check after a small delay on mobile
            if (isMobile) {
                const timeout = setTimeout(checkConnection, 1000);
                return () => clearTimeout(timeout);
            }
            setLoading(false);
        }
    }, [isMobile, checkConnection, handleAccountsChanged]);

    const connect = async () => {
        if (typeof window.ethereum === 'undefined') {
            // Give mobile another chance if it just hasn't injected yet
            if (isMobile) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (typeof window.ethereum !== 'undefined') {
                    // It injected, proceed with normal connection
                } else {
                    setError('No wallet detected. Please open this dApp inside your wallet\'s browser (MetaMask, Trust Wallet, etc.)');
                    return;
                }
            } else {
                setError('No EVM wallet detected. Please install a browser extension like MetaMask or RABBY.');
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);

            const provider = new BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);

            if (accounts && accounts.length > 0) {
                const addr = accounts[0];
                setAccount(addr);
                setProvider(provider);

                const network = await provider.getNetwork();
                setChainId(Number(network.chainId));

                await syncUserWithSupabase(addr);
            }
        } catch (err: unknown) {
            if (err instanceof Error && 'code' in err && err.code === 4001) {
                setError('Connection rejected by user');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to connect wallet');
            }
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
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to switch network');
            throw err;
        }
    };

    const connectToLocal = async (): Promise<boolean> => {
        if (!window.ethereum) {
            setError('No wallet detected');
            return false;
        }

        try {
            const success = await switchToLocalNetwork();
            if (success) {
                await connect();
            }
            return success;
        } catch (error) {
            setError('Failed to connect to local network');
            return false;
        }
    };

    const value = React.useMemo(() => ({
        account,
        address: account,
        provider,
        chainId,
        loading,
        error,
        isConnected: !!account,
        isMobile,
        connect,
        disconnect,
        switchNetwork,
        connectToLocal,
    }), [
        account,
        provider,
        chainId,
        loading,
        error,
        isMobile,
        connect,
        disconnect,
        switchNetwork,
        connectToLocal
    ]);

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}

export { formatEther, parseEther };
