import { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OnChainVerificationBadgeProps {
    dataType: 'project' | 'subtask';
    referenceId: number;
}

export function OnChainVerificationBadge({ dataType, referenceId }: OnChainVerificationBadgeProps) {
    const [verified, setVerified] = useState<{
        ton: boolean;
        evm: boolean;
    }>({ ton: false, evm: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkVerification() {
            try {
                const { data } = await supabase
                    .from('on_chain_data_mirror')
                    .select('chain')
                    .eq('data_type', dataType)
                    .eq('reference_id', referenceId);

                if (data) {
                    setVerified({
                        ton: data.some(d => d.chain === 'TON'),
                        evm: data.some(d => d.chain === 'EVM')
                    });
                }
            } catch (error) {
                console.error('Error checking verification:', error);
            } finally {
                setLoading(false);
            }
        }

        checkVerification();
    }, [dataType, referenceId]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 animate-pulse" />
                <span>Verifying...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                {verified.ton ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                ) : (
                    <XCircle className="w-3.5 h-3.5 text-gray-500" />
                )}
                <span className={`text-xs font-medium ${verified.ton ? 'text-green-400' : 'text-gray-500'}`}>
                    TON
                </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                {verified.evm ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                ) : (
                    <XCircle className="w-3.5 h-3.5 text-gray-500" />
                )}
                <span className={`text-xs font-medium ${verified.evm ? 'text-green-400' : 'text-gray-500'}`}>
                    EVM
                </span>
            </div>
        </div>
    );
}
