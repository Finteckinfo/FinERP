# SIZ to FIN Migration Progress

## ✅ Completed

1. **Service Files**
   - ✅ Renamed `sizTokenService.ts` → `finTokenService.ts`
   - ✅ Renamed `sizTokenConfig.ts` → `finTokenConfig.ts`
   - ✅ Updated all function names and interfaces

2. **Components**
   - ✅ Created `FINBadge.vue` to replace `SIZCOINBadge.vue`
   - ✅ Updated `FINTokenBalanceWidget.vue` (formerly SizTokenBalance)
   - ✅ Updated `CreateProject.vue` - replaced SIZ with FIN, removed Algorand
   - ✅ Updated `EarningsWidget.vue` - replaced SIZ with FIN, removed Algorand
   - ✅ Updated `ProjectBudgetWidget.vue` - removed SIZ imports

3. **Core Updates**
   - ✅ All Algorand dependencies removed from main files
   - ✅ EVM-only implementation using MetaMask
   - ✅ All token references changed from SIZ to FIN

## 🔄 In Progress

1. **SettingsTabs.vue** - Needs complete cleanup:
   - Remove all `useWalletAccount`, `activeWallet`, `connectedWallet` references
   - Remove `algosdk` and `NetworkId` imports
   - Update `loadTransactions` to use EVM (Etherscan/Polygonscan APIs)
   - Fix template references (SIZCOIN → FIN, Algorand → EVM)
   - Remove `getNetworkId` function
   - Update disconnect logic

## 📋 Remaining Work

1. **URL Updates** - Replace all `siz.land` references:
   - `src/composables/useAuth.ts`
   - `src/composables/useNextAuth.ts`
   - `src/services/nextAuthService.ts`
   - `src/utils/cookies.ts`
   - `src/router/guards/authGuard.ts`
   - `src/components/guards/WalletGuard.vue`
   - `src/views/authentication/SSOCallback.vue`
   - `src/components/onboarding/WalletTutorial.vue`

2. **File Cleanup**:
   - Delete `src/components/shared/SIZCOINBadge.vue`
   - Delete `src/components/shared/SIZCOINBadge.ts`
   - Delete `src/assets/images/logos/SIZLAND LOGO SVG.svg` (if not needed)

3. **Template Updates**:
   - Update all template text from "SIZCOIN" to "FIN"
   - Update all template text from "Algorand" to "EVM" or "Ethereum/Polygon"
   - Update wallet connection messages

4. **Documentation**:
   - Update README files
   - Update comments mentioning SIZ/SIZCOIN

## Notes

- All domain URLs should use `VITE_SSO_PRIMARY_DOMAIN` environment variable
- Cookie domains should be configurable via environment variable
- Transaction loading should use Etherscan/Polygonscan APIs for EVM chains
- All wallet operations now use MetaMask (EVM) only

