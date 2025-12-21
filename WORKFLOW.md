# FinPro Application Workflow Documentation

A comprehensive guide to understanding and testing the FinPro blockchain-powered ERP system.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Local Development Setup](#local-development-setup)
4. [Wallet Setup](#wallet-setup)
5. [User Workflow](#user-workflow)
6. [Smart Contract Workflow](#smart-contract-workflow)
7. [Testing Guide](#testing-guide)
8. [Environment Configuration](#environment-configuration)
9. [Troubleshooting](#troubleshooting)

>  **For detailed wallet setup instructions, see [WALLET_SETUP_GUIDE.md](./WALLET_SETUP_GUIDE.md)**

---

## System Overview

FinPro is a decentralized Enterprise Resource Planning (ERP) system that leverages blockchain technology for secure, transparent project management and payments. The system combines:

- **FIN Token**: ERC20 token (100M supply, 1:1 USDT peg)
- **Project Escrow**: Secure payment holding with multi-sig approvals
- **FINSwap DEX**: Token exchange with 0.3% fee
- **MultiSig Wallet**: Configurable multi-signature security

### Key Features

| Feature | Description |
|---------|-------------|
| Wallet Integration | MetaMask connection for EVM wallets |
| Project Management | Create, fund, and manage projects with escrow |
| Task Allocation | Assign tasks with FIN token rewards |
| Gasless Transactions | Gelato Network integration |
| Multi-sig Security | Required for payments >10,000 FIN |
| Time-locked Refunds | 24-hour employer protection |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FinPro SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   FRONTEND (Vue 3)                        │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │  │
│  │  │ Dashboard  │ │  Projects  │ │  DEX Interface     │    │  │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │  │
│  │  │ Payments   │ │   Tasks    │ │  Team Management   │    │  │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   SERVICES LAYER                          │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────────────┐  │  │
│  │  │ AuthService │ │ WalletStore │ │ ProjectEscrowSvc   │  │  │
│  │  └─────────────┘ └─────────────┘ └────────────────────┘  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────────────┐  │  │
│  │  │ DEXService  │ │ FINTokenSvc │ │ GaslessService     │  │  │
│  │  └─────────────┘ └─────────────┘ └────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              BLOCKCHAIN LAYER (EVM)                       │  │
│  │  ┌────────────┐ ┌───────────────┐ ┌──────────────────┐   │  │
│  │  │ FINToken   │ │ ProjectEscrow │ │ FINSwap DEX      │   │  │
│  │  │ (ERC20)    │ │ (Escrow)      │ │ (AMM)            │   │  │
│  │  └────────────┘ └───────────────┘ └──────────────────┘   │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │                MultiSigWallet                      │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
FinPro/
├── contracts/                    # Solidity smart contracts
│   ├── contracts/
│   │   ├── FINToken.sol         # ERC20 token with roles
│   │   ├── ProjectEscrow.sol    # Escrow for project payments
│   │   ├── FINSwap.sol          # DEX for token swaps
│   │   └── MultiSigWallet.sol   # Multi-signature wallet
│   ├── scripts/
│   │   ├── deploy.ts            # Main deployment script
│   │   ├── deployFaucet.ts      # Test token faucet
│   │   └── mintTestTokens.ts    # Token minting utilities
│   ├── test/                    # Contract tests
│   └── hardhat.config.ts        # Hardhat configuration
│
├── src/                         # Frontend source
│   ├── components/              # Vue components
│   ├── composables/             # Vue composables
│   │   ├── useMetaMaskWallet.ts # MetaMask integration
│   │   ├── useEVMWallet.ts      # Generic EVM wallet
│   │   └── useAuth.ts           # Authentication
│   ├── services/                # Business logic services
│   │   ├── finTokenService.ts   # FIN token operations
│   │   ├── projectEscrowService.ts # Escrow operations
│   │   ├── dexService.ts        # DEX swap operations
│   │   └── projectApi.ts        # Backend API calls
│   ├── stores/                  # Pinia state stores
│   │   ├── walletStore.ts       # Wallet state
│   │   └── auth.ts              # Auth state
│   ├── views/                   # Page components
│   │   ├── dashboards/          # Dashboard views
│   │   └── projects/            # Project management views
│   └── router/                  # Vue Router config
│
├── package.json                 # Frontend dependencies
└── vite.config.ts              # Vite configuration
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension
- Git

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Finteckinfo/FinPro.git
cd FinPro

# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..
```

### Step 2: Configure Environment Variables

Create environment files:

```bash
# For smart contracts (contracts/.env)
cp contracts/.env.example contracts/.env
```

Edit `contracts/.env`:
```env
# RPC URLs (get free keys from Alchemy or Infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# API keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

Create `.env.local` in root for frontend:
```env
# Network RPC URLs
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Contract Addresses (update after deployment)
VITE_FIN_TOKEN_ADDRESS_ETH=0x...
VITE_FIN_TOKEN_ADDRESS_POLYGON=0x...
VITE_FIN_TOKEN_ADDRESS_SEPOLIA=0x...
VITE_ESCROW_CONTRACT_ADDRESS=0x...
VITE_DEX_CONTRACT_ADDRESS=0x...

# Gelato for gasless transactions (optional)
VITE_GELATO_RELAY_API_KEY=your_gelato_key

# Backend API (if applicable)
VITE_API_URL=http://localhost:3000/api
```

### Step 3: Deploy Smart Contracts (Testnet)

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia
```

Save the deployed contract addresses and update your `.env.local`.

### Step 4: Start the Frontend

```bash
# From root directory
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Wallet Setup

>  **Complete guide available at [WALLET_SETUP_GUIDE.md](./WALLET_SETUP_GUIDE.md)**

### Quick Setup Steps:

#### 1. Install MetaMask
- Download from: https://metamask.io/download/
- Install browser extension
- Create new wallet or import existing

#### 2. Connect to Sepolia Testnet
```
Network Name: Sepolia
RPC URL: https://rpc.sepolia.org
Chain ID: 11155111
Currency Symbol: SepoliaETH
Block Explorer: https://sepolia.etherscan.io
```

#### 3. Get Test ETH
Choose one of these faucets:

| Faucet | URL | Amount |
|--------|-----|--------|
| Alchemy | https://www.alchemy.com/faucets/ethereum-sepolia | 0.5 ETH/day |
| Infura | https://www.infura.io/faucet/sepolia | 0.5 ETH/day |
| QuickNode | https://faucet.quicknode.com/ethereum/sepolia | 0.1 ETH |
| Chainlink | https://faucets.chain.link/sepolia | 0.1 ETH |
| Google Cloud | https://cloud.google.com/application/web3/faucet/ethereum/sepolia | 0.05 ETH/day |

#### 4. Connect to FinPro
1. Open `http://localhost:5174` (or your deployed URL)
2. Click "Get Started" or "Create a Project"
3. Approve MetaMask connection popup
4. You're connected! 

---

## User Workflow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY FLOWCHART                     │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  LANDING     │
    │   PAGE       │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   CONNECT    │◄─────── MetaMask / WalletConnect
    │   WALLET     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  DASHBOARD   │
    │   (Home)     │
    └──────┬───────┘
           │
           ├────────────────┬────────────────┬────────────────┐
           ▼                ▼                ▼                ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   CREATE     │ │   VIEW       │ │    DEX       │ │   TEAM       │
    │   PROJECT    │ │  PROJECTS    │ │   SWAP       │ │ INVITATIONS  │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────────────┘
           │                │                │
           ▼                ▼                ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │    FUND      │ │   PROJECT    │ │  SWAP FIN    │
    │   ESCROW     │ │  WORKSPACE   │ │   USDT      │
    └──────┬───────┘ └──────┬───────┘ └──────────────┘
           │                │
           ▼                ▼
    ┌──────────────┐ ┌──────────────┐
    │   ALLOCATE   │ │   MANAGE     │
    │    TASKS     │ │    TASKS     │
    └──────┬───────┘ └──────────────┘
           │
           ▼
    ┌──────────────┐
    │   WORKER     │
    │  COMPLETES   │
    │    TASK      │
    └──────┬───────┘
           │
           ├───────────────────────┐
           ▼                       ▼
    ┌──────────────┐       ┌──────────────┐
    │  < 10K FIN   │       │  > 10K FIN   │
    │ AUTO-RELEASE │       │  MULTI-SIG   │
    └──────────────┘       │  APPROVAL    │
                           └──────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │   PAYMENT    │
                           │  RELEASED    │
                           └──────────────┘
```

### 1. Connect Wallet (Entry Point)

**Route:** `/` (Landing Page)

1. User visits the application
2. Clicks "Connect Wallet" button
3. MetaMask popup appears
4. User approves connection
5. Redirected to Dashboard

**Key Components:**
- `src/views/pages/LandingPage.vue`
- `src/composables/useMetaMaskWallet.ts`
- `src/layouts/full/vertical-header/ConnectWallet.vue`

### 2. Dashboard Overview

**Route:** `/dashboard/default`

**Features Displayed:**
- FIN Token balance
- Project statistics
- Recent activities
- Pending invitations
- Weekly progress metrics
- Upcoming deadlines
- Quick actions

**Key Components:**
- `src/views/dashboards/default/DefaultDashboard.vue`
- `src/views/dashboards/default/components/FINTokenBalance.vue`
- `src/views/dashboards/default/components/DEXSwap.vue`
- `src/views/dashboards/default/components/ProjectOverview.vue`

### 3. Create New Project

**Route:** `/projects/create`

**Workflow:**
1. Click "Create New Project"
2. Fill project details:
   - Name
   - Description
   - Type (Progressive, Parallel, Sequential)
   - Priority (Low, Medium, High, Critical)
   - Start Date / End Date
3. Submit creates project in database
4. Redirect to project details

**Key Components:**
- `src/views/projects/CreateProjectProtected.vue`
- `src/views/projects/CreateProject.vue`

### 4. Fund Project Escrow (Blockchain)

**Route:** `/projects/:id/fund-escrow`

**Workflow:**
1. Navigate to project
2. Click "Fund Escrow"
3. Enter FIN amount
4. Approve FIN token spend (MetaMask)
5. Confirm fund transaction (MetaMask)
6. Tokens locked in escrow contract

**Smart Contract Flow:**
```solidity
// 1. User approves FIN token spending
FINToken.approve(escrowAddress, amount)

// 2. User funds project
ProjectEscrow.fundProject(amount)
  → Creates project entry
  → Transfers FIN to escrow
  → Emits ProjectFunded event
```

### 5. Allocate Tasks to Workers

**Route:** `/projects/:id/workspace`

**Workflow:**
1. Open project workspace
2. Create task with FIN allocation
3. Assign worker wallet address
4. Submit allocation transaction

**Smart Contract Flow:**
```solidity
ProjectEscrow.allocateTask(projectId, workerAddress, amount)
  → Validates project has sufficient funds
  → Creates task entry
  → Updates totalAllocated
  → Emits TaskAllocated event
```

### 6. Worker Completes Task

**Workflow:**
1. Worker logs into their account
2. Views assigned tasks
3. Completes work
4. Marks task as complete

**Smart Contract Flow:**
```solidity
ProjectEscrow.completeTask(taskId)
  → Validates worker is task assignee
  → Updates task status to COMPLETED
  → If amount < 10,000 FIN: auto-releases payment
  → If amount >= 10,000 FIN: requires multi-sig approval
```

### 7. Multi-Sig Payment Approval (Large Payments)

**For payments >= 10,000 FIN:**

```solidity
// Approver 1
ProjectEscrow.approvePayment(taskId)
  → Records approval

// Approver 2
ProjectEscrow.approvePayment(taskId)
  → Records approval
  → If approvalCount >= 2: releases payment automatically
```

### 8. DEX Token Swap

**Dashboard DEX Widget**

**Workflow:**
1. Enter amount to swap
2. Select tokens (FIN  USDT)
3. Review exchange rate (0.3% fee)
4. Approve token spending
5. Execute swap

**Smart Contract Flow:**
```solidity
// 1. Approve token spend
FINToken.approve(dexAddress, amountIn)

// 2. Execute swap
FINSwap.swap(tokenIn, tokenOut, amountIn, minAmountOut)
  → Validates pool exists
  → Calculates output with 0.3% fee
  → Transfers tokens
  → Updates reserves
```

### 9. Refund Unused Funds

**For Employers:**

```solidity
// Step 1: Request refund (starts 24-hour timelock)
ProjectEscrow.requestRefund(projectId)

// Step 2: Process refund (after 24 hours)
ProjectEscrow.processRefund(projectId)
  → Calculates unused funds
  → Returns FIN to employer
```

---

## Smart Contract Workflow

### Contract Deployment Order

```
1. FINToken (ERC20)
   ↓
2. ProjectEscrow (requires FINToken address)
   ↓
3. FINSwap (DEX)
   ↓
4. MultiSigWallet
```

### Role-Based Access Control

| Contract | Role | Permissions |
|----------|------|-------------|
| FINToken | MINTER_ROLE | Mint new tokens |
| FINToken | PAUSER_ROLE | Pause/unpause transfers |
| FINToken | UPGRADER_ROLE | Upgrade contract |
| ProjectEscrow | MANAGER_ROLE | Allocate tasks |
| ProjectEscrow | APPROVER_ROLE | Approve large payments |
| ProjectEscrow | UPGRADER_ROLE | Upgrade contract |

### Security Features

```
┌─────────────────────────────────────────────────────────────┐
│                   SECURITY MEASURES                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │ Reentrancy      │    │ nonReentrant modifier       │    │
│  │ Protection      │    │ on all state-changing       │    │
│  └─────────────────┘    └─────────────────────────────┘    │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │ Multi-Sig       │    │ 2 approvals required for    │    │
│  │ Approval        │    │ payments >= 10,000 FIN      │    │
│  └─────────────────┘    └─────────────────────────────┘    │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │ Time-Lock       │    │ 24-hour delay on refunds    │    │
│  │ Refunds         │    │ to protect workers          │    │
│  └─────────────────┘    └─────────────────────────────┘    │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │ Emergency       │    │ Pausable contracts for      │    │
│  │ Pause           │    │ emergency situations        │    │
│  └─────────────────┘    └─────────────────────────────┘    │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │ Upgradeable     │    │ UUPS proxy pattern for      │    │
│  │ Contracts       │    │ bug fixes without migration │    │
│  └─────────────────┘    └─────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Guide

### Smart Contract Tests

```bash
cd contracts

# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/FinPro.test.ts

# Generate coverage report
npx hardhat coverage
```

### Frontend Testing

```bash
# TypeScript type checking
npm run typecheck

# ESLint
npm run lint

# Unit tests (Vitest)
npm run test
```

### Manual Testing Checklist

#### Wallet Connection
- [ ] MetaMask connects successfully
- [ ] Wallet address displays correctly
- [ ] Network detection works
- [ ] Disconnect wallet works

#### Dashboard
- [ ] FIN balance loads correctly
- [ ] Project stats display
- [ ] Recent activities load
- [ ] Quick actions work

#### Project Management
- [ ] Create project works
- [ ] Project list loads
- [ ] Project details display
- [ ] Fund escrow transaction works

#### Task Management
- [ ] Allocate task works
- [ ] Task list displays
- [ ] Complete task works
- [ ] Payment releases (auto for <10K)

#### DEX
- [ ] Swap interface loads
- [ ] Quote calculation works
- [ ] Swap transaction executes
- [ ] Balances update

### Local Testing with Hardhat Network

```bash
# Start local Hardhat node
cd contracts
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.ts --network localhost

# Configure MetaMask:
# - Network: Localhost 8545
# - Chain ID: 31337
# - Import test accounts from Hardhat
```

---

## Environment Configuration

### Supported Networks

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Ethereum Mainnet | 1 | `VITE_ETHEREUM_RPC_URL` |
| Polygon | 137 | `VITE_POLYGON_RPC_URL` |
| Sepolia Testnet | 11155111 | `VITE_SEPOLIA_RPC_URL` |
| Localhost | 31337 | http://localhost:8545 |

### Complete Environment Variables

```env
# ============================================
# FRONTEND ENVIRONMENT (.env.local)
# ============================================

# Network RPC URLs
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Contract Addresses - Ethereum
VITE_FIN_TOKEN_ADDRESS_ETH=0x...

# Contract Addresses - Polygon  
VITE_FIN_TOKEN_ADDRESS_POLYGON=0x...

# Contract Addresses - Sepolia (for testing)
VITE_FIN_TOKEN_ADDRESS_SEPOLIA=0x...
VITE_ESCROW_CONTRACT_ADDRESS=0x...
VITE_DEX_CONTRACT_ADDRESS=0x...
VITE_MULTISIG_ADDRESS=0x...

# Gelato Gasless Transactions
VITE_GELATO_RELAY_API_KEY=your_gelato_key

# Backend API
VITE_API_URL=http://localhost:3000/api

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## Troubleshooting

### Common Issues

#### MetaMask Connection Failed
```
Error: MetaMask not detected
```
**Solution:** Ensure MetaMask extension is installed and enabled.

#### Transaction Failed
```
Error: execution reverted
```
**Solutions:**
1. Check you have enough ETH for gas
2. Verify token approval was done first
3. Check contract address is correct

#### Wrong Network
```
Error: unsupported network
```
**Solution:** Switch MetaMask to supported network (Sepolia, Ethereum, Polygon).

#### Insufficient Token Balance
```
Error: ERC20: transfer amount exceeds balance
```
**Solution:** Ensure wallet has enough FIN tokens.

### Debug Commands

```bash
# Check contract deployment
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# View contract on explorer
# Sepolia: https://sepolia.etherscan.io/address/CONTRACT_ADDRESS

# Check transaction
# https://sepolia.etherscan.io/tx/TX_HASH
```

### Getting Help

- Check contract events on Etherscan
- View browser console for errors
- Check MetaMask activity for transaction status
- Review Hardhat console output during development

---

## Quick Reference

### Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard/default` | Main dashboard |
| `/projects` | Project list |
| `/projects/create` | Create project |
| `/projects/:id` | Project details |
| `/projects/:id/workspace` | Project workspace |
| `/projects/:id/fund-escrow` | Fund escrow |
| `/payments` | Payment history |
| `/settings` | User settings |

### Key Commands

```bash
# Development
npm run dev           # Start frontend
npm run build         # Build for production
npm run preview       # Preview production build

# Contracts
npx hardhat compile   # Compile contracts
npx hardhat test      # Run tests
npx hardhat node      # Start local node
npx hardhat run scripts/deploy.ts --network sepolia  # Deploy
```

---

**Authored by Llakterian**

*Last Updated: December 2024*
*Version: 1.0.0*

