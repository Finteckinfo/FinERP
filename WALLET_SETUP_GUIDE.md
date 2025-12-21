# MetaMask & Wallet Setup Guide for FinPro

Complete step-by-step guide to set up MetaMask and connect to FinPro.

---

## Table of Contents

1. [Install MetaMask](#step-1-install-metamask)
2. [Create or Import Wallet](#step-2-create-or-import-wallet)
3. [Connect to Sepolia Testnet](#step-3-connect-to-sepolia-testnet)
4. [Get Test ETH from Faucet](#step-4-get-test-eth-from-faucet)
5. [Connect Wallet to FinPro](#step-5-connect-wallet-to-FinPro)
6. [Add FIN Token to MetaMask](#step-6-add-fin-token-to-metamask)
7. [Troubleshooting](#troubleshooting)

---

## Step 1: Install MetaMask

### For Chrome/Brave/Edge:

1. Open your browser and go to: **https://metamask.io/download/**
2. Click **"Install MetaMask for Chrome"**
3. Click **"Add to Chrome"** in the Chrome Web Store
4. Click **"Add Extension"** in the popup
5. MetaMask fox icon will appear in your browser toolbar

### For Firefox:

1. Go to: **https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/**
2. Click **"Add to Firefox"**
3. Click **"Add"** in the popup

### Verify Installation:

- Look for the  fox icon in your browser toolbar
- Click it to open MetaMask

---

## Step 2: Create or Import Wallet

### Creating a New Wallet:

1. Click the MetaMask extension icon
2. Click **"Get Started"**
3. Click **"Create a Wallet"**
4. Create a strong password (min 8 characters)
5. Click **"Create"**
6. **IMPORTANT:** Write down your Secret Recovery Phrase (12 words)
   - Store it safely offline
   - Never share it with anyone
   - You'll need it to recover your wallet
7. Confirm your recovery phrase by selecting words in order
8. Click **"All Done"**

### Importing an Existing Wallet:

1. Click the MetaMask extension icon
2. Click **"Get Started"**
3. Click **"Import Wallet"**
4. Enter your 12-word recovery phrase
5. Create a new password
6. Click **"Import"**

---

## Step 3: Connect to Sepolia Testnet

### Method 1: Using Chainlist (Recommended)

1. Go to: **https://chainlist.org/**
2. Search for **"Sepolia"**
3. Click **"Connect Wallet"** (top right)
4. Approve the connection in MetaMask
5. Find **"Sepolia"** in the list
6. Click **"Add to MetaMask"**
7. Approve in MetaMask popup

### Method 2: Manual Configuration

1. Click MetaMask extension icon
2. Click the network dropdown (shows "Ethereum Mainnet")
3. Click **"Show test networks"** toggle (if not visible, go to Settings > Advanced > Show test networks)
4. Select **"Sepolia"**

**OR** Add manually:

1. Click network dropdown → **"Add Network"**
2. Click **"Add a network manually"**
3. Enter these details:

| Field | Value |
|-------|-------|
| Network Name | Sepolia |
| New RPC URL | `https://rpc.sepolia.org` |
| Chain ID | `11155111` |
| Currency Symbol | `SepoliaETH` |
| Block Explorer URL | `https://sepolia.etherscan.io` |

4. Click **"Save"**

### Alternative RPC URLs (if main one is slow):

```
https://rpc.sepolia.org
https://rpc2.sepolia.org
https://ethereum-sepolia.publicnode.com
https://eth-sepolia.g.alchemy.com/v2/demo
```

---

## Step 4: Get Test ETH from Faucet

You need test ETH to pay for transaction fees (gas). Here are working faucets:

### Faucet Options (2024):

#### 1. Alchemy Sepolia Faucet (Recommended)
- **URL:** https://www.alchemy.com/faucets/ethereum-sepolia
- **Amount:** 0.5 ETH per day
- **Requirements:** Free Alchemy account
- **Steps:**
  1. Create free account at alchemy.com
  2. Go to faucet page
  3. Paste your wallet address
  4. Click "Send Me ETH"

#### 2. Infura Sepolia Faucet
- **URL:** https://www.infura.io/faucet/sepolia
- **Amount:** 0.5 ETH per day
- **Requirements:** Free Infura account

#### 3. QuickNode Sepolia Faucet
- **URL:** https://faucet.quicknode.com/ethereum/sepolia
- **Amount:** 0.1 ETH per request
- **Requirements:** Free QuickNode account

#### 4. Google Cloud Sepolia Faucet
- **URL:** https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- **Amount:** 0.05 ETH per day
- **Requirements:** Google account

#### 5. Chainlink Faucet
- **URL:** https://faucets.chain.link/sepolia
- **Amount:** 0.1 ETH
- **Requirements:** None (may require GitHub login)

### How to Get Your Wallet Address:

1. Click MetaMask extension icon
2. Your address is shown at the top (starts with `0x...`)
3. Click to copy the full address
4. Paste into faucet

### Verify Receipt:

1. After requesting, wait 30 seconds to 2 minutes
2. Check MetaMask - balance should update
3. Or check on Etherscan: `https://sepolia.etherscan.io/address/YOUR_ADDRESS`

---

## Step 5: Connect Wallet to FinPro

### Prerequisites:
-  MetaMask installed
-  Connected to Sepolia network
-  Have some test ETH (at least 0.01 ETH)

### Connection Steps:

1. **Start FinPro Application:**
   ```bash
   cd /home/c0bw3b/FinPro
   npm run dev
   ```

2. **Open Application:**
   - Go to: `http://localhost:5174`

3. **Connect Wallet:**
   - Click **"Get Started"** or **"Create a Project"**
   - MetaMask popup will appear
   - Click **"Connect"** to approve connection
   - Select the account(s) you want to connect
   - Click **"Next"** then **"Confirm"**

4. **Verify Connection:**
   - You should see your wallet address in the header
   - You'll be redirected to the Dashboard
   - Your FIN token balance will be displayed

### If Popup Doesn't Appear:

1. Click MetaMask icon in toolbar
2. Look for pending connection request
3. If none, refresh the FinPro page and try again

---

## Step 6: Add FIN Token to MetaMask

To see your FIN token balance in MetaMask:

### Method 1: Auto-Add (If Deployed)

1. Go to FinPro Dashboard
2. Click on FIN balance widget
3. Click **"Add FIN to MetaMask"** (if available)
4. Approve in MetaMask popup

### Method 2: Manual Add

1. Open MetaMask
2. Click **"Import tokens"** at the bottom
3. Select **"Custom token"** tab
4. Enter token details:

For **Sepolia** (after deployment):
```
Token Contract Address: [YOUR_DEPLOYED_FIN_TOKEN_ADDRESS]
Token Symbol: FIN
Token Decimals: 18
```

5. Click **"Add Custom Token"**
6. Click **"Import Tokens"**

### Get FIN Tokens for Testing:

After smart contracts are deployed, you can:

1. **Use Test Token Faucet:**
   ```bash
   cd contracts
   npx hardhat run scripts/mintTestTokens.ts --network sepolia
   ```

2. **Or swap on FINSwap DEX** (if liquidity exists)

---

## Troubleshooting

### MetaMask Won't Install

**Problem:** Extension won't install
**Solutions:**
- Try a different browser (Chrome, Brave, Firefox)
- Clear browser cache
- Disable conflicting extensions
- Check you're on official metamask.io site

### Can't Connect to Sepolia

**Problem:** Network connection fails
**Solutions:**
- Try different RPC URL
- Check internet connection
- Clear MetaMask cache: Settings > Advanced > Clear activity tab data

### Faucet Not Working

**Problem:** No ETH received from faucet
**Solutions:**
- Wait 2-5 minutes (sometimes slow)
- Try a different faucet
- Check you're on correct network
- Some faucets have 24-hour limits
- Verify address is correct

### MetaMask Not Detected by FinPro

**Problem:** App says "MetaMask not detected"
**Solutions:**
1. Refresh the page (Ctrl+R / Cmd+R)
2. Make sure MetaMask is unlocked
3. Check MetaMask is enabled for the site:
   - Click MetaMask icon
   - Click three dots menu
   - Click "Connected sites"
   - Ensure localhost is listed
4. Try disconnecting and reconnecting

### Transaction Stuck

**Problem:** Transaction pending forever
**Solutions:**
1. In MetaMask, click the pending transaction
2. Click "Speed Up" and add more gas
3. Or click "Cancel" and retry
4. If stuck, reset account: Settings > Advanced > Reset Account

### Wrong Network Warning

**Problem:** App shows wrong network warning
**Solutions:**
1. Click MetaMask icon
2. Click network dropdown
3. Select "Sepolia"
4. Refresh FinPro page

---

## Quick Reference

### Sepolia Network Details

| Property | Value |
|----------|-------|
| Network Name | Sepolia |
| Chain ID | 11155111 |
| Currency | SepoliaETH |
| RPC URL | https://rpc.sepolia.org |
| Explorer | https://sepolia.etherscan.io |

### MetaMask Shortcuts

| Action | Steps |
|--------|-------|
| Copy Address | Click address in MetaMask |
| Switch Network | Click network name dropdown |
| View on Explorer | Click "View on block explorer" |
| Reset Account | Settings > Advanced > Reset |

### Useful Links

- **MetaMask Download:** https://metamask.io/download/
- **Sepolia Etherscan:** https://sepolia.etherscan.io
- **Chainlist:** https://chainlist.org
- **Alchemy Faucet:** https://www.alchemy.com/faucets/ethereum-sepolia

---

## Next Steps After Setup

Once your wallet is connected:

1. **View Dashboard** - See your FIN balance and project stats
2. **Create Project** - Start a new project with escrow funding
3. **Try DEX Swap** - Exchange tokens using FINSwap
4. **Explore Features** - Check out tasks, payments, and team management

---

**Authored by Llakterian**

*Need help? Check the main [WORKFLOW.md](./WORKFLOW.md) documentation or open an issue on GitHub.*

