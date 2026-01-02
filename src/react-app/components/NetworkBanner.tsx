import { useState } from 'react';
import { useWallet } from '@/react-app/context/WalletContext';
import { switchToSepoliaNetwork, isOnSepolia } from '@/react-app/lib/sepoliaNetworkConfig';
import { AlertTriangle, ArrowRight, CheckCircle, Loader2, X } from 'lucide-react';

/**
 * NetworkBanner - Shows a banner when users are on the wrong network
 * Provides one-click switching to Sepolia testnet
 */
export function NetworkBanner() {
    const { chainId, isConnected } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    // Don't show if not connected or already on Sepolia or dismissed
    if (!isConnected || isOnSepolia(chainId) || dismissed) {
        return null;
    }

    const handleSwitchNetwork = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await switchToSepoliaNetwork();
            if (result) {
                setSuccess(true);
                // Banner will auto-hide when chainId updates
            } else {
                setError('Failed to switch network. Please try manually.');
            }
        } catch (err) {
            setError('Network switch was cancelled or failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const getNetworkName = (id: number | null): string => {
        if (!id) return 'Unknown Network';
        const networks: Record<number, string> = {
            1: 'Ethereum Mainnet',
            5: 'Goerli Testnet',
            137: 'Polygon Mainnet',
            80001: 'Mumbai Testnet',
            42161: 'Arbitrum One',
            10: 'Optimism',
            31337: 'Local Network',
            11155111: 'Sepolia Testnet',
        };
        return networks[id] || `Chain ID: ${id}`;
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
            <div className="bg-gradient-to-r from-amber-500/95 via-orange-500/95 to-amber-500/95 backdrop-blur-sm text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="font-semibold">Wrong Network Detected!</span>
                                <span className="text-white/90 text-sm">
                                    You're on <strong>{getNetworkName(chainId)}</strong>.
                                    Please switch to <strong>Sepolia Testnet</strong> to use this app.
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {error && (
                                <span className="text-xs text-white/80 hidden sm:block">{error}</span>
                            )}

                            <button
                                onClick={handleSwitchNetwork}
                                disabled={isLoading || success}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg 
                           hover:bg-white/90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed
                           shadow-md hover:shadow-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Switching...</span>
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Switched!</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Switch to Sepolia</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setDismissed(true)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}

export default NetworkBanner;
