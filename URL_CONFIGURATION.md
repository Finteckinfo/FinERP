# URL Configuration Guide for FinERP Frontend

This document shows all the URLs and endpoints configured in the FinERP frontend application.

## Environment Variables

All URLs are configured via environment variables in `.env` or `.env.local` file.

### Primary URLs

#### Backend API URL
- **Variable:** `VITE_BACKEND_URL`
- **Default:** `http://localhost:5000` (fallback in some places)
- **Used in:**
  - `src/services/projectApi.ts` - Main API client
  - `src/services/nextAuthService.ts` - Session validation
  - `src/composables/useNextAuth.ts` - Backend session check
  - `src/services/websocket.ts` - WebSocket connection
  - `src/services/paymentService.ts` - Payment API
  - `src/views/pages/kanban/services/kanbanApi.ts` - Kanban API
  - `src/views/projects/CreateProject.vue` - Project creation API

#### SSO Primary Domain
- **Variable:** `VITE_SSO_PRIMARY_DOMAIN`
- **Default:** `https://www.siz.land`
- **Used in:**
  - `src/composables/useAuth.ts` - SSO session check
  - `src/composables/useNextAuth.ts` - NextAuth session validation
  - `src/services/nextAuthService.ts` - SSO token management
  - `src/router/guards/authGuard.ts` - Authentication guard
  - `src/components/guards/WalletGuard.vue` - Wallet authentication
  - `src/views/authentication/LoginPage.vue` - Login redirect
  - `src/views/authentication/SSOCallback.vue` - SSO callback handler

#### API URL (Legacy)
- **Variable:** `VITE_API_URL`
- **Default:** Not set (must be configured)
- **Used in:**
  - `src/stores/auth.ts` - User authentication
  - `src/stores/authUser.ts` - User data
  - `src/utils/helpers/fetch-wrapper.ts` - API wrapper

### Blockchain RPC URLs

#### Ethereum Mainnet RPC
- **Variable:** `VITE_ETHEREUM_RPC_URL`
- **Example:** `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`
- **Used in:**
  - `src/lib/sizTokenConfig.ts` - Network configuration
  - `src/services/sizTokenService.ts` - Token balance queries

#### Polygon Mainnet RPC
- **Variable:** `VITE_POLYGON_RPC_URL`
- **Example:** `https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY`
- **Used in:**
  - `src/lib/sizTokenConfig.ts` - Network configuration
  - `src/services/sizTokenService.ts` - Token balance queries

#### Sepolia Testnet RPC
- **Variable:** `VITE_SEPOLIA_RPC_URL`
- **Example:** `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
- **Used in:**
  - `src/lib/sizTokenConfig.ts` - Network configuration
  - `src/services/sizTokenService.ts` - Token balance queries

### Smart Contract Addresses

#### FIN Token Addresses
- **Variable:** `VITE_FIN_TOKEN_ADDRESS_ETH` - Ethereum mainnet
- **Variable:** `VITE_FIN_TOKEN_ADDRESS_POLYGON` - Polygon mainnet
- **Variable:** `VITE_FIN_TOKEN_ADDRESS_SEPOLIA` - Sepolia testnet
- **Used in:**
  - `src/lib/sizTokenConfig.ts` - Token contract addresses
  - `src/services/sizTokenService.ts` - Token interactions

#### Escrow Contract Address
- **Variable:** `VITE_ESCROW_CONTRACT_ADDRESS`
- **Used in:**
  - `src/services/projectEscrowService.ts` - Escrow operations

#### DEX Contract Address
- **Variable:** `VITE_DEX_CONTRACT_ADDRESS`
- **Used in:**
  - `src/services/dexService.ts` - DEX swap operations

### Other Services

#### Gelato Relay API Key
- **Variable:** `VITE_GELATO_RELAY_API_KEY`
- **Used in:**
  - `src/services/gaslessService.ts` - Gasless transaction relay

#### WalletConnect Project ID
- **Variable:** `VITE_WALLETCONNECT_PROJECT_ID`
- **Used in:**
  - `src/lib/walletManager.ts` - WalletConnect integration (if needed)

## Current Configuration Locations

### Main Configuration Files

1. **`src/services/projectApi.ts`**
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
   ```

2. **`src/composables/useAuth.ts`**
   ```typescript
   const ssoDomain = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'https://www.siz.land';
   ```

3. **`src/composables/useNextAuth.ts`**
   ```typescript
   const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
   ```

4. **`src/services/websocket.ts`**
   ```typescript
   const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
   ```

5. **`src/lib/sizTokenConfig.ts`**
   ```typescript
   rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'
   ```

## Hardcoded URLs (Should be moved to env)

1. **`src/utils/cookies.ts`**
   - Domain: `.siz.land` (hardcoded)

2. **`src/views/projects/CreateProject.vue`**
   - Link: `https://www.siz.land/wallet` (hardcoded)

3. **`src/components/onboarding/WalletTutorial.vue`**
   - Link: `https://www.siz.land/wallet` (hardcoded)

## Recommended .env File Structure

```bash
# Backend API
VITE_BACKEND_URL=https://api.yourdomain.com

# SSO Domain
VITE_SSO_PRIMARY_DOMAIN=https://www.siz.land

# Legacy API (if still used)
VITE_API_URL=https://api.yourdomain.com

# Ethereum RPC URLs
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Smart Contract Addresses
VITE_FIN_TOKEN_ADDRESS_ETH=0x...
VITE_FIN_TOKEN_ADDRESS_POLYGON=0x...
VITE_FIN_TOKEN_ADDRESS_SEPOLIA=0x...
VITE_ESCROW_CONTRACT_ADDRESS=0x...
VITE_DEX_CONTRACT_ADDRESS=0x...

# Services
VITE_GELATO_RELAY_API_KEY=your_gelato_key
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

## Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Never commit `.env` files with real credentials to version control
- Use `.env.example` as a template for required variables
- Default values are fallbacks and may not work in production

