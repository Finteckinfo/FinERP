import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/ton';
import { useState } from 'react';

export function useTonWallet() {
    const [tonConnectUI] = useTonConnectUI();
    const tonAddress = useTonAddress();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const storeProjectOnTon = async (projectData: {
        name: string;
        description: string;
        owner: string;
        totalFunds: number;
    }) => {
        try {
            setLoading(true);
            setError(null);

            // Build message to DataRegistry contract
            const body = beginCell()
                .storeUint(0x12345678, 32) // op code for StoreProject
                .storeStringTail(projectData.name)
                .storeStringTail(projectData.description)
                .storeAddress(Address.parse(projectData.owner))
                .storeCoins(toNano(projectData.totalFunds))
                .endCell();

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600,
                messages: [
                    {
                        address: import.meta.env.VITE_TON_DATA_REGISTRY_ADDRESS || '',
                        amount: toNano('0.05').toString(), // Gas fee
                        payload: body.toBoc().toString('base64')
                    }
                ]
            };

            const result = await tonConnectUI.sendTransaction(transaction);
            return result.boc; // Transaction hash
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to store on TON';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const storeSubtaskOnTon = async (subtaskData: {
        projectId: number;
        title: string;
        assignedTo: string;
        amount: number;
    }) => {
        try {
            setLoading(true);
            setError(null);

            const body = beginCell()
                .storeUint(0x87654321, 32) // op code for StoreSubtask
                .storeUint(subtaskData.projectId, 64)
                .storeStringTail(subtaskData.title)
                .storeAddress(Address.parse(subtaskData.assignedTo))
                .storeCoins(toNano(subtaskData.amount))
                .endCell();

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600,
                messages: [
                    {
                        address: import.meta.env.VITE_TON_DATA_REGISTRY_ADDRESS || '',
                        amount: toNano('0.05').toString(),
                        payload: body.toBoc().toString('base64')
                    }
                ]
            };

            const result = await tonConnectUI.sendTransaction(transaction);
            return result.boc;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to store subtask on TON';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        tonAddress,
        isConnected: !!tonAddress,
        loading,
        error,
        storeProjectOnTon,
        storeSubtaskOnTon,
        connectTon: () => tonConnectUI.openModal(),
        disconnectTon: () => tonConnectUI.disconnect()
    };
}
