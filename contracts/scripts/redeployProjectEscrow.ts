import { ethers, upgrades } from "hardhat";

async function main() {
    console.log("Redeploying ProjectEscrow with 30% Protocol Fee enforcement...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Existing FIN Token Address (from deploy.ts)
    const finTokenAddress = "0x2f575ACfec3D607C094BC02c6bDe169C7f01f707";
    console.log("Using existing FIN Token:", finTokenAddress);

    // Deploy ProjectEscrow
    console.log("Deploying ProjectEscrow (Upgradeable Proxy)...");
    const ProjectEscrow = await ethers.getContractFactory("ProjectEscrow");

    // initialize takes (address _finToken, address admin)
    const projectEscrow = await upgrades.deployProxy(ProjectEscrow, [finTokenAddress, deployer.address], {
        kind: "uups",
        initializer: "initialize",
    });

    await projectEscrow.waitForDeployment();
    const projectEscrowAddress = await projectEscrow.getAddress();

    console.log("\nSUCCESS! ProjectEscrow deployed to:", projectEscrowAddress);
    console.log("Enforcement Status: 30% Fee is IMMUTABLE.");

    console.log("\nIMPORTANT: Update your frontend .env file with this new address:");
    console.log(`VITE_PROJECT_ESCROW_ADDRESS=${projectEscrowAddress}`);

    // Verification prompt
    console.log("To verify on BaseScan:");
    console.log(`npx hardhat verify --network base ${projectEscrowAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
