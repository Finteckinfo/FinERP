import { ethers } from 'ethers';

export interface UserOperation {
    sender: string;
    nonce: number;
    initCode: string;
    callData: string;
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    paymasterAndData: string;
    signature: string;
}

export interface EntryPointConfig {
    address: string;
    rpcUrl: string;
    chainId: number;
}

export interface PaymasterConfig {
    address: string;
    signingKey: string;
    token: string;
}

export class AccountAbstractionSDK {
    private provider: ethers.JsonRpcProvider;
    private entryPointAddress: string;
    private paymasterAddress: string;
    private paymasterSigningKey: string;

    constructor(config: EntryPointConfig, paymasterConfig: PaymasterConfig) {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.entryPointAddress = config.address;
        this.paymasterAddress = paymasterConfig.address;
        this.paymasterSigningKey = paymasterConfig.signingKey;
        // Note: chainId from config is reserved for future use in multi-chain support
        void config.chainId;
    }

    async getUserOperationHash(userOp: Partial<UserOperation>): Promise<string> {
        const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
            [
                'address',
                'uint256',
                'bytes',
                'bytes',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'bytes',
            ],
            [
                userOp.sender,
                userOp.nonce,
                userOp.initCode || '0x',
                userOp.callData || '0x',
                userOp.callGasLimit || 0n,
                userOp.verificationGasLimit || 0n,
                userOp.preVerificationGas || 0n,
                userOp.maxFeePerGas || 0n,
                userOp.maxPriorityFeePerGas || 0n,
                userOp.paymasterAndData || '0x',
            ]
        );

        return ethers.keccak256(encoded);
    }

    async signUserOperation(
        userOp: Partial<UserOperation>,
        signingKey: string
    ): Promise<string> {
        const hash = await this.getUserOperationHash(userOp);
        const messageHash = ethers.hashMessage(ethers.getBytes(hash));
        const wallet = new ethers.Wallet(signingKey);
        return wallet.signingKey.sign(messageHash).serialized;
    }

    async signPaymasterData(
        userOp: Partial<UserOperation>,
        _maxCost: bigint
    ): Promise<string> {
        const hash = await this.getUserOperationHash(userOp);
        const paymasterWallet = new ethers.Wallet(this.paymasterSigningKey);
        const messageHash = ethers.hashMessage(ethers.getBytes(hash));
        return paymasterWallet.signingKey.sign(messageHash).serialized;
    }

    async buildUserOperation(
        sender: string,
        target: string,
        data: string,
        value: bigint = 0n,
        nonce: number = 0
    ): Promise<Partial<UserOperation>> {
        const callData = await this.encodeCall(target, data, value);

        const baseFeePerGas = (await this.provider.getFeeData()).gasPrice || 1n;
        const maxPriorityFeePerGas = ethers.parseUnits('1', 'gwei');
        const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;

        return {
            sender,
            nonce,
            initCode: '0x',
            callData,
            callGasLimit: 200000n,
            verificationGasLimit: 100000n,
            preVerificationGas: 21000n,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData: this.paymasterAddress,
        };
    }

    private async encodeCall(
        target: string,
        data: string,
        value: bigint
    ): Promise<string> {
        const iface = new ethers.Interface(['function execute(address,uint256,bytes)']);
        return iface.encodeFunctionData('execute', [target, value, data]);
    }

    async estimateUserOperationGas(
        userOp: Partial<UserOperation>
    ): Promise<{ callGasLimit: bigint; verificationGasLimit: bigint; preVerificationGas: bigint }> {
        try {
            const callData = userOp.callData || '0x';
            const baseGas = 21000n;
            const callGasEstimate = BigInt(callData.length > 2 ? (callData.length - 2) / 2 * 16 : 0);

            return {
                preVerificationGas: baseGas + 1000n,
                verificationGasLimit: 100000n,
                callGasLimit: 200000n + callGasEstimate,
            };
        } catch (error) {
            console.error('Error estimating gas:', error);
            throw new Error('Failed to estimate user operation gas');
        }
    }

    async sendUserOperation(
        userOp: UserOperation,
        bundlerUrl?: string
    ): Promise<{ userOpHash: string; status: string }> {
        const userOpHash = await this.getUserOperationHash(userOp);

        if (bundlerUrl) {
            return this.sendViaBundler(userOp, bundlerUrl);
        }

        return {
            userOpHash,
            status: 'submitted',
        };
    }

    private async sendViaBundler(
        userOp: UserOperation,
        bundlerUrl: string
    ): Promise<{ userOpHash: string; status: string }> {
        try {
            const response = await fetch(bundlerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_sendUserOperation',
                    params: [userOp, this.entryPointAddress],
                }),
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error.message);
            }

            return {
                userOpHash: result.result,
                status: 'pending',
            };
        } catch (error) {
            console.error('Bundler error:', error);
            throw error;
        }
    }

    async getUserOperationReceipt(
        userOpHash: string,
        bundlerUrl?: string
    ): Promise<{ status: string; blockNumber?: number; transactionHash?: string } | null> {
        if (!bundlerUrl) {
            return null;
        }

        try {
            const response = await fetch(bundlerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_getUserOperationReceipt',
                    params: [userOpHash],
                }),
            });

            const result = await response.json();

            if (result.error) {
                return null;
            }

            if (!result.result) {
                return null;
            }

            return {
                status: result.result ? 'success' : 'pending',
                blockNumber: result.result?.blockNumber,
                transactionHash: result.result?.transactionHash,
            };
        } catch (error) {
            console.error('Error getting receipt:', error);
            return null;
        }
    }
}

export async function createAccountAbstractionSDK(
    rpcUrl: string,
    entryPointAddress: string,
    paymasterAddress: string,
    paymasterSigningKey: string,
    chainId: number = 31337
): Promise<AccountAbstractionSDK> {
    const entryPointConfig: EntryPointConfig = {
        address: entryPointAddress,
        rpcUrl,
        chainId,
    };

    const paymasterConfig: PaymasterConfig = {
        address: paymasterAddress,
        signingKey: paymasterSigningKey,
        token: '',
    };

    return new AccountAbstractionSDK(entryPointConfig, paymasterConfig);
}
