import algosdk from 'algosdk';
import { NetworkId } from '@txnlab/use-wallet-vue';
import { getSizAssetId } from '@/lib/sizTokenConfig';

export interface AccountInfo {
  amount: number; // ALGO balance (microALGO)
  minBalance: number;
  assets: Array<{
    assetId: number;
    amount: number;
    name?: string;
    unitName?: string;
    decimals?: number;
  }>;
}

export interface SizTokenBalance {
  assetId: number;
  amount: number; // Base units
  formattedAmount: string; // Formatted for display (e.g., "1.00")
  name: string;
  unitName: string;
  decimals: number;
  found: boolean;
}

/**
 * Fetch account information from Algorand blockchain
 */
export async function fetchAccountInfo(
  walletAddress: string,
  networkId: NetworkId
): Promise<AccountInfo | null> {
  try {
    // Create Algorand client based on network
    const algodConfig = networkId === NetworkId.TESTNET
      ? { server: 'https://testnet-api.algonode.cloud', port: '', token: '' }
      : { server: 'https://mainnet-api.algonode.cloud', port: '', token: '' };

    const algod = new algosdk.Algodv2(algodConfig.token, algodConfig.server, algodConfig.port);
    
    // Fetch account information
    const account = await algod.accountInformation(walletAddress).do();

    // Get SIZ asset ID for the network
    const sizAssetId = getSizAssetId(networkId);

    // Find SIZ asset in account assets
    // Algorand SDK can return assetId or 'asset-id' depending on version
    const accountAssets = account.assets || [];
    const sizAsset = accountAssets.find(
      (asset: any) => {
        const assetId = asset.assetId !== undefined ? asset.assetId : asset['asset-id'];
        return Number(assetId) === sizAssetId;
      }
    );

    // Fetch asset details
    let name = 'SIZ Token';
    let unitName = 'SIZ';
    let decimals = 0;
    
    if (sizAsset) {
      try {
        const assetInfo = await algod.getAssetByID(sizAssetId).do();
        name = assetInfo.params.name || 'SIZ Token';
        unitName = assetInfo.params.unitName || 'SIZ';
        decimals = assetInfo.params.decimals || 0;
      } catch (e) {
        console.warn('Failed to fetch asset details:', e);
      }
    }

    // Format assets array
    const formattedAssets = sizAsset ? [{
      assetId: sizAssetId,
      amount: Number(sizAsset.amount),
      name,
      unitName,
      decimals,
    }] : [];

    // Debug logging
    if (sizAsset) {
      const divisor = Math.pow(10, decimals);
      console.log('✅ [SIZ Token] Found SIZ token in wallet:', {
        assetId: sizAssetId,
        amount: Number(sizAsset.amount),
        decimals,
        divisor,
        formattedAmount: (Number(sizAsset.amount) / divisor).toFixed(Math.max(2, decimals)),
        networkId
      });
    } else {
      console.log('❌ [SIZ Token] SIZ token not found in wallet:', {
        assetId: sizAssetId,
        networkId,
        totalAssets: accountAssets.length
      });
    }

    return {
      amount: Number(account.amount),
      minBalance: Number(account.minBalance || 0),
      assets: formattedAssets,
    };
  } catch (error) {
    console.error('Error fetching account info:', error);
    return null;
  }
}

/**
 * Get SIZ token balance for a wallet
 */
export async function getSizTokenBalance(
  walletAddress: string,
  networkId: NetworkId
): Promise<SizTokenBalance | null> {
  const accountInfo = await fetchAccountInfo(walletAddress, networkId);
  
  if (!accountInfo) {
    return null;
  }

  const sizAsset = accountInfo.assets[0];
  const sizAssetId = getSizAssetId(networkId);

  if (!sizAsset) {
    return {
      assetId: sizAssetId,
      amount: 0,
      formattedAmount: '0.00',
      name: 'SIZ Token',
      unitName: 'SIZ',
      decimals: 0,
      found: false,
    };
  }

  // Use the actual decimals from the asset to format the amount correctly
  const decimals = sizAsset.decimals || 0;
  const divisor = Math.pow(10, decimals);
  const formattedAmount = (sizAsset.amount / divisor).toFixed(Math.max(2, decimals));

  return {
    assetId: sizAsset.assetId,
    amount: sizAsset.amount,
    formattedAmount,
    name: sizAsset.name || 'SIZ Token',
    unitName: sizAsset.unitName || 'SIZ',
    decimals,
    found: true,
  };
}

