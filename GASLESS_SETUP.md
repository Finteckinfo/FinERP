# Gasless Transaction Setup Guide

## Overview

FinERP supports gasless transactions using Gelato Relay, allowing users to interact with the system without paying gas fees. This is especially useful for test token distribution and frequent ERP operations.

## Requirements

### 1. Gelato Relay API Key

1. Sign up at [Gelato Dashboard](https://relay.gelato.network/)
2. Create a new project
3. Get your API key
4. Add to `.env`:
   ```bash
   VITE_GELATO_RELAY_API_KEY=your_gelato_api_key
   ```

### 2. Gelato Relayer Address

For smart contracts that need to support gasless transactions, grant the Gelato relayer the necessary roles.

Get Gelato relayer addresses:
- **Ethereum Mainnet**: `0x3caca7b48d0573d793d3b0279b5F0029180E83b6`
- **Polygon Mainnet**: `0x3caca7b48d0573d793d3b0279b5F0029180E83b6`
- **Sepolia Testnet**: `0x3caca7b48d0573d793d3b0279b5F0029180E83b6`

Add to `.env`:
```bash
GELATO_RELAYER_ADDRESS=0x3caca7b48d0573d793d3b0279b5F0029180E83b6
```

## Setup

### 1. Grant Relayer Role

For contracts that support gasless operations (like TestTokenFaucet), grant the RELAYER_ROLE:

```typescript
// In a script or console
const RELAYER_ROLE = await faucet.RELAYER_ROLE();
await faucet.grantRole(RELAYER_ROLE, GELATO_RELAYER_ADDRESS);
```

### 2. Fund Gelato Relay

Gelato Relay needs to be funded to pay for gas. You can:
- Fund via Gelato Dashboard
- Use Gelato's pay-per-use model (for testing)

### 3. Configure Frontend

The `gaslessService.ts` is already configured. Just ensure:
- `VITE_GELATO_RELAY_API_KEY` is set
- Contracts have RELAYER_ROLE granted

## Usage

### Gasless Token Distribution

Users can request test tokens without paying gas:

```typescript
import { requestTestTokens } from '@/services/testTokenFaucet';

const response = await requestTestTokens(
  userAddress,
  "100", // Amount in FIN
  chainId
);
```

### Gasless ERP Operations

Any transaction can be sent gaslessly:

```typescript
import { sendGaslessTransaction } from '@/services/gaslessService';

const response = await sendGaslessTransaction(signer, {
  to: contractAddress,
  data: encodedFunctionCall
});
```

## Supported Operations

1. **Test Token Requests**: Users get test tokens without gas fees
2. **Project Escrow Operations**: Fund escrows gaslessly
3. **Token Transfers**: Send FIN tokens without gas
4. **DEX Swaps**: Swap tokens gaslessly (if supported)

## Cost Model

- **Gelato Relay**: Charges a small fee per transaction
- **For Testing**: Use testnet where costs are minimal
- **For Production**: Consider funding model or pass costs to users

## Alternative: Backend Gasless Service

Instead of Gelato, you can implement a backend service that:
1. Receives user requests
2. Pays gas fees from a treasury wallet
3. Executes transactions on behalf of users

This gives more control but requires maintaining a funded wallet.

## Testing

1. Set up Gelato API key
2. Deploy TestTokenFaucet contract
3. Grant RELAYER_ROLE to Gelato
4. Test gasless token requests
5. Verify transactions on block explorer

## Notes

- Gasless transactions are perfect for test token distribution
- Consider rate limiting to prevent abuse
- Monitor Gelato usage and costs
- For production, implement proper access controls

