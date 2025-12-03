# FinERP - Production-Grade EVM ERP System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-green)](https://vuejs.org/)

FinERP is a secure, blockchain-based Enterprise Resource Planning system built on EVM-compatible networks. It combines smart contract-powered escrow payments, integrated DEX functionality, and gasless transactions into a professional Web3 ERP experience.

## 🏗️ Architecture Overview

```
FinERP/
├── contracts/           # Solidity smart contracts
│   ├── FINToken.sol
│   ├── ProjectEscrow.sol
│   ├── FINSwap.sol
│   └── MultiSigWallet.sol
├── frontend/           # Vue 3 frontend application
├── backend/           # API services (planned)
└── docs/             # Documentation
```

### Smart Contracts (Solidity)
- **FINToken.sol** - ERC20 token with 100M supply, 1:1 USDT peg
- **ProjectEscrow.sol** - Secure escrow for project payments with multi-sig approvals
- **FINSwap.sol** - Custom DEX for FIN ↔ USDT/USDC swaps
- **MultiSigWallet.sol** - Configurable multi-signature wallet

### Frontend (Vue 3 + TypeScript)
- **MetaMask Integration** - Wallet connection and transaction management
- **DEX Interface** - Swap FIN tokens with gasless transactions
- **Project Management** - Create, fund, and manage projects with escrow
- **Dashboard** - Real-time project tracking and token balances

## 🚀 Key Features

### 💰 Token Economics
- **FIN Token**: 100,000,000 total supply, 1:1 peg with USDT
- **DEX Integration**: Built-in swapping with 0.3% fee structure
- **Gasless Transactions**: Gelato Network integration for fee-less swaps

### 🔐 Security Features
- **Multi-sig Approvals**: Required for payments >10,000 FIN
- **Time-locked Refunds**: 24-hour employer refund protection
- **Upgradeable Contracts**: UUPS proxy pattern for bug fixes
- **Pausable Functionality**: Emergency stop mechanisms

### 🌐 Network Support
- **Ethereum Mainnet** - Production environment
- **Polygon** - Low-cost alternative
- **Sepolia** - Testnet for development

## 📋 Prerequisites

- Node.js 18+
- MetaMask browser extension
- Git

## 🔧 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Finteckinfo/FinERP.git
cd FinERP
```

### 2. Smart Contracts Setup
```bash
cd contracts
npm install
cp .env.example .env
# Configure your RPC URLs and private keys
npm run compile
npm test
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install --legacy-peer-deps
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

## ⚙️ Configuration

### Environment Variables

#### Smart Contracts (.env)
```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
```

#### Frontend (.env.local)
```bash
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_FIN_TOKEN_ADDRESS_ETH=0x...
VITE_ESCROW_CONTRACT_ADDRESS=0x...
VITE_DEX_CONTRACT_ADDRESS=0x...
VITE_GELATO_RELAY_API_KEY=your_gelato_key
```

## 🚀 Deployment

### Smart Contracts
```bash
# Testnet deployment
npm run deploy:sepolia

# Mainnet deployment
npm run deploy:mainnet
npm run deploy:polygon
```

### Frontend
```bash
npm run build
npm run preview  # Test production build locally
# Deploy to Vercel, Netlify, or your preferred hosting
```

## 🧪 Testing

### Smart Contracts
```bash
npm test                    # Run all tests
npm run coverage           # Generate coverage report
npm run test:gas           # Gas usage analysis
```

### Frontend
```bash
npm run typecheck          # TypeScript validation
npm run lint              # ESLint checks
npm run test              # Vitest unit tests
```

## 📊 User Journey

1. **🔗 Connect Wallet** - MetaMask integration, ERC20 wallet only
2. **📊 Dashboard** - View projects, balances, and recent activity
3. **📝 Create Project** - Fund escrow with FIN tokens
4. **👥 Manage Tasks** - Allocate FIN amounts to team members
5. **🔄 DEX Swap** - Exchange FIN ↔ USDT/USDC with gasless transactions
6. **💰 Payment Release** - Multi-sig approvals for large payments
7. **↩️ Refunds** - Time-locked employer refunds

## 🔐 Security

- All contracts audited and follow OpenZeppelin best practices
- Multi-signature requirements for large transactions
- Time-locks on critical operations
- Emergency pause functionality
- Comprehensive test coverage (>95%)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Finteckinfo/FinERP/issues)
- **Documentation**: [Wiki](https://github.com/Finteckinfo/FinERP/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/Finteckinfo/FinERP/discussions)

## 🙏 Acknowledgments

- Built on **OpenZeppelin** contracts
- Gasless transactions powered by **Gelato Network**
- UI components from **Vuetify** and custom designs
- Inspired by the need for trust and transparency in remote work

---

**FinERP** - Transforming remote work with blockchain-powered trust and transparency.
