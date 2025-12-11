# Complete Environment Variables Guide for Netlify Deployment

This guide walks you through getting ALL environment variables needed for FinERP deployment.

## Table of Contents
1. [Supabase Variables](#1-supabase-variables) ✅ (You already have these)
2. [RPC Provider URLs](#2-rpc-provider-urls)
3. [WalletConnect Project ID](#3-walletconnect-project-id)
4. [Gelato Relay API Key](#4-gelato-relay-api-key-optional)
5. [Block Explorer API Keys](#5-block-explorer-api-keys-optional)
6. [Contract Addresses](#6-contract-addresses-after-deployment)
7. [Domain Configuration](#7-domain-configuration)
8. [Adding to Netlify](#8-adding-to-netlify)

---

## 1. Supabase Variables ✅

**Status:** You already have these!

### Step-by-Step:
1. Go to: https://supabase.com/dashboard/project/REPLACE_WITH_YOUR_PROJECT_ID
2. Click **Settings** (gear icon in left sidebar)
3. Click **API** in the settings menu
4. Copy these values:

```
VITE_SUPABASE_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_SUPABASE_ANON_KEY
VITE_BACKEND_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_API_URL=REPLACE_WITH_YOUR_SUPABASE_URL/rest/v1
```

---

## 2. RPC Provider URLs

You need RPC URLs to connect to Ethereum networks. Choose ONE provider:

### Option A: Alchemy (Recommended - Free Tier Available)

**Step-by-Step:**
1. Go to: https://www.alchemy.com/
2. Click **Sign Up** (or **Log In** if you have an account)
3. Create a free account
4. After login, click **Create App** or **+ Create** button
5. Fill in:
   - **App Name**: `FinERP`
   - **Chain**: Select each network one by one
   - **Network**: Choose the network
6. Click **Create App**
7. Repeat for each network:
   - **Ethereum Mainnet**
   - **Polygon Mainnet**
   - **Sepolia Testnet** (for testing)

**For each app, get the API key:**
1. Click on your app
2. Click **View Key** button
3. Copy the **HTTPS** URL (looks like: `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`)

**You'll get 3 URLs:**
```
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**Free Tier:** 300M compute units/month (plenty for testing)

---

### Option B: Infura (Alternative)

**Step-by-Step:**
1. Go to: https://www.infura.io/
2. Sign up for free account
3. After login, go to **Dashboard**
4. Click **Create New Key**
5. Select:
   - **Network**: Ethereum Mainnet
   - **Name**: `FinERP Ethereum`
6. Click **Create**
7. Copy the **HTTPS Endpoint** URL
8. Repeat for Polygon and Sepolia

**You'll get 3 URLs:**
```
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
VITE_POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

**Free Tier:** 100,000 requests/day

---

### Option C: QuickNode (Alternative)

**Step-by-Step:**
1. Go to: https://www.quicknode.com/
2. Sign up for free account
3. Create endpoints for each network
4. Copy the HTTPS URLs

---

## 3. WalletConnect Project ID

**Step-by-Step:**
1. Go to: https://cloud.walletconnect.com/
2. Click **Sign In** or **Get Started**
3. Sign in with GitHub, Google, or email
4. After login, click **Create New Project** or **+ New Project**
5. Fill in:
   - **Project Name**: `FinERP`
   - **Homepage URL**: `https://your-site.netlify.app` (or use placeholder for now)
   - **Description**: `FinERP Web3 ERP System`
6. Click **Create**
7. On the project page, you'll see:
   - **Project ID**: Copy this (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
8. Copy the Project ID

**Add to Netlify:**
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**Note:** You can update the homepage URL later in WalletConnect dashboard.

---

## 4. Gelato Relay API Key (Optional - for Gasless Transactions)

**Step-by-Step:**
1. Go to: https://relay.gelato.network/
2. Click **Get Started** or **Sign Up**
3. Connect your wallet (MetaMask recommended)
4. After connecting, you'll see your dashboard
5. Go to **API Keys** section
6. Click **Create API Key**
7. Fill in:
   - **Name**: `FinERP`
   - **Network**: Select networks you want (Sepolia for testing, Mainnet for production)
8. Click **Create**
9. Copy the **API Key** (keep it secret!)

**Add to Netlify:**
```
VITE_GELATO_RELAY_API_KEY=your_gelato_api_key_here
VITE_USE_GASLESS_FAUCET=true
```

**Note:** Gelato free tier allows limited gasless transactions. For production, you may need a paid plan.

---

## 5. Block Explorer API Keys (Optional - for Transaction History)

### Etherscan API Key

**Step-by-Step:**
1. Go to: https://etherscan.io/
2. Click **Sign Up** (top right)
3. Create a free account
4. After login, go to: https://etherscan.io/myapikey
5. Click **+ Add** button
6. Enter **AppName**: `FinERP`
7. Click **Create**
8. Copy the **API Key Token**

**Add to Netlify:**
```
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Polygonscan API Key

**Step-by-Step:**
1. Go to: https://polygonscan.com/
2. Click **Sign Up** (top right)
3. Create a free account (or use same account if you have one)
4. After login, go to: https://polygonscan.com/myapikey
5. Click **+ Add** button
6. Enter **AppName**: `FinERP`
7. Click **Create**
8. Copy the **API Key Token**

**Add to Netlify:**
```
VITE_POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

**Note:** These are optional but useful for displaying transaction history in the app.

---

## 6. Contract Addresses (After Deployment)

**Status:** You'll get these AFTER deploying your smart contracts.

### Step-by-Step to Deploy Contracts:

1. **Deploy to Sepolia Testnet First** (for testing):
   ```bash
   cd contracts
   npm install
   cp .env.example .env
   # Edit .env with your RPC URL and private key
   npm run deploy:sepolia
   ```

2. **After deployment, you'll get addresses like:**
   ```
   FIN Token deployed to: 0x1234567890abcdef1234567890abcdef12345678
   Project Escrow deployed to: 0xabcdef1234567890abcdef1234567890abcdef12
   FINSwap DEX deployed to: 0x9876543210fedcba9876543210fedcba98765432
   TestTokenFaucet deployed to: 0xfedcba0987654321fedcba0987654321fedcba0
   ```

3. **Copy these addresses and add to Netlify:**
   ```
   VITE_FIN_TOKEN_ADDRESS_SEPOLIA=0x1234567890abcdef1234567890abcdef12345678
   VITE_ESCROW_CONTRACT_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
   VITE_DEX_CONTRACT_ADDRESS=0x9876543210fedcba9876543210fedcba98765432
   VITE_FAUCET_CONTRACT_ADDRESS=0xfedcba0987654321fedcba0987654321fedcba0
   ```

4. **For Mainnet/Polygon** (after testing):
   - Deploy to mainnet: `npm run deploy:mainnet`
   - Deploy to Polygon: `npm run deploy:polygon`
   - Add the addresses:
   ```
   VITE_FIN_TOKEN_ADDRESS_ETH=0x...
   VITE_FIN_TOKEN_ADDRESS_POLYGON=0x...
   ```

**Note:** For now, you can leave these empty and add them after deployment.

---

## 7. Domain Configuration

### For Initial Deployment (Netlify Default Domain)

After deploying to Netlify, you'll get a URL like: `https://random-name-123.netlify.app`

**Add to Netlify:**
```
VITE_SSO_PRIMARY_DOMAIN=https://random-name-123.netlify.app
VITE_COOKIE_DOMAIN=.netlify.app
```

### For Custom Domain (Later)

1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Enter your domain (e.g., `finerp.com`)
4. Follow DNS configuration instructions
5. Update environment variables:
   ```
   VITE_SSO_PRIMARY_DOMAIN=https://finerp.com
   VITE_COOKIE_DOMAIN=.finerp.com
   ```

**For now, use placeholder:**
```
VITE_SSO_PRIMARY_DOMAIN=https://your-site.netlify.app
VITE_COOKIE_DOMAIN=.netlify.app
```

---

## 8. Adding to Netlify

### Step-by-Step:

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Sign in or create account

2. **Select Your Site**
   - Click on your FinERP site (or create new site if not done)

3. **Navigate to Environment Variables**
   - Click **Site settings** (gear icon)
   - Click **Environment variables** in left sidebar
   - Click **Add a variable** button

4. **Add Each Variable**
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: `REPLACE_WITH_YOUR_SUPABASE_URL`
   - Click **Save**
   - Repeat for each variable

5. **Quick Copy-Paste Method:**
   - Click **Add multiple** button
   - Paste all variables in this format:
   ```
   VITE_SUPABASE_URL=REPLACE_WITH_YOUR_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_SUPABASE_ANON_KEY
   VITE_BACKEND_URL=REPLACE_WITH_YOUR_SUPABASE_URL
   VITE_API_URL=REPLACE_WITH_YOUR_SUPABASE_URL/rest/v1
   VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
   VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
   VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   VITE_GELATO_RELAY_API_KEY=your_gelato_key
   VITE_USE_GASLESS_FAUCET=true
   VITE_SSO_PRIMARY_DOMAIN=https://your-site.netlify.app
   VITE_COOKIE_DOMAIN=.netlify.app
   ```
   - Replace placeholders with your actual values
   - Click **Save**

6. **Redeploy After Adding Variables**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**
   - This ensures new variables are available

---

## Complete Checklist

Use this checklist to track your progress:

### Required Variables
- [ ] `VITE_SUPABASE_URL` ✅ (You have this)
- [ ] `VITE_SUPABASE_ANON_KEY` ✅ (You have this)
- [ ] `VITE_BACKEND_URL` ✅ (You have this)
- [ ] `VITE_API_URL` ✅ (You have this)
- [ ] `VITE_ETHEREUM_RPC_URL` (Get from Alchemy/Infura)
- [ ] `VITE_POLYGON_RPC_URL` (Get from Alchemy/Infura)
- [ ] `VITE_SEPOLIA_RPC_URL` (Get from Alchemy/Infura)
- [ ] `VITE_WALLETCONNECT_PROJECT_ID` (Get from WalletConnect)

### Optional Variables
- [ ] `VITE_GELATO_RELAY_API_KEY` (Get from Gelato - optional)
- [ ] `VITE_USE_GASLESS_FAUCET` (Set to `true` if using Gelato)
- [ ] `VITE_ETHERSCAN_API_KEY` (Get from Etherscan - optional)
- [ ] `VITE_POLYGONSCAN_API_KEY` (Get from Polygonscan - optional)

### After Contract Deployment
- [ ] `VITE_FIN_TOKEN_ADDRESS_ETH` (After mainnet deployment)
- [ ] `VITE_FIN_TOKEN_ADDRESS_POLYGON` (After Polygon deployment)
- [ ] `VITE_FIN_TOKEN_ADDRESS_SEPOLIA` (After Sepolia deployment)
- [ ] `VITE_ESCROW_CONTRACT_ADDRESS` (After deployment)
- [ ] `VITE_DEX_CONTRACT_ADDRESS` (After deployment)
- [ ] `VITE_FAUCET_CONTRACT_ADDRESS` (After deployment)

### Domain Configuration
- [ ] `VITE_SSO_PRIMARY_DOMAIN` (Update after Netlify deployment)
- [ ] `VITE_COOKIE_DOMAIN` (Update after Netlify deployment)

---

## Quick Reference: All Variables Template

Copy this template and fill in your values:

```bash
# Supabase (You have these)
VITE_SUPABASE_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_SUPABASE_ANON_KEY
VITE_BACKEND_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_API_URL=REPLACE_WITH_YOUR_SUPABASE_URL/rest/v1

# RPC URLs (Get from Alchemy/Infura)
VITE_ETHEREUM_RPC_URL=
VITE_POLYGON_RPC_URL=
VITE_SEPOLIA_RPC_URL=

# WalletConnect (Get from cloud.walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=

# Gelato (Optional - Get from relay.gelato.network)
VITE_GELATO_RELAY_API_KEY=
VITE_USE_GASLESS_FAUCET=true

# Block Explorers (Optional)
VITE_ETHERSCAN_API_KEY=
VITE_POLYGONSCAN_API_KEY=

# Contract Addresses (After deployment)
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

---

## Troubleshooting

**Can't find API key?**
- Check the provider's documentation
- Look in Settings/API/Keys section
- Some providers require email verification first

**RPC URL not working?**
- Verify you copied the full HTTPS URL
- Check if you selected the correct network
- Ensure your account is active (not suspended)

**WalletConnect not connecting?**
- Verify Project ID is correct
- Check homepage URL matches your deployment
- Ensure project is active in WalletConnect dashboard

**Need help?**
- Check provider documentation
- Contact provider support
- Review Netlify build logs for errors

---

## Estimated Time

- Supabase: ✅ Already done (0 min)
- RPC Provider: 10-15 minutes
- WalletConnect: 5 minutes
- Gelato: 5 minutes (optional)
- Block Explorers: 10 minutes (optional)
- Contract Deployment: 30-60 minutes (later)
- Adding to Netlify: 5-10 minutes

**Total:** ~30-45 minutes for required variables

---

Good luck with your deployment! 🚀

