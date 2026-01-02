import { useState } from 'react';
import { X, Sparkles, ArrowRight, DollarSign } from 'lucide-react';
import { supabase } from '@/react-app/lib/supabase';
import { useWallet } from '@/react-app/hooks/useWallet';
import { useContract, parseEther } from '@/react-app/hooks/useWallet';
import { useTonWallet } from '@/react-app/hooks/useTonWallet';
import { FIN_TOKEN_ABI, PROJECT_ESCROW_ABI, CONTRACT_ADDRESSES } from '@/react-app/lib/contracts';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { account, provider, chainId } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_funds: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const finToken = useContract(CONTRACT_ADDRESSES.finToken, FIN_TOKEN_ABI);
  const projectEscrow = useContract(CONTRACT_ADDRESSES.projectEscrow, PROJECT_ESCROW_ABI);
  const { storeProjectOnTon, tonAddress } = useTonWallet();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!account || !provider || !finToken || !projectEscrow) {
        throw new Error('Wallet connection or contract initialization failed');
      }

      const amount = parseEther(formData.total_funds.toString());

      console.log('DEBUG: Funding Project');
      console.log('DEBUG: FIN Token Address:', await finToken.getAddress());
      console.log('DEBUG: Escrow Address:', await projectEscrow.getAddress());
      console.log('DEBUG: Wallet Account:', account);

      // 0. Check FIN Token Balance
      setLoadingStep('Verifying Treasury Balance...');
      let balance;
      try {
        balance = await finToken.balanceOf(account);
      } catch (err: any) {
        if (err.message?.includes('could not decode result data') || err.message?.includes('BAD_DATA')) {
          // In context, assume we can access chainId from parent scope if I add it to destructured vars
          throw new Error(`Network Mismatch: Could not verify FIN token balance. Please ensure you are connected to the correct network (Sepolia Testnet). Current Chain ID: ${chainId}`);
        }
        throw err;
      }

      if (balance < amount) {
        throw new Error('Insufficient FIN Balance: You do not have enough FIN tokens to fund this project. Please mint some tokens first.');
      }

      // 1. Approve FIN Token
      setLoadingStep('Authorizing Treasury Transfer...');
      const approveTx = await finToken.approve(CONTRACT_ADDRESSES.projectEscrow, amount);
      await approveTx.wait();

      // 2. Fund Project On-chain
      setLoadingStep('Initializing Protocol Registry...');
      const fundTx = await projectEscrow.fundProject(amount);
      const receipt = await fundTx.wait();

      // 3. Extract On-chain Project ID
      const event = receipt.logs
        .map((log: any) => {
          try {
            return projectEscrow.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((e: any) => e && e.name === 'ProjectFunded');

      const onChainId = event ? event.args.projectId.toString() : null;

      // 4. Create record in Supabase
      setLoadingStep('Finalizing Registry Backup...');
      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description,
          total_funds: formData.total_funds,
          on_chain_id: onChainId,
          start_date: formData.start_date,
          end_date: formData.end_date,
          owner_id: account.toLowerCase(),
          wallet_address: account,
          is_public: true,
          allow_guests: false,
          escrow_funded: true,
          status: 'active'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 5. Replicate to TON for transparency (optional but recommended)
      if (tonAddress && newProject) {
        try {
          setLoadingStep('Replicating to TON for Transparency...');
          const tonTxHash = await storeProjectOnTon({
            name: formData.name,
            description: formData.description || '',
            owner: tonAddress,
            totalFunds: formData.total_funds
          });

          // Store TON reference in mirror table
          await supabase.from('on_chain_data_mirror').insert({
            chain: 'TON',
            contract_address: import.meta.env.VITE_TON_DATA_REGISTRY_ADDRESS,
            data_type: 'project',
            reference_id: newProject.id,
            on_chain_hash: tonTxHash,
            data_snapshot: newProject
          });
        } catch (tonError) {
          // TON replication is optional, don't fail the entire process
          console.warn('TON replication failed:', tonError);
        }
      }

      setFormData({
        name: '',
        description: '',
        total_funds: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'An error occurred';

      // Handle Common RPC Errors
      if (errorMessage.includes('returned too many errors') || errorMessage.includes('-32002')) {
        errorMessage = 'Wallet Network Congested: Please switch your MetaMask RPC URL to a public node (e.g., via Chainlist) or try again later.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#121A2C] border border-white/10 rounded-[40px] shadow-2xl shadow-black/50 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

        <div className="p-8 sm:p-10 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Register Project</h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Enrollment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors border border-white/5 flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8 overflow-y-auto relative z-10">
          {error && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[24px] text-red-400 text-sm font-bold flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
              Entity Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all text-white placeholder-gray-700 text-lg font-bold"
              placeholder="e.g. Decentralized Treasury Alpha"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
              Strategic Brief
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all resize-none text-white placeholder-gray-700 font-medium"
              placeholder="Primary objectives and scope of the managed asset..."
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
              Treasury Allocation (FIN)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.total_funds || ''}
                onChange={(e) => setFormData({ ...formData, total_funds: parseFloat(e.target.value) || 0 })}
                className="w-full pl-14 pr-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all text-white placeholder-gray-700 text-3xl font-black"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all text-white font-medium"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                End Date
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all text-white font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex-[2] flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-[#0D99FF] to-[#0066FF] text-white rounded-[24px] font-black text-lg hover:shadow-[0_12px_40px_rgba(13,153,255,0.4)] hover:scale-[1.02] transition-all disabled:opacity-20 border border-white/10"
            >
              <span>{loading ? (loadingStep || 'Initializing...') : 'Initialize Registry'}</span>
              <ArrowRight className="w-5 h-5 absolute right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
