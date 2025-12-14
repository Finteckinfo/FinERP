# FIN Token Whitepaper (Draft)

**Document status**: Draft (needs final numbers + legal review)  
**Project**: FinERP  
**Token**: FIN  
**Last updated**: 2025-12-14  

> **Disclaimer**: This document is for informational purposes only and does not constitute financial advice, investment advice, or an offer to sell securities. Token design, utility, and distribution may change. Always consult legal counsel before any token launch.

---

## 1. Abstract

FinERP is a Web3-native enterprise resource planning (ERP) platform that integrates **project management**, **escrow-based payments**, and **token-powered settlement** to enable secure, transparent coordination between employers, teams, and vendors.

The **FIN** token is a utility token designed to facilitate:

- Settlement of work and invoices inside the FinERP ecosystem
- Escrow funding and milestone payments
- Optional integration with a built-in DEX module for swaps/liquidity

---

## 2. Problem

Modern remote teams face recurring problems:

- **Payment risk**: workers worry about late/non-payment; employers worry about incomplete work.
- **Dispute complexity**: proving work completion is difficult; escrow solutions are fragmented.
- **Cross-border friction**: fees, delays, and compliance overhead reduce efficiency.
- **Lack of transparency**: stakeholders lack a shared source of truth for funds allocation and release.

---

## 3. Solution: FinERP

FinERP combines:

- **Project workflows** (tasks, assignments, progress)
- **Escrow smart contracts** that hold funds and release them based on workflow state
- **Role-based controls** for managers/approvers and large payments
- **Optional DEX module** for token swaps and liquidity operations

### Core workflow

1. Employer funds project escrow with FIN (or swaps into FIN).
2. Tasks are allocated with FIN amounts.
3. Worker completes tasks.
4. Payment is released automatically for small tasks, or after multi-approval for large tasks.
5. Unused funds can be refunded to employer after a timelock.

---

## 4. Token Overview (FIN)

- **Symbol**: FIN
- **Standard**: ERC-20
- **Decimals**: 18
- **Max supply**: 100,000,000 FIN *(based on current contract implementation)*

### 4.1 Utility

FIN is intended to be used inside FinERP for:

- Funding project escrow balances
- Paying workers, contractors, suppliers
- Potential incentives (e.g., usage rewards, fee rebates) *(optional)*
- Governance features *(optional; not enabled by default)*

### 4.2 “Peg” / Price Stability (Clarification)

Some documentation refers to “1 FIN = 1 USDT”. A DEX pool + liquidity **does not guarantee a peg** by itself.

If a stable value is required, FinERP should implement one of:

- A managed treasury/market-making policy
- A stablecoin-backed redemption mechanism
- A hybrid design (FIN as an internal settlement unit with stablecoin rails)

**PLACEHOLDER**: confirm which mechanism you want to claim publicly.

---

## 5. Economics & Fees

### 5.1 DEX swap fee

The current FINSwap contract implements a swap fee of **0.3%** (30 bps).

**PLACEHOLDER**: define fee recipient policy:

- retained in the pool (LPs)
- routed to a treasury
- split between LPs/treasury

### 5.2 Escrow release policy

The escrow contract currently enforces:

- auto-release below **10,000 FIN**
- multi-approval above **10,000 FIN**
- refunds after **24 hours** timelock

---

## 6. Token Distribution (PLACEHOLDER)

**This section must be finalized before any launch.**

Provide:

- allocations (% and absolute FIN)
- vesting schedules
- lockups
- treasury controls

### Suggested template

| Allocation | % | Amount (FIN) | Vesting / Lock |
|-----------:|---:|-------------:|----------------|
| Community & Ecosystem | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |
| Liquidity | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |
| Team | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |
| Advisors | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |
| Treasury / Foundation | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |
| Strategic Partners | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |
| Public Sale (if any) | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |

---

## 7. Governance (Optional)

Governance is **not required** for initial product functionality.

If enabled later, governance may cover:

- protocol parameters (fees, thresholds)
- treasury policies
- upgrade approvals

**PLACEHOLDER**: decide whether governance is in-scope for V1.

---

## 8. Technology

### 8.1 Smart contracts

FinERP includes:

- `FINToken` (upgradeable ERC-20)
- `ProjectEscrow` (upgradeable escrow)
- `FINSwap` (upgradeable AMM-style swap)
- `MultiSigWallet` (upgradeable multisig)

### 8.2 Security measures

- role-based access control
- pausable emergency stops
- reentrancy protections
- multi-approval for large releases
- timelocked refunds
- upgradeability via UUPS (requires strict ops discipline)

---

## 9. Roadmap (PLACEHOLDER)

Example structure:

- **Phase 1**: MVP — wallet auth, escrow funding/release, basic project flows
- **Phase 2**: production-grade backend, audit, monitoring, alerting
- **Phase 3**: governance/treasury tooling, integrations, compliance hardening

---

## 10. Risks

- **Smart contract risk**: bugs, economic attacks, upgrade misuse
- **Liquidity risk**: shallow liquidity can cause volatility
- **Regulatory risk**: token classification varies by jurisdiction
- **Operational risk**: key management, multisig governance, incident response

---

## 11. Legal & Compliance (PLACEHOLDER)

You should decide and document:

- jurisdictions excluded/allowed
- KYC/AML requirements (if any)
- token offering structure (if any)

---

## Appendix A — Open Questions (Need Your Answers)

1. Is FIN meant to be:
   - a pure utility token, or
   - a settlement token with stability target, or
   - a governance token?
2. What is the **final distribution** and **vesting** plan?
3. Is there a treasury? Who controls it (multisig signers)?
4. If you claim a “peg”, what is the actual enforcement mechanism?


