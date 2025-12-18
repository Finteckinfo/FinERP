import { CheckCircle, Clock, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import type { Subtask } from '@/shared/types';

interface SubtaskCardProps {
  subtask: Subtask;
  onStatusChange: (id: number, status: string) => void;
  onReview: (id: number, approved: boolean) => void;
  isOwner: boolean;
}

export default function SubtaskCard({ subtask, onStatusChange, onReview, isOwner }: SubtaskCardProps) {
  const statusConfig = {
    pending: { icon: Clock, color: 'yellow', label: 'Pending', bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-800/50' },
    in_progress: { icon: AlertCircle, color: 'blue', label: 'In Progress', bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-800/50' },
    submitted: { icon: Clock, color: 'amber', label: 'Awaiting Review', bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-800/50' },
    approved: { icon: CheckCircle, color: 'green', label: 'Approved', bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-800/50' },
    rejected: { icon: XCircle, color: 'red', label: 'Rejected', bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-800/50' },
  };

  const config = statusConfig[subtask.status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-black/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 shadow-md shadow-green-900/30 border border-green-800/50 hover:shadow-lg hover:shadow-green-900/40 transition-shadow">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-semibold text-green-100 mb-1 break-words">
            {subtask.title}
          </h3>
          {subtask.description && (
            <p className="text-xs sm:text-sm text-green-300/70 mb-2 break-words">
              {subtask.description}
            </p>
          )}
          {subtask.assigned_to && (
            <p className="text-xs text-green-500/60 truncate">
              Assigned to: {subtask.assigned_to}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 self-start sm:ml-4 flex-shrink-0">
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.text}`} />
          <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border} whitespace-nowrap`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm">
        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
        <span className="font-semibold text-emerald-300">
          ${subtask.allocated_amount.toLocaleString()}
        </span>
        <span className="text-green-500/60">allocated</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {subtask.status === 'pending' && (
          <button
            onClick={() => onStatusChange(subtask.id, 'in_progress')}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-blue-900/50 transition-all border border-blue-500/30"
          >
            Start Work
          </button>
        )}
        
        {subtask.status === 'in_progress' && (
          <button
            onClick={() => onStatusChange(subtask.id, 'submitted')}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-amber-900/50 transition-all border border-amber-500/30"
          >
            Submit for Review
          </button>
        )}

        {subtask.status === 'submitted' && isOwner && (
          <>
            <button
              onClick={() => onReview(subtask.id, true)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-green-900/50 transition-all border border-green-500/30"
            >
              Approve
            </button>
            <button
              onClick={() => onReview(subtask.id, false)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-red-900/50 transition-all border border-red-500/30"
            >
              Reject
            </button>
          </>
        )}

        {subtask.status === 'rejected' && (
          <button
            onClick={() => onStatusChange(subtask.id, 'in_progress')}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-blue-900/50 transition-all border border-blue-500/30"
          >
            Revise & Resubmit
          </button>
        )}
      </div>
    </div>
  );
}
