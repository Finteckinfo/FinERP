# FINe Token Smart Contract

## Overview

The FINe Token is an ERC-20 compliant token designed for the FinPro platform. It maintains a 1:1 peg with USDT and provides utility within the project management ecosystem.

## Contract Details

- **Name**: FINe Token
- **Symbol**: FINe
- **Decimals**: 18 (matching USDT)
- **Maximum Supply**: 100,000,000 FINe tokens
- **Initial Liquidity**: 10,000,000 FINe tokens minted to treasury

## Features

### 1. ERC-20 Compliance
- Standard ERC-20 functions (transfer, approve, transferFrom)
- Full compatibility with existing wallets and exchanges

### 2. Mintable
- Authorized minters can create new tokens
- Owner can add/remove minter addresses
- Total supply capped at 100 million tokens
- Prevents inflation beyond maximum supply

### 3. Burnable
- Token holders can burn their tokens
- `redeemForUSDT()` function for requesting USDT conversion
- Emits events for off-chain redemption processing

### 4. Pausable
- Emergency pause functionality for critical situations
- Prevents all token transfers when paused
- Only contract owner can pause/unpause

### 5. Access Control
- Owner-based access control for critical functions
- Separate minter role for authorized addresses
- Treasury management by owner

## Key Functions

### Minting
```solidity
function mint(address to, uint256 amount) external onlyMinter whenNotPaused
```
- Create new tokens up to MAX_SUPPLY
- Only callable by authorized minters
- Emits `TokensMinted` event

### Redemption
```solidity
function redeemForUSDT(uint256 amount) external whenNotPaused
```
- Burns FINe tokens from sender
- Emits `TokensRedeemed` event
- Backend should process USDT transfer based on event

### Administration
```solidity
function addMinter(address account) external onlyOwner
function removeMinter(address account) external onlyOwner
function updateTreasury(address newTreasury) external onlyOwner
function pause() external onlyOwner
function unpause() external onlyOwner
```

## Deployment Guide

### Prerequisites
1. Node.js and npm installed
2. Hardhat or Foundry for deployment
3. Ethereum wallet with ETH for gas fees
4. Network RPC URL (mainnet, testnet, or local)

### Cost Estimates
- **Ethereum Mainnet**: ~$100-300 (varies with gas prices)
- **Polygon**: ~$0.10-1.00
- **BSC**: ~$0.50-5.00
- **Testnets (Sepolia, Goerli)**: Free (requires testnet ETH)

### Deployment Steps

#### 1. Install Dependencies
```bash
npm install --save-dev @openzeppelin/contracts
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

#### 2. Configure Hardhat
Create `hardhat.config.js`:
```javascript
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

#### 3. Create Deployment Script
Create `scripts/deploy.js`:
```javascript
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const treasury = "YOUR_TREASURY_ADDRESS"; // Replace with actual treasury address
  
  const FINeToken = await ethers.getContractFactory("FINeToken");
  const token = await FINeToken.deploy(treasury);
  
  await token.deployed();
  
  console.log("FINe Token deployed to:", token.address);
  console.log("Initial supply minted to treasury:", await token.balanceOf(treasury));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 4. Deploy to Testnet (Free)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### 5. Deploy to Mainnet (Costs Gas)
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

#### 6. Verify Contract on Etherscan
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "TREASURY_ADDRESS"
```

## Integration with FinPro

### Backend Integration

1. **Listen for Redemption Events**
```typescript
// Monitor TokensRedeemed events
contract.on("TokensRedeemed", async (from, amount) => {
  // Process USDT transfer to user
  await processUSDTTransfer(from, amount);
});
```

2. **Mint Tokens for Project Funding**
```typescript
// When user deposits USDT
async function onUSDTDeposit(userAddress: string, amount: number) {
  const tx = await contract.mint(userAddress, amount);
  await tx.wait();
}
```

### Frontend Integration

1. **Install Web3 Library**
```bash
npm install ethers
```

2. **Connect to Contract**
```typescript
import { ethers } from 'ethers';
import FINeTokenABI from './FINeToken.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, FINeTokenABI, signer);
```

3. **Check Balance**
```typescript
const balance = await contract.balanceOf(userAddress);
console.log("FINe Balance:", ethers.utils.formatEther(balance));
```

4. **Redeem for USDT**
```typescript
const amount = ethers.utils.parseEther("100"); // 100 FINe tokens
const tx = await contract.redeemForUSDT(amount);
await tx.wait();
```

## Current Implementation

### In-App Token System (Free, Demo)
For the current showcase/demo version, we're using:
- Database-backed token balances
- Instant swaps via API endpoints
- No blockchain interaction required
- Zero cost for testing and demonstration

### Migration Path to Blockchain

When ready to deploy the actual ERC-20 token:

1. **Deploy Smart Contract** (costs gas)
   - Use the deployment guide above
   - Start with testnet for validation

2. **Update Backend**
   - Add blockchain monitoring for deposits
   - Implement automatic minting on USDT deposits
   - Process redemptions from blockchain events

3. **Update Frontend**
   - Add Web3 wallet integration
   - Replace API calls with smart contract calls
   - Show real-time blockchain confirmations

4. **Migration Strategy**
   - Export existing in-app balances
   - Airdrop equivalent blockchain tokens to users
   - Sunset in-app system gradually

## Security Considerations

1. **Access Control**
   - Only add trusted addresses as minters
   - Keep private keys secure
   - Use multi-sig for treasury in production

2. **Supply Management**
   - Maximum supply prevents inflation
   - Monitor minting activities
   - Regular audits of total supply

3. **Emergency Procedures**
   - Pause function for critical vulnerabilities
   - Documented incident response plan
   - Communication channels for users

4. **Audit Recommendations**
   - Professional security audit before mainnet
   - Formal verification of critical functions
   - Bug bounty program post-launch

## Testing

### Unit Tests
```javascript
describe("FINeToken", function () {
  it("Should mint initial supply to treasury", async function () {
    const [owner] = await ethers.getSigners();
    const treasury = owner.address;
    const token = await FINeToken.deploy(treasury);
    
    const balance = await token.balanceOf(treasury);
    expect(balance).to.equal(ethers.utils.parseEther("10000000"));
  });
  
  it("Should enforce maximum supply", async function () {
    // Test minting beyond MAX_SUPPLY reverts
  });
  
  it("Should allow redemption", async function () {
    // Test redeemForUSDT burns tokens
  });
});
```

## License

MIT License - See contract header for details

## Support

For questions or issues:
- GitHub: [Your Repository]
- Documentation: https://docs.finpro.app
- Email: support@finpro.app
