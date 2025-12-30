import { Link } from 'react-router';
import { Briefcase, DollarSign } from 'lucide-react';
import type { Project } from '@/shared/types';
import { OnChainVerificationBadge } from './OnChainVerificationBadge';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const availableFunds = (project.released_funds || 0);
  const isEscrowFunded = project.escrow_funded;
  const isActive = new Date(project.end_date) > new Date();

  return (
    <Link to={`/projects/${project.id}`}>
      <div className="group relative bg-[#121A2C] backdrop-blur-xl rounded-[24px] p-6 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 border border-white/5 hover:border-[#0D99FF]/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D99FF]/5 to-[#0066FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 bg-gradient-to-br from-[#0D99FF] to-[#0066FF] rounded-2xl shadow-lg shadow-blue-500/20 flex-shrink-0">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-[#0D99FF] transition-colors truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {project.description && (
            <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>Released Funds</span>
              </div>
              <span className="font-bold text-white text-lg">
                ${availableFunds.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider">
                <span className={`${isEscrowFunded ? 'text-green-400' : 'text-yellow-400'}`}>
                  Escrow: {isEscrowFunded ? 'Funded' : 'Pending'}
                </span>
                <span className={`${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                  {isActive ? 'Active' : 'Ended'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <OnChainVerificationBadge dataType="project" referenceId={project.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
