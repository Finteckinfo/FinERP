import { Link } from 'react-router';
import { Briefcase, DollarSign } from 'lucide-react';
import type { Project } from '@/shared/types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const availableFunds = project.total_funds - project.allocated_funds;
  const percentAllocated = project.total_funds > 0 
    ? (project.allocated_funds / project.total_funds) * 100 
    : 0;

  return (
    <Link to={`/projects/${project.id}`}>
      <div className="group relative bg-gradient-to-br from-green-900/40 to-black/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-lg shadow-green-900/30 hover:shadow-xl hover:shadow-green-900/50 transition-all duration-300 border border-green-800/50 hover:border-green-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800/10 to-emerald-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg shadow-green-900/50 flex-shrink-0">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-green-100 group-hover:text-green-50 transition-colors truncate">
                  {project.name}
                </h3>
                <p className="text-xs sm:text-sm text-green-500/70 mt-0.5">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
              project.status === 'active' 
                ? 'bg-green-900/50 text-green-300 border-green-700/50' 
                : project.status === 'completed'
                ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50'
                : 'bg-gray-900/50 text-gray-400 border-gray-700/50'
            }`}>
              {project.status}
            </span>
          </div>

          {project.description && (
            <p className="text-sm sm:text-base text-green-300/80 mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-green-400/70">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Total Budget</span>
              </div>
              <span className="font-semibold text-green-100">
                ${project.total_funds.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-green-500/60">
                <span>Allocated: ${project.allocated_funds.toLocaleString()}</span>
                <span>Available: ${availableFunds.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-green-900/50">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                  style={{ width: `${percentAllocated}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
