import { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateSubtaskRequest } from '@/shared/types';
import { supabase } from '@/react-app/lib/supabase';

interface CreateSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  availableFunds: number;
}

export default function CreateSubtaskModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  availableFunds
}: CreateSubtaskModalProps) {
  const [formData, setFormData] = useState<Omit<CreateSubtaskRequest, 'project_id'>>({
    title: '',
    description: '',
    assigned_to: '',
    allocated_amount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create subtask
      const { error: subtaskError } = await supabase
        .from('subtasks')
        .insert({
          ...formData,
          project_id: projectId,
          status: 'pending'
        });

      if (subtaskError) throw subtaskError;

      // Update project allocated funds (this should ideally be an atomic transaction or handled by a trigger)
      const { error: projectError } = await supabase.rpc('allocate_project_funds', {
        p_project_id: projectId,
        p_amount: formData.allocated_amount
      });

      // If RPC fails (e.g. not created yet), attempt direct update for demo purposes
      if (projectError) {
        console.warn('RPC allocate_project_funds failed, attempting direct update:', projectError);
        // Note: Direct increment like this is not atomic in the client. 
        // In a real app, you'd use a Postgres trigger or function.
        const { data: project } = await supabase
          .from('projects')
          .select('allocated_funds')
          .eq('id', projectId)
          .single();

        if (project) {
          const { error: updateError } = await supabase
            .from('projects')
            .update({
              allocated_funds: project.allocated_funds + formData.allocated_amount,
              updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

          if (updateError) throw updateError;
        }
      }

      setFormData({ title: '', description: '', assigned_to: '', allocated_amount: 0 });
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
          <h2 className="text-xl sm:text-2xl font-bold text-green-100">Create Subtask</h2>
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

          <div className="p-3 sm:p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
            <p className="text-xs sm:text-sm text-emerald-300">
              Available funds: <span className="font-semibold">${availableFunds.toLocaleString()}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-green-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/50 border border-green-800/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-green-100 placeholder-green-700 text-sm sm:text-base"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-green-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/50 border border-green-800/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none text-green-100 placeholder-green-700 text-sm sm:text-base"
              placeholder="Describe the task"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-green-300 mb-2">
              Assign To
            </label>
            <input
              type="text"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/50 border border-green-800/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-green-100 placeholder-green-700 text-sm sm:text-base"
              placeholder="Team member name or wallet address"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-green-300 mb-2">
              Allocated Amount (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-500 text-sm sm:text-base">$</span>
              <input
                type="number"
                required
                min="0"
                max={availableFunds}
                step="0.01"
                value={formData.allocated_amount || ''}
                onChange={(e) => setFormData({ ...formData, allocated_amount: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-black/50 border border-green-800/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-green-100 placeholder-green-700 text-sm sm:text-base"
                placeholder="0.00"
              />
            </div>
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
              {loading ? 'Creating...' : 'Create Subtask'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
