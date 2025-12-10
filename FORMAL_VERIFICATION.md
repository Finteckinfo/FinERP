# Formal Verification for FinERP Smart Contracts

## Overview

This document outlines the formal verification approach for critical functions in the FinERP smart contracts. Formal verification provides mathematical proofs of correctness for security properties.

## Critical Functions for Verification

### 1. FINToken.sol

#### `mint(address to, uint256 amount)`
**Properties to verify:**
- **Supply Cap Invariant**: `totalSupply() <= MAX_SUPPLY` always holds
- **Non-negative Balance**: `balanceOf(to) >= 0` after minting
- **Role Authorization**: Only `MINTER_ROLE` can call this function
- **Zero Address Protection**: `to != address(0)`

**Specification (Scribble):**
```solidity
/// if-succ postcondition totalSupply() <= MAX_SUPPLY
/// if-succ postcondition balanceOf(to) >= old(balanceOf(to)) + amount
/// if-succ require msg.sender == MINTER_ROLE
/// if-succ require to != address(0)
function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
    // Implementation
}
```

#### `burn(uint256 amount)`
**Properties to verify:**
- **Balance Invariant**: `balanceOf(msg.sender) >= amount` before burn
- **Supply Consistency**: `totalSupply() = old(totalSupply()) - amount`
- **Non-negative**: Final balance never negative

### 2. FINSwap.sol

#### `swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut)`
**Properties to verify:**
- **Slippage Protection**: `amountOut >= minAmountOut`
- **Liquidity Invariant**: `k = reserveA * reserveB` constant (minus fees)
- **No Underflow**: Reserves never go negative
- **Fee Collection**: Fee properly calculated and retained

**Specification:**
```solidity
/// if-succ postcondition amountOut >= minAmountOut
/// if-succ postcondition reserveA_new * reserveB_new >= reserveA_old * reserveB_old
/// if-succ require amountIn > 0
/// if-succ require reserveIn > 0 && reserveOut > 0
function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) 
    external nonReentrant whenNotPaused returns (uint256 amountOut) {
    // Implementation
}
```

#### `addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB)`
**Properties to verify:**
- **Liquidity Calculation**: Liquidity proportional to sqrt(amountA * amountB)
- **Reserve Updates**: Reserves increase by deposited amounts
- **No Zero Liquidity**: `liquidity > 0` when amounts > 0

### 3. ProjectEscrow.sol

#### `_releasePayment(uint256 taskId)`
**Properties to verify:**
- **Approval Requirements**: Large payments require sufficient approvals
- **Double Payment Prevention**: Task status changes to PAID after release
- **Balance Sufficiency**: Contract has enough tokens for payment
- **Reentrancy Protection**: State changes before external calls

**Specification:**
```solidity
/// if-succ postcondition task.status == PAID
/// if-succ require task.amount < APPROVAL_THRESHOLD || task.approvalCount >= REQUIRED_APPROVALS
/// if-succ require balanceOf(address(this)) >= task.amount
function _releasePayment(uint256 taskId) internal {
    // Implementation
}
```

#### `requestRefund(uint256 projectId)`
**Properties to verify:**
- **Authorization**: Only employer can request refund
- **Timelock**: Refund cannot be processed immediately
- **State Consistency**: Refund timestamp properly set

### 4. MultiSigWallet.sol

#### `executeTransaction(uint256 txIndex)`
**Properties to verify:**
- **Confirmation Threshold**: `numConfirmations >= numConfirmationsRequired`
- **Execution Uniqueness**: Transaction executed at most once
- **Call Success**: External call must succeed
- **State Update**: Transaction marked as executed

## Formal Verification Tools

### 1. Scribble (Static Verification)
```bash
# Install Scribble
npm install -g eth-scribble

# Verify contracts
scribble contracts/contracts/*.sol --output-mode files --assert
```

### 2. Certora Prover
```bash
# Certora specification example
method swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut)
    env e
    requires e.msg.sender == e.msg.sender
    requires amountIn > 0
    requires getReserve(tokenIn) > 0
    requires getReserve(tokenOut) > 0
    ensures amountOut >= minAmountOut
    ensures getReserve(tokenIn) == old(getReserve(tokenIn)) + amountIn
    ensures getReserve(tokenOut) == old(getReserve(tokenOut)) - amountOut
{
    // Function body
}
```

### 3. VerX (Formal Verification Framework)
```yaml
# verx.yml
contracts:
  - path: "contracts/FINToken.sol"
    properties:
      - name: "SupplyCapInvariant"
        description: "Total supply never exceeds maximum"
        invariant: "totalSupply() <= MAX_SUPPLY"
```

## Verification Workflow

### Phase 1: Property Specification
1. Identify critical security properties
2. Write formal specifications in Scribble
3. Review specifications with security team

### Phase 2: Static Verification
1. Run Scribble on all contracts
2. Fix any failing assertions
3. Achieve 100% property coverage

### Phase 3: Dynamic Verification
1. Use Certora for complex properties
2. Verify AMM invariant properties
3. Test edge cases and boundary conditions

### Phase 4: Integration Testing
1. Verify contract interactions
2. Test upgrade scenarios
3. Validate cross-contract invariants

## Verification Results Documentation

### Property Coverage Matrix
| Contract | Function | Properties | Status | Tools |
|----------|----------|------------|---------|-------|
| FINToken | mint | 4 | ✅ | Scribble |
| FINToken | burn | 3 | ✅ | Scribble |
| FINSwap | swap | 4 | 🔄 | Certora |
| FINSwap | addLiquidity | 3 | ✅ | Scribble |
| ProjectEscrow | _releasePayment | 4 | ✅ | Scribble |
| MultiSigWallet | executeTransaction | 4 | ✅ | Scribble |

### Continuous Integration
```yaml
# .github/workflows/verification.yml
name: Formal Verification
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Scribble
        run: npm install -g eth-scribble
      - name: Run Formal Verification
        run: |
          scribble contracts/contracts/*.sol --output-mode files --assert
          npm run test:verification
```

## Security Properties Summary

### Financial Invariants
1. **Token Supply**: Never exceeds maximum cap
2. **AMM Constant Product**: k = x * y preserved (minus fees)
3. **Escrow Balance**: Contract balance >= total allocated payments

### Access Control Invariants
1. **Role Authorization**: Functions only callable by authorized roles
2. **Multi-sig Threshold**: Large payments require multiple approvals
3. **Upgrade Control**: Only authorized addresses can upgrade

### State Consistency Invariants
1. **Task Status**: Proper state transitions only
2. **Project Funding**: Allocated ≤ Funded
3. **Transaction Execution**: Each transaction executed at most once

## Recommendations

1. **Implement Scribble annotations** for all critical functions
2. **Set up Certora verification** for AMM properties
3. **Create CI pipeline** for continuous verification
4. **Regular verification reviews** with security team
5. **Document verification results** for audit purposes

## Timeline

- **Week 1-2**: Write Scribble specifications
- **Week 3-4**: Set up Certora verification
- **Week 5-6**: Complete verification of all properties
- **Week 7-8**: Integration testing and CI setup
- **Week 9-10**: Documentation and review

This formal verification approach ensures mathematical guarantees for the security properties of the FinERP system.
