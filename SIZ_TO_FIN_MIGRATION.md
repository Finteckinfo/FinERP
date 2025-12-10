# SIZ to FIN Migration Summary

This document summarizes all changes made to remove Sizland/SIZ ecosystem references and replace them with FIN token references for the independent FinERP project.

## Completed Changes

### 1. Service Files
- ✅ Renamed `sizTokenService.ts` → `finTokenService.ts`
- ✅ Updated all function names: `getSizTokenBalance` → `getFINTokenBalance`
- ✅ Updated interface: `SizTokenBalance` → `FINTokenBalance`
- ✅ Renamed `sizTokenConfig.ts` → `finTokenConfig.ts`

### 2. Components
- ✅ Renamed `SizTokenBalance.vue` → `FINTokenBalanceWidget.vue`
- ✅ Created `FINBadge.vue` to replace `SIZCOINBadge.vue`
- ✅ Updated all references from SIZ to FIN in component files

### 3. Remaining Work

#### Files Still Needing Updates:
1. **`src/views/projects/CreateProject.vue`**
   - Line 497: `import { getSizTokenBalance } from '@/services/sizTokenService';`
   - Line 649: `getSizTokenBalance` function call
   - Update to use `getFINTokenBalance` from `finTokenService`

2. **`src/views/pages/settings/SettingsTabs.vue`**
   - Line 465: `import { getSizTokenBalance, type SizTokenBalance } from '@/services/sizTokenService';`
   - Line 531: `const sizBalance = ref<SizTokenBalance | null>(null);`
   - Line 748: Comment mentions "Load SIZ balance from Algorand"
   - Line 760-761: `getSizTokenBalance` calls
   - Update to use FIN token service

3. **`src/views/dashboards/default/components/EarningsWidget.vue`**
   - Line 187: `import { getSizTokenBalance, type SizTokenBalance } from '@/services/sizTokenService';`
   - Line 201: `const walletBalance = ref<SizTokenBalance | null>(null);`
   - Line 236: `getSizTokenBalance` call
   - Update to use FIN token service

4. **`src/views/dashboards/default/components/ProjectBudgetWidget.vue`**
   - Line 91: `import { getSizTokenBalance, type SizTokenBalance } from '@/services/sizTokenService';`
   - Update to use FIN token service

5. **URL References to Replace:**
   - All `siz.land` → `finerp.com` (or your domain)
   - All `www.siz.land` → `www.finerp.com`
   - All `.siz.land` cookie domains → `.finerp.com`

6. **Files with siz.land URLs:**
   - `src/composables/useAuth.ts`
   - `src/composables/useNextAuth.ts`
   - `src/services/nextAuthService.ts`
   - `src/utils/cookies.ts`
   - `src/router/guards/authGuard.ts`
   - `src/components/guards/WalletGuard.vue`
   - `src/views/authentication/SSOCallback.vue`
   - `src/views/projects/CreateProject.vue`
   - `src/components/onboarding/WalletTutorial.vue`

7. **Remove/Update Files:**
   - Delete `src/components/shared/SIZCOINBadge.vue`
   - Delete `src/components/shared/SIZCOINBadge.ts`
   - Delete `src/assets/images/logos/SIZLAND LOGO SVG.svg` (if not needed)

8. **Documentation Updates:**
   - Update all README files mentioning Sizland
   - Update `URL_CONFIGURATION.md` to remove siz.land references
   - Update comments mentioning SIZCOIN/SIZ tokens

## Environment Variables to Update

Update `.env` file to use FinERP domain instead of siz.land:
- `VITE_SSO_PRIMARY_DOMAIN` should point to FinERP domain (not siz.land)
- All cookie domains should use FinERP domain

## Notes

- This project is now completely independent from Sizland ecosystem
- All token references should be FIN (not SIZ/SIZCOIN)
- All URLs should point to FinERP domain
- All Algorand references have been removed (EVM-only)

