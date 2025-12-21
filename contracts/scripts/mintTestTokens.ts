import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { FINToken__factory } from "../typechain-types";

dotenv.config();

/**
 * Mint Test FIN Tokens - Similar to Pool Game Tokens
 * 
 * This script mints test FIN tokens for testing the ERP system.
 * Think of it like getting tokens in a pool game - you get a certain amount
 * to play with and test the system functionality.
 * 
 * Requirements:
 * - FIN Token contract must be deployed
 * - Deployer must have MINTER_ROLE
 * - Set FIN_TOKEN_ADDRESS in .env
 */

async function main() {
  console.log(" FinPro Test Token Minting - Pool Game Style");
  console.log("==============================================\n");

  // Configuration
  const FIN_TOKEN_ADDRESS = process.env.FIN_TOKEN_ADDRESS;
  const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.MAINNET_RPC_URL || process.env.POLYGON_RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const RECIPIENT_ADDRESS = process.env.TEST_RECIPIENT_ADDRESS || process.env.DEPLOYER_ADDRESS;

  if (!FIN_TOKEN_ADDRESS) {
    throw new Error("FIN_TOKEN_ADDRESS not set in .env");
  }

  if (!RPC_URL) {
    throw new Error("RPC_URL not set in .env");
  }

  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env");
  }

  if (!RECIPIENT_ADDRESS) {
    throw new Error("TEST_RECIPIENT_ADDRESS or DEPLOYER_ADDRESS not set in .env");
  }

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const network = await provider.getNetwork();

  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${signer.address}`);
  console.log(`Recipient: ${RECIPIENT_ADDRESS}`);
  console.log(`FIN Token: ${FIN_TOKEN_ADDRESS}\n`);

  // Connect to FIN Token contract
  const finToken = FINToken__factory.connect(FIN_TOKEN_ADDRESS, signer);

  // Check if deployer has minter role
  const MINTER_ROLE = await finToken.MINTER_ROLE();
  const hasMinterRole = await finToken.hasRole(MINTER_ROLE, signer.address);

  if (!hasMinterRole) {
    throw new Error(`Deployer ${signer.address} does not have MINTER_ROLE`);
  }

  // Test token amounts (like pool game tokens)
  // Standard amounts: 100, 500, 1000, 5000, 10000 FIN
  const testAmounts = {
    starter: ethers.parseEther("100"),      // Starter pack
    standard: ethers.parseEther("500"),    // Standard pack
    premium: ethers.parseEther("1000"),    // Premium pack
    enterprise: ethers.parseEther("5000"), // Enterprise pack
    unlimited: ethers.parseEther("10000")  // Unlimited pack
  };

  // Choose amount based on environment or use standard
  const amount = process.env.TEST_TOKEN_AMOUNT 
    ? ethers.parseEther(process.env.TEST_TOKEN_AMOUNT)
    : testAmounts.standard;

  console.log(`Minting ${ethers.formatEther(amount)} FIN tokens...\n`);

  // Check current balance
  const currentBalance = await finToken.balanceOf(RECIPIENT_ADDRESS);
  console.log(`Current balance: ${ethers.formatEther(currentBalance)} FIN`);

  // Mint tokens
  const tx = await finToken.mint(RECIPIENT_ADDRESS, amount);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log(` Tokens minted! Block: ${receipt?.blockNumber}`);

  // Check new balance
  const newBalance = await finToken.balanceOf(RECIPIENT_ADDRESS);
  console.log(`New balance: ${ethers.formatEther(newBalance)} FIN`);
  console.log(`Minted: ${ethers.formatEther(amount)} FIN\n`);

  console.log(" Test tokens successfully minted!");
  console.log("You can now use these tokens to test the ERP system.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

