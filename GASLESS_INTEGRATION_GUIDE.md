Account Abstraction Integration Guide

OVERVIEW

This guide explains the EIP-4337 Account Abstraction (AA) integration in FinPro, enabling gasless transactions for users. The implementation allows users to execute transactions without holding ETH, paying gas fees with FIN tokens instead through a Paymaster.

ARCHITECTURE COMPONENTS

1. SimpleAccount.sol
   Purpose: User's smart contract wallet
   Functions:
   - initialize(owner, entryPoint): Sets up account ownership
   - validateUserOp(signature): Validates transaction signatures
   - executeCall(target, value, data): Executes single transaction
   - executeBatch(targets, values, datas): Executes multiple transactions
   - increaseNonce(): Manages transaction ordering

2. TokenPaymaster.sol
   Purpose: Subsidizes gas fees by accepting token payments
   Key Features:
   - Accepts FIN tokens for gas payment
   - Configurable exchange rate (tokens per gas unit)
   - Multiple verified signers for security
   - Post-operation gas tracking
   - Owner-controlled fund management

3. AccountAbstractionSDK (src/lib/accountAbstraction.ts)
   Purpose: SDK for building and signing UserOperations
   Core Methods:
   - buildUserOperation(): Creates unsigned UserOp
   - signUserOperation(): Signs with user's private key
   - signPaymasterData(): Signs with paymaster's key
   - getUserOperationHash(): Computes UserOp hash
   - sendUserOperation(): Submits to bundler
   - getUserOperationReceipt(): Polls for confirmation

4. useGaslessTransaction Hook (src/react-app/hooks/useGaslessTransaction.ts)
   Purpose: React integration for gasless transactions
   Exports:
   - useGaslessTransaction(): Low-level UserOp management
   - useGaslessContractCall(): High-level contract calls

FLOW DIAGRAM

User Initiates Transaction
  |
  v
React Hook (useGaslessTransaction)
  |
  v
SDK builds UserOperation (nonce, callData, gas limits)
  |
  v
Sign with user's private key
  |
  v
Sign with paymaster's key
  |
  v
Send to Bundler (off-chain service)
  |
  v
Bundler aggregates UserOps
  |
  v
Bundler calls EntryPoint.handleOps()
  |
  v
EntryPoint validates signatures
  |
  v
EntryPoint calls SimpleAccount.executeCall()
  |
  v
Paymaster.postOp() charges FIN tokens
  |
  v
Transaction confirmed on-chain

INTEGRATION WITH FINPRO

1. Project Creation (Gasless)

Instead of:
  const tx = await projectEscrow.createProject(
      name, 
      budget, 
      { value: ethers.parseEther('0.01') }
  );

Use:
  const callData = projectEscrow.interface.encodeFunctionData(
      'createProject', 
      [name, budget]
  );
  
  const result = await useGaslessTransaction({
      entryPointAddress: config.accountAbstraction.entryPointAddress,
      paymasterAddress: config.accountAbstraction.paymasterAddress,
      paymasterSigningKey: config.accountAbstraction.paymasterSigningKey,
      rpcUrl: config.accountAbstraction.rpcUrl,
  }).sendGaslessTransaction(
      userAddress,
      projectEscrow.address,
      callData,
      userPrivateKey
  );

2. Token Transfers (Gasless)

Instead of:
  const tx = await finToken.transfer(recipient, amount);

Use:
  const callData = finToken.interface.encodeFunctionData(
      'transfer',
      [recipient, amount]
  );
  
  const result = await useGaslessContractCall({...}).callContract(
      userAddress,
      {
          contractAddress: finToken.address,
          functionName: 'transfer',
          args: [recipient, amount],
          abi: finToken.abi
      },
      userPrivateKey
  );

ENVIRONMENT VARIABLES REQUIRED

VITE_ENTRY_POINT_ADDRESS=0x0000000000000000000000000000000000000001
VITE_PAYMASTER_ADDRESS=0x0000000000000000000000000000000000000002
VITE_PAYMASTER_SIGNING_KEY=0x1234567890123456789012345678901234567890
VITE_BUNDLER_URL=https://bundler.example.com
VITE_RPC_URL=http://localhost:8545

DEPLOYMENT STEPS

1. Deploy SimpleAccount
   - For each user, deploy a SimpleAccount pointing to their address
   - This is their smart wallet on-chain

2. Deploy TokenPaymaster
   - Deploy once on the network
   - Pass FINToken address as accepted token
   - Pass EntryPoint address (from Alchemy or custom)
   - Set initial verified signer (your backend)

