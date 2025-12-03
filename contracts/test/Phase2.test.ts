import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { FINToken, FINSwap, MultiSigWallet } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FinERP Phase 2 - DEX & MultiSig", function () {
    let finToken: FINToken;
    let usdtToken: FINToken; // Mock USDT using FINToken contract for simplicity
    let finSwap: FINSwap;
    let multiSigWallet: MultiSigWallet;

    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;
    let signer3: SignerWithAddress;

    const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100M

    beforeEach(async function () {
        [owner, user1, user2, signer1, signer2, signer3] = await ethers.getSigners();

        // Deploy FIN Token
        const FINTokenFactory = await ethers.getContractFactory("FINToken");
        finToken = (await upgrades.deployProxy(FINTokenFactory, [owner.address], {
            kind: "uups",
        })) as unknown as FINToken;

        // Deploy Mock USDT (using same contract logic)
        usdtToken = (await upgrades.deployProxy(FINTokenFactory, [owner.address], {
            kind: "uups",
        })) as unknown as FINToken;

        // Deploy FINSwap
        const FINSwapFactory = await ethers.getContractFactory("FINSwap");
        finSwap = (await upgrades.deployProxy(FINSwapFactory, [owner.address], {
            kind: "uups",
        })) as unknown as FINSwap;

        // Deploy MultiSigWallet (2-of-3)
        const MultiSigWalletFactory = await ethers.getContractFactory("MultiSigWallet");
        const owners = [signer1.address, signer2.address, signer3.address];
        multiSigWallet = (await upgrades.deployProxy(MultiSigWalletFactory, [owners, 2, owner.address], {
            kind: "uups",
        })) as unknown as MultiSigWallet;
    });

    describe("FINSwap DEX", function () {
        const liquidityAmount = ethers.parseEther("10000");

        beforeEach(async function () {
            // Owner already has max supply of FIN
            // USDT mock also has max supply minted to owner

            // Approve router
            await finToken.approve(await finSwap.getAddress(), liquidityAmount);
            await usdtToken.approve(await finSwap.getAddress(), liquidityAmount);
        });

        it("Should add liquidity successfully", async function () {
            await finSwap.addLiquidity(
                await finToken.getAddress(),
                await usdtToken.getAddress(),
                liquidityAmount,
                liquidityAmount
            );

            const poolId = await finSwap.getPoolId(await finToken.getAddress(), await usdtToken.getAddress());
            const pool = await finSwap.pools(poolId);

            expect(pool.reserveA).to.equal(liquidityAmount);
            expect(pool.reserveB).to.equal(liquidityAmount);
        });

        it("Should swap tokens correctly", async function () {
            // Add liquidity first
            await finSwap.addLiquidity(
                await finToken.getAddress(),
                await usdtToken.getAddress(),
                liquidityAmount,
                liquidityAmount
            );

            // User1 wants to swap 100 FIN for USDT
            const swapAmount = ethers.parseEther("100");
            // Transfer FIN to user1 from owner
            await finToken.transfer(user1.address, swapAmount);

            await finToken.connect(user1).approve(await finSwap.getAddress(), swapAmount);

            const expectedOut = await finSwap.getAmountOut(
                await finToken.getAddress(),
                await usdtToken.getAddress(),
                swapAmount
            );

            await finSwap.connect(user1).swap(
                await finToken.getAddress(),
                await usdtToken.getAddress(),
                swapAmount,
                0 // Accept any amount for test
            );

            expect(await usdtToken.balanceOf(user1.address)).to.equal(expectedOut);
        });
    });

    describe("MultiSigWallet", function () {
        it("Should accept deposits", async function () {
            const depositAmount = ethers.parseEther("1.0");
            await owner.sendTransaction({
                to: await multiSigWallet.getAddress(),
                value: depositAmount
            });

            expect(await ethers.provider.getBalance(await multiSigWallet.getAddress())).to.equal(depositAmount);
        });

        it("Should execute transaction with sufficient confirmations", async function () {
            const depositAmount = ethers.parseEther("1.0");
            await owner.sendTransaction({
                to: await multiSigWallet.getAddress(),
                value: depositAmount
            });

            // Signer1 submits transaction to send 0.5 ETH to user1
            const transferAmount = ethers.parseEther("0.5");
            const txData = "0x";

            await multiSigWallet.connect(signer1).submitTransaction(
                user1.address,
                transferAmount,
                txData
            );

            // Signer1 confirms (auto-confirmed on submit? No, separate step usually, but let's check contract)
            // Contract logic: submitTransaction does NOT auto-confirm.
            await multiSigWallet.connect(signer1).confirmTransaction(0);

            // Signer2 confirms
            await multiSigWallet.connect(signer2).confirmTransaction(0);

            // Execute
            const initialBalance = await ethers.provider.getBalance(user1.address);
            await multiSigWallet.connect(signer1).executeTransaction(0);
            const finalBalance = await ethers.provider.getBalance(user1.address);

            expect(finalBalance - initialBalance).to.equal(transferAmount);
        });

        it("Should fail execution without sufficient confirmations", async function () {
            const transferAmount = ethers.parseEther("0.5");

            await multiSigWallet.connect(signer1).submitTransaction(
                user1.address,
                transferAmount,
                "0x"
            );

            await multiSigWallet.connect(signer1).confirmTransaction(0);

            // Try to execute with only 1 confirmation (need 2)
            await expect(
                multiSigWallet.connect(signer1).executeTransaction(0)
            ).to.be.revertedWith("cannot execute tx");
        });
    });
});
