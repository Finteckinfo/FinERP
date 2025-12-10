import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { TestTokenFaucet__factory } from "../typechain-types";

dotenv.config();

/**
 * Deploy Test Token Faucet Contract
 * 
 * This deploys a faucet contract that allows users to request test tokens
 * daily, similar to getting tokens in a pool game.
 */

async function main() {
  console.log("🚰 Deploying Test Token Faucet...\n");

  const FIN_TOKEN_ADDRESS = process.env.FIN_TOKEN_ADDRESS;
  const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.MAINNET_RPC_URL || process.env.POLYGON_RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!FIN_TOKEN_ADDRESS) {
    throw new Error("FIN_TOKEN_ADDRESS not set in .env");
  }

  if (!RPC_URL || !PRIVATE_KEY) {
    throw new Error("RPC_URL and PRIVATE_KEY must be set in .env");
  }

  // Configuration
  const DAILY_LIMIT = ethers.parseEther(process.env.FAUCET_DAILY_LIMIT || "1000"); // 1000 FIN per day
  const COOLDOWN_PERIOD = parseInt(process.env.FAUCET_COOLDOWN_PERIOD || "86400"); // 24 hours in seconds

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const network = await provider.getNetwork();

  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${signer.address}`);
  console.log(`FIN Token: ${FIN_TOKEN_ADDRESS}`);
  console.log(`Daily Limit: ${ethers.formatEther(DAILY_LIMIT)} FIN`);
  console.log(`Cooldown Period: ${COOLDOWN_PERIOD / 3600} hours\n`);

  // Deploy faucet
  console.log("Deploying faucet contract...");
  const faucetFactory = new TestTokenFaucet__factory(signer);
  const faucet = await faucetFactory.deploy(
    FIN_TOKEN_ADDRESS,
    DAILY_LIMIT,
    COOLDOWN_PERIOD
  );

  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();

  console.log(`✅ Faucet deployed to: ${faucetAddress}`);
  console.log(`Transaction hash: ${faucet.deploymentTransaction()?.hash}\n`);

  // Fund the faucet with tokens
  console.log("Funding faucet with tokens...");
  const finToken = await ethers.getContractAt("FINToken", FIN_TOKEN_ADDRESS, signer);
  
  // Mint tokens to faucet (assuming deployer has MINTER_ROLE)
  const faucetFunding = ethers.parseEther(process.env.FAUCET_INITIAL_FUNDING || "100000"); // 100,000 FIN
  const mintTx = await finToken.mint(faucetAddress, faucetFunding);
  await mintTx.wait();
  
  console.log(`✅ Funded faucet with ${ethers.formatEther(faucetFunding)} FIN\n`);

  // Grant RELAYER_ROLE if Gelato address is provided
  const GELATO_RELAYER = process.env.GELATO_RELAYER_ADDRESS;
  if (GELATO_RELAYER) {
    console.log(`Granting RELAYER_ROLE to Gelato: ${GELATO_RELAYER}...`);
    const RELAYER_ROLE = await faucet.RELAYER_ROLE();
    const grantTx = await faucet.grantRole(RELAYER_ROLE, GELATO_RELAYER);
    await grantTx.wait();
    console.log("✅ RELAYER_ROLE granted\n");
  }

  console.log("🎉 Faucet deployment complete!");
  console.log("\nNext steps:");
  console.log(`1. Add to .env: VITE_FAUCET_CONTRACT_ADDRESS=${faucetAddress}`);
  console.log("2. Verify contract on block explorer");
  console.log("3. Test faucet functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

