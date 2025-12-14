# Authentication & NextAuth Audit Notes

## What’s in this repo

- This repository’s primary app is a **Vue 3 + Vite** frontend (not a Next.js app).
- There is **no `next-auth` / `nextauth.js` package dependency** in either:
  - `/package.json` (root app)
  - `/frontend/package.json` (secondary app copy)
  - corresponding `package-lock.json` files

## Why you still see “NextAuth” in code

Some frontend modules reference cookie names like:

- `next-auth.session-token`
- `__Secure-next-auth.session-token`

This is typically done for **interoperability** when an *external* SSO/auth system happens to set cookies using NextAuth’s conventional names.

In this repo, those cookies are treated as **opaque bearer tokens** used for API calls and “signed-in” checks in a few places (e.g. `src/composables/useNextAuth.ts`, `src/services/nextAuthService.ts`, `src/router/guards/authGuard.ts`).

## Important security note (frontend-only validation)

A browser app **cannot safely “validate” a JWT** purely by decoding it (base64 decode) — that does **not** verify the signature.

If your UI uses token decoding to decide “signed in” vs “signed out”, an attacker can spoof UI state by setting a fake cookie. Backend APIs should still reject requests, but the UI state can be misleading.

## Recommendations

### 1) If you run NextAuth elsewhere (separate repo/service)

This Vue repo is not running NextAuth itself. If your SSO is a separate **Next.js + NextAuth** service:

- **Identify the exact NextAuth version** running there (package.json).
- **Upgrade/pin** to a known safe version per the advisory you referenced.
- **Rotate secrets** if the advisory involves token/cookie integrity.
- Ensure cookies are:
  - `HttpOnly`
  - `Secure`
  - `SameSite=Lax` or `Strict` (depending on SSO flow)

### 2) Prefer wallet-based gating for Web3 flows

For Web3 flows, prefer using **wallet connection + signature-based login** rather than relying on a NextAuth-named cookie.

### 3) Reduce “NextAuth” coupling in this repo (optional but recommended)

- Rename “NextAuth” wrappers to “Session/SSO” naming to avoid confusion.
- Prefer a **single auth source of truth** (either wallet-first, or SSO-first + server validation).

## What I need from you to finish this audit

1. Do you have a **separate Next.js/NextAuth repo** (SSO server)? If yes, share:
   - repo link/name (or path)
   - currently deployed version
2. In production, which mechanism is authoritative?
   - **Wallet-only**
   - **SSO-only**
   - **SSO + wallet linked**


