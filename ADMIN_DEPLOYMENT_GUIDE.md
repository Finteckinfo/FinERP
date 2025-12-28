# FinPro Admin Deployment & User Setup Guide

**Last Updated:** December 29, 2025  
**Status:** Production-Ready

---

## Table of Contents

1. [Quick Overview](#quick-overview)
2. [Admin Responsibilities](#admin-responsibilities)
3. [Phase 1: Local/Testnet Setup](#phase-1-localtestnet-setup)
4. [Phase 2: Token Deployment](#phase-2-token-deployment)
5. [Phase 3: User Setup Requirements](#phase-3-user-setup-requirements)
6. [Phase 4: Mainnet Deployment](#phase-4-mainnet-deployment)
7. [Ongoing Admin Tasks](#ongoing-admin-tasks)

---

## Quick Overview

**The Good News:** Users do NOT need pre-funded wallets. Here's why and what you need to do instead:

### Your Role (Admin)
- Deploy smart contracts (one-time)
- Distribute initial FIN tokens to users
- Monitor system health
- Handle disputes

### User Role
- Download wallet (MetaMask)
- Click "Start" in Telegram Mini App
- Wallet auto-connects
- Create projects and receive tokens

**You control the token flow** - users cannot get FIN tokens without your approval or completing tasks.

---

## Admin Responsibilities

### ✅ One-Time Setup (Do Once)

| Task | Effort | Time | Cost |
|------|--------|------|------|
| Deploy contracts to Sepolia | 5 min | 2 min | ~$50 (gas) |
| Mint initial FIN tokens (100M) | 2 min | 1 min | Free (already minted) |
| Configure Telegram webhook | 2 min | 1 min | Free |
| Set up RLS on Supabase | 5 min | 3 min | Free |
| Create admin account | 5 min | 2 min | Free |

**Total Setup Time: ~15 minutes**

### 🔄 Ongoing Tasks (Regular)

| Task | Frequency | Effort | Time |
|------|-----------|--------|------|
| Approve project requests | Daily/Weekly | 1-2 min | Per request |
| Distribute FIN tokens to users | Weekly | 5 min | Batch operation |
| Monitor Telegram bot logs | Daily | 2 min | Check health |
| Review project escrows | Weekly | 10 min | Audit |
| Handle user disputes | As needed | 15 min | Per issue |
| Backup database | Weekly | 1 min | Automated |

---

## Phase 1: Local/Testnet Setup

### 1.1 Deploy to Local Anvil (Testing)

```bash
cd /home/c0bw3b/FinPro/contracts

# Start Anvil blockchain
anvil --fork-url https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# In another terminal, deploy contracts
npm run deploy

# Output will show contract addresses
```

**Expected Output:**
```
FIN Token deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Project Escrow deployed to: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
FINSwap deployed to: 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
MultiSigWallet deployed to: 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
```

### 1.2 Update Configuration

Copy addresses to `src/react-app/lib/config.ts`:

```typescript
contracts: {
    finToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    projectEscrow: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    finSwap: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    multiSigWallet: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
}
```

### 1.3 Verify Deployment

```bash
# Run tests to verify all contracts work
cd /home/c0bw3b/FinPro/contracts
npm test

# All 33 tests should pass
```

---

## Phase 2: Token Deployment

### Current Token Status

**FIN Token (ERC20 Token):**
- Total Supply: 100,000,000 FIN
- Decimals: 18
- Status: Already minted in contracts
- Owner: Deployment wallet (you)

### 2.1 Mint Tokens (Not Needed Yet)

The token is already minted during deployment. You don't need to mint again unless you want to increase supply.

```bash
# To mint 1,000,000 new FIN tokens to your wallet
cd /home/c0bw3b/FinPro/contracts

# Create a script or use ethers.js to call:
# finToken.mint(YOUR_ADDRESS, ethers.parseEther("1000000"))
```

### 2.2 Distribute Initial Tokens to Users

**Option A: Direct Transfer (Simple)**
```bash
# Transfer tokens to user wallets
ethers.sendTransaction({
    to: userWalletAddress,
    value: ethers.parseEther("100") // 100 FIN tokens
})
```

**Option B: Faucet Smart Contract (Recommended)**

Use the built-in `TestTokenFaucet.sol` for testing:

```bash
npm run deployFaucet

# Users can then claim tokens via the dApp
```

**Option C: Admin Panel (Future Feature)**

Create an admin dashboard to:
1. Input user wallet address
2. Input token amount
3. Click "Distribute"
4. Tokens sent automatically

### 2.3 Token Economics

**Suggested Token Allocation:**

```
Total Supply: 100,000,000 FIN
├─ Team Reserve: 10,000,000 (10%)
├─ Marketing: 10,000,000 (10%)
├─ Community Rewards: 30,000,000 (30%)
├─ Liquidity Pool: 20,000,000 (20%)
└─ Operations: 30,000,000 (30%)
```

---

## Phase 3: User Setup Requirements

### 3.1 What Users Need

**Minimum Requirements:**
- [ ] A web browser (Chrome, Firefox, Safari, Edge)
- [ ] Telegram installed
- [ ] MetaMask wallet (auto-prompted)
- [ ] No pre-funded wallet needed

**User Can Start With:**
- [ ] Zero ETH (no gas needed - you pay for them)
- [ ] Zero FIN tokens (you distribute)
- [ ] Just a wallet address

### 3.2 User Onboarding Flow

```
1. User opens Telegram
2. Searches for @FinProBot
3. Clicks /start command
4. Mini App opens → React dApp
5. MetaMask auto-connects (if not, user clicks "Connect")
6. User sees profile with wallet address
7. User can create projects
8. Admin approves and funds
9. User completes tasks
10. Gets paid in FIN tokens
```

### 3.3 User Setup Instructions to Share

**For Non-Technical Users:**

```
STEP 1: Download MetaMask
- Go to metamask.io
- Click "Install"
- Create new wallet
- Save seed phrase safely

STEP 2: Open Telegram
- Search for @FinProBot
- Send /start
- Wait for Mini App to load

STEP 3: Connect Wallet
- If prompted, click "Connect MetaMask"
- Approve in MetaMask popup
- You're ready to work!

STEP 4: Create Profile
- Click "Profile" in the app
- Add your name and bio
- Save

STEP 5: Browse Projects
- Click "Projects" tab
- View available projects
- Click a project to see tasks
- Accept a task to start work
```

### 3.4 No Gas Fees?

**How it works:**

1. User creates a transaction (e.g., submit work)
2. You (admin) pay the gas fee via Vercel serverless function
3. User sees instant confirmation
4. No wallet fees charged to user

**This requires:**
- Vercel function with ETH balance (your cost)
- Account Abstraction paymaster contract
- TokenPaymaster configured (already done)

---

## Phase 4: Mainnet Deployment

### 4.1 Pre-Mainnet Checklist

- [ ] All 33 tests passing locally ✅
- [ ] Security audit completed ✅
- [ ] 1-week testnet validation
- [ ] External audit recommended (2-3 weeks, $5k-15k)
- [ ] Legal review (jurisdiction-dependent)

### 4.2 Sepolia Testnet Deployment

**Get Sepolia Testnet ETH:**

```bash
# 1. Get Alchemy API key
https://www.alchemy.com

# 2. Add to .env
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# 3. Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# 4. Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

**Cost:** ~$50-100 in testnet ETH (you can get free from faucets)

### 4.3 Mainnet Deployment

**Prerequisites:**
- External audit completed
- Legal compliance confirmed
- $10,000+ ETH for gas and initial operations
- Team ready for 24/7 support

**Deployment:**
```bash
# 1. Configure mainnet in hardhat.config.ts
# 2. Get mainnet RPC and private key
# 3. Deploy with:
npx hardhat run scripts/deploy.ts --network mainnet

# 4. Verify on Etherscan (forever public record)
```

**Estimated Costs:**
- Contract deployment: $3,000-5,000
- Initial liquidity: $5,000-10,000
- Ongoing gas fees: $100-500/month

---

## Ongoing Admin Tasks

### Daily (5 minutes)

```bash
# 1. Check bot health
pm2 logs finpro-bot | tail -20

# 2. Monitor Telegram messages
# Check for error reports or user complaints

# 3. Verify Vercel is up
curl https://fin1pro.vercel.app
```

### Weekly (30 minutes)

```bash
# 1. Approve pending projects
# Go to Supabase dashboard
# Check projects table for pending approvals
UPDATE projects SET status = 'approved' WHERE id = 'project_id';

# 2. Distribute tokens to active users
# Batch transfer to wallets
ethers.sendTransaction({
    to: batchUserAddresses,
    value: ethers.parseEther("10") // 10 FIN per user
})

# 3. Review completed tasks
SELECT * FROM subtasks WHERE status = 'completed' ORDER BY completed_at DESC;

# 4. Backup database
# Supabase auto-backups daily, verify:
# Dashboard → Settings → Backups
```

### Monthly (1-2 hours)

```bash
# 1. Security audit of contract interactions
# Review all transactions
SELECT * FROM token_transactions ORDER BY created_at DESC LIMIT 50;

# 2. Update documentation
# Add new features, known issues, FAQs

# 3. Performance review
# Check database size, query performance
# Monitor Vercel bandwidth usage

# 4. User feedback analysis
# Compile issues and feature requests
# Plan improvements
```

---

## Detailed Task: Distributing Tokens to Users

### Method 1: Telegram Command (Recommended)

Create an admin-only command in `telegram-bot/handlers/commands.ts`:

```typescript
case '/distribute':
    // Admin checks if sender is admin
    if (message.from?.id !== ADMIN_TELEGRAM_ID) return;
    
    // Parse: /distribute 0x123...abc 100
    const [, address, amount] = text.split(' ');
    
    // Call smart contract
    const tx = await finToken.transfer(
        address,
        ethers.parseEther(amount)
    );
    
    // Notify user
    await bot.sendMessage(
        chatId,
        `Sent ${amount} FIN to ${address}`
    );
```

### Method 2: Direct Ethers.js Script

```typescript
// distribute-tokens.ts
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const finToken = new ethers.Contract(
    FIN_TOKEN_ADDRESS,
    FIN_TOKEN_ABI,
    signer
);

// Distribute to multiple users
const users = [
    { address: "0x...", amount: "100" },
    { address: "0x...", amount: "50" },
    { address: "0x...", amount: "75" },
];

for (const user of users) {
    const tx = await finToken.transfer(
        user.address,
        ethers.parseEther(user.amount)
    );
    console.log(`Distributed ${user.amount} FIN to ${user.address}`);
}
```

Run with:
```bash
npx ts-node distribute-tokens.ts
```

---

## Detailed Task: Approving Projects

### Database Approval

```sql
-- View pending projects
SELECT id, name, total_funds, owner_id, status, created_at 
FROM projects 
WHERE status = 'pending' 
ORDER BY created_at ASC;

-- Approve a project
UPDATE projects 
SET status = 'approved', approved_at = NOW() 
WHERE id = 'project_id';

-- Reject a project
UPDATE projects 
SET status = 'rejected', approved_at = NOW() 
WHERE id = 'project_id';
```

### Grant Approval Permission

Some users might need approval authority. Grant them the APPROVER role:

```typescript
const APPROVER_ROLE = await projectEscrow.APPROVER_ROLE();
await projectEscrow.grantRole(APPROVER_ROLE, approverWalletAddress);
```

---

## Detailed Task: Handling Payment Disputes

### Scenario 1: User Claims Work Not Paid

```sql
-- Check subtask status
SELECT id, title, assigned_to, status, allocated_amount 
FROM subtasks 
WHERE id = 'subtask_id';

-- Check if payment was made
SELECT * FROM token_transactions 
WHERE from_user = 'admin' 
AND to_user = 'user_id' 
AND subtask_id = 'subtask_id';

-- If not paid, make payment manually
-- (same as distribution steps above)
```

### Scenario 2: Disputed Task Quality

```sql
-- Check reviews
SELECT * FROM subtask_reviews 
WHERE subtask_id = 'subtask_id' 
ORDER BY created_at DESC;

-- Option A: Approve anyway (pay full amount)
UPDATE token_transactions 
SET status = 'approved' 
WHERE subtask_id = 'subtask_id';

-- Option B: Partial payment (negotiate amount)
-- Manual transfer of negotiated amount
```

---

## Contract Addresses Reference

### Localhost/Anvil
```
FIN Token: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Project Escrow: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
FINSwap: 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
MultiSigWallet: 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
```

### Sepolia (After deployment)
```
FIN Token: [DEPLOY AND UPDATE]
Project Escrow: [DEPLOY AND UPDATE]
FINSwap: [DEPLOY AND UPDATE]
MultiSigWallet: [DEPLOY AND UPDATE]
```

### Mainnet (After audit & deployment)
```
FIN Token: [DEPLOY AND UPDATE]
Project Escrow: [DEPLOY AND UPDATE]
FINSwap: [DEPLOY AND UPDATE]
MultiSigWallet: [DEPLOY AND UPDATE]
```

---

## Security Best Practices

### 1. Private Key Management

```bash
# NEVER commit private keys to Git
# Use environment variables only

# For production, use:
# - AWS Secrets Manager
# - Azure Key Vault
# - HashiCorp Vault
# - Hardware wallet (Ledger, Trezor)

# Example production setup:
export ADMIN_PRIVATE_KEY=$(aws secretsmanager get-secret-value \
  --secret-id FinPro/AdminKey \
  --query SecretString --output text)
```

### 2. Multi-Signature Wallet

Set up 3-of-5 multi-sig for mainnet:
```bash
# Use Gnosis Safe (multi-sig wallet)
# https://safe.global

# Add 5 team members as signers
# Require 3 signatures for transactions over $1000
```

### 3. Rate Limiting

Admin actions should have rate limits:

```typescript
// Prevent accidental mass distribution
const maxTokensPerDay = ethers.parseEther("1000000");
const tokensDistributedToday = await checkDailyTotal();

if (tokensDistributedToday + amount > maxTokensPerDay) {
    throw new Error("Daily distribution limit exceeded");
}
```

### 4. Audit Logging

Log all admin actions:

```typescript
// Log to database
await supabase
    .from('admin_actions')
    .insert({
        admin_id: req.user.id,
        action: 'distribute_tokens',
        target: userAddress,
        amount: amount,
        timestamp: new Date(),
        ip_address: req.ip,
    });
```

---

## Troubleshooting

### Problem: Deployment fails with "Insufficient funds"

**Solution:**
```bash
# Get testnet ETH from faucet
# Sepolia: https://sepoliafaucet.com
# Goerli: https://goerlifaucet.com

# Or use Alchemy's faucet
https://www.alchemy.com/faucets/ethereum-sepolia
```

### Problem: Telegram bot not sending messages

```bash
# Check bot logs
pm2 logs finpro-bot | tail -50

# Verify environment variables
grep TELEGRAM .env

# Check webhook URL
# Should be: https://fin1pro.vercel.app/webhook

# Restart bot
pm2 restart finpro-bot
```

### Problem: Users can't connect MetaMask

**Cause:** Wrong chain ID in config

**Solution:**
```typescript
// In src/react-app/lib/config.ts
accountAbstraction: {
    chainId: 11155111, // Sepolia
    // OR
    chainId: 1, // Mainnet (after launch)
}
```

### Problem: Token balances not updating

**Solution:**
```sql
-- Refresh token_balances table
DELETE FROM token_balances;

-- Let the system recalculate on next transaction
-- OR manually update
INSERT INTO token_balances (user_id, balance, last_updated)
SELECT user_id, SUM(amount), NOW()
FROM token_transactions
GROUP BY user_id;
```

---

## Checklist for Production Launch

**4 Weeks Before:**
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Testnet deployment successful
- [ ] Legal review completed

**2 Weeks Before:**
- [ ] Mainnet contracts ready
- [ ] Admin team trained
- [ ] User documentation finalized
- [ ] Support team ready

**1 Week Before:**
- [ ] Final security audit
- [ ] Backup systems verified
- [ ] Monitoring set up
- [ ] Team on-call scheduled

**Launch Day:**
- [ ] Deploy to mainnet
- [ ] Verify all contracts
- [ ] Test with small amount
- [ ] Announce publicly
- [ ] Monitor 24/7

**Post-Launch (1 Month):**
- [ ] Daily security monitoring
- [ ] User feedback collection
- [ ] Performance analysis
- [ ] Bug fix releases

---

## Summary

**You as Admin:**
1. Deploy contracts (one-time, ~15 minutes)
2. Distribute FIN tokens to users (weekly, ~5 minutes)
3. Approve projects (as needed, ~1 minute each)
4. Monitor system health (daily, ~5 minutes)

**Users:**
1. Download MetaMask
2. Open Telegram and message bot
3. Create profile
4. Join projects and complete tasks
5. Get paid in FIN tokens (no gas fees)

**No pre-funded wallets needed** - you control everything through smart contracts.

---

## Questions?

See the related documentation:
- `SETUP_FOR_BEGINNERS.md` - User setup guide
- `SECURITY_AUDIT_REPORT.md` - Security details
- `GASLESS_INTEGRATION_GUIDE.md` - Account Abstraction details

Good luck with your launch! 🚀
