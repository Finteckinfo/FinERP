# Netlify Environment Variables - Ready to Copy

Copy and paste these into Netlify Dashboard → Site settings → Environment variables

## ✅ Complete Variables (Ready to Deploy)

```bash
# Supabase Database
VITE_SUPABASE_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_SUPABASE_ANON_KEY
VITE_BACKEND_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_API_URL=REPLACE_WITH_YOUR_SUPABASE_URL/rest/v1

# RPC URLs (All Complete!)
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/REPLACE_WITH_YOUR_ALCHEMY_KEY
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/REPLACE_WITH_YOUR_ALCHEMY_KEY
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/REPLACE_WITH_YOUR_ALCHEMY_KEY

# WalletConnect (Multi-wallet support)
VITE_WALLETCONNECT_PROJECT_ID=REPLACE_WITH_YOUR_WALLETCONNECT_PROJECT_ID

# Block Explorer (Transaction history)
VITE_ETHERSCAN_API_KEY=REPLACE_WITH_YOUR_ETHERSCAN_API_KEY
```

## ⏳ Still Need (Add Later)

```bash
# Gelato Relay (Optional - for gasless transactions)
VITE_GELATO_RELAY_API_KEY=
VITE_USE_GASLESS_FAUCET=true

# Block Explorer Keys (Optional - for transaction history)
VITE_POLYGONSCAN_API_KEY=

# Contract Addresses (After smart contract deployment)
VITE_FIN_TOKEN_ADDRESS_ETH=
VITE_FIN_TOKEN_ADDRESS_POLYGON=
VITE_FIN_TOKEN_ADDRESS_SEPOLIA=
VITE_ESCROW_CONTRACT_ADDRESS=
VITE_DEX_CONTRACT_ADDRESS=
VITE_FAUCET_CONTRACT_ADDRESS=

# Domain (Update after Netlify deployment)
VITE_SSO_PRIMARY_DOMAIN=https://your-site.netlify.app
VITE_COOKIE_DOMAIN=.netlify.app
```

## How to Add to Netlify

1. Go to: https://app.netlify.com
2. Select your site (or create new site)
3. Click **Site settings** (gear icon)
4. Click **Environment variables** in left sidebar
5. Click **Add multiple** button
6. Paste the "Complete Variables" section above
7. Click **Save**
8. Go to **Deploys** tab
9. Click **Trigger deploy** → **Deploy site**

## Minimum Required for First Deployment

You can deploy with these 8 variables:
- All 4 Supabase variables ✅
- All 3 RPC URLs ✅
- WalletConnect Project ID ✅

The rest can be added later as you:
- Deploy smart contracts
- Configure optional services (Gelato, block explorers)

## Progress: 9/20 Variables Complete (45%)

**Required variables:** 8/8 ✅ (100%)
**Optional variables:** 1/12 ✅ (Etherscan added)
**Remaining optional:** 11/12 ⏳

You're ready for deployment! 🚀

