# FinPro Production Deployment Guide

## Table of Contents
1. Pre-Deployment Requirements
2. Environment Configuration
3. Smart Contract Deployment
4. Backend Services Setup
5. Frontend Deployment
6. Telegram Bot Integration
7. Monitoring and Maintenance
8. Troubleshooting
9. Security Checklist
10. Post-Launch Operations

---

## 1. PRE-DEPLOYMENT REQUIREMENTS

### 1.1 Development Environment Prerequisites
Before deploying to production, ensure you have the following installed:

- Node.js v20+ (LTS recommended)
- npm or yarn package manager
- Git version control system
- Foundry/Anvil for local blockchain testing (optional but recommended)
- A code editor (VS Code recommended)
- Command line terminal access (Terminal, PowerShell, or similar)

### 1.2 External Services Required
You will need accounts and API keys from:

- Ethereum testnet (Sepolia) for staging
- Ethereum mainnet for production (optional)
- Polygon network for alternative deployment
- Supabase for backend database and authentication
- Vercel or similar platform for frontend hosting
- Telegram Bot Father for bot token
- Domain name registrar for custom domain
- SSL/TLS certificate provider (free through Vercel)

### 1.3 Team Access and Permissions
Ensure these are assigned before deployment:

- GitHub repository owner with push access
- Supabase project admin with database access
- Vercel account with deployment permissions
- Telegram bot admin control
- Smart contract deployment account with sufficient funds

### 1.4 Initial Cost Estimation
Deployment costs breakdown:

- Domain name: 10-15 USD per year
- Supabase free tier: 0 USD (with limitations)
- Vercel deployment: 0-20 USD per month
- Ethereum testnet deployment: 0 USD
- Ethereum mainnet deployment: 2000-5000 USD (initial + gas fees)
- Telegram bot: 0 USD
- Total for staging: ~50-100 USD
- Total for mainnet launch: ~3000-7000 USD

---

## 2. ENVIRONMENT CONFIGURATION

### 2.1 Current Environment Status
Your .env file currently contains:

VITE_SUPABASE_URL=https://haslirlxxyrllbaytwop.supabase.co
VITE_SUPABASE_ANON_KEY=[CONFIGURED]
TELEGRAM_BOT_TOKEN=8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54
TELEGRAM_WEBHOOK_URL=https://fin1pro.vercel.app
TELEGRAM_MINI_APP_URL=https://fin1pro.vercel.app
SUPABASE_SERVICE_KEY=[CONFIGURED]
BOT_PORT=3001

### 2.2 Missing Configuration Variables
For production deployment, add the following to your .env file:

# Smart Contract Deployment
PRIVATE_KEY=[Your deployment wallet private key]
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/[YOUR_ALCHEMY_KEY]
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/[YOUR_ALCHEMY_KEY]
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/[YOUR_ALCHEMY_KEY]
ETHERSCAN_API_KEY=[Your Etherscan API key for verification]

# Application URLs
VITE_APP_URL=https://fin1pro.vercel.app
NODE_ENV=production

# Telegram Configuration (Already Configured)
# TELEGRAM_BOT_TOKEN=[CONFIGURED]
# TELEGRAM_WEBHOOK_URL=[CONFIGURED]
# TELEGRAM_MINI_APP_URL=[CONFIGURED]

# Supabase Configuration (Already Configured)
# VITE_SUPABASE_URL=[CONFIGURED]
# VITE_SUPABASE_ANON_KEY=[CONFIGURED]
# SUPABASE_SERVICE_KEY=[CONFIGURED]

### 2.3 How to Obtain Missing Variables

#### Private Key (PRIVATE_KEY)
1. Create a new wallet in MetaMask or similar
2. Fund it with testnet ETH for staging
3. Fund it with real ETH for mainnet (minimum 5 ETH recommended)
4. Export private key (NEVER commit to git, only add to .env locally)
5. Add to GitHub Secrets for Vercel deployment

#### Alchemy API Key
1. Visit https://alchemy.com
2. Create a free account
3. Create app for Sepolia testnet
4. Create app for Ethereum mainnet
5. Copy RPC URLs

#### Etherscan API Key
1. Visit https://etherscan.io
2. Create account
3. Navigate to API Keys
4. Generate new API key
5. Copy and save securely

