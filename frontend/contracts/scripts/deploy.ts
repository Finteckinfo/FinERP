import { ethers, upgrades } from "hardhat";

async function main() {
    console.log("Deploying FinPro Smart Contracts...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Deploy FIN Token
    console.log("Deploying FIN Token (Upgradeable)...");
    const FINToken = await ethers.getContractFactory("FINToken");
    const finToken = await upgrades.deployProxy(
        FINToken,
        [deployer.address], // admin address
        { initializer: "initialize", kind: "uups" }
    );
    await finToken.waitForDeployment();
    const finTokenAddress = await finToken.getAddress();
    console.log("FIN Token deployed to:", finTokenAddress);
    console.log("   Total Supply: 100,000,000 FIN\n");

    // Deploy Project Escrow
    console.log("Deploying Project Escrow (Upgradeable)...");
    const ProjectEscrow = await ethers.getContractFactory("ProjectEscrow");
    const projectEscrow = await upgrades.deployProxy(
        ProjectEscrow,
        [finTokenAddress, deployer.address], // FIN token address, admin address
        { initializer: "initialize", kind: "uups" }
    );
    await projectEscrow.waitForDeployment();
    const projectEscrowAddress = await projectEscrow.getAddress();
    console.log("Project Escrow deployed to:", projectEscrowAddress);
    console.log("   Approval Threshold: 10,000 FIN");
    console.log("   Refund Timelock: 24 hours\n");

    // Grant roles
    console.log("Setting up roles...");
    const MANAGER_ROLE = await projectEscrow.MANAGER_ROLE();
    const APPROVER_ROLE = await projectEscrow.APPROVER_ROLE();

    // Grant deployer all roles (can be changed later)
    await projectEscrow.grantRole(MANAGER_ROLE, deployer.address);
    await projectEscrow.grantRole(APPROVER_ROLE, deployer.address);
    console.log("Roles granted to deployer\n");

    // Deploy FINSwap
    console.log("Deploying FINSwap (Upgradeable)...");
    const FINSwap = await ethers.getContractFactory("FINSwap");
    const finSwap = await upgrades.deployProxy(FINSwap, [deployer.address], {
        kind: "uups",
        initializer: "initialize",
    });
    await finSwap.waitForDeployment();
    const finSwapAddress = await finSwap.getAddress();
    console.log("FINSwap deployed to:", finSwapAddress);
    console.log("   FINSwap deployed with admin:", deployer.address, "\n");

    // Deploy MultiSigWallet
    console.log("Deploying MultiSigWallet (Upgradeable)...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    // Deploy with deployer as sole owner initially (for testing/setup)
    // In production, this should be a list of actual owners
    const owners = [deployer.address];
    const numConfirmationsRequired = 1;
    const multiSigWallet = await upgrades.deployProxy(MultiSigWallet, [owners, numConfirmationsRequired, deployer.address], {
        kind: "uups",
        initializer: "initialize",
    });
    await multiSigWallet.waitForDeployment();
    const multiSigWalletAddress = await multiSigWallet.getAddress();
    console.log("MultiSigWallet deployed to:", multiSigWalletAddress);
    console.log("   Owners:", owners);
    console.log("   Confirmations Required:", numConfirmationsRequired, "\n");

    // Summary
    console.log("=".repeat(60));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
    console.log("\nContract Addresses:");
    console.log("  FIN Token:", finTokenAddress);
    console.log("  Project Escrow:", projectEscrowAddress);
    console.log("  FIN Swap:", finSwapAddress);
    console.log("  MultiSig Wallet:", multiSigWalletAddress);
    console.log("\nAdmin Address:", deployer.address);
    console.log("=".repeat(60));

    // Save deployment info
    const deploymentInfo = {
        network: (await ethers.provider.getNetwork()).name,
        chainId: Number((await ethers.provider.getNetwork()).chainId),
        contracts: {
            finToken: finTokenAddress,
            projectEscrow: projectEscrowAddress,
            finSwap: finSwapAddress,
            multiSigWallet: multiSigWalletAddress,
        },
        admin: deployer.address,
        timestamp: new Date().toISOString(),
    };

    console.log("\nSave this deployment info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Verification instructions
    console.log("\nTo verify contracts on Etherscan:");
    console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${finTokenAddress}`);
    console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${projectEscrowAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
