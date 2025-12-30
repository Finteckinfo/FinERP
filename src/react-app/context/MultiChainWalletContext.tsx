import React, { createContext, useContext, ReactNode } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { WalletProvider, useWallet } from './WalletContext';
import { useTonWallet } from '../hooks/useTonWallet';

interface MultiChainWalletContextType {
    evmWallet: ReturnType<typeof useWallet>;
    tonWallet: ReturnType<typeof useTonWallet>;
}

const MultiChainWalletContext = createContext<MultiChainWalletContextType | undefined>(undefined);

function MultiChainWalletInner({ children }: { children: ReactNode }) {
    const evmWallet = useWallet();
    const tonWallet = useTonWallet();

    const value = React.useMemo(() => ({
        evmWallet,
        tonWallet
    }), [evmWallet, tonWallet]);

    return (
        <MultiChainWalletContext.Provider value={value}>
            {children}
        </MultiChainWalletContext.Provider>
    );
}

export function MultiChainWalletProvider({ children }: { children: ReactNode }) {
    const manifestUrl = import.meta.env.VITE_TON_MANIFEST_URL ||
        `${window.location.origin}/tonconnect-manifest.json`;

    return (
        <TonConnectUIProvider manifestUrl={manifestUrl}>
            <WalletProvider>
                <MultiChainWalletInner>
                    {children}
                </MultiChainWalletInner>
            </WalletProvider>
        </TonConnectUIProvider>
    );
}

export function useMultiChainWallet() {
    const context = useContext(MultiChainWalletContext);
    if (context === undefined) {
        throw new Error('useMultiChainWallet must be used within a MultiChainWalletProvider');
    }
    return context;
}