#### Supabase Configuration
1. Project URL and keys are already configured
2. Verify by logging into Supabase dashboard
3. Check that tables exist: telegram_users, projects, subtasks

### 2.4 Securing Environment Variables

For Local Development:
- Keep .env in .gitignore (already configured)
- Never commit secrets to git
- Use unique keys for development

For Vercel Deployment:
1. Go to Vercel dashboard
2. Navigate to project settings
3. Go to Environment Variables
4. Add all production variables
5. Ensure marked as Production only

For GitHub Actions (CI/CD):
1. Go to GitHub repository settings
2. Navigate to Secrets and Variables
3. Add PRIVATE_KEY as a secret
4. Add RPC URLs as secrets

---

## 3. SMART CONTRACT DEPLOYMENT

### 3.1 Smart Contracts Overview
Your project contains four main smart contracts:

1. FIN Token - ERC-20 token with minting, burning, and pause functionality
2. Project Escrow - Core contract managing project funding and task allocation
3. FIN Swap - Decentralized exchange for token swaps
4. MultiSigWallet - Multi-signature wallet for secure fund management

All contracts use UUPS (Universal Upgradeable Proxy Standard) for future upgrades.

### 3.2 Testnet Deployment (Sepolia)

Step 1: Configure Network
- Ensure SEPOLIA_RPC_URL is set in .env
- Ensure PRIVATE_KEY is set (testnet key)
- Fund deployment account: Get Sepolia ETH from faucet at https://www.alchemy.com/faucets/ethereum

Step 2: Deploy Contracts
Run this command in the contracts directory:
```
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

Step 3: Verify Deployment
- Note the contract addresses from console output
- Visit Etherscan Sepolia: https://sepolia.etherscan.io
- Search for each contract address
- Update src/react-app/lib/config.ts with new addresses

Step 4: Verify Contracts on Etherscan
Run verification commands:
```
npx hardhat verify --network sepolia 0xContractAddress
```

### 3.3 Mainnet Deployment (Ethereum)

Critical: Only proceed after extensive testnet testing

Step 1: Funding
- Ensure deployment account has minimum 5 ETH
- Total gas cost estimated 2-5 ETH depending on network congestion

Step 2: Execute Deployment
```
cd contracts
npx hardhat run scripts/deploy.ts --network mainnet
```

Step 3: Wait for Confirmation
- Deployment takes 10-15 minutes
- Do not restart or interrupt
- Monitor transaction on https://etherscan.io

Step 4: Verify Contracts
After deployment confirms, run:
```
npx hardhat verify --network mainnet 0xContractAddress
```

Step 5: Record Addresses
Save contract addresses in secure location:
- Store in password manager
- Document in internal wiki
- Update production config

### 3.4 Polygon Deployment (Alternative)
Polygon offers lower transaction fees (~1/100th of Ethereum)

Step 1: Deploy
```
cd contracts
npx hardhat run scripts/deploy.ts --network polygon
```

Step 2: Verify
```
npx hardhat verify --network polygon 0xContractAddress
```

Step 3: Update Frontend Config
Update src/react-app/lib/config.ts with Polygon contract addresses

### 3.5 Contract Verification Checklist

After deployment, verify:
- All four contracts deployed successfully
- Contract addresses recorded correctly
- All Etherscan verifications passed
- Frontend config updated with new addresses
- Hardhat compile runs without errors
- All test suite passes with new addresses

---

## 4. BACKEND SERVICES SETUP

### 4.1 Telegram Bot Webhook Configuration

Your Telegram bot is already configured with:
- Bot Token: 8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54
- Webhook URL: https://fin1pro.vercel.app
- Mini App URL: https://fin1pro.vercel.app

Step 1: Register Webhook with Telegram
The webhook is automatically set when bot starts, but you can manually configure:

```
curl -X POST https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/setWebhook \
  -F "url=https://fin1pro.vercel.app/webhook" \
  -F "allowed_updates=message,callback_query"
