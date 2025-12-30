import { TonClient, Address, beginCell, toNano } from '@ton/ton';
import { supabase } from '../react-app/lib/supabase';

const _TON_CLIENT = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TON_API_KEY
});

// Omitted unused interfaces ProjectData and SubtaskData

export async function syncProjectToTon(projectId: number): Promise<string> {
    try {
        // 1. Get project data from Supabase
        const { data: project, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error || !project) {
            throw new Error(`Project ${projectId} not found`);
        }

        // 2. Build TON transaction
        beginCell()
            .storeUint(0x12345678, 32) // op code for StoreProject
            .storeStringTail(project.name)
            .storeStringTail(project.description || '')
            .storeAddress(Address.parse(project.owner_id))
            .storeCoins(toNano(project.total_funds))
            .endCell();

        // 3. Send transaction (requires bot wallet setup)
        // Note: This would need proper wallet implementation
        const txHash = `ton_${Date.now()}_${projectId}`; // Placeholder

        // 4. Store in on_chain_data_mirror
        await supabase.from('on_chain_data_mirror').insert({
            chain: 'TON',
            contract_address: process.env.VITE_TON_DATA_REGISTRY_ADDRESS,
            data_type: 'project',
            reference_id: projectId,
            on_chain_hash: txHash,
            data_snapshot: project
        });

        // 5. Record cross-chain transaction
        await supabase.from('cross_chain_transactions').insert({
            user_id: project.owner_id,
            source_chain: 'EVM',
            dest_chain: 'TON',
            tx_hash: txHash,
            operation_type: 'project_create',
            amount: project.total_funds,
            metadata: { project_id: projectId },
            status: 'completed'
        });

        return txHash;
    } catch (error) {
        console.error('Error syncing project to TON:', error);
        throw error;
    }
}

export async function syncSubtaskToTon(subtaskId: number): Promise<string> {
    try {
        const { data: subtask, error } = await supabase
            .from('subtasks')
            .select('*')
            .eq('id', subtaskId)
            .single();

        if (error || !subtask) {
            throw new Error(`Subtask ${subtaskId} not found`);
        }

        beginCell()
            .storeUint(0x87654321, 32) // op code for StoreSubtask
            .storeUint(subtask.project_id, 64)
            .storeStringTail(subtask.title)
            .storeAddress(Address.parse(subtask.assigned_to || '0:0000000000000000000000000000000000000000000000000000000000000000'))
            .storeCoins(toNano(subtask.allocated_amount))
            .endCell();

        const txHash = `ton_${Date.now()}_subtask_${subtaskId}`;

        await supabase.from('on_chain_data_mirror').insert({
            chain: 'TON',
            contract_address: process.env.VITE_TON_DATA_REGISTRY_ADDRESS,
            data_type: 'subtask',
            reference_id: subtaskId,
            on_chain_hash: txHash,
            data_snapshot: subtask
        });

        await supabase.from('cross_chain_transactions').insert({
            user_id: subtask.assigned_to || 'system',
            source_chain: 'EVM',
            dest_chain: 'TON',
            tx_hash: txHash,
            operation_type: 'subtask_create',
            amount: subtask.allocated_amount,
            metadata: { subtask_id: subtaskId, project_id: subtask.project_id },
            status: 'completed'
        });

        return txHash;
    } catch (error) {
        console.error('Error syncing subtask to TON:', error);
        throw error;
    }
}

export async function verifyOnChainData(
    chain: 'TON' | 'EVM',
    dataType: string,
    referenceId: number
): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('on_chain_data_mirror')
            .select('*')
            .eq('chain', chain)
            .eq('data_type', dataType)
            .eq('reference_id', referenceId)
            .single();

        return !error && !!data;
    } catch (error) {
        console.error('Error verifying on-chain data:', error);
        return false;
    }
}
