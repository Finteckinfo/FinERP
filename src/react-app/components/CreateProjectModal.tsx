import { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateProjectRequest } from '@/shared/types';
import { supabase } from '@/react-app/lib/supabase';
import { useWallet } from '@/react-app/hooks/useWallet';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { account } = useWallet();
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    total_funds: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          ...formData,
          owner_id: account?.toLowerCase() || 'demo-user',
          status: 'active'
        });

      if (insertError) throw insertError;

      setFormData({ name: '', description: '', total_funds: 0 });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-950 to-black border border-green-800/50 rounded-2xl shadow-2xl shadow-green-900/50 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-br from-green-950 to-black border-b border-green-800/50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-green-100">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-900/30 rounded-lg transition-colors border border-green-800/50 flex-shrink-0"
          >
            <X className="w-5 h-5 text-green-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {error && (
            <div className="p-3 sm:p-4 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-green-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/50 border border-green-800/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-green-100 placeholder-green-700 text-sm sm:text-base"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-green-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/50 border border-green-800/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none text-green-100 placeholder-green-700 text-sm sm:text-base"
              placeholder="Describe your project"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-green-300 mb-2">
              Total Budget (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-500 text-sm sm:text-base">$</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.total_funds || ''}
                onChange={(e) => setFormData({ ...formData, total_funds: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-black/50 border border-green-800/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-green-100 placeholder-green-700 text-sm sm:text-base"
                placeholder="0.00"
              />
            </div>
            <p className="mt-2 text-xs text-green-500/60">
              This amount will be held in blockchain escrow for task payments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-green-800/50 rounded-lg text-green-300 font-medium hover:bg-green-900/20 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-900/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30 text-sm sm:text-base"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