```

Step 2: Verify Webhook
```
curl https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/getWebhookInfo
```

Expected response shows:
- "pending_count": 0
- "url": "https://fin1pro.vercel.app/webhook"
- "has_custom_certificate": false

Step 3: Test Bot Commands
1. Open Telegram
2. Search for your bot (by token)
3. Send /start command
4. Verify response received
5. Test /help, /projects commands

### 4.2 Supabase Database Setup

Your Supabase project is configured at:
https://haslirlxxyrllbaytwop.supabase.co

Verify these tables exist:
1. telegram_users - Stores Telegram user accounts
2. projects - Project data and funding info
3. subtasks - Task assignments and status
4. profiles - User profiles and roles

Step 1: Verify Tables
1. Go to Supabase dashboard
2. Click "SQL Editor"
3. Run this query:
```
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public';
```

Step 2: Check Realtime Subscriptions
- Navigate to Realtime section
- Enable realtime for: projects, subtasks, telegram_users
- This allows instant updates in the app

Step 3: Configure Row Level Security
For security, enable RLS on all tables:
1. Go to Authentication
2. Enable Row Level Security
3. Add policies for authenticated users
4. Test with sample data

### 4.3 Email and Notifications

Step 1: Configure Telegram Notifications
Telegram notifications are automatic when:
- Project is created
- Task is assigned
- Task status changes
- Payment approved

Step 2: Optional: Add Email Notifications
To add email alerts:
1. Go to Supabase Functions
2. Create function for SendGrid integration
3. Call function on project events
4. Test with sample project creation

### 4.4 Rate Limiting and Security

Step 1: Enable API Rate Limiting
In Supabase:
1. Go to Project Settings
2. Enable "Enforce rate limiting"
3. Set limits to 1000 requests/minute per user

Step 2: Configure CORS
In Vercel:
1. Add to vercel.json:
```
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {"key": "Access-Control-Allow-Credentials", "value": "true"},
        {"key": "Access-Control-Allow-Origin", "value": "https://fin1pro.vercel.app"},
        {"key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"},
        {"key": "Access-Control-Allow-Headers", "value": "Content-Type"}
      ]
    }
  ]
}
```

---

## 5. FRONTEND DEPLOYMENT

### 5.1 Pre-Deployment Checks

Before deploying to production, ensure:
1. All tests pass: npm run build && npm run lint
2. No console errors in dev server
3. Contract addresses updated in config.ts
4. Environment variables configured in Vercel
5. Git commits are up to date

### 5.2 Vercel Deployment

Your app is configured for Vercel deployment.

Step 1: Connect GitHub Repository
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js/Vite configuration

Step 2: Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings
2. Select "Environment Variables"
3. Add these production variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_APP_URL
   - NODE_ENV=production

Step 3: Deploy
1. Click "Deploy"
2. Vercel builds and deploys automatically
3. Takes 3-5 minutes
4. Receives automatic SSL certificate

Step 4: Verify Deployment
1. Visit https://fin1pro.vercel.app
2. Check that page loads without errors
3. Open browser console (F12) - no critical errors
4. Test Web3 wallet connection

### 5.3 Custom Domain Setup

To use your own domain instead of vercel.app:

Step 1: Register Domain
1. Use Namecheap, GoDaddy, or similar
2. Complete registration
3. Note the nameservers

Step 2: Add Domain to Vercel
1. In Vercel project settings
2. Go to "Domains"
3. Enter your domain name
4. Vercel provides nameserver configuration

Step 3: Update Domain Registrar
1. Go to registrar settings
2. Update nameservers to Vercel's
3. Wait 24-48 hours for DNS propagation
4. Verify domain resolves to app

Step 4: Configure Telegram Webhook
Once domain is live:
1. Update TELEGRAM_WEBHOOK_URL in .env
2. Update TELEGRAM_MINI_APP_URL
3. Re-run telegram bot to set new webhook

### 5.4 Build Optimization

To optimize Vercel deployment:

Step 1: Update vercel.json
```
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/**": {
      "memory": 512,
      "maxDuration": 60
    }
  }
}
```

Step 2: Optimize Images
- Replace large images with optimized versions
- Use Vercel Image Optimization

Step 3: Enable Caching
- Set Cache-Control headers for static assets
- Vercel Edge Cache for API responses

---

## 6. TELEGRAM BOT INTEGRATION

### 6.1 Current Bot Status
- Bot Token: 8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54
- Bot Username: Search in Telegram for the bot
- Webhook: https://fin1pro.vercel.app/webhook
- Status: Ready for production

### 6.2 Bot Commands Configuration
The bot supports these commands:
- /start - Initialize and link Telegram account
- /projects - View user's projects
- /tasks - View assigned tasks
- /profile - View user profile
- /stats - View platform statistics
- /help - Show help message
- /ping - Check bot status

All commands are automatically registered on bot startup.

### 6.3 Webhook Deployment

Step 1: Deploy API Endpoint
The webhook endpoint is at: /api/telegram-webhook.ts

In Vercel:
1. This is automatically deployed
2. Endpoint becomes: https://fin1pro.vercel.app/api/telegram-webhook
3. No manual configuration needed

Step 2: Verify Webhook
```
curl https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/getWebhookInfo
```

Should return:
```
{
  "ok": true,
  "result": {
    "url": "https://fin1pro.vercel.app/webhook",
    "has_custom_certificate": false,
    "pending_count": 0,
    "ip_address": "...",
    "last_error_date": null,
    "last_error_message": null,
    "last_synchronization_unixtime": ...
  }
}
```

Step 3: Test Webhook
1. Send a message to the bot in Telegram
2. Check Vercel function logs:
   - Go to Vercel dashboard
   - Select project
   - Go to "Functions"
   - View logs for telegram-webhook
3. Verify message was received

### 6.4 Real-Time Notifications

The bot sends notifications for:
1. Project Creation - When user creates new project
2. Task Assignment - When task is assigned to user
3. Task Status Updates - When task status changes
4. Payment Approvals - When multi-sig approval completes

These are triggered by Supabase webhooks automatically.

### 6.5 User Authentication in Bot

How users link their Telegram account:
1. User opens Telegram bot
2. Sends /start command
3. System checks if account exists in telegram_users table
4. If new: Prompts to open Mini App and connect wallet
5. If existing: Shows welcome message
6. User wallet is linked to Telegram ID

This prevents unauthorized access to other users' projects.

---

## 7. MONITORING AND MAINTENANCE

### 7.1 Error Monitoring
Set up error tracking to catch issues immediately:

Option 1: Sentry (Recommended)
1. Create account at https://sentry.io
2. Create project for FinPro
3. Add Sentry to frontend:
```
npm install @sentry/react @sentry/tracing
```
4. Initialize in src/react-app/main.tsx
5. Errors automatically reported

Option 2: Vercel Analytics
1. Already included with Vercel deployment
2. View in Vercel dashboard
3. See real-time metrics

### 7.2 Performance Monitoring

Monitor these metrics weekly:
- Page load time (target: <3 seconds)
- API response time (target: <500ms)
- User transaction completion rate (target: >95%)
- Contract call success rate (target: 99.9%)

In Vercel:
1. Go to Analytics tab
2. View Core Web Vitals
3. Monitor for performance regressions

### 7.3 Database Monitoring

Monitor Supabase:
1. Storage usage (monthly)
2. Query performance
3. Row count growth
4. Authentication metrics

Steps:
1. Login to Supabase dashboard
2. Go to Reports
3. Review graphs weekly
4. Alert if approaching limits

### 7.4 Blockchain Monitoring

Monitor smart contracts:
1. Total Value Locked (TVL)
2. Number of projects
3. Number of users
4. Transaction volumes

Tools:
- Etherscan dashboard for contract address
- Dune Analytics for custom dashboards
- DefiLlama for TVL tracking

### 7.5 Telegram Bot Monitoring

Monitor bot health:
1. Number of daily active users
2. Command usage statistics
3. Error rates
4. Webhook latency

Steps:
1. View bot statistics in Telegram Bot API:
```
curl https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/getMe
```

2. Log command usage in database
3. Create Supabase query to track metrics
4. Set alerts for failures

---

## 8. TROUBLESHOOTING

### 8.1 Common Issues and Solutions

Issue: "Contract not found" error in app
Solution:
1. Verify contract addresses in src/react-app/lib/config.ts
2. Ensure addresses match deployed contracts
3. Check you're on the correct network
4. Refresh browser and clear cache

Issue: Telegram webhook not responding
Solution:
1. Verify webhook URL in Telegram settings
2. Check TELEGRAM_BOT_TOKEN is correct
3. Verify Vercel deployment is live
4. Check Vercel function logs for errors
5. Ensure TELEGRAM_WEBHOOK_URL ends with /webhook

Issue: Supabase connection failing
Solution:
1. Verify VITE_SUPABASE_URL is correct
2. Verify VITE_SUPABASE_ANON_KEY is correct
3. Check Supabase project is active
4. Verify Row Level Security policies allow access
5. Check network connectivity to supabase.co

Issue: MetaMask connection fails
Solution:
1. Ensure wallet is unlocked
2. Switch to correct network
3. Clear MetaMask cache
4. Restart browser
5. Try different browser or device

Issue: Low gas prices causing slow transactions
Solution:
1. Wait for network congestion to decrease
2. Increase gas price if urgent
3. Use Polygon network instead (lower fees)
4. Batch transactions to reduce number

Issue: Smart contract reverts
Solution:
1. Check Etherscan for revert reason
2. Verify user has sufficient token balance
3. Verify contract allowance is set
4. Check contract state (is it paused?)
5. Verify function parameters are correct

### 8.2 Emergency Procedures

If Critical Issue Occurs:
1. Pause bot: Stop Telegram bot from accepting commands
2. Pause app: Disable main page functionality temporarily
3. Assess impact: How many users affected?
4. Communicate: Post status update
5. Fix: Deploy emergency patch
6. Test: Thoroughly test before resuming

How to Pause Application:
1. Create maintenance page in Vercel
2. Deploy with redirect
3. Users see "Currently under maintenance"
4. Post ETA for resumption

How to Pause Telegram Bot:
1. Remove webhook: 
```
curl -X POST https://api.telegram.org/bot8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/deleteWebhook
```
2. Bot stops responding to updates
3. Restore webhook when issue fixed

### 8.3 Rollback Procedures

If deployment causes issues:

Frontend Rollback:
1. Go to Vercel dashboard
2. Go to Deployments
3. Click previous stable deployment
4. Click "Promote to Production"
5. Takes 30 seconds

Contract Rollback:
Note: Smart contracts cannot be changed once deployed
However, you can:
1. Deploy new version with fix
2. Migrate users to new contract
3. Or use proxy pattern to point to new implementation

---

## 9. SECURITY CHECKLIST

### 9.1 Pre-Launch Security Review

Complete this checklist before going live:

Code Security:
- [ ] No hardcoded secrets in code
- [ ] All env variables use .env file
- [ ] Private keys never exposed in git
- [ ] API keys rotated before launch
- [ ] Dependencies audited (npm audit)
- [ ] No console.log of sensitive data

Blockchain Security:
- [ ] Smart contracts audited by professional
- [ ] All edge cases tested
- [ ] Overflow/underflow protection implemented
- [ ] Reentrancy guards in place
- [ ] Access control properly configured
- [ ] Rate limiting for critical functions

Frontend Security:
- [ ] HTTPS enabled (default with Vercel)
- [ ] Content Security Policy configured
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Input validation on all forms
- [ ] No sensitive data in localStorage

Backend Security:
- [ ] Supabase RLS enabled on all tables
- [ ] API endpoints authenticated
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Webhook signature verification

Infrastructure Security:
- [ ] Vercel environment variables encrypted
- [ ] GitHub secrets properly configured
- [ ] Database backups enabled
- [ ] Monitoring and alerting enabled
- [ ] Incident response plan documented

### 9.2 Ongoing Security Practices

Weekly:
- Check for security updates
- Review error logs
- Monitor for suspicious activity
- Test backup and recovery procedures

Monthly:
- Rotate API keys
- Audit access logs
- Review user permissions
- Update security policies

Quarterly:
- Security audit of codebase
- Penetration testing
- Update disaster recovery plan
- Team security training

### 9.3 Incident Response Plan

When Security Issue Found:
1. Isolate affected systems
2. Notify team immediately
3. Assess scope and severity
4. Create incident report
5. Develop fix
6. Test fix thoroughly
7. Deploy with monitoring
8. Post-mortem analysis

Contact List (Keep Updated):
- Security team lead: [Phone/Email]
- DevOps lead: [Phone/Email]
- CEO/Project lead: [Phone/Email]
- Supabase support: support@supabase.io
- Vercel support: support@vercel.com

---

## 10. POST-LAUNCH OPERATIONS

### 10.1 Day 1 - Go Live Checklist

Morning of Launch:
- [ ] All services operational
- [ ] Database backups running
- [ ] Monitoring systems active
- [ ] Status page ready
- [ ] Support team briefed
- [ ] Incident response plan reviewed

During Launch:
- [ ] Monitor error logs continuously
- [ ] Check user signup rate
- [ ] Verify transactions completing
- [ ] Test all major user flows
- [ ] Monitor contract interactions
- [ ] Check Telegram bot responses

### 10.2 Week 1 Operations

Daily:
- Review error logs and metrics
- Check contract health
- Monitor database performance
- Review user feedback

Address Issues:
- Fix critical bugs immediately
- Schedule non-critical fixes
- Update documentation
- Communicate with users

Track Metrics:
- User signups per day
- Active users per day
- Transactions per day
- Error rate
- API response time

### 10.3 First Month Operations

Ongoing:
- Weekly security review
- Bi-weekly performance review
- User feedback incorporation
- Feature improvement planning

Scaling Preparation:
- Monitor growth rate
- Identify scaling bottlenecks
- Plan infrastructure upgrades
- Prepare additional resources

User Support:
- Monitor support tickets
- Create FAQ documentation
- Create tutorial videos
- Improve onboarding flow

### 10.4 Scaling Strategy

If Daily Active Users Exceed 100:
1. Upgrade Supabase plan
2. Enable Supabase connection pooling
3. Increase Vercel resources
4. Implement caching layer

If Daily Active Users Exceed 1000:
1. Move to dedicated database
2. Implement CDN for static assets
3. Scale blockchain nodes
4. Consider Layer 2 solution (Polygon)

If Daily Active Users Exceed 10000:
1. Consider sharding or partitioning
2. Implement advanced caching
3. Multi-region deployment
4. Load balancing

---

## NEXT STEPS

Step 1: Obtain Missing Variables
- Get Alchemy RPC URLs
- Get Etherscan API key
- Get deployment private key (with funds)
- Configure in .env

Step 2: Deploy to Testnet
- Deploy contracts to Sepolia
- Verify contracts on Etherscan
- Test frontend with testnet addresses
- Test Telegram bot integration

Step 3: Comprehensive Testing
- Run full test suite
- Test all user flows
- Stress test with multiple users
- Test error scenarios

Step 4: Final Verifications
- Security audit completed
- All monitoring configured
- Incident response plan ready
- Team trained and ready

Step 5: Deploy to Mainnet
- Deploy contracts to Ethereum
- Update frontend configuration
- Deploy to Vercel
- Enable monitoring
- Announce to users

Step 6: Monitor Post-Launch
- Daily check-ins
- Weekly reviews
- User feedback incorporation
- Continuous improvement

---

## APPENDIX: USEFUL COMMANDS

Deploy to Testnet:
```
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

Deploy to Mainnet:
```
cd contracts
npx hardhat run scripts/deploy.ts --network mainnet
```

Verify Contracts:
```
npx hardhat verify --network sepolia 0xContractAddress
```

Test Smart Contracts:
```
cd contracts
npm test
```

Build Frontend:
```
npm run build
```

Test Telegram Webhook:
```
curl -X POST https://api.telegram.org/bot[TOKEN]/setWebhook \
  -F "url=https://yourdomain.com/webhook"
```

Check Telegram Bot Status:
```
curl https://api.telegram.org/bot[TOKEN]/getWebhookInfo
```

---

## SUPPORT AND RESOURCES

For help with deployment:
- Vercel documentation: https://vercel.com/docs
- Supabase documentation: https://supabase.com/docs
- Ethereum documentation: https://ethereum.org/developers
- Hardhat documentation: https://hardhat.org/docs
- Telegram Bot API: https://core.telegram.org/bots/api

For security concerns:
- Contact blockchain security auditor
- Report vulnerabilities responsibly
- Keep dependencies updated

---

This guide covers the complete journey from development to production. Follow each section carefully and verify all steps before proceeding to the next.

Your FinPro platform is ready for production deployment.
