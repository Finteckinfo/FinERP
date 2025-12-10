# FIN Token Minting Guide

## Overview

This guide explains how to mint FIN tokens for testing and production use. Think of it like getting tokens in a pool game - you need tokens to play and test the system.

## Requirements

### 1. Environment Setup

Create a `.env` file in the `contracts/` directory:

```bash
# Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Deployer Account
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=your_deployer_address_here

# FIN Token Contract (after deployment)
FIN_TOKEN_ADDRESS=0x...

# Test Accounts (for batch minting)
TEST_RECIPIENT_ADDRESS=0x...
TEST_ACCOUNT_1=0x...
TEST_ACCOUNT_2=0x...
TEST_ACCOUNT_3=0x...

# Token Amounts
TEST_TOKEN_AMOUNT=1000  # Amount in FIN (will be converted to wei)
TEST_TOKEN_AMOUNT_PER_ACCOUNT=1000  # For batch minting

# Explorer API Keys (for transaction verification)
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
```

### 2. Deploy FIN Token Contract

First, deploy the FIN token contract:

```bash
cd contracts
npm run deploy:sepolia  # For testnet
# or
npm run deploy:mainnet  # For mainnet
# or
npm run deploy:polygon  # For Polygon
```

After deployment, update `FIN_TOKEN_ADDRESS` in your `.env` file.

### 3. Grant Minter Role

The deployer automatically gets the MINTER_ROLE. If you need to grant it to another address:

```typescript
// In a script or console
const MINTER_ROLE = await finToken.MINTER_ROLE();
await finToken.grantRole(MINTER_ROLE, minterAddress);
```

## Minting Tokens

### Single Account Minting

Mint tokens to a single test account:

```bash
cd contracts
npx hardhat run scripts/mintTestTokens.ts --network sepolia
```

This will mint the amount specified in `TEST_TOKEN_AMOUNT` (default: 500 FIN) to `TEST_RECIPIENT_ADDRESS`.

### Batch Minting

Mint tokens to multiple test accounts at once:

```bash
npx hardhat run scripts/mintBatchTestTokens.ts --network sepolia
```

This mints `TEST_TOKEN_AMOUNT_PER_ACCOUNT` to each account listed in `TEST_ACCOUNT_1`, `TEST_ACCOUNT_2`, etc.

### Test Token Packs (Pool Game Style)

Like pool game tokens, we offer different "packs":

- **Starter Pack**: 100 FIN - Basic testing
- **Standard Pack**: 500 FIN - Standard testing
- **Premium Pack**: 1,000 FIN - Extended testing
- **Enterprise Pack**: 5,000 FIN - Full feature testing
- **Unlimited Pack**: 10,000 FIN - Comprehensive testing

Set `TEST_TOKEN_AMOUNT` to the desired amount (e.g., `100`, `500`, `1000`, `5000`, `10000`).

## Gasless Token Distribution

For a better user experience, we can implement gasless token distribution using Gelato Relay or a similar service. This allows users to receive test tokens without paying gas fees.

### Using Gelato Relay

1. Set up Gelato Relay API key in `.env`:
   ```bash
   VITE_GELATO_RELAY_API_KEY=your_gelato_key
   ```

2. The frontend can request tokens via a backend endpoint that uses Gelato to pay gas fees.

## Creative Test Token System

### Pool Game Token Model

Similar to pool games where you get tokens to play, we can implement:

1. **Daily Token Drops**: Users get a small amount of test tokens daily
2. **Achievement Rewards**: Complete tasks/achievements to earn tokens
3. **Referral Bonuses**: Invite team members to get bonus tokens
4. **Project Milestones**: Earn tokens when completing project milestones

### Implementation Ideas

1. **Backend Token Faucet**: Create an API endpoint that mints tokens on-demand
2. **Smart Contract Faucet**: Deploy a faucet contract that allows limited daily withdrawals
3. **Gamification**: Integrate token rewards into the ERP workflow

## Gasless Transactions

### Setup Gelato Relay

1. Get API key from [Gelato Dashboard](https://relay.gelato.network/)
2. Add to `.env`:
   ```bash
   VITE_GELATO_RELAY_API_KEY=your_key
   ```

3. The `gaslessService.ts` is already configured to use Gelato Relay.

### Supported Networks

Gelato supports:
- Ethereum Mainnet
- Polygon Mainnet
- Sepolia Testnet
- And many more

### Usage

Transactions can be sent gaslessly using the `sendGaslessTransaction` function in `src/services/gaslessService.ts`.

## Token Economics

### Initial Supply

- **Total Supply**: Set during contract deployment
- **Test Tokens**: Minted as needed for testing
- **Production Tokens**: Distributed according to tokenomics

### Token Distribution

1. **Team & Development**: Reserved for team
2. **Testing Pool**: For test tokens (like pool game tokens)
3. **User Rewards**: Distributed through ERP activities
4. **Liquidity**: For DEX trading

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use testnet first** before mainnet deployment
3. **Verify contracts** on block explorers
4. **Limit minter role** to trusted addresses only
5. **Monitor token distribution** to prevent abuse

## Next Steps

1. Deploy FIN token contract
2. Set up test accounts
3. Mint initial test tokens
4. Configure gasless transactions
5. Test the ERP system with tokens

## Troubleshooting

### "MINTER_ROLE not granted"
- Ensure the deployer address has the minter role
- Grant role using `grantRole(MINTER_ROLE, address)`

### "Insufficient gas"
- Ensure deployer wallet has enough native tokens (ETH/MATIC)
- Use testnet for testing to save costs

### "Contract not found"
- Verify FIN_TOKEN_ADDRESS is correct
- Ensure contract is deployed on the selected network

