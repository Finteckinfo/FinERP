# Simplified TON Contract Deployment Guide

Since we're encountering issues with the local Tact compiler setup, here are alternative approaches:

## Option 1: Use TON Online IDE (Recommended for Quick Start)

1. **Visit TON IDE**: https://ide.nujan.io/

2. **Create New Project**:
   - Click "New Project"
   - Select "Tact" as language
   - Name it "DataRegistry"

3. **Copy Contract Code**:
   - Copy the contents from `contracts/ton/DataRegistry.tact`
   - Paste into the online IDE

4. **Compile**:
   - Click "Build" button
   - Wait for compilation to complete
   - Download the compiled files (BOC)

5. **Deploy**:
   - Click "Deploy" in the IDE
   - Connect your TON wallet (Tonkeeper)
   - Confirm deployment transaction
   - **Save the contract address**

6. **Update Environment**:
   ```bash
   # Add to .env
   VITE_TON_DATA_REGISTRY_ADDRESS=EQD_your_contract_address_here
   ```

---

## Option 2: Use Blueprint Without Local Compilation

Since the local setup is having issues, let's use a pre-configured approach:

```bash
# Create a separate directory for TON deployment
cd ~
npx create-ton@latest finpro-ton --type tact-empty --contractName DataRegistry

# Navigate to the project
cd finpro-ton

# Replace the contract file
# Copy your DataRegistry.tact content to contracts/data_registry.tact

# Build
npm run build

# Deploy to testnet
npm run deploy:testnet
```

---

## Option 3: Manual Deployment (For Production)

If you need more control, here's a manual deployment script:

### Step 1: Install Dependencies in Separate Project

```bash
# Create isolated deployment folder
mkdir ~/ton-deploy
cd ~/ton-deploy
npm init -y
npm install @ton/core @ton/ton ton-crypto
```

### Step 2: Create Deployment Script

Create `deploy.js`:

```javascript
const { TonClient, WalletContractV4, internal } = require('@ton/ton');
const { mnemonicToPrivateKey } = require('ton-crypto');
const fs = require('fs');

async function deploy() {
  // 1. Connect to TON
  const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  });

  // 2. Load wallet from mnemonic
  const mnemonic = process.env.TON_MNEMONIC.split(' ');
  const key = await mnemonicToPrivateKey(mnemonic);
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  
  // 3. Load compiled contract (BOC file from online IDE)
  const contractCode = fs.readFileSync('./DataRegistry.boc');
  
  // 4. Deploy
  const contract = client.open(wallet);
  await contract.sendTransfer({
    secretKey: key.secretKey,
    messages: [internal({
      to: contractAddress,
      value: '0.05',
      init: {
        code: contractCode,
        data: beginCell().endCell()
      }
    })]
  });
  
  console.log('Contract deployed!');
}

deploy().catch(console.error);
```

---

## Recommended Quick Path

For immediate testing, I recommend **Option 1 (Online IDE)**:

1. Go to https://ide.nujan.io/
2. Create new Tact project
3. Paste the DataRegistry contract code
4. Click "Build" then "Deploy"
5. Connect Tonkeeper wallet
6. Confirm deployment
7. Copy contract address to `.env`

This will get you up and running in 5 minutes without any local setup issues.

---

## Alternative: Skip TON for Initial Testing

If you want to test the core functionality first:

1. **Test with EVM only**:
   - The system works fine with just EVM
   - TON replication is optional
   - Verification badge will show only EVM checkmark

2. **Add TON later**:
   - Deploy TON contract when ready
   - Update environment variable
   - System will automatically start replicating

The dual-chain architecture is designed to be resilient - if TON wallet isn't connected or contract isn't deployed, the system continues working with just EVM.

---

## Testing Without TON Contract

You can test the complete flow right now:

```bash
# 1. Start local environment
npm run dev

# 2. Connect only EVM wallet (MetaMask)

# 3. Create a project
# - Will complete successfully
# - Data stored on EVM + Supabase
# - TON replication skipped (logged as warning)

# 4. Verify
# - Project appears in dashboard
# - Verification badge shows EVM checkmark only
# - Chat creation still works
```

This lets you validate everything except TON replication immediately.
