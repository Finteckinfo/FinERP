import { ethers } from 'ethers';

// FIN Token ABI (simplified for balance reading)
const FIN_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

export interface FINTokenBalance {
  balance: string;
  formattedBalance: string;
  decimals: number;
  symbol: string;
  name: string;
  found: boolean;
}

// Get FIN token balance from smart contract
export async function getFINTokenBalance(
  walletAddress: string,
  rpcUrl: string,
  tokenAddress: string
): Promise<FINTokenBalance | null> {
  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create contract instance
    const contract = new ethers.Contract(tokenAddress, FIN_TOKEN_ABI, provider);

    // Get token info
    const [balance, decimals, symbol, name] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol(),
      contract.name()
    ]);

    // Format balance
    const formattedBalance = ethers.formatUnits(balance, decimals);

    return {
      balance: balance.toString(),
      formattedBalance,
      decimals,
      symbol,
      name,
      found: true
    };
  } catch (error) {
    console.error('Error fetching FIN token balance:', error);
    return null;
  }
}

// Get network-specific token address
export function getFINTokenAddress(chainId: number): string {
  const addresses: { [key: number]: string } = {
    1: import.meta.env.VITE_FIN_TOKEN_ADDRESS_ETH || '0x...', // Ethereum Mainnet
    137: import.meta.env.VITE_FIN_TOKEN_ADDRESS_POLYGON || '0x...', // Polygon Mainnet
    11155111: import.meta.env.VITE_FIN_TOKEN_ADDRESS_ETH || '0x...' // Sepolia Testnet
  };

  return addresses[chainId] || addresses[1]; // Default to Ethereum
}

// Get network-specific RPC URL
export function getRPCUrl(chainId: number): string {
  const rpcUrls: { [key: number]: string } = {
    1: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    137: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
    11155111: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo'
  };

  return rpcUrls[chainId] || rpcUrls[1];
}
