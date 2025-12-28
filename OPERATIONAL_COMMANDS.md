# FinPro Operational Commands & Startup Guide

## TABLE OF CONTENTS

1. Quick Start Commands
2. Detailed Step-by-Step Instructions
3. Troubleshooting Commands
4. Monitoring Commands
5. Emergency Procedures
6. Maintenance Commands

---

## 1. QUICK START COMMANDS

### For Local Development (Testing Only)

Terminal 1 - Blockchain:
```
anvil --host 0.0.0.0 --port 8545 --accounts 10 --chain-id 31337
```

Terminal 2 - Deploy Contracts:
```
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

Terminal 3 - Start Frontend:
```
npm run dev
```

App available at: http://localhost:5174

---

### For Production - Testnet (Staging)

Step 1 - Deploy Contracts to Sepolia:
```
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

Step 2 - Verify Contracts on Etherscan:
```
npx hardhat verify --network sepolia 0xContractAddress
```

Step 3 - Update Frontend Configuration:
Edit src/react-app/lib/config.ts and update contract addresses to Sepolia addresses

Step 4 - Deploy Frontend to Vercel:
Push to main branch and Vercel will auto-deploy

Step 5 - Verify Deployment:
Visit https://fin1pro.vercel.app and confirm page loads

---

### For Production - Mainnet (Live)

WARNING: Mainnet deployment is permanent and costs real ETH. Verify extensively on testnet first.

Step 1 - Deploy Contracts to Mainnet:
```
cd contracts
npx hardhat run scripts/deploy.ts --network mainnet
```

Step 2 - Wait for Deployment Confirmation:
Deployment takes 10-15 minutes. Monitor on Etherscan.

Step 3 - Verify Contracts on Etherscan:
```
npx hardhat verify --network mainnet 0xContractAddress
```

Step 4 - Update Frontend Configuration:
Edit src/react-app/lib/config.ts and update contract addresses to Mainnet addresses

Step 5 - Deploy Frontend to Vercel:
Push to main branch with updated addresses

Step 6 - Go Live:
Visit https://fin1pro.vercel.app and confirm everything works

---

## 2. DETAILED STEP-BY-STEP INSTRUCTIONS

### Setting Up Environment Variables

Step 1 - Get API Keys
```
Visit Alchemy: https://alchemy.com
Create account if needed
Create app for Sepolia testnet
Create app for Ethereum mainnet
Copy the RPC URLs
```

Step 2 - Get Etherscan API Key
```
Visit Etherscan: https://etherscan.io
Create account
Go to API Keys section
Generate new API key
Copy the key
```

Step 3 - Create Deployment Wallet
```
Option A - Use MetaMask
Open MetaMask
Create new account
Click to reveal private key
Copy the private key

Option B - Use Command Line
npx hardhat accounts
(Note the first account and its private key)
```

Step 4 - Fund Deployment Wallet for Testnet
```
For Sepolia testnet:
Visit https://www.alchemy.com/faucets/ethereum
Connect wallet
Claim testnet ETH
Should receive 0.5 ETH
```

Step 5 - Add Variables to .env File
```
Open .env file in project root
Add these lines:

PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
VITE_APP_URL=https://fin1pro.vercel.app
NODE_ENV=production
```

Step 6 - Verify .env File
```
Do NOT commit .env to git (already in .gitignore)
Verify file has no syntax errors
Verify all required variables are present
Test by running: npm run build
```

---

### Deploying Smart Contracts to Testnet

Step 1 - Verify Contract Code Compiles
```
cd contracts
npm run compile
```

Expected output: "Nothing to compile" or successful compilation

Step 2 - Run Contract Tests
```
npm test
```

Expected output: 19 passing tests

Step 3 - Deploy to Sepolia
```
npx hardhat run scripts/deploy.ts --network sepolia
```

Expected output:
```
Deploying FinPro Smart Contracts...
Deploying contracts with account: 0x...
FIN Token deployed to: 0x...
Project Escrow deployed to: 0x...
FIN Swap deployed to: 0x...
MultiSigWallet deployed to: 0x...
```

Step 4 - Record Contract Addresses
Save this output somewhere secure:
- FIN Token address
- Project Escrow address
- FIN Swap address
- MultiSigWallet address
- Admin account address

Step 5 - Wait for Confirmations
```
Monitor on Etherscan Sepolia:
Visit https://sepolia.etherscan.io
Search for your wallet address
Wait until all transactions show 12+ confirmations
```

Step 6 - Verify on Etherscan
```
For each contract address:
npx hardhat verify --network sepolia 0xContractAddress

Expected output: Successfully verified contract
```

---

### Updating Frontend Configuration

Step 1 - Open Config File
```
Edit: src/react-app/lib/config.ts
```

Step 2 - Replace Contract Addresses
```
Find section: "Contract Addresses (Local Anvil)"

Replace with your Sepolia addresses:

contracts: {
    finToken: '0xYourSepioliaFINTokenAddress',
    projectEscrow: '0xYourSepioliaProjectEscrowAddress',
    finSwap: '0xYourSepoliaFINSwapAddress',
    multiSigWallet: '0xYourSepoliaMultiSigWalletAddress',
},
```

