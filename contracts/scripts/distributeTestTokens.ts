import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { FINToken__factory } from "../typechain-types";

dotenv.config();

/**
 * Distribute Test FIN Tokens from Admin Treasury
 * 
 * Since FINToken mints all tokens to admin on initialization,
 * this script distributes tokens from the admin wallet to test accounts.
 * 
 * Like distributing pool game tokens - admin has all tokens and distributes
 * them to players for testing.
 */

async function main() {
  console.log("🎱 Distributing Test FIN Tokens (Pool Game Style)");
  console.log("==================================================\n");

  const FIN_TOKEN_ADDRESS = process.env.FIN_TOKEN_ADDRESS;
  const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.MAINNET_RPC_URL || process.env.POLYGON_RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!FIN_TOKEN_ADDRESS || !RPC_URL || !PRIVATE_KEY) {
    throw new Error("Missing required environment variables");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const network = await provider.getNetwork();

  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Admin: ${signer.address}`);

  // Connect to FIN Token
  const finToken = FINToken__factory.connect(FIN_TOKEN_ADDRESS, signer);
  
  // Check admin balance
  const adminBalance = await finToken.balanceOf(signer.address);
  console.log(`Admin Balance: ${ethers.formatEther(adminBalance)} FIN\n`);

  if (adminBalance === 0n) {
    throw new Error("Admin has no tokens to distribute");
  }

  // Test accounts (pool game players)
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

  // Token packs (like pool game token packs)
  const packs = {
    starter: ethers.parseEther("100"),
    standard: ethers.parseEther("500"),
    premium: ethers.parseEther("1000"),
    enterprise: ethers.parseEther("5000"),
    unlimited: ethers.parseEther("10000")
  };

  const packType = (process.env.TEST_TOKEN_PACK || "standard") as keyof typeof packs;
  const amountPerAccount = packs[packType] || packs.standard;

  console.log(`Distributing ${packType} pack (${ethers.formatEther(amountPerAccount)} FIN each)`);
  console.log(`To ${testAccounts.length} test accounts...\n`);

  const totalNeeded = amountPerAccount * BigInt(testAccounts.length);
  if (adminBalance < totalNeeded) {
    throw new Error(`Insufficient balance. Need ${ethers.formatEther(totalNeeded)} FIN, have ${ethers.formatEther(adminBalance)} FIN`);
  }

  // Distribute tokens
  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    console.log(`[${i + 1}/${testAccounts.length}] Sending to ${account}...`);
    
    try {
      const tx = await finToken.transfer(account, amountPerAccount);
      await tx.wait();
      
      const newBalance = await finToken.balanceOf(account);
      console.log(`  ✅ Success! Balance: ${ethers.formatEther(newBalance)} FIN`);
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
  }

  // Check final balances
  console.log("\n📊 Final Balances:");
  for (const account of testAccounts) {
    const balance = await finToken.balanceOf(account);
    console.log(`  ${account}: ${ethers.formatEther(balance)} FIN`);
  }

  const remainingAdminBalance = await finToken.balanceOf(signer.address);
  console.log(`\nAdmin Remaining: ${ethers.formatEther(remainingAdminBalance)} FIN`);
  console.log("\n🎉 Token distribution complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

