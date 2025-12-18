import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { useWallet } from '@/react-app/hooks/useWallet';

export default function WalletConnect() {
  const { account, loading, error, connect, disconnect, isConnected } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-900/20 border border-red-800 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-red-400 truncate">{error}</span>
      </div>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-700/50 rounded-lg flex-1 sm:flex-initial">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-mono text-green-100 truncate">{formatAddress(account)}</span>
          </div>
        </div>
        <button
          onClick={disconnect}
          className="p-2 hover:bg-green-900/20 rounded-lg transition-colors border border-green-800/50 flex-shrink-0"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-900/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30 text-sm sm:text-base w-full sm:w-auto justify-center"
    >
      <Wallet className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
      <span className="truncate">{loading ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
}
