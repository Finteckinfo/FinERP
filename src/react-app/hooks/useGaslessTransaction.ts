import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { AccountAbstractionSDK } from '../../lib/accountAbstraction';

interface GaslessTransactionState {
    loading: boolean;
    error: string | null;
    success: boolean;
    userOpHash: string | null;
    transactionHash: string | null;
}

interface UseGaslessTransactionOptions {
    entryPointAddress: string;
    paymasterAddress: string;
    paymasterSigningKey: string;
    bundlerUrl?: string;
    rpcUrl: string;
}

export function useGaslessTransaction(options: UseGaslessTransactionOptions) {
    const [state, setState] = useState<GaslessTransactionState>({
        loading: false,
        error: null,
        success: false,
        userOpHash: null,
        transactionHash: null,
    });

    const sdk = React.useMemo(() => new AccountAbstractionSDK(
        {
            address: options.entryPointAddress,
            rpcUrl: options.rpcUrl,
            chainId: 31337,
        },
        {
            address: options.paymasterAddress,
            signingKey: options.paymasterSigningKey,
            token: '',
        }
    ), [
        options.entryPointAddress,
        options.rpcUrl,
        options.paymasterAddress,
        options.paymasterSigningKey
    ]);

    const sendGaslessTransaction = useCallback(
        async (
            senderAddress: string,
            targetAddress: string,
            callData: string,
            signingKey: string,
            nonce: number = 0
        ) => {
            setState({
                loading: true,
                error: null,
                success: false,
                userOpHash: null,
                transactionHash: null,
            });

            try {
                const userOp = await sdk.buildUserOperation(
                    senderAddress,
                    targetAddress,
                    callData,
                    0n,
                    nonce
                );

                const gasEstimate = await sdk.estimateUserOperationGas(userOp);
                Object.assign(userOp, gasEstimate);

                const signature = await sdk.signUserOperation(userOp, signingKey);

                const finalUserOp = {
                    ...userOp,
                    signature,
                    paymasterAndData: userOp.paymasterAndData || options.paymasterAddress,
                } as any;

                const result = await sdk.sendUserOperation(
                    finalUserOp,
                    options.bundlerUrl
                );

                setState({
                    loading: false,
                    error: null,
                    success: true,
                    userOpHash: result.userOpHash,
                    transactionHash: null,
                });

                if (options.bundlerUrl) {
                    let receipt = null;
                    let attempts = 0;
                    const maxAttempts = 30;

                    while (!receipt && attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        receipt = await sdk.getUserOperationReceipt(
                            result.userOpHash,
                            options.bundlerUrl
                        );
                        attempts++;
                    }

                    if (receipt) {
                        setState(prev => ({
                            ...prev,
                            transactionHash: receipt?.transactionHash || null,
                        }));
                    }
                }

                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setState({
                    loading: false,
                    error: errorMessage,
                    success: false,
                    userOpHash: null,
                    transactionHash: null,
                });
                throw error;
            }
        },
        [sdk, options]
    );

    return {
        ...state,
        sendGaslessTransaction,
    };
}

export interface GaslessContractCallOptions {
    contractAddress: string;
    functionName: string;
    args: unknown[];
    abi: any;
}

export function useGaslessContractCall(options: UseGaslessTransactionOptions) {
    const gaslessUtils = useGaslessTransaction(options);

    const callContract = useCallback(
        async (
            senderAddress: string,
            contractCall: GaslessContractCallOptions,
            signingKey: string,
            nonce: number = 0
        ) => {
            const iface = new ethers.Interface(contractCall.abi);
            const callData = iface.encodeFunctionData(
                contractCall.functionName,
                contractCall.args
            );

            return gaslessUtils.sendGaslessTransaction(
                senderAddress,
                contractCall.contractAddress,
                callData,
                signingKey,
                nonce
            );
        },
        [gaslessUtils]
    );

    return {
        ...gaslessUtils,
        callContract,
    };
}
