import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { FINToken__factory } from "../typechain-types";

dotenv.config();

/**
 * Batch Mint Test FIN Tokens - For Multiple Test Accounts
 * 
 * Like distributing pool game tokens to multiple players,
 * this script mints tokens to multiple test accounts at once.
 * 
 * Perfect for testing team collaboration features in the ERP.
 */

async function main() {
  console.log(" FinPro Batch Test Token Minting");
  console.log("===================================\n");

  const FIN_TOKEN_ADDRESS = process.env.FIN_TOKEN_ADDRESS;
  const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.MAINNET_RPC_URL || process.env.POLYGON_RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!FIN_TOKEN_ADDRESS || !RPC_URL || !PRIVATE_KEY) {
    throw new Error("Missing required environment variables");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const finToken = FINToken__factory.connect(FIN_TOKEN_ADDRESS, signer);

  // Test accounts (add your test wallet addresses here)
  const testAccounts = [
    process.env.TEST_ACCOUNT_1,
    process.env.TEST_ACCOUNT_2,
    process.env.TEST_ACCOUNT_3,
    process.env.TEST_ACCOUNT_4,
    process.env.TEST_ACCOUNT_5,
  ].filter(Boolean) as string[];

  if (testAccounts.length === 0) {
    throw new Error("No test accounts configured. Set TEST_ACCOUNT_1, TEST_ACCOUNT_2, etc. in .env");
  }

  const amountPerAccount = ethers.parseEther(process.env.TEST_TOKEN_AMOUNT_PER_ACCOUNT || "1000");

  console.log(`Minting ${ethers.formatEther(amountPerAccount)} FIN to ${testAccounts.length} accounts...\n`);

  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    console.log(`[${i + 1}/${testAccounts.length}] Minting to ${account}...`);
    
    try {
      const tx = await finToken.mint(account, amountPerAccount);
      await tx.wait();
      console.log(`   Success!`);
    } catch (error: any) {
      console.error(`   Failed: ${error.message}`);
    }
  }

  console.log("\n Batch minting complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

