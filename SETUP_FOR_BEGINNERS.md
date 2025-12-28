SETUP FOR BEGINNERS

Complete Step-by-Step Guide to Run FinPro

No Prior Experience Required

This guide is designed for someone with little or no blockchain/development experience. We explain every step in simple terms.

What You Will Need (Hardware)

1. Computer (Mac, Windows, or Linux)
   Minimum specs:
   - RAM: 4GB (8GB recommended)
   - Storage: 2GB free
   - CPU: Dual-core (any modern processor)

2. Internet Connection
   - At least 5 Mbps
   - Stable connection recommended

3. Text Editor or IDE
   Recommendation: Visual Studio Code (free)
   Download from: https://code.visualstudio.com

That's it! You don't need anything else physical.

What You Will Need (Software - We'll Install Everything)

All software is free and open-source:
- Node.js (JavaScript runtime)
- npm (package manager)
- Git (version control)
- Anvil (local blockchain for testing)
- Hardhat (smart contract tools)

We'll install all of these in the steps below.

Part 1: Initial Setup (20 minutes)

Step 1: Install Node.js

Windows:
1. Go to https://nodejs.org
2. Click "Download" (get the LTS version)
3. Run the installer
4. Click "Next" for each step
5. Accept the default options
6. Restart your computer

Mac:
1. Go to https://nodejs.org
2. Click "Download" (get the LTS version)
3. Run the installer (.pkg file)
4. Follow the installation wizard

Linux (Ubuntu/Debian):
1. Open Terminal
2. Run: sudo apt-get update && sudo apt-get install nodejs npm

Verify Installation:
1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
2. Type: node --version
3. You should see a version number (v20 or higher)
4. Type: npm --version
5. You should see a version number

Step 2: Install Git

Windows/Mac:
1. Go to https://git-scm.com
2. Click "Download"
3. Run the installer
4. Accept all default options

Linux (Ubuntu/Debian):
1. Open Terminal
2. Run: sudo apt-get install git

Verify Installation:
1. Open Command Prompt/Terminal
2. Type: git --version
3. You should see a version number

Step 3: Install Visual Studio Code (Optional but Recommended)

1. Go to https://code.visualstudio.com
2. Click "Download"
3. Run the installer
4. Launch the application

Recommended VS Code Extensions (after install):
- Solidity (for smart contracts)
- Prettier (for code formatting)
- ESLint (for code quality)

Step 4: Install Foundry (for Anvil - Local Blockchain)

Windows:
1. Go to https://github.com/foundry-rs/foundry#windows
2. Follow the "Using foundryup" instructions
3. Open Command Prompt and run:
   curl -L https://foundry.paradigm.xyz | bash
4. Close and reopen Command Prompt
5. Run: foundryup

Mac/Linux:
1. Open Terminal
2. Run: curl -L https://foundry.paradigm.xyz | bash
3. Close and reopen Terminal
4. Run: foundryup

Verify Installation:
1. Open Command Prompt/Terminal
2. Type: anvil --version
3. You should see a version number

Part 2: Getting the Code (10 minutes)

Step 1: Clone the Repository

1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
2. Navigate to where you want the project:
   cd Documents (or any folder you prefer)
3. Clone the repository:
   git clone https://github.com/Finteckinfo/FinPro.git
4. Enter the project:
   cd FinPro

Step 2: Install Project Dependencies

In the Command Prompt/Terminal (still in FinPro folder):

Root dependencies:
npm install

Smart contract dependencies:
cd contracts
npm install
cd ..

This downloads all the project files needed to run. First time takes 2-3 minutes.

Part 3: Configuration (15 minutes)

Step 1: Create Environment File

1. In VS Code, open the FinPro folder (File > Open Folder)
2. Look for the file named ".env.example"
3. Copy this file and rename it to ".env"
4. Open the ".env" file

Step 2: Fill in Required Values

You'll see variables that look like:
VITE_SUPABASE_URL=
TELEGRAM_BOT_TOKEN=

These are already configured for testing. You don't need to change anything.

Values that are Already Set (DO NOT CHANGE):
- VITE_SUPABASE_URL (test database)
- VITE_SUPABASE_ANON_KEY (test access key)
- TELEGRAM_BOT_TOKEN (test bot)
- SUPABASE_SERVICE_KEY (test service key)

Values You Can Keep as-is for Local Testing:
- VITE_ENTRY_POINT_ADDRESS
- VITE_PAYMASTER_ADDRESS
- VITE_PAYMASTER_SIGNING_KEY
- VITE_BUNDLER_URL
- VITE_RPC_URL (already set to localhost)

Step 3: Save the File

- The .env file is ready
- No other configuration needed for local testing

Part 4: Running the Application (30 minutes - first time)

You'll need to run several services. Each runs in its own terminal.

Terminal 1: Start the Local Blockchain (Anvil)

1. Open a new Command Prompt/Terminal
2. Navigate to FinPro folder: cd path/to/FinPro
3. Run: anvil --host 0.0.0.0 --port 8545 --chain-id 31337 --accounts 10

What you should see:
```
          _   _
         | | | |
         | |_| | _____ __
         |  _  |/ _ \ \ /
         | | | |  __/> <
         \_| |_/\___/_/\_\

Done...
Listening on 127.0.0.1:8545
```

This is your local blockchain. Keep this terminal open.

Terminal 2: Deploy Smart Contracts

1. Open a new Command Prompt/Terminal
2. Navigate to contracts: cd path/to/FinPro/contracts
3. Run: npx hardhat run scripts/deploy.ts --network localhost

What you should see:
```
Deploying contracts...
FINToken deployed to: 0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1
ProjectEscrow deployed to: 0x68B1D87F95878fE05B998F19b66F4baba5De1aed
FINSwap deployed to: 0x59b670e9fA9D0A427751Af201D676719a970857b
MultiSigWallet deployed to: 0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1
```

Copy these addresses - you might need them. This terminal can be closed after.

Terminal 3: Start the Frontend (React App)

1. Open a new Command Prompt/Terminal
2. Navigate to FinPro: cd path/to/FinPro
3. Run: npm run dev

What you should see:
```
  VITE v6.x.x
  ready in 500ms

  Local: http://localhost:5173/
  Press q to quit
```

Terminal 4 (Optional): Start Telegram Bot

1. Open a new Command Prompt/Terminal
2. Navigate to FinPro: cd path/to/FinPro
3. Run: npm run bot:dev

What you should see:
```
Bot server running on port 3001
```

Your System Is Now Running!

Open your web browser and go to: http://localhost:5173

You should see the FinPro application loaded.

Part 5: Using the Application

Creating Your First Project

1. Click "Create Project" button
2. Enter project details:
   - Project Name: "My Test Project"
   - Budget: "1000" (FIN tokens)
   - Description: "Testing FinPro"
3. Click "Create"
4. Approve the transaction in MetaMask (or your wallet)
5. Wait for confirmation (5-10 seconds)
6. Your project is created

Allocating Tasks

1. Click on your project
2. Click "Add Task"
3. Enter task details:
   - Task Name: "Design"
   - Worker: (any address)
   - Budget: "100" FIN
4. Click "Allocate"
5. Approve the transaction
6. Task is allocated

Completing and Approving

1. Worker clicks "Complete Task"
2. Approvers click "Approve Payment"
3. Once approved, funds are released
4. Task marked as complete

Testing Account Abstraction (Gasless)

This advanced feature requires additional setup:

1. The paymaster is configured in config.ts
2. Gasless transactions are optional
3. Traditional transactions work without any special setup
4. See GASLESS_INTEGRATION_GUIDE.md for advanced usage

Stopping the Application

To stop running services:

1. Terminal with Anvil: Press Ctrl+C
2. Terminal with Frontend: Press q or Ctrl+C
3. Terminal with Bot: Press Ctrl+C
4. Close terminals

Restarting Later

When you want to run again later:
1. Open Terminal 1: Start Anvil
2. Open Terminal 2: Deploy contracts again
3. Open Terminal 3: Start frontend
4. Open browser to http://localhost:5173

(You can skip Terminal 2 if contracts are already deployed)

Common Issues and Solutions

Issue: "Command not found: node"
Solution: 
- Node.js not installed or not added to PATH
- Restart your computer after installing Node.js
- Verify with: node --version

Issue: "npm ERR! code ENOENT"
Solution:
- You're not in the right folder
- Make sure you're in the FinPro directory
- Check with: ls (Mac/Linux) or dir (Windows)

Issue: "Port 8545 already in use"
Solution:
- Another Anvil is running
- Kill it: pkill anvil (Mac/Linux)
- Or change port: anvil --port 8546

Issue: "Connection refused"
Solution:
- Anvil is not running
- Make sure Terminal 1 is still running
- Check it says "Listening on 127.0.0.1:8545"

Issue: "MetaMask shows wrong network"
Solution:
- Make sure Anvil is running on port 8545
- MetaMask should auto-detect
- Or manually add:
  Network Name: Localhost
  RPC: http://localhost:8545
  Chain ID: 31337

Issue: "Transaction failed"
Solution:
- Check Anvil terminal for error messages
- Make sure you have enough test ETH
- Try again - sometimes timing issues
- Check browser console for details (F12)

Issue: "Contracts not deployed"
Solution:
- Run deploy command again:
  npx hardhat run scripts/deploy.ts --network localhost
- Check that you're in contracts folder
- Check Anvil is running

Testing on Sepolia Testnet

When ready to test on real testnet:

1. Get test ETH from faucet:
   https://sepoliafaucet.com

2. Update .env with Sepolia RPC:
   VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

3. Deploy to Sepolia:
   npx hardhat run scripts/deploy.ts --network sepolia

4. Update contract addresses in config.ts

5. Set MetaMask to Sepolia network

6. Run frontend normally

Advanced Testing

Running Tests

To verify everything works:
1. Open Command Prompt/Terminal
2. Navigate to: cd contracts
3. Run: npm test

You should see: "33 passing"

This verifies all smart contracts work correctly.

Checking Security

To run security analysis:
1. Open Command Prompt/Terminal
2. Navigate to: cd contracts
3. Run: slither .

This checks for smart contract vulnerabilities.

Viewing Logs

Smart contract logs appear in Anvil terminal showing:
- Transactions received
- Gas used
- State changes
- Errors

Browser console logs (Press F12 in browser):
- Frontend errors
- Contract call details
- Wallet events
- Network requests

Getting Help

If something doesn't work:

1. Check the terminal output for error messages
2. Read SECURITY_AUDIT_REPORT.md for known issues
3. Check GASLESS_INTEGRATION_GUIDE.md for AA features
4. Search error message on Google
5. Ask in GitHub issues: github.com/Finteckinfo/FinPro/issues

Key Concepts Explained Simply

Smart Contracts: Computer programs that run on blockchain (not owned by anyone)

Blockchain: Distributed ledger where transactions are permanent and transparent

FIN Token: Digital currency used in FinPro ecosystem

Gas: Fee paid to execute transactions (like paying for transaction processing)

Anvil: Fake blockchain for testing - runs on your computer

MetaMask: Digital wallet for managing addresses and approving transactions

Testnet: Practice blockchain with fake money - no real value

Mainnet: Real blockchain with real money - used for production

Account Abstraction: Advanced feature allowing gasless transactions

Paymaster: Contract that pays gas fees on behalf of users

RLS (Row Level Security): Database protection that keeps data private

Next Steps After Setup

1. Explore the application
2. Create test projects
3. Test all features
4. Review GASLESS_INTEGRATION_GUIDE.md
5. Read SECURITY_AUDIT_REPORT.md
6. Check smart contracts in contracts/contracts/
7. Test on Sepolia testnet
8. Provide feedback

Checklist: "System is Ready"

Before declaring the system ready, verify:

Terminal 1: Anvil running
- Shows "Listening on 127.0.0.1:8545"

Terminal 3: Frontend running
- Shows "Local: http://localhost:5173/"

Web Browser: http://localhost:5173
- Application loads
- No error messages

MetaMask: Connected
- Shows Localhost 31337 network
- Shows test account with ETH

Test Transaction:
- Create a project
- See wallet popup
- Transaction completes
- Project appears in list

All Green: System is ready for testing!

Support

For technical issues: development@finpro.io
For questions: hello@finpro.io
Emergency: emergency@finpro.io

GitHub Issues: https://github.com/Finteckinfo/FinPro/issues

Documentation

Complete guides available:
- DOCUMENTATION_INDEX.md (what to read)
- PRODUCTION_STARTUP_SUMMARY.md (overview)
- SECURITY_AUDIT_REPORT.md (security details)
- GASLESS_INTEGRATION_GUIDE.md (advanced features)
- LAUNCH_CHECKLIST.md (production timeline)

You're all set! Enjoy testing FinPro.
