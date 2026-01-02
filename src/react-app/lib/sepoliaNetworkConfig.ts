/**
 * Sepolia Testnet Configuration
 * Used to help users easily add/switch to Sepolia network in MetaMask
 */

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const SEPOLIA_NETWORK_CONFIG = {
    chainId: SEPOLIA_CHAIN_ID_HEX,
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

/**
 * Add Sepolia network to MetaMask
 */
export const addSepoliaNetwork = async (): Promise<boolean> => {
    if (!window.ethereum) {
        console.error('No wallet detected');
        return false;
    }

    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK_CONFIG],
        });
        return true;
    } catch (error) {
        console.error('Failed to add Sepolia network:', error);
        return false;
    }
};

/**
 * Switch to Sepolia network, adding it first if necessary
 */
export const switchToSepoliaNetwork = async (): Promise<boolean> => {
    if (!window.ethereum) {
        console.error('No wallet detected');
        return false;
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
        });
        return true;
    } catch (error: any) {
        // Error code 4902 means the chain hasn't been added yet
        if (error.code === 4902) {
            return await addSepoliaNetwork();
        }
        console.error('Failed to switch to Sepolia network:', error);
        return false;
    }
};

/**
 * Check if user is on the correct network (Sepolia)
 */
export const isOnSepolia = (chainId: number | null): boolean => {
    return chainId === SEPOLIA_CHAIN_ID;
};
