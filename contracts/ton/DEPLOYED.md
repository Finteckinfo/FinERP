# TON DataRegistry Contract - Deployment Summary

## Deployment Details

**Status**: ✅ Successfully Deployed  
**Network**: TON Sandbox (Testnet)  
**Contract Address**: `EQCLRl8UvIaYLmeKXrAGKa_6eVKIryhlH9fCarInF1xtN4dw`  
**Deployer Address**: `EQABEq658dLg1KxPhXZxj0vapZMNYevotqeINH786lpwwSnT`  
**Deployment Date**: 2025-12-30  
**Gas Used**: 0.009354 TON

## Contract Information

- **Type**: Data Registry for Transparent Storage
- **Language**: Tact
- **Purpose**: Store project and subtask data on-chain for transparency
- **Access**: Owner-only writes, public reads

## Quick Setup

Add this to your `.env` file:

```bash
VITE_TON_DATA_REGISTRY_ADDRESS=EQCLRl8UvIaYLmeKXrAGKa_6eVKIryhlH9fCarInF1xtN4dw
VITE_TON_NETWORK=testnet
```

## Verification

View contract on TON Explorer:
- Sandbox: https://sandbox.tonwhales.com/explorer/address/EQCLRl8UvIaYLmeKXrAGKa_6eVKIryhlH9fCarInF1xtN4dw

## Next Steps

1. **Update Environment**:
   ```bash
   # Copy .env.example to .env if not exists
   cp .env.example .env
   
   # Edit .env and ensure TON contract address is set
   ```

2. **Test Integration**:
   ```bash
   # Start development server
   npm run dev
   
   # Connect both EVM and TON wallets
   # Create a test project
   # Verify data appears on both chains
   ```

3. **Deploy to Mainnet** (when ready):
   - Use same contract code
   - Deploy via https://ide.nujan.io/ to mainnet
   - Update `VITE_TON_DATA_REGISTRY_ADDRESS` with mainnet address
   - Change `VITE_TON_NETWORK` to `mainnet`

## Contract Functions

### Write Functions (Owner Only)
- `StoreProject(name, description, owner, totalFunds)` - Store project data
- `StoreSubtask(projectId, title, assignedTo, amount)` - Store subtask data

### Read Functions (Public)
- `getProject(projectId)` - Retrieve project data
- `getSubtask(subtaskId)` - Retrieve subtask data
- `getProjectCount()` - Get total projects
- `getSubtaskCount()` - Get total subtasks

## Important Notes

- This is a **sandbox deployment** for testing
- For production, deploy to TON mainnet
- Contract owner is the deployer address
- All stored data is publicly readable
- Data is immutable once stored
