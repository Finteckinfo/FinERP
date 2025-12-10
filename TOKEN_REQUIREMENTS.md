# FIN Token Requirements & Setup

## Token Specifications

### Basic Requirements

1. **Token Standard**: ERC20
2. **Name**: FIN Token
3. **Symbol**: FIN
4. **Decimals**: 18 (standard)
5. **Total Supply**: 100,000,000 FIN (100 million)
6. **Initial Distribution**: All tokens minted to admin on deployment

### Network Support

- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon Mainnet** (Chain ID: 137)
- **Sepolia Testnet** (Chain ID: 11155111)

## Deployment Steps

### 1. Prepare Environment

Create `contracts/.env`:
```bash
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Deployer
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=your_deployer_address_here

# Explorer API Keys (for verification)
ETHERSCAN_API_KEY=your_key
POLYGONSCAN_API_KEY=your_key
```

### 2. Deploy Contracts

```bash
cd contracts
npm install
npm run compile

# Deploy to Sepolia (testnet)
npm run deploy:sepolia

# Or deploy to mainnet
npm run deploy:mainnet
```

### 3. Save Contract Addresses

After deployment, update `.env` files:
```bash
# Frontend .env
VITE_FIN_TOKEN_ADDRESS_ETH=0x...
VITE_FIN_TOKEN_ADDRESS_POLYGON=0x...
VITE_FIN_TOKEN_ADDRESS_SEPOLIA=0x...

# Contracts .env
FIN_TOKEN_ADDRESS=0x...
```

### 4. Verify Contracts

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Token Distribution

### Initial State

- **All tokens** (100M FIN) are minted to the deployer/admin address
- Admin can distribute tokens as needed

### Distribution Methods

1. **Direct Transfer**: Admin transfers tokens to users
2. **Faucet Contract**: Deploy TestTokenFaucet for automated distribution
3. **Backend API**: Create API endpoint that transfers from treasury

### Test Token Distribution

```bash
# Distribute tokens to test accounts
npx hardhat run scripts/distributeTestTokens.ts --network sepolia
```

## Test Token System (Pool Game Style)

### Concept

Like pool game tokens, users can get test tokens to "play" and test the ERP system.

### Implementation Options

#### Option 1: Smart Contract Faucet (Recommended)

1. Deploy TestTokenFaucet contract
2. Fund it with tokens from admin
3. Users request tokens daily (with limits)
4. Supports gasless transactions via Gelato

**Deploy:**
```bash
npx hardhat run scripts/deployFaucet.ts --network sepolia
```

**Features:**
- Daily request limits (e.g., 1000 FIN/day)
- Cooldown period (e.g., 24 hours)
- Gasless support via Gelato Relay
- Role-based access control

#### Option 2: Backend API Faucet

1. Create API endpoint `/api/faucet/request`
2. Backend holds treasury wallet
3. On request, backend mints/transfers tokens
4. More control, requires backend maintenance

#### Option 3: Manual Distribution

1. Admin manually transfers tokens
2. Use `distributeTestTokens.ts` script
3. Simple but requires manual intervention

### Token Packs (Pool Game Style)

- **Starter Pack**: 100 FIN - Basic testing
- **Standard Pack**: 500 FIN - Standard testing  
- **Premium Pack**: 1,000 FIN - Extended testing
- **Enterprise Pack**: 5,000 FIN - Full feature testing
- **Unlimited Pack**: 10,000 FIN - Comprehensive testing

## Gasless Transactions

### Setup Gelato Relay

1. Get API key from [Gelato Dashboard](https://relay.gelato.network/)
2. Add to `.env`: `VITE_GELATO_RELAY_API_KEY=your_key`
3. Grant RELAYER_ROLE to Gelato address in contracts
4. Fund Gelato Relay (for production)

### Supported Operations

- Test token requests
- Project escrow funding
- Token transfers
- DEX swaps

## Testing Workflow

1. **Deploy Contracts**: Deploy FIN token and faucet to testnet
2. **Distribute Initial Tokens**: Transfer tokens to test accounts
3. **Test Faucet**: Request tokens via faucet
4. **Test ERP Features**: Use tokens to test project creation, escrow, etc.
5. **Verify Functionality**: Ensure all features work with tokens

## Production Considerations

1. **Token Economics**: Define token distribution strategy
2. **Liquidity**: Add liquidity to DEX for trading
3. **Governance**: Consider token governance mechanisms
4. **Security**: Audit contracts before mainnet deployment
5. **Monitoring**: Set up monitoring for token distribution

## Cost Estimates

### Testnet (Sepolia)
- Deployment: ~$0 (free testnet ETH)
- Transactions: ~$0 (free testnet ETH)
- Perfect for testing

### Mainnet
- Contract Deployment: ~$50-200 (depending on gas prices)
- Token Distribution: ~$0.10-1 per transfer
- Gasless Transactions: Gelato fees (~$0.05-0.50 per tx)

## Next Steps

1. ✅ Deploy FIN token to testnet
2. ✅ Set up test accounts
3. ✅ Deploy faucet contract
4. ✅ Configure gasless transactions
5. ✅ Test token distribution
6. ✅ Test ERP functionality with tokens
7. ⏳ Deploy to mainnet (when ready)

## Support

For issues or questions:
- Check contract documentation
- Review deployment logs
- Verify contract addresses on block explorer
- Test on testnet first