3. Fund Paymaster
   - Transfer sufficient FIN tokens to paymaster contract
   - Tokens will be used to subsidize user gas fees
   - Monitor balance and refill as needed

4. Update Config
   - Add deployed addresses to APP_CONFIG in config.ts
   - Set VITE_ENTRY_POINT_ADDRESS to EntryPoint address
   - Set VITE_PAYMASTER_ADDRESS to TokenPaymaster address

5. Configure Bundler
   - Use Alchemy's Bundler (recommended for production)
   - Or deploy your own bundler
   - Update VITE_BUNDLER_URL accordingly

TESTING

Run tests:
  cd contracts
  npm test -- --grep "Account Abstraction"

Tests cover:
- SimpleAccount initialization and ownership
- Account nonce management
- Call execution (single and batch)
- ETH receive functionality
- TokenPaymaster initialization
- Verifier management
- Exchange rate updates
- Access control
- Integration scenarios

SECURITY CONSIDERATIONS

1. Signature Validation
   - All UserOps signed with user's private key
   - Paymaster must verify signatures from authorized signers only
   - Use industry-standard elliptic curve signatures (ECDSA)

2. Nonce Management
   - SimpleAccount tracks nonce per user
   - Bundler must respect nonce ordering
   - Prevents replay attacks

3. Gas Limits
   - Each UserOp has preVerificationGas, verificationGasLimit, callGasLimit
   - Paymaster validates gas cost does not exceed maxCost
   - Prevents gas cost manipulation

4. Token Approval
   - SimpleAccount must approve Paymaster for token transfers
   - Use EIP-2612 permit for gasless approval if available

5. Private Key Management
   - Store paymaster signing key securely
   - Use environment variables (not in code)
   - Rotate keys periodically
   - Store user private keys client-side (never transmit)

ADVANTAGES OF THIS IMPLEMENTATION

1. Better User Experience
   - No need for users to hold ETH for gas
   - Seamless onboarding without fund transfers
   - All fees paid in FIN tokens (ecosystem token)

2. Cost Reduction
   - Batch multiple operations in single UserOp
   - Amortize verification costs across batches
   - Potential for liquidity pool rebates

3. Flexibility
   - Paymaster can sponsor specific operation types
   - Time-based or volume-based sponsorship policies
   - Customizable exchange rates

4. Scalability
   - Bundlers can aggregate thousands of UserOps
   - Single transaction can process many operations
   - Reduces on-chain transaction volume

TROUBLESHOOTING

Issue: "Invalid signature"
Solution: Ensure paymaster signing key matches verified signer address

Issue: "Gas cost exceeded"
Solution: Increase maxCost or decrease callGasLimit in UserOp

Issue: "Nonce already used"
Solution: Increment nonce and retry; ensure bundler doesn't duplicate

Issue: "Insufficient token balance"
Solution: Fund SimpleAccount with FIN tokens for paymaster to charge

Issue: "Bundler timeout"
Solution: Increase polling attempts; check bundler URL is accessible

PRODUCTION DEPLOYMENT

1. Use Alchemy Bundler for mainnet (handles EntryPoint)
2. Deploy TokenPaymaster on mainnet with proper fund reserve
3. Set exchange rate based on market price of ETH and FIN
4. Monitor gas prices and adjust exchange rate daily
5. Implement rate limiting to prevent abuse
6. Add event logging for auditing
7. Set up monitoring alerts for low paymaster balance

FUTURE ENHANCEMENTS

1. Multi-Paymaster Support
   - Allow different paymasters for different token types
   - Support stablecoin and other ERC20 tokens

2. Batch Operations
   - Combine multiple contract calls in single UserOp
   - Further reduce per-operation overhead

3. Time-Locked Operations
   - Support delayed execution
   - Useful for scheduled payments

4. Conditional Logic
   - Support if-this-then-that operations
   - Enable automation workflows

5. Cross-Chain Relaying
   - Use AA for bridging and cross-chain operations
   - Unified experience across networks

ADDITIONAL RESOURCES

EIP-4337 Specification: https://eips.ethereum.org/EIPS/eip-4337
Alchemy Bundler Docs: https://docs.alchemy.com/
OpenZeppelin AA Libraries: https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable

SUPPORT AND MAINTENANCE

For bugs or questions:
1. Check error message in state.error from hooks
2. Review console logs for SDK debug info
3. Verify contract addresses in config.ts
4. Check gas limit estimates for underestimation
5. Ensure bundler is running and accessible

Contact: development@finpro.io
