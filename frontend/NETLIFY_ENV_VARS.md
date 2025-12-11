# Netlify Environment Variables

Copy and paste these into Netlify Dashboard → Site settings → Environment variables

## Required Supabase Variables

```
VITE_SUPABASE_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_SUPABASE_ANON_KEY
VITE_BACKEND_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_API_URL=REPLACE_WITH_YOUR_SUPABASE_URL/rest/v1
```

## Network RPC URLs (Add your keys)

```
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

## Contract Addresses (Add after deployment)

```
VITE_FIN_TOKEN_ADDRESS_ETH=
VITE_FIN_TOKEN_ADDRESS_POLYGON=
VITE_FIN_TOKEN_ADDRESS_SEPOLIA=
VITE_ESCROW_CONTRACT_ADDRESS=
VITE_DEX_CONTRACT_ADDRESS=
VITE_FAUCET_CONTRACT_ADDRESS=
```

## WalletConnect (Add your project ID)

```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Gelato Relay (Optional)

```
VITE_GELATO_RELAY_API_KEY=your_gelato_key
VITE_USE_GASLESS_FAUCET=true
```

## Domain Configuration (Update after Netlify deployment)

```
VITE_SSO_PRIMARY_DOMAIN=https://your-site.netlify.app
VITE_COOKIE_DOMAIN=.netlify.app
```

## Block Explorer Keys (Optional)

```
VITE_ETHERSCAN_API_KEY=your_key
VITE_POLYGONSCAN_API_KEY=your_key
```

