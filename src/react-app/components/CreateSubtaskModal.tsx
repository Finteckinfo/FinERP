import { useState } from 'react';
import { X, Activity, DollarSign, ArrowRight, User } from 'lucide-react';
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
      // Step 1: Validate project exists
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, allocated_funds')
        .eq('id', projectId)
        .single();

      if (projectError) {
        throw new Error(`Project not found: ${projectError.message}`);
      }

      // Step 2: Ensure assigned_to user exists in users table
      const assignedToId = formData.assigned_to || 'anonymous';

      if (assignedToId !== 'anonymous') {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', assignedToId)
          .single();

        if (!existingUser) {
          // Create user if doesn't exist
          const { error: userInsertError } = await supabase
            .from('users')
            .insert({ id: assignedToId });

          if (userInsertError && userInsertError.code !== '23505') {
            console.warn('User creation returned:', userInsertError.code);
          }
        }
      }

      // Step 3: Create subtask with full error logging
      const { error: subtaskError } = await supabase
        .from('subtasks')
        .insert({
          project_id: projectId,
          title: formData.title,
          description: formData.description || null,
          assigned_to: assignedToId !== 'anonymous' ? assignedToId : null,
          allocated_amount: formData.allocated_amount,
          status: 'pending'
        })
        .select();

      if (subtaskError) {
        console.error('Subtask creation failed:', {
          code: subtaskError.code,
          message: subtaskError.message,
          details: subtaskError.details,
          hint: subtaskError.hint
        });
        throw new Error(`Failed to create stream: ${subtaskError.message}`);
      }

      // Step 4: Update project allocated funds via RPC
      const { error: allocError } = await supabase.rpc('allocate_project_funds', {
        p_project_id: projectId,
        p_amount: formData.allocated_amount
      });

      if (allocError) {
        console.warn('RPC allocate_project_funds failed, attempting fallback update:', allocError);
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            allocated_funds: (project.allocated_funds || 0) + formData.allocated_amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId);

        if (updateError) {
          console.error('Fallback update failed:', updateError);
          throw new Error(`Failed to update project funds: ${updateError.message}`);
        }
      }

      // Success - reset form and close
      setFormData({ title: '', description: '', assigned_to: '', allocated_amount: 0 });
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred creating the stream';
      setError(errorMessage);
      console.error('Full error details:', err);
    } finally {
      setLoading(false);
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
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Deploy Stream</h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Component Initialization</p>
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

          <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-[24px] flex flex-col gap-1">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Allocatable Treasury</span>
            <div className="text-xl font-black text-blue-400">${availableFunds.toLocaleString()}</div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
              Stream Identifier
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all text-white placeholder-gray-700 text-lg font-bold"
              placeholder="e.g. Core Engine API"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
              Stream Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all text-white placeholder-gray-700 font-medium resize-none"
              placeholder="Describe the component objectives and deliverables..."
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
              Assigned Participant
            </label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full pl-14 pr-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all text-white placeholder-gray-700 font-bold"
                placeholder="Wallet Address / ID"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
              Treasury Allocation (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
              <input
                type="number"
                required
                min="0"
                max={availableFunds}
                step="1"
                value={formData.allocated_amount || ''}
                onChange={(e) => setFormData({ ...formData, allocated_amount: parseFloat(e.target.value) || 0 })}
                className="w-full pl-14 pr-6 py-4 bg-black/20 border border-white/5 rounded-[22px] focus:border-blue-500/30 outline-none transition-all text-white placeholder-gray-700 text-3xl font-black"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || formData.allocated_amount > availableFunds}
              className="group relative flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-[#0D99FF] to-[#0066FF] text-white rounded-[24px] font-black text-lg hover:shadow-[0_12px_40px_rgba(13,153,255,0.4)] hover:scale-[1.02] transition-all disabled:opacity-20 border border-white/10 w-full"
            >
              <span>{loading ? 'Initializing Stream...' : 'Initialize Work Stream'}</span>
              <ArrowRight className="w-5 h-5 absolute right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
