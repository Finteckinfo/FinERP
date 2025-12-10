import { NetworkId } from '@txnlab/use-wallet-vue';

// SIZ Token Asset IDs kwa kila network
export const SIZ_ASSET_IDS: Record<NetworkId, number> = {
  [NetworkId.MAINNET]: 3186560531,
  [NetworkId.TESTNET]: 739030083,
  [NetworkId.BETANET]: 0, // Tafadhali ongeza ikiwa unahitaji
  [NetworkId.FNET]: 0, // Tafadhali ongeza ikiwa unahitaji
  [NetworkId.LOCALNET]: 0, // Tafadhali ongeza ikiwa unahitaji
};

// Function ya kupata SIZ Asset ID kwa network
export function getSizAssetId(networkId: NetworkId): number {
  return SIZ_ASSET_IDS[networkId] || 0;
}

// Function ya kuweka kiasi cha SIZ token kwa muundo unaofaa
// SIZ tokens zina decimals 2, hivyo 100 base units = 1.00 SIZ
export function formatSizTokenAmount(amount: number): string {
  return (amount / 100).toFixed(2);
}


