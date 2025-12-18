import { Navigate } from 'react-router';
import { useWallet } from '@/react-app/hooks/useWallet';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected, loading } = useWallet();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-300">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
