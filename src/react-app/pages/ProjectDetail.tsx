import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Plus, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { useProject } from '@/react-app/hooks/useProjects';
import { useSubtasks } from '@/react-app/hooks/useSubtasks';
import SubtaskCard from '@/react-app/components/SubtaskCard';
import CreateSubtaskModal from '@/react-app/components/CreateSubtaskModal';
import WalletConnect from '@/react-app/components/WalletConnect';
import { supabase } from '@/react-app/lib/supabase';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { project, loading: projectLoading, refetch: refetchProject } = useProject(id || '');
  const { subtasks, loading: subtasksLoading, refetch: refetchSubtasks } = useSubtasks(
    project ? project.id : null
  );
  const [isCreateSubtaskModalOpen, setIsCreateSubtaskModalOpen] = useState(false);

  const handleStatusChange = async (subtaskId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', subtaskId);

      if (error) throw error;

      refetchSubtasks();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleReview = async (subtaskId: number, approved: boolean) => {
    try {
      const status = approved ? 'approved' : 'rejected';

      // Create review entry
      const { error: reviewError } = await supabase
        .from('subtask_reviews')
        .insert({
          subtask_id: subtaskId,
          reviewer_id: 'demo-user', // Should be current user wallet
          status,
          comments: '',
        });

      if (reviewError) throw reviewError;

      // Update subtask status
      const { error: subtaskError } = await supabase
        .from('subtasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', subtaskId);

      if (subtaskError) throw subtaskError;

      refetchSubtasks();
      refetchProject();
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleSubtaskCreated = () => {
    refetchSubtasks();
    refetchProject();
  };

  if (projectLoading || subtasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-300">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-green-900/40 to-black/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-green-900/50 border border-green-800/50 p-8 max-w-md w-full text-center">
          <p className="text-green-300 mb-4">Project not found</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const availableFunds = project.total_funds - project.allocated_funds;
  const approvedSubtasks = subtasks.filter(s => s.status === 'approved').length;
  const completionRate = subtasks.length > 0 ? (approvedSubtasks / subtasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-lg border-b border-green-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Back to Projects</span>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial">
                <WalletConnect />
              </div>
              <button
                onClick={() => setIsCreateSubtaskModalOpen(true)}
                disabled={availableFunds <= 0}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-900/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30 text-sm sm:text-base whitespace-nowrap"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New Subtask</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Project Header */}
        <div className="bg-gradient-to-br from-green-900/40 to-black/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-green-900/50 border border-green-800/50 p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-100 mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-base sm:text-lg text-green-300/70">{project.description}</p>
              )}
            </div>
            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap ${project.status === 'active'
                ? 'bg-green-900/50 text-green-300 border-green-700/50'
                : project.status === 'completed'
                  ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50'
                  : 'bg-gray-900/50 text-gray-400 border-gray-700/50'
              }`}>
              {project.status}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-green-800/30 to-emerald-900/30 rounded-xl p-4 sm:p-5 border border-green-700/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-green-300/70">Total Budget</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-100">
                ${project.total_funds.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-800/30 to-green-900/30 rounded-xl p-4 sm:p-5 border border-emerald-700/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-green-300/70">Available</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-100">
                ${availableFunds.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-green-900/30 rounded-xl p-4 sm:p-5 border border-blue-800/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-green-300/70">Tasks</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-100">
                {approvedSubtasks}/{subtasks.length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-green-900/30 rounded-xl p-4 sm:p-5 border border-yellow-800/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-green-300/70">Completion</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-100">
                {completionRate.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Subtasks Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-100 mb-4 sm:mb-6 px-2 sm:px-0">Subtasks</h2>

          {subtasks.length === 0 ? (
            <div className="bg-gradient-to-br from-green-900/40 to-black/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-green-900/50 border border-green-800/50 p-8 sm:p-12 text-center">
              <div className="inline-block p-4 sm:p-6 bg-green-900/30 rounded-2xl mb-4 border border-green-800/50">
                <Plus className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-green-100 mb-2">
                No Subtasks Yet
              </h3>
              <p className="text-sm sm:text-base text-green-400/70 mb-6 max-w-md mx-auto px-4">
                Break down your project into smaller tasks and allocate funds for each one.
              </p>
              <button
                onClick={() => setIsCreateSubtaskModalOpen(true)}
                disabled={availableFunds <= 0}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-green-900/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Create First Subtask
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {subtasks.map((subtask) => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  onStatusChange={handleStatusChange}
                  onReview={handleReview}
                  isOwner={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateSubtaskModal
        isOpen={isCreateSubtaskModalOpen}
        onClose={() => setIsCreateSubtaskModalOpen(false)}
        onSuccess={handleSubtaskCreated}
        projectId={project.id}
        availableFunds={availableFunds}
      />
    </div>
  );
}
