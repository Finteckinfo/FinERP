// EVM Network configurations for FIN token
export const SUPPORTED_NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
  },
} as const;

// FIN Token contract addresses (set via environment variables)
export const FIN_TOKEN_ADDRESSES = {
  ethereum: import.meta.env.VITE_FIN_TOKEN_ADDRESS_ETH || '',
  polygon: import.meta.env.VITE_FIN_TOKEN_ADDRESS_POLYGON || '',
  sepolia: import.meta.env.VITE_FIN_TOKEN_ADDRESS_SEPOLIA || '',
};

// Function to get FIN token address for a chain ID
export function getFinTokenAddress(chainId: number): string {
  switch (chainId) {
    case 1:
      return FIN_TOKEN_ADDRESSES.ethereum;
    case 137:
      return FIN_TOKEN_ADDRESSES.polygon;
    case 11155111:
      return FIN_TOKEN_ADDRESSES.sepolia;
    default:
      return '';
  }
}
