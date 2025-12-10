// EVM-based FIN token service
import { ethers } from 'ethers';
import { getFinTokenAddress } from '@/lib/finTokenConfig';

export interface FINTokenBalance {
  contractAddress: string; // Contract address for EVM
  amount: string; // BigNumber string
  formattedBalance: string; // Formatted for display (e.g., "1.00")
  name: string;
  symbol: string;
  decimals: number;
  found: boolean;
}

/**
 * Get FIN token balance for an EVM wallet address
 */
export async function getFINTokenBalance(
  walletAddress: string,
  rpcUrl: string,
  tokenAddress: string
): Promise<FINTokenBalance | null> {
  try {
    if (!rpcUrl || !tokenAddress) {
      throw new Error('RPC URL and token address are required');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Standard ERC20 ABI for balanceOf, name, symbol, decimals
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
    ];

    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    
    const [balance, name, symbol, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);

    const formattedBalance = ethers.formatUnits(balance, decimals);

    return {
      contractAddress: tokenAddress,
      amount: balance.toString(),
      formattedBalance,
      name,
      symbol,
      decimals: Number(decimals),
      found: balance > 0n,
    };
  } catch (error) {
    console.error('Failed to fetch FIN token balance:', error);
    return null;
  }
}

/**
 * Get FIN token address for a chain ID
 */
export function getFINTokenAddress(chainId: number): string {
  return getFinTokenAddress(chainId);
}

/**
 * Get RPC URL for a chain ID
 */
export function getRPCUrl(chainId: number): string {
  switch (chainId) {
    case 1:
      return import.meta.env.VITE_ETHEREUM_RPC_URL || '';
    case 137:
      return import.meta.env.VITE_POLYGON_RPC_URL || '';
    case 11155111:
      return import.meta.env.VITE_SEPOLIA_RPC_URL || '';
    default:
      return '';
  }
}
