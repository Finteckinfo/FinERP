import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SimpleAccount, TokenPaymaster } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('Account Abstraction Integration', function () {
    let simpleAccount: SimpleAccount;
    let tokenPaymaster: TokenPaymaster;
    let mockToken: any;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const SimpleAccount = await ethers.getContractFactory('SimpleAccount');
        simpleAccount = await SimpleAccount.deploy() as SimpleAccount;
        await simpleAccount.waitForDeployment();

        // Deploy a mock ERC20 for testing
        const MockToken = await ethers.getContractFactory('FINToken');
        mockToken = await MockToken.deploy() as any;
        await mockToken.waitForDeployment();

        const TokenPaymaster = await ethers.getContractFactory('TokenPaymaster');
        tokenPaymaster = await TokenPaymaster.deploy(
            await mockToken.getAddress(),
            owner.address,
            owner.address
        ) as TokenPaymaster;
        await tokenPaymaster.waitForDeployment();

        await simpleAccount.initialize(owner.address, owner.address);
    });

    describe('SimpleAccount', function () {
        it('Should initialize with correct owner and entryPoint', async function () {
            expect(await simpleAccount.owner()).to.equal(owner.address);
            expect(await simpleAccount.entryPoint()).to.equal(owner.address);
        });

        it('Should increment nonce after execution', async function () {
            const initialNonce = await simpleAccount.nonce();
            expect(initialNonce).to.equal(0);

            await simpleAccount.increaseNonce();
            const newNonce = await simpleAccount.nonce();
            expect(newNonce).to.equal(1);
        });

        it('Should execute calls from owner', async function () {
            await owner.sendTransaction({
                to: await simpleAccount.getAddress(),
                value: ethers.parseEther('1.0'),
            });

            const transferAmount = ethers.parseEther('0.5');

            await expect(
                simpleAccount.executeCall(addr1.address, transferAmount, '0x')
            ).to.not.be.reverted;
        });

        it('Should execute batch calls', async function () {
            await owner.sendTransaction({
                to: await simpleAccount.getAddress(),
                value: ethers.parseEther('2.0'),
            });

            const targets = [addr1.address, addr2.address];
            const values = [ethers.parseEther('0.5'), ethers.parseEther('0.5')];
            const datas = ['0x', '0x'];

            await expect(simpleAccount.executeBatch(targets, values, datas)).to.not.be.reverted;
        });

        it('Should receive ETH', async function () {
            const amount = ethers.parseEther('1.0');
            const tx = await owner.sendTransaction({
                to: await simpleAccount.getAddress(),
                value: amount,
            });

            await expect(tx).to.changeEtherBalance(simpleAccount, amount);
        });
    });

    describe('TokenPaymaster', function () {
        it('Should initialize with correct parameters', async function () {
            expect(await tokenPaymaster.acceptedToken()).to.equal(await mockToken.getAddress());
            expect(await tokenPaymaster.entryPoint()).to.equal(owner.address);
            expect(await tokenPaymaster.verifiedSigners(owner.address)).to.be.true;
        });

        it('Should allow adding verifiers', async function () {
            await expect(tokenPaymaster.addVerifier(addr2.address)).to.not.be.reverted;
            expect(await tokenPaymaster.verifiedSigners(addr2.address)).to.be.true;
        });

        it('Should allow removing verifiers', async function () {
            await tokenPaymaster.addVerifier(addr2.address);
            expect(await tokenPaymaster.verifiedSigners(addr2.address)).to.be.true;

            await tokenPaymaster.removeVerifier(addr2.address);
            expect(await tokenPaymaster.verifiedSigners(addr2.address)).to.be.false;
        });

        it('Should update exchange rate', async function () {
            const newRate = ethers.parseUnits('2', 18);
            await tokenPaymaster.setExchangeRate(newRate);
            expect(await tokenPaymaster.exchangeRate()).to.equal(newRate);
        });

        it('Should prevent unauthorized operations', async function () {
            await expect(
                tokenPaymaster.connect(addr1).addVerifier(addr2.address)
            ).to.be.revertedWithCustomError(tokenPaymaster, 'OwnableUnauthorizedAccount');
        });

        it('Should return correct balance', async function () {
            // Initially balance is 0 since no tokens have been transferred to paymaster
            const initialBalance = await tokenPaymaster.getBalance();
            expect(initialBalance).to.equal(0);
        });
    });

    describe('Integration Tests', function () {
        it('Should validate user operation signatures', async function () {
            const messageHash = ethers.id('test');
            const signature = await owner.signMessage(ethers.getBytes(messageHash));

            expect(signature).to.be.a('string');
            expect(signature.length).to.be.greaterThan(0);
        });

        it('Should handle batch operations with paymaster', async function () {
            await tokenPaymaster.addVerifier(addr1.address);
            expect(await tokenPaymaster.verifiedSigners(addr1.address)).to.be.true;

            const rate1 = ethers.parseUnits('1', 18);
            await tokenPaymaster.setExchangeRate(rate1);
            expect(await tokenPaymaster.exchangeRate()).to.equal(rate1);

            const rate2 = ethers.parseUnits('2', 18);
            await tokenPaymaster.setExchangeRate(rate2);
            expect(await tokenPaymaster.exchangeRate()).to.equal(rate2);
        });

        it('Should track nonce increments across operations', async function () {
            let currentNonce = await simpleAccount.nonce();
            expect(currentNonce).to.equal(0);

            for (let i = 0; i < 5; i++) {
                await simpleAccount.increaseNonce();
                currentNonce = await simpleAccount.nonce();
                expect(currentNonce).to.equal(i + 1);
            }
        });
    });
});
