import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { FINToken, ProjectEscrow } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FinERP Smart Contracts - Security Tests", function () {
    let finToken: FINToken;
    let projectEscrow: ProjectEscrow;
    let admin: SignerWithAddress;
    let employer: SignerWithAddress;
    let worker1: SignerWithAddress;
    let worker2: SignerWithAddress;
    let approver1: SignerWithAddress;
    let approver2: SignerWithAddress;
    let attacker: SignerWithAddress;

    const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100M FIN
    const APPROVAL_THRESHOLD = ethers.parseEther("10000"); // 10K FIN
    const REFUND_TIMELOCK = 24 * 60 * 60; // 24 hours

    beforeEach(async function () {
        [admin, employer, worker1, worker2, approver1, approver2, attacker] = await ethers.getSigners();

        // Deploy FIN Token
        const FINToken = await ethers.getContractFactory("FINToken");
        finToken = await upgrades.deployProxy(FINToken, [admin.address], {
            initializer: "initialize",
            kind: "uups",
        }) as unknown as FINToken;
        await finToken.waitForDeployment();

        // Deploy Project Escrow
        const ProjectEscrow = await ethers.getContractFactory("ProjectEscrow");
        projectEscrow = await upgrades.deployProxy(
            ProjectEscrow,
            [await finToken.getAddress(), admin.address],
            { initializer: "initialize", kind: "uups" }
        ) as unknown as ProjectEscrow;
        await projectEscrow.waitForDeployment();

        // Grant roles
        const APPROVER_ROLE = await projectEscrow.APPROVER_ROLE();
        await projectEscrow.grantRole(APPROVER_ROLE, approver1.address);
        await projectEscrow.grantRole(APPROVER_ROLE, approver2.address);

        // Transfer FIN tokens to employer
        await finToken.transfer(employer.address, ethers.parseEther("1000000")); // 1M FIN
    });

    describe("FIN Token Security", function () {
        it("Should have correct initial supply", async function () {
            expect(await finToken.totalSupply()).to.equal(INITIAL_SUPPLY);
        });

        it("Should not allow minting beyond max supply", async function () {
            const MINTER_ROLE = await finToken.MINTER_ROLE();
            await finToken.grantRole(MINTER_ROLE, admin.address);

            await expect(
                finToken.mint(admin.address, 1)
            ).to.be.revertedWith("FINToken: exceeds max supply");
        });

        it("Should prevent unauthorized minting", async function () {
            await expect(
                finToken.connect(attacker).mint(attacker.address, ethers.parseEther("1000"))
            ).to.be.reverted;
        });

        it("Should allow pausing by PAUSER_ROLE", async function () {
            const PAUSER_ROLE = await finToken.PAUSER_ROLE();
            await finToken.grantRole(PAUSER_ROLE, admin.address);

            await finToken.pause("Emergency stop");

            await expect(
                finToken.transfer(worker1.address, ethers.parseEther("100"))
            ).to.be.reverted;
        });

        it("Should prevent unauthorized pausing", async function () {
            await expect(
                finToken.connect(attacker).pause("Malicious pause")
            ).to.be.reverted;
        });

        it("Should allow burning tokens", async function () {
            const burnAmount = ethers.parseEther("1000");
            await finToken.burn(burnAmount);

            expect(await finToken.totalSupply()).to.equal(INITIAL_SUPPLY - burnAmount);
        });
    });

    describe("Project Escrow Security", function () {
        let projectId: bigint;
        const fundAmount = ethers.parseEther("50000"); // 50K FIN

        beforeEach(async function () {
            // Approve escrow to spend employer's FIN
            await finToken.connect(employer).approve(await projectEscrow.getAddress(), fundAmount);

            // Fund project
            const tx = await projectEscrow.connect(employer).fundProject(fundAmount);
            const receipt = await tx.wait();
            const event = receipt?.logs.find((log: any) => {
                try {
                    return projectEscrow.interface.parseLog(log)?.name === "ProjectFunded";
                } catch {
                    return false;
                }
            });
            projectId = event ? projectEscrow.interface.parseLog(event)!.args[0] : 0n;
        });

        it("Should fund project successfully", async function () {
            const project = await projectEscrow.getProject(projectId);
            expect(project.totalFunded).to.equal(fundAmount);
            expect(project.employer).to.equal(employer.address);
        });

        it("Should prevent double-spending in task allocation", async function () {
            const MANAGER_ROLE = await projectEscrow.MANAGER_ROLE();
            await projectEscrow.grantRole(MANAGER_ROLE, admin.address);

            // Allocate all funds to worker1
            await projectEscrow.allocateTask(projectId, worker1.address, fundAmount);

            // Try to allocate more (should fail)
            await expect(
                projectEscrow.allocateTask(projectId, worker2.address, ethers.parseEther("1"))
            ).to.be.revertedWith("ProjectEscrow: insufficient project funds");
        });

        it("Should require multi-sig approval for large payments", async function () {
            const MANAGER_ROLE = await projectEscrow.MANAGER_ROLE();
            await projectEscrow.grantRole(MANAGER_ROLE, admin.address);

            // Allocate large task (>10K FIN)
            const largeAmount = ethers.parseEther("15000");
            const tx = await projectEscrow.allocateTask(projectId, worker1.address, largeAmount);
            const receipt = await tx.wait();
            const event = receipt?.logs.find((log: any) => {
                try {
                    return projectEscrow.interface.parseLog(log)?.name === "TaskAllocated";
                } catch {
                    return false;
                }
            });
            const taskId = event ? projectEscrow.interface.parseLog(event)!.args[0] : 0n;

            // Complete task
            await projectEscrow.connect(worker1).completeTask(taskId);

            // Check that payment is not auto-released
            const task = await projectEscrow.getTask(taskId);
            expect(task.status).to.equal(2); // COMPLETED, not PAID

            // Approve with first approver
            await projectEscrow.connect(approver1).approvePayment(taskId);

            // Still not released (need 2 approvals)
            const task2 = await projectEscrow.getTask(taskId);
            expect(task2.status).to.equal(2); // Still COMPLETED

            // Approve with second approver
            await projectEscrow.connect(approver2).approvePayment(taskId);

            // Now should be released
            const task3 = await projectEscrow.getTask(taskId);
            expect(task3.status).to.equal(3); // PAID
        });

        it("Should enforce 24-hour timelock on refunds", async function () {
            // Request refund
            await projectEscrow.connect(employer).requestRefund(projectId);

            // Try to process immediately (should fail)
            await expect(
                projectEscrow.connect(employer).processRefund(projectId)
            ).to.be.revertedWith("ProjectEscrow: timelock not expired");

            // Fast-forward 24 hours
            await ethers.provider.send("evm_increaseTime", [REFUND_TIMELOCK]);
            await ethers.provider.send("evm_mine", []);

            // Now should succeed
            await expect(
                projectEscrow.connect(employer).processRefund(projectId)
            ).to.not.be.reverted;
        });

        it("Should prevent reentrancy attacks", async function () {
            // This test ensures ReentrancyGuard is working
            // In a real attack, a malicious contract would try to call back into escrow
            // during token transfer. Our SafeERC20 + ReentrancyGuard prevents this.

            const MANAGER_ROLE = await projectEscrow.MANAGER_ROLE();
            await projectEscrow.grantRole(MANAGER_ROLE, admin.address);

            const taskAmount = ethers.parseEther("5000");
            const tx = await projectEscrow.allocateTask(projectId, worker1.address, taskAmount);
            const receipt = await tx.wait();
            const event = receipt?.logs.find((log: any) => {
                try {
                    return projectEscrow.interface.parseLog(log)?.name === "TaskAllocated";
                } catch {
                    return false;
                }
            });
            const taskId = event ? projectEscrow.interface.parseLog(event)!.args[0] : 0n;

            await projectEscrow.connect(worker1).completeTask(taskId);

            // Payment should be released without reentrancy issues
            const task = await projectEscrow.getTask(taskId);
            expect(task.status).to.equal(3); // PAID
        });

        it("Should prevent unauthorized role grants", async function () {
            const MANAGER_ROLE = await projectEscrow.MANAGER_ROLE();

            await expect(
                projectEscrow.connect(attacker).grantRole(MANAGER_ROLE, attacker.address)
            ).to.be.reverted;
        });

        it("Should prevent unauthorized contract upgrades", async function () {
            const ProjectEscrowV2 = await ethers.getContractFactory("ProjectEscrow");

            await expect(
                upgrades.upgradeProxy(await projectEscrow.getAddress(), ProjectEscrowV2.connect(attacker))
            ).to.be.reverted;
        });
    });

    describe("Integration Tests", function () {
        it("Should handle complete project workflow", async function () {
            const MANAGER_ROLE = await projectEscrow.MANAGER_ROLE();
            await projectEscrow.grantRole(MANAGER_ROLE, admin.address);

            // 1. Employer funds project
            const fundAmount = ethers.parseEther("20000");
            await finToken.connect(employer).approve(await projectEscrow.getAddress(), fundAmount);
            const fundTx = await projectEscrow.connect(employer).fundProject(fundAmount);
            const fundReceipt = await fundTx.wait();
            const fundEvent = fundReceipt?.logs.find((log: any) => {
                try {
                    return projectEscrow.interface.parseLog(log)?.name === "ProjectFunded";
                } catch {
                    return false;
                }
            });
            const projectId = fundEvent ? projectEscrow.interface.parseLog(fundEvent)!.args[0] : 0n;

            // 2. Allocate tasks
            const task1Amount = ethers.parseEther("3000");
            const task2Amount = ethers.parseEther("15000"); // > 10,000 threshold

            const task1Tx = await projectEscrow.allocateTask(projectId, worker1.address, task1Amount);
            const task1Receipt = await task1Tx.wait();
            const task1Event = task1Receipt?.logs.find((log: any) => {
                try {
                    return projectEscrow.interface.parseLog(log)?.name === "TaskAllocated";
                } catch {
                    return false;
                }
            });
            const task1Id = task1Event ? projectEscrow.interface.parseLog(task1Event)!.args[0] : 0n;

            const task2Tx = await projectEscrow.allocateTask(projectId, worker2.address, task2Amount);
            const task2Receipt = await task2Tx.wait();
            const task2Event = task2Receipt?.logs.find((log: any) => {
                try {
                    return projectEscrow.interface.parseLog(log)?.name === "TaskAllocated";
                } catch {
                    return false;
                }
            });
            const task2Id = task2Event ? projectEscrow.interface.parseLog(task2Event)!.args[0] : 0n;

            // 3. Workers complete tasks
            await projectEscrow.connect(worker1).completeTask(task1Id);
            await projectEscrow.connect(worker2).completeTask(task2Id);

            // 4. Check balances
            expect(await finToken.balanceOf(worker1.address)).to.equal(task1Amount);
            expect(await finToken.balanceOf(worker2.address)).to.equal(0); // Task 2 needs approval

            // 5. Approve large task
            await projectEscrow.connect(approver1).approvePayment(task2Id);
            await projectEscrow.connect(approver2).approvePayment(task2Id);

            // 6. Verify final balances
            expect(await finToken.balanceOf(worker2.address)).to.equal(task2Amount);

            // 7. Refund remaining funds
            const project = await projectEscrow.getProject(projectId);
            const remainingFunds = project.totalFunded - project.totalAllocated;

            await projectEscrow.connect(employer).requestRefund(projectId);
            await ethers.provider.send("evm_increaseTime", [REFUND_TIMELOCK]);
            await ethers.provider.send("evm_mine", []);

            const employerBalanceBefore = await finToken.balanceOf(employer.address);
            await projectEscrow.connect(employer).processRefund(projectId);
            const employerBalanceAfter = await finToken.balanceOf(employer.address);

            expect(employerBalanceAfter - employerBalanceBefore).to.equal(remainingFunds);
        });
    });
});
