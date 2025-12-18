import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, Shield, Sparkles, CheckCircle, Lock } from 'lucide-react';
import { useWallet } from '@/react-app/hooks/useWallet';

export default function LoginPage() {
  const { account, loading, error, connect, isConnected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && account) {
      navigate('/');
    }
  }, [isConnected, account, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg shadow-green-900/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                FinPro
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-green-100 leading-tight">
              Decentralized Project Management
            </h2>
            <p className="text-lg text-green-300/70 leading-relaxed">
              Secure your remote team payments with blockchain escrow technology. Connect your wallet to get started.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-900/30 to-black/80 backdrop-blur-xl rounded-xl border border-green-800/50">
              <div className="p-2 bg-green-900/50 rounded-lg">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-100 mb-1">Trustless Escrow</h3>
                <p className="text-sm text-green-400/70">Smart contracts hold funds securely until work is approved</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-900/30 to-black/80 backdrop-blur-xl rounded-xl border border-green-800/50">
              <div className="p-2 bg-green-900/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-100 mb-1">Transparent Payments</h3>
                <p className="text-sm text-green-400/70">All transactions are verifiable on the blockchain</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-900/30 to-black/80 backdrop-blur-xl rounded-xl border border-green-800/50">
              <div className="p-2 bg-green-900/50 rounded-lg">
                <Lock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-100 mb-1">Wallet-Based Auth</h3>
                <p className="text-sm text-green-400/70">No passwords needed - your wallet is your identity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-green-900/40 to-black/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-green-900/50 border border-green-800/50 p-8 md:p-10">
              {/* Mobile branding */}
              <div className="lg:hidden mb-8 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg shadow-green-900/50">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    FinPro
                  </h1>
                </div>
                <p className="text-green-300/70">
                  Decentralized Project Management
                </p>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-green-100 mb-3">
                  Welcome Back
                </h2>
                <p className="text-green-400/70">
                  Connect your Ethereum wallet to access your projects
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 rounded-xl">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={connect}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-green-900/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30 text-base md:text-lg"
                >
                  <Wallet className="w-6 h-6" />
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>

                <div className="text-center">
                  <p className="text-xs text-green-500/60">
                    Supports MetaMask, WalletConnect, and other EVM wallets
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-green-800/50">
                <div className="space-y-3 text-sm text-green-400/70">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    No account creation needed
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Your wallet address is your identity
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Secured by blockchain technology
                  </p>
                </div>
              </div>
            </div>

            {/* Security notice */}
            <div className="mt-6 p-4 bg-gradient-to-br from-amber-900/20 to-black/60 backdrop-blur-xl rounded-xl border border-amber-800/30">
              <p className="text-xs text-amber-300/80 text-center">
                <Lock className="w-3 h-3 inline mr-1" />
                Never share your private keys or seed phrase with anyone
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
