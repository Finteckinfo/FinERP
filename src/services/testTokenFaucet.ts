/**
 * Test Token Faucet Service
 * 
 * Similar to pool game tokens - provides a way to get test tokens
 * for testing the ERP system without real money.
 * 
 * This service can be integrated with:
 * 1. Backend API that mints tokens on-demand
 * 2. Smart contract faucet that allows limited daily withdrawals
 * 3. Gelato Relay for gasless token distribution
 */

import { ethers } from 'ethers';
import { useEVMWallet } from '@/composables/useEVMWallet';
import { sendGaslessTransaction } from './gaslessService';
import { getFINTokenAddress } from '@/lib/finTokenConfig';

export interface FaucetRequest {
  address: string;
  amount: string; // Amount in FIN (e.g., "100")
  chainId: number;
}

export interface FaucetResponse {
  success: boolean;
  transactionHash?: string;
  amount: string;
  message: string;
}

/**
 * Request test tokens from faucet (like getting pool game tokens)
 * 
 * This can work in two ways:
 * 1. Backend API that mints tokens (recommended for testing)
 * 2. Smart contract faucet that allows limited withdrawals
 */
export async function requestTestTokens(
  address: string,
  amount: string = "100",
  chainId?: number
): Promise<FaucetResponse> {
  try {
    // Get chain ID from wallet if not provided
    const { chainId: walletChainId } = useEVMWallet();
    const targetChainId = chainId || walletChainId.value || 11155111; // Default to Sepolia

    // Option 1: Backend API Faucet (Recommended)
    // This is like a pool game token dispenser - you request, you get tokens
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      try {
        const response = await fetch(`${backendUrl}/api/faucet/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            address,
            amount,
            chainId: targetChainId
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            transactionHash: data.transactionHash,
            amount: data.amount || amount,
            message: `Successfully received ${amount} FIN test tokens!`
          };
        }
      } catch (error) {
        console.warn('Backend faucet not available, trying contract faucet:', error);
      }
    }

    // Option 2: Smart Contract Faucet
    // Direct interaction with a faucet contract
    return await requestFromContractFaucet(address, amount, targetChainId);

  } catch (error: any) {
    console.error('Faucet request failed:', error);
    return {
      success: false,
      amount: "0",
      message: error.message || 'Failed to request test tokens'
    };
  }
}

/**
 * Request tokens from smart contract faucet
 */
async function requestFromContractFaucet(
  address: string,
  amount: string,
  chainId: number
): Promise<FaucetResponse> {
  // Faucet contract address (deploy a faucet contract separately)
  const FAUCET_CONTRACT_ADDRESS = import.meta.env.VITE_FAUCET_CONTRACT_ADDRESS;
  
  if (!FAUCET_CONTRACT_ADDRESS) {
    throw new Error('Faucet contract not configured. Please set VITE_FAUCET_CONTRACT_ADDRESS');
  }

  const { provider, signer } = useEVMWallet();
  
  if (!signer.value) {
    throw new Error('Wallet not connected');
  }

  // Faucet contract ABI (simplified)
  const faucetAbi = [
    'function requestTokens(uint256 amount) external',
    'function dailyLimit() view returns (uint256)',
    'function lastRequest(address) view returns (uint256)',
    'function canRequest(address) view returns (bool)'
  ];

  const faucetContract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, faucetAbi, signer.value);
  
  // Check if user can request
  const canRequest = await faucetContract.canRequest(address);
  if (!canRequest) {
    throw new Error('Daily limit reached. Please try again tomorrow.');
  }

  // Request tokens (can be gasless if configured)
  const amountWei = ethers.parseEther(amount);
  
  // Try gasless first
  const useGasless = import.meta.env.VITE_USE_GASLESS_FAUCET === 'true';
  
  if (useGasless) {
    const data = faucetContract.interface.encodeFunctionData('requestTokens', [amountWei]);
    
    const relayResponse = await sendGaslessTransaction(signer.value, {
      to: FAUCET_CONTRACT_ADDRESS,
      data: data
    });

    return {
      success: true,
      transactionHash: relayResponse.transactionHash,
      amount,
      message: `Successfully requested ${amount} FIN test tokens (gasless)!`
    };
  } else {
    // Regular transaction
    const tx = await faucetContract.requestTokens(amountWei);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      amount,
      message: `Successfully requested ${amount} FIN test tokens!`
    };
  }
}

/**
 * Check faucet status (daily limit, last request time, etc.)
 */
export async function getFaucetStatus(address: string, chainId: number): Promise<{
  canRequest: boolean;
  dailyLimit: string;
  lastRequestTime: number | null;
  timeUntilNextRequest: number | null;
}> {
  const FAUCET_CONTRACT_ADDRESS = import.meta.env.VITE_FAUCET_CONTRACT_ADDRESS;
  
  if (!FAUCET_CONTRACT_ADDRESS) {
    return {
      canRequest: false,
      dailyLimit: "0",
      lastRequestTime: null,
      timeUntilNextRequest: null
    };
  }

  try {
    const { provider } = useEVMWallet();
    if (!provider.value) {
      throw new Error('Provider not available');
    }

    const faucetAbi = [
      'function dailyLimit() view returns (uint256)',
      'function lastRequest(address) view returns (uint256)',
      'function canRequest(address) view returns (bool)',
      'function cooldownPeriod() view returns (uint256)'
    ];

    const faucetContract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, faucetAbi, provider.value);
    
    const [canRequest, dailyLimit, lastRequest, cooldownPeriod] = await Promise.all([
      faucetContract.canRequest(address),
      faucetContract.dailyLimit(),
      faucetContract.lastRequest(address),
      faucetContract.cooldownPeriod().catch(() => ethers.parseEther("86400")) // Default 24 hours
    ]);

    const lastRequestTime = lastRequest > 0 ? Number(lastRequest) * 1000 : null;
    const cooldownMs = Number(cooldownPeriod) * 1000;
    const timeUntilNextRequest = lastRequestTime 
      ? Math.max(0, (lastRequestTime + cooldownMs) - Date.now())
      : null;

    return {
      canRequest,
      dailyLimit: ethers.formatEther(dailyLimit),
      lastRequestTime,
      timeUntilNextRequest
    };
  } catch (error) {
    console.error('Failed to get faucet status:', error);
    return {
      canRequest: false,
      dailyLimit: "0",
      lastRequestTime: null,
      timeUntilNextRequest: null
    };
  }
}

/**
 * Get available test token packs (like pool game token packs)
 */
export function getTestTokenPacks(): Array<{
  name: string;
  amount: string;
  description: string;
  icon: string;
}> {
  return [
    {
      name: 'Starter Pack',
      amount: '100',
      description: 'Perfect for basic testing',
      icon: 'mdi-package-variant'
    },
    {
      name: 'Standard Pack',
      amount: '500',
      description: 'Great for standard testing',
      icon: 'mdi-package-variant-closed'
    },
    {
      name: 'Premium Pack',
      amount: '1,000',
      description: 'Ideal for extended testing',
      icon: 'mdi-package-variant-plus'
    },
    {
      name: 'Enterprise Pack',
      amount: '5,000',
      description: 'For full feature testing',
      icon: 'mdi-package-variant-closed-plus'
    },
    {
      name: 'Unlimited Pack',
      amount: '10,000',
      description: 'Comprehensive testing suite',
      icon: 'mdi-infinity'
    }
  ];
}

