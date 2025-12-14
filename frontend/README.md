# FinERP Frontend

This is the frontend application for FinERP, a blockchain-based ERP system.

For complete project documentation, see the main [README.md](../README.md) in the project root.

## Frontend Setup

### Prerequisites
- Node.js 18+
- MetaMask browser extension

### Installation
```bash
npm install --legacy-peer-deps
```

### Environment Setup
```bash
cp .env.example .env.local
# Configure your environment variables
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

### Testing
```bash
npm run typecheck          # TypeScript validation
npm run lint              # ESLint checks
npm run test              # Vitest unit tests
```

---

**Authored by Llakterian**