Step 3 - Verify Syntax
```
npm run build
```

Should compile without errors

Step 4 - Commit Changes
```
git add src/react-app/lib/config.ts
git commit -m "Update contract addresses for Sepolia testnet"
git push origin main
```

Step 5 - Verify Vercel Deployment
```
Visit https://fin1pro.vercel.app
Check browser console (F12) for errors
Test Web3 connection (should detect wallet)
```

---

### Setting Up Telegram Bot for Production

Step 1 - Verify Bot Token
```
Your bot token: 8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54

Test the token:
curl https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/getMe

Expected response:
{
  "ok": true,
  "result": {
    "id": 8490080324,
    "is_bot": true,
    "first_name": "FinPro",
    ...
  }
}
```

Step 2 - Set Webhook URL
```
For Sepolia/Testnet:
curl -X POST https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/setWebhook \
  -F "url=https://fin1pro.vercel.app/webhook" \
  -F "allowed_updates=message,callback_query"

For Mainnet (same URL or custom domain):
curl -X POST https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/setWebhook \
  -F "url=https://yourdomain.com/webhook" \
  -F "allowed_updates=message,callback_query"
```

Step 3 - Verify Webhook
```
curl https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/getWebhookInfo

Expected response:
{
  "ok": true,
  "result": {
    "url": "https://fin1pro.vercel.app/webhook",
    "has_custom_certificate": false,
    "pending_count": 0,
    "ip_address": "...",
    "last_error_date": null,
    "last_error_message": null
  }
}
```

Step 4 - Register Bot Commands
```
curl -X POST https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/setMyCommands \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Initialize and link account"},
      {"command": "projects", "description": "View your projects"},
      {"command": "tasks", "description": "View your assigned tasks"},
      {"command": "profile", "description": "View your profile"},
      {"command": "stats", "description": "Platform statistics"},
      {"command": "help", "description": "Show help message"},
      {"command": "ping", "description": "Check bot status"}
    ]
  }'
```

Step 5 - Test Bot in Telegram
```
1. Open Telegram
2. Search for your bot username
3. Send /start command
4. Verify you receive response
5. Test other commands
6. Check Vercel logs for webhook calls
```

---

### Deploying Frontend to Vercel

Step 1 - Connect GitHub to Vercel
```
Visit https://vercel.com
Click "New Project"
Select your GitHub repository
Vercel will auto-configure
```

Step 2 - Configure Environment Variables
```
In Vercel dashboard:
1. Go to Settings
2. Go to Environment Variables
3. Add:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_APP_URL (for production)
   - NODE_ENV=production
```

Step 3 - Deploy
```
Push to main branch:
git push origin main

Vercel will automatically:
- Build the project
- Run tests
- Deploy to production
- Assign domain
- Enable SSL/TLS
```

Step 4 - Monitor Deployment
```
In Vercel dashboard:
1. Go to Deployments
2. Watch build progress
3. Wait for "Ready" status
4. Takes 3-5 minutes typically
```

Step 5 - Verify Deployment
```
Visit https://fin1pro.vercel.app
Check page loads without errors
Open browser console (F12)
Verify no critical errors
Test Web3 connection
```

---

## 3. TROUBLESHOOTING COMMANDS

### Verify Blockchain Connection

```
Test RPC connectivity:
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

Expected response: "result":"0x7a69" (for Sepolia)
```

### Check Contract Deployment Status

```
Check if contract exists on Sepolia:
curl https://sepolia.etherscan.io/api \
  ?module=account \
  &action=txlist \
  &address=0xContractAddress \
  &startblock=0 \
  &endblock=99999999 \
  &sort=asc

If contract exists, you'll see transaction history
```

### Verify Telegram Webhook

```
Check webhook status:
curl https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/getWebhookInfo | jq .

jq helps format JSON response for readability
```

### Check Vercel Deployment Logs

```
In Vercel dashboard:
1. Go to Deployments
2. Click on deployment
3. Go to Logs
4. View build output
5. View runtime logs for errors
```

### Check Supabase Connection

```
In Supabase dashboard:
1. Go to SQL Editor
2. Run: SELECT NOW();
3. If responds with current time, connection OK

Check authentication:
SELECT COUNT(*) FROM public.telegram_users;
```

### Debug Frontend Issues

```
Browser Console:
1. Open F12
2. Go to Console tab
3. Look for red errors
4. Check Network tab for failed requests
5. Check Application tab for stored data
```

---

## 4. MONITORING COMMANDS

### Monitor Contract Interactions

```
View recent transactions:
curl https://sepolia.etherscan.io/api \
  ?module=account \
  &action=txlist \
  &address=0xProjectEscrowAddress \
  &startblock=latest \
  &endblock=latest \
  &sort=desc \
  &apikey=YOUR_ETHERSCAN_KEY
```

