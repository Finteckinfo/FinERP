# 🛑 PRIVATE PROPRIETARY SOURCE CODE - DO NOT SHARE
> [!CAUTION]
> **STRICT SECURITY WARNING**
> This repository contains **CONFIDENTIAL TRADE SECRETS**.
> 1. **DO NOT MAKE PUBLIC**: This repository must remain **PRIVATE** at all times.
> 2. **DO NOT CLONE FOR OTHER USE**: Unauthorized duplication or extraction of code for other projects is strictly prohibited by the LICENSE.
> 3. **UNPAID LICENSE**: Usage is currently conditional on payment. See `LICENSE` for details.

# FinPro - Decentralized Project Management and Finance Platform

A comprehensive blockchain-based platform for decentralized project management, task execution, and decentralized finance operations. FinPro enables teams to collaborate on projects using smart contracts for fund management, gasless transactions via EIP-4337 Account Abstraction, and real-time Telegram integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Smart Contracts](#smart-contracts)
- [Testing](#testing)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Telegram Integration](#telegram-integration)
- [Contributing](#contributing)
- [License](#license)

## Overview

FinPro is a full-stack decentralized application (dApp) that combines project management, DeFi operations, and Telegram integration into a single platform. Users can create projects, assign tasks, manage escrow payments, and perform token operations—all while maintaining full control through blockchain-based authentication.

The platform supports:
- Wallet-only authentication (no passwords)
- Gasless transactions via EIP-4337 (users don't need ETH for gas)
- Real-time Telegram notifications
- Interactive Telegram Mini App
- Multi-signature wallet operations
- Token swapping and liquidity management
- Row-level security for data protection

## Features

### Core Functionality

- **Decentralized Authentication**: No passwords—secure login using wallet signatures
- **Project Management**: Create and manage projects with defined budgets and timelines
- **Task Assignment**: Break projects into subtasks with specific allocations and deadlines
- **Escrow Payments**: Secure fund holding with automatic release on task completion
- **Token Operations**: Native FIN token for payments, rewards, and governance
- **Token Swap**: Built-in DEX for trading platform tokens
- **Multi-Signature Wallet**: Administrative operations require multiple approvals

### User Experience

- **Gasless Transactions**: Use platform features without holding ETH for gas (EIP-4337)
- **Real-time Notifications**: Instant Telegram alerts for project and task updates
- **Telegram Mini App**: Direct access from Telegram without leaving the app
- **Web Dashboard**: Full-featured React interface for desktop users
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Security

- **Smart Contract Audits**: Verified with Slither static analysis tool
- **Row-Level Security**: Database policies ensure users see only their own data
- **Webhook Verification**: Secure Telegram webhook with signature validation
- **Environment Protection**: Sensitive credentials stored safely with .env gitignore
- **Reentrancy Protection**: All critical functions protected against attacks
- **Zero Vulnerabilities**: Dependency scanning with npm audit (production)

## Architecture

The platform is built on a three-tier architecture:

### 1. Frontend (React Application)

```
src/react-app/
├── components/        # Reusable UI components
├── pages/            # Page components
├── hooks/            # Custom React hooks (gasless transactions, wallet management)
├── context/          # Global state management
├── lib/              # Utility functions and config
└── assets/           # Images and CSS
```

Technology Stack:
- React 19 with TypeScript
- Vite v6.4.1 for bundling
- ethers.js v6 for blockchain interaction
- Supabase client for database access
- Tailwind CSS for styling

### 2. Backend Services

#### Telegram Bot Service
```
telegram-bot/
├── bot.ts            # Main bot server
├── config.ts         # Configuration management
├── handlers/         # Command and message handlers
└── notifications.ts  # Telegram notifications
```

Features:
- 7 commands: /start, /projects, /tasks, /profile, /stats, /ping, /help
- Real-time Supabase webhook integration
- PM2 process management for persistence
- Automatic restart and systemd integration

#### API Endpoints
```
api/
├── telegram-webhook.ts  # Vercel serverless function
├── set-webhook.js       # Webhook registration
└── hello.js            # Health check endpoint
```

### 3. Smart Contracts (Solidity)

```
contracts/
├── FINToken.sol           # ERC20 token (100M supply)
├── ProjectEscrow.sol      # Project and task management
├── FINSwap.sol            # Decentralized exchange
├── MultiSigWallet.sol     # Multi-signature operations
├── SimpleAccount.sol      # EIP-4337 account abstraction
├── TokenPaymaster.sol     # Gas sponsorship via tokens
└── TestTokenFaucet.sol    # Test token distribution
```

### 4. Database (Supabase PostgreSQL)

- Row-level security on all tables
- Real-time subscriptions for updates
- Webhook notifications for database changes
- Automatic backups and point-in-time recovery

## Tech Stack

### Frontend
- React 19
- TypeScript (strict mode)
- Vite 6.4.1
- ethers.js 6.x
- Tailwind CSS
- Supabase Client
- Vite Worker (for heavy computations)

### Backend
- Node.js with TypeScript
- Express.js
- node-telegram-bot-api
- Supabase SDK
- dotenv for configuration

### Blockchain
- Solidity 0.8.20+
- Hardhat (development framework)
- OpenZeppelin Contracts
- EIP-4337 (Account Abstraction)
- ethers.js for contract interaction

### Infrastructure
- Vercel (frontend deployment)
- Supabase (database and backend)
- PM2 (process management)
- Docker-compatible (render.yaml, wrangler.toml)

### Testing & Quality
- TypeScript strict mode
- ESLint for code quality
- Slither for contract security
- npm audit for dependencies
- 33 test cases (all passing)

## Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Git
- A Telegram account for bot testing
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Finteckinfo/FinPro.git
cd FinPro
```

2. Install dependencies:
```bash
npm install
cd contracts && npm install && cd ..
```

3. Create environment configuration:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Development Commands

```bash
# Frontend development
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript strict check

# Smart Contracts
npm run contracts:test   # Run all contract tests
npm run contracts:build  # Compile contracts
npm run contracts:deploy # Deploy to localhost

# Telegram Bot
npm run bot:start        # Start bot service locally
npm run bot:dev          # Start with nodemon (auto-restart)

# Database
npm run db:migrate       # Run migrations
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_WEBHOOK_URL=https://your-deployment.vercel.app
TELEGRAM_MINI_APP_URL=https://your-deployment.vercel.app
BOT_PORT=3001

# Contract Configuration
VITE_FINTOKEN_ADDRESS=0x...
VITE_PROJECT_ESCROW_ADDRESS=0x...
VITE_FIN_SWAP_ADDRESS=0x...

# Account Abstraction (EIP-4337)
VITE_ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7B47cba519c0895EF5
VITE_PAYMASTER_ADDRESS=0x...
VITE_BUNDLER_URL=https://bundler.url/rpc
VITE_RPC_URL=https://rpc.sepolia.org
```

Variables prefixed with `VITE_` are exposed to the frontend. Never prefix sensitive keys with `VITE_`.

### Telegram Bot Token Rotation

If your bot token is compromised:

1. Go to @BotFather on Telegram
2. Select your bot
3. Choose "Edit Bot" > "API Token" > "Revoke current token"
4. Generate a new token
5. Update `.env` and redeploy

See `SECURITY_TOKEN_ROTATION.md` for detailed instructions.

## Development

### Project Structure

```
FinPro/
├── src/
│   ├── react-app/          # Frontend application
│   ├── lib/                # Shared libraries (blockchain, utilities)
│   ├── worker/             # Web Workers for heavy computation
│   └── shared/             # Shared types and contracts
├── contracts/              # Solidity smart contracts
├── telegram-bot/           # Telegram bot service
├── api/                    # Serverless API functions
├── migrations/             # Database migrations
├── public/                 # Static assets
├── tests/                  # Test files
└── [config files]          # Various configuration files
```

### Code Style

- TypeScript with strict mode enabled
- ESLint for JavaScript/TypeScript
- Prettier formatting (configured in package.json)
- Solidity: OpenZeppelin style guidelines

### Creating a New Feature

1. Create component/hook in appropriate directory
2. Add TypeScript types in `src/shared/types.ts`
3. Create tests in `src/tests/`
4. Update documentation if needed
5. Run `npm run lint` to check code quality
6. Submit pull request with description

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Create Vercel project linked to repository
3. Set environment variables in Vercel dashboard
4. Vercel will automatically deploy on push

### Smart Contracts

Deploy to testnet or mainnet:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
# Or for mainnet
npx hardhat run scripts/deploy.ts --network mainnet
```

Update contract addresses in `.env` after deployment.

### Telegram Bot

For persistent operation:

```bash
# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start "npm run bot:start" --name "finpro-bot"

# Enable startup on reboot
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs finpro-bot
```

## Smart Contracts

### Contract Overview

| Contract | Purpose | Status |
|----------|---------|--------|
| FINToken | ERC20 token (100M supply) | Deployed |
| ProjectEscrow | Project and task management | Deployed |
| FINSwap | Token exchange/DEX | Deployed |
| MultiSigWallet | Administrative operations | Deployed |
| SimpleAccount | EIP-4337 user wallet | Deployed |
| TokenPaymaster | Gas sponsorship | Deployed |
| TestTokenFaucet | Test token distribution | Deployed |

### Key Functions

#### ProjectEscrow.sol
```solidity
createProject(string title, uint256 budget, uint256 deadline)
allocateTask(uint256 projectId, address assignee, uint256 amount)
completeTask(uint256 taskId)
approvePayment(uint256 taskId)
requestRefund(uint256 projectId)
```

#### FINToken.sol
```solidity
transfer(address to, uint256 amount)
approve(address spender, uint256 amount)
mint(address to, uint256 amount) // Owner only
burn(uint256 amount)
pause() // Owner only
```

#### SimpleAccount.sol (EIP-4337)
```solidity
initialize(address owner, address entryPoint)
executeCall(address target, uint256 value, bytes calldata data)
executeBatch(Call[] calldata calls)
validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds)
```

### Testing

Run all contract tests:

```bash
cd contracts
npm test
```

Test results: 33/33 passing (100%)

See `contracts/test/` for complete test suites.

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- contracts/test/AccountAbstraction.test.ts

# Watch mode
npm run test:watch
```

### Test Coverage

- AccountAbstraction: 14 tests
- FinPro (Token + Escrow): 13 tests
- Phase2 (DEX + MultiSig): 6 tests

Total: 33/33 tests passing

### Frontend Testing

```bash
# TypeScript strict mode check
npm run type-check

# ESLint checks
npm run lint
```

## Security

### Audit Results

The project has been analyzed with the following tools:

**Slither Analysis**: Zero critical/high severity issues
- 5 low-risk items (all documented)
- All reentrancy vectors mitigated
- Proper access control on sensitive functions

**npm audit**: Zero production vulnerabilities
- Regular dependency updates
- Security patches applied promptly

**TypeScript Strict Mode**: Zero type errors
- Full type safety enabled
- No implicit any types

See `SECURITY_AUDIT_REPORT.md` for detailed findings.

### Security Best Practices

1. Never expose private keys in code
2. Use environment variables for sensitive data
3. Keep the bot token secure and rotate when exposed
4. Validate all user inputs on backend
5. Use row-level security on database
6. Verify webhook signatures from Telegram
7. Implement rate limiting for API endpoints
8. Regular security audits for smart contracts

### Reporting Security Issues

If you discover a security vulnerability, please email security@finpro.example instead of using the public issue tracker.

## API Documentation

### Telegram Bot Commands

```
/start     - Initialize account and link wallet
/projects  - List your projects
/tasks     - Show assigned tasks
/profile   - Display your profile
/stats     - View platform statistics
/ping      - Health check
/help      - Show available commands
```

### REST Endpoints

#### Health Check
```
GET /api/hello
Response: { message: "Hello from FinPro API" }
```

#### Telegram Webhook
```
POST /api/telegram-webhook
Body: Telegram Update object
```

#### Set Webhook
```
POST /api/set-webhook
Body: { botToken: string, webhookUrl: string }
```

## Telegram Integration

### Setup

1. Create a bot with @BotFather:
   - Send `/newbot`
   - Choose a name (e.g., "FinPro Bot")
   - Get your token

2. Configure webhook:
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<DEPLOYMENT_URL>/api/telegram-webhook"
```

3. Set environment variables:
```bash
TELEGRAM_BOT_TOKEN=<token_from_botfather>
TELEGRAM_WEBHOOK_URL=<your_deployment_url>
```

4. Start the bot:
```bash
pm2 start "npm run bot:start" --name "finpro-bot"
```

### Telegram Mini App

Users can access the dApp directly within Telegram by:
1. Starting the bot with `/start`
2. Clicking the "Open App" button
3. Connecting their wallet
4. Using all features without leaving Telegram

## Contributing

This project is closed-source. For inquiries about contributing, please contact the maintainers.

### Code Quality Standards

- All code must pass TypeScript strict mode
- ESLint checks must pass
- New features require tests
- Documentation must be updated
- Commits should follow conventional commit format

## License

This software and the "FinPro" name are the **EXCLUSIVE PRIVATE PROPERTY** of the original development team led by Sambu Leonard (https://github.com/llakterian). 

Usage is strictly under a **CONDITIONAL SOURCE AVAILABLE LICENSE**. Rights are granted ONLY upon full payment of the invoice drawn on 31st December 2025. This license retroactively supersedes all previous licenses in the project history. 

**COMMERCIAL TERMS:**
- **Royalty:** 30% of Gross Revenue (Perpetual).
- **Buyout Option:** Available at 7x Development Fees.
- **Enforcement:** Enforced via Smart Contract Protocol Fees.
- **Confidentiality:** Strict Non-Duplication & Private Repo clauses apply.

See the [LICENSE](file:///home/c0bw3b/FinPro/LICENSE) file for details.
