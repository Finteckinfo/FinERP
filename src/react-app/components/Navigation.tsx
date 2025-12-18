import { Link, useLocation } from 'react-router';
import { Home, ArrowDownUp, Sparkles } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Projects', icon: Home },
    { path: '/swap', label: 'Token Swap', icon: ArrowDownUp },
  ];

  return (
    <nav className="bg-black/60 backdrop-blur-lg border-b border-green-900/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg shadow-green-900/50 group-hover:shadow-green-900/70 transition-all">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                FinPro
              </h1>
              <p className="text-xs text-green-500/70 hidden sm:block">Decentralized Project Management</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/50'
                      : 'text-green-400/80 hover:text-green-300 hover:bg-green-900/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