### Monitor Database

```
In Supabase:
1. Go to Home
2. Check "Requests" (API usage)
3. Check "Storage" (database size)
4. Check "Realtime" (active connections)
5. Check "Logs" (query performance)
```

### Monitor Telegram Bot

```
Check bot updates:
curl https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/getUpdates \
  -H "Content-Type: application/json"

Shows recent messages received by bot
Use offset parameter to skip older updates
```

### Monitor Vercel Analytics

```
In Vercel dashboard:
1. Go to Analytics
2. View:
   - Page views
   - Unique visitors
   - Core Web Vitals
   - Response times
   - Error rates
3. Set up alerts for threshold breaches
```

---

## 5. EMERGENCY PROCEDURES

### Emergency - Pause Application

If critical issue found and need to take app offline:

```
Option 1: Pause via Vercel
1. Go to Vercel dashboard
2. Go to Settings
3. Go to Domains
4. Disable domain
5. Users see 404

Option 2: Maintenance Page
1. Create public/maintenance.html
2. Redirect root to maintenance page
3. Deploy
4. Users see maintenance message
```

### Emergency - Pause Telegram Bot

If bot is spamming or malfunctioning:

```
Stop receiving updates:
curl -X POST https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/deleteWebhook

Bot will stop responding immediately

Resume later:
curl -X POST https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/setWebhook \
  -F "url=https://fin1pro.vercel.app/webhook"
```

### Emergency - Rollback Frontend

If broken deployment detected:

```
In Vercel dashboard:
1. Go to Deployments
2. Find last working deployment
3. Click deployment
4. Click "Promote to Production"
5. Takes 30 seconds to revert
```

### Emergency - Database Restore

If database corruption detected:

```
In Supabase:
1. Go to Database
2. Go to Backups
3. Click restore from backup
4. Choose point in time
5. Confirm restoration

Data restored to that point
```

---

## 6. MAINTENANCE COMMANDS

### Weekly Maintenance

```
Check for dependency updates:
npm outdated

Update dependencies:
npm update

Update dev dependencies:
npm update --save-dev

Audit for vulnerabilities:
npm audit

Fix auto-fixable vulnerabilities:
npm audit fix
```

### Monthly Maintenance

```
Update Ethereum nodes:
# No action needed for Alchemy (managed)

Review Supabase usage:
# Check in Supabase dashboard

Review Vercel analytics:
# Check in Vercel dashboard

Check contract health:
curl https://sepolia.etherscan.io/api \
  ?module=stats \
  &action=tokensupply \
  &contractaddress=0xFINTokenAddress \
  &apikey=YOUR_ETHERSCAN_KEY
```

### Quarterly Maintenance

```
Security audit:
npm audit

Code review of changes:
git log --oneline

Check contract gas efficiency:
cd contracts
npx hardhat run scripts/estimateGas.ts

Plan infrastructure upgrades based on:
- User growth
- Database size
- API usage
- Transaction volume
```

### Backup Procedures

```
Database backups (automatic in Supabase):
- Daily automatic backups
- 7-day retention
- Restore to any point in time

Code backups:
- GitHub is your backup
- All code versioned
- Easy recovery from any commit

Contract state:
- Immutable on blockchain
- No backup needed
- Queryable via Etherscan
```

---

## PRODUCTION READINESS VERIFICATION

Before Going Live, Verify All:

```
Blockchain:
curl -X POST https://sepolia.eth.rpc.alchemyapi.io/v2/YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

Response should show block number

Contracts:
curl https://sepolia.etherscan.io/api \
  ?module=account \
  &action=balance \
  &address=0xContractAddress \
  &tag=latest

Response should show contract address balance

Telegram:
curl https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/getMe

Response should show bot information

Database:
In Supabase, query: SELECT COUNT(*) FROM public.projects;

Should return number of projects

Frontend:
curl https://fin1pro.vercel.app

Should return HTML (page loads)
```

---

## QUICK REFERENCE

Command Quick Links:

Deploy Testnet: cd contracts && npx hardhat run scripts/deploy.ts --network sepolia
Deploy Mainnet: cd contracts && npx hardhat run scripts/deploy.ts --network mainnet
Run Tests: cd contracts && npm test
Build Frontend: npm run build
Start Dev Server: npm run dev
Check Telegram: curl https://api.telegram.org/bot[TOKEN]/getMe
Verify Supabase: In Supabase dashboard > SQL Editor > SELECT 1;
Check Vercel: Visit https://fin1pro.vercel.app

---

## SUPPORT CONTACTS

For issues during deployment:

Alchemy Support: https://alchemy.com/support
Etherscan Support: https://etherscan.io/contactus
Telegram Bot API: https://core.telegram.org/bots/api-support
Supabase Support: https://supabase.com/support
Vercel Support: https://vercel.com/support

---

This guide covers all operational commands needed to deploy and maintain FinPro in production.

For questions, refer to the full PRODUCTION_DEPLOYMENT_GUIDE.md file.
