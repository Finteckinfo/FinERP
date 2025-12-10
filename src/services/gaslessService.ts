import { GelatoRelaySDK } from '@gelatonetwork/relay-sdk';
import { ethers } from 'ethers';

export interface GaslessTransaction {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
}

export interface RelayResponse {
  taskId: string;
  transactionHash?: string;
  status: 'pending' | 'success' | 'failed';
}

// Initialize Gelato Relay SDK
let relaySDK: any = null;

function initializeGelato(): void {
  const apiKey = import.meta.env.VITE_GELATO_RELAY_API_KEY;
  if (!apiKey) {
    throw new Error('Gelato Relay API key not configured');
  }

  if (!relaySDK) {
    relaySDK = new GelatoRelaySDK(apiKey);
  }
}

// Send gasless transaction
export async function sendGaslessTransaction(
  signer: any,
  tx: GaslessTransaction
): Promise<RelayResponse> {
  try {
    initializeGelato();

    // Get the user's address
    const userAddress = await signer.getAddress();

    // Prepare the transaction request for Gelato
    const request = {
      chainId: (await signer.provider.getNetwork()).chainId,
      target: tx.to,
      data: tx.data,
      user: userAddress,
      feeToken: ethers.ZeroAddress, // Use native token for fees, or specify ERC20
      isRelayContext: true
    };

    // Send via Gelato Relay
    const response = await relaySDK.sendRelayTransaction(request);

    return {
      taskId: response.taskId,
      status: 'pending'
    };

  } catch (error) {
    console.error('Error sending gasless transaction:', error);
    throw error;
  }
}

// Check transaction status
export async function getTransactionStatus(taskId: string): Promise<RelayResponse> {
  try {
    initializeGelato();

    const status = await relaySDK.getTaskStatus(taskId);

    return {
      taskId,
      transactionHash: status.transactionHash,
      status: status.taskState === 1 ? 'success' : status.taskState === 2 ? 'failed' : 'pending'
    };

  } catch (error) {
    console.error('Error checking transaction status:', error);
    throw error;
  }
}

// Estimate gasless transaction cost
export async function estimateGaslessCost(
  provider: any,
  tx: GaslessTransaction
): Promise<string> {
  try {
    initializeGelato();

    // Estimate gas cost
    const gasEstimate = await provider.estimateGas({
      to: tx.to,
      data: tx.data,
      value: tx.value || '0x0'
    });

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    // Calculate cost (simplified - Gelato may have different pricing)
    const cost = gasEstimate * gasPrice;

    return ethers.formatEther(cost);

  } catch (error) {
    console.error('Error estimating gasless cost:', error);
    throw error;
  }
}

// Check if gasless transactions are supported on current network
export function isGaslessSupported(chainId: number): boolean {
  // Gelato supports multiple networks
  const supportedChains = [1, 5, 10, 56, 100, 137, 250, 42161, 43114, 80001]; // Mainnets and testnets
  return supportedChains.includes(chainId);
}

// Get supported fee tokens for the current network
export async function getSupportedFeeTokens(chainId: number): Promise<string[]> {
  try {
    initializeGelato();

    // This would typically come from Gelato API
    // For now, return common tokens
    const feeTokens: { [key: number]: string[] } = {
      1: [ethers.ZeroAddress, '0xA0b86a33E6441a8b5dE1a3A7f3e5F8c4B2D1E0F9'], // ETH, USDT
      137: [ethers.ZeroAddress, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F6'], // MATIC, USDT
      56: [ethers.ZeroAddress, '0x55d398326f99059fF775485246999027B3197955'], // BNB, USDT
    };

    return feeTokens[chainId] || [ethers.ZeroAddress];

  } catch (error) {
    console.error('Error getting supported fee tokens:', error);
    return [ethers.ZeroAddress]; // Default to native token
  }
}
