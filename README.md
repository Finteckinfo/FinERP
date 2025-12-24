# FinPro - Decentralized Project Management

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-blue?style=flat-square&logo=vercel)](https://finpro-finteckinfo.vercel.app)

Secure remote team payments with blockchain escrow technology.

## Overview

FinPro is a decentralized project management platform that combines traditional task tracking with blockchain-secured escrow payments. Built for remote teams, freelancers, and DAOs, it ensures transparent and trustless collaboration through smart contract-based fund management.

## Key Features

### Trustless Escrow System
- Smart contracts hold funds securely until work is approved
- Automatic fund release upon task completion
- Zero counterparty risk

### Wallet-Based Authentication
- Connect with MetaMask, WalletConnect, or any EVM wallet
- No passwords needed - your wallet is your identity
- Instant authentication and authorization

### Complete Project Visibility
- Track budgets and allocations in real-time
- Monitor task progress and approvals
- Transparent fund distribution

### Comprehensive Task Management
- Create projects with allocated budgets
- Break down work into subtasks
- Built-in approval and review workflow

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

### Backend & Database
- Supabase (PostgreSQL)
- Row Level Security (RLS) policies
- Real-time subscriptions

### Blockchain
- Ethereum network support
- EVM wallet integration (MetaMask, WalletConnect)
- Ethers.js for blockchain interaction

### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Vite for fast builds

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An Ethereum wallet (MetaMask recommended)
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Finteckinfo/FinPro.git
cd FinPro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://your-project.vercel.app
```

4. Apply the database schema:
- Open your Supabase SQL Editor
- Copy and run the contents of `supabase_schema.sql`

5. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

The production build will be output to the `dist` directory.

## Usage

### Connect Your Wallet
1. Navigate to the login page
2. Click "Connect Wallet"
3. Approve the connection in your wallet extension

### Create Your First Project
1. Click "New Project" in the header
2. Enter project name, description, and total budget
3. Submit to create the project

### Add Subtasks
1. Open a project from the dashboard
2. Click "New Subtask"
3. Enter task details and allocate funds
4. Assign to team members (optional)

### Track Progress
1. Team members update task status as they work
2. Submit tasks for review when complete
3. Project owner reviews and approves/rejects
4. Funds are released upon approval

## Project Structure

```
FinPro/
├── src/
│   ├── react-app/           # Frontend React application
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries (config, supabase)
│   │   ├── pages/           # Page components
│   │   └── App.tsx          # Main app component
│   ├── shared/              # Shared types and utilities
│   └── worker/              # Cloudflare Worker (legacy)
├── supabase_schema.sql      # Database schema and migrations
├── package.json             # Dependencies and scripts
├── .env.example             # Example environment variables
└── vite.config.ts           # Vite configuration
```

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- **users**: Wallet-based user profiles (id is EVM address)
- **projects**: Project metadata and budget tracking
- **subtasks**: Individual tasks within projects
- **token_balances**: User token balances (FINe, USDT)
- **swap_transactions**: Token swap history
- **token_transactions**: All token movements

All tables have Row Level Security (RLS) enabled with public access policies for anonymous (wallet-based) authentication.

## Security

- Wallet-based authentication (no passwords to leak)
- Row Level Security (RLS) on all database tables
- Client-side wallet signature verification
- Input validation on all forms
- Secure environment variable handling

## Deployment

### Vercel (Current)

**Live Application**: https://finpro-finteckinfo.vercel.app

If you are seeing a "Log in to Vercel" wall or hydration errors:
1.  Go to your **Vercel Dashboard** > **Settings** > **Deployment Protection**.
2.  Set **Vercel Authentication** to **Disabled**.
3.  Go to **Settings** > **Toolbar** and set it to **Disabled**.
4.  Trigger a **Redeploy** from the latest commit.

### Alternative Hosts (Recommended)

This project is optimized for several free hosting platforms. We have included a `public/_redirects` file for seamless routing.

#### Netlify
1.  Connect your GitHub repository to [Netlify](https://www.netlify.com/).
2.  **Build Command**: `npm run build`
3.  **Publish Directory**: `dist`
4.  **Environment Variables**: Add your `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL`.

#### Cloudflare Pages
1.  Go to **Workers & Pages** in your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Connect your Git repository.
3.  **Framework Preset**: Vite
4.  **Build Command**: `npm run build`
5.  **Output Directory**: `dist`
6.  **Environment Variables**: Add necessary `VITE_` variables in the Settings tab.

## Contributing

Contributions are welcome! Areas for enhancement:

- Multi-chain support (Polygon, BSC, Arbitrum)
- Smart contract integration for on-chain escrow
- Advanced analytics and reporting
- Team collaboration features
- Mobile app development

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/Finteckinfo/FinPro/issues
- Documentation: See this README

---

Built with React, TypeScript, Supabase, and Ethereum technology.
