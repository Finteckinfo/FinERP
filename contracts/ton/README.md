# TON Smart Contract Deployment

This directory contains the TON DataRegistry smart contract for transparent on-chain data storage.

## Prerequisites

```bash
# Install Tact compiler globally
npm install -g @tact-lang/compiler

# Or use Blueprint (recommended)
npm create ton@latest
```

## Quick Start

### Option 1: Using Tact Compiler Directly

```bash
# Compile the contract
npx tact --config tact.config.json

# Output will be in ./build directory
```

### Option 2: Using Blueprint (Recommended)

```bash
# Initialize Blueprint project
npm create ton@latest ton-deployment
cd ton-deployment

# Copy DataRegistry.tact to contracts/
cp ../DataRegistry.tact contracts/

# Compile
npx blueprint build

# Deploy to testnet
npx blueprint run

# Follow prompts to deploy
```

## Deployment Steps

1. **Compile Contract**:
   ```bash
   npx tact --config tact.config.json
   ```

2. **Deploy to Testnet**:
   - Use TON Wallet (Tonkeeper, TonHub, etc.)
   - Send deployment transaction
   - Save contract address

3. **Update Environment**:
   ```bash
   # Add to your .env file
   VITE_TON_DATA_REGISTRY_ADDRESS=EQD_your_contract_address
   ```

4. **Verify Deployment**:
   - Check on TON Explorer: https://testnet.tonscan.org
   - Test getProjectCount() function
   - Ensure contract is active

## Contract Functions

### Write Functions (Owner Only)
- `StoreProject`: Store project data on-chain
- `StoreSubtask`: Store subtask data on-chain

### Read Functions (Public)
- `getProject(projectId)`: Retrieve project data
- `getSubtask(subtaskId)`: Retrieve subtask data
- `getProjectCount()`: Get total projects stored
- `getSubtaskCount()`: Get total subtasks stored

## Testing

```bash
# Test locally with sandbox
npx blueprint test

# Test on testnet
npx blueprint run --testnet
```

## Gas Costs

Approximate costs on TON testnet:
- Deploy: ~0.05 TON
- Store Project: ~0.01 TON
- Store Subtask: ~0.01 TON
- Read operations: Free

## Security Notes

- Only contract owner can store data
- All data is publicly readable
- Data is immutable once stored
- No delete functionality (by design for transparency)

## Troubleshooting

**Error: "Only owner can store data"**
- Ensure transactions come from the owner address
- Check sender() matches contract owner

**Contract not found**
- Verify contract address is correct
- Check network (testnet vs mainnet)
- Ensure contract deployment succeeded

## Next Steps

After deployment:
1. Update `.env` with contract address
2. Test data storage from frontend
3. Verify data on TON Explorer
4. Monitor gas usage
