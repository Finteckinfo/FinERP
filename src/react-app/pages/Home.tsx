import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useProjects } from '@/react-app/hooks/useProjects';
import ProjectCard from '@/react-app/components/ProjectCard';
import CreateProjectModal from '@/react-app/components/CreateProjectModal';
import WalletConnect from '@/react-app/components/WalletConnect';
import { Navigation } from '@/react-app/components/Navigation';

export default function HomePage() {
  const { projects, loading, error, refetch } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-300">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black flex items-center justify-center p-4">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-green-900/50 border border-green-900/50 p-8 max-w-md w-full">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black">
      <Navigation />
      
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-sm border-b border-green-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Your Projects</h2>
              <p className="text-sm text-green-400/70">Manage your remote team projects with blockchain-secured escrow</p>
            </div>
            
            <div className="flex items-center gap-3">
              <WalletConnect />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-900/50 hover:scale-105 transition-all border border-green-500/30 text-sm sm:text-base whitespace-nowrap"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New Project</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {projects.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block p-4 sm:p-6 bg-gradient-to-br from-green-900/40 to-black/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-green-900/50 border border-green-800/50 mb-6">
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-green-100 mb-3 px-4">
              No Projects Yet
            </h2>
            <p className="text-sm sm:text-base text-green-400/70 mb-8 max-w-md mx-auto px-4">
              Create your first project to start tracking tasks and managing funds with Web3 escrow payments on Ethereum.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-green-900/50 hover:scale-105 transition-all border border-green-500/30 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
