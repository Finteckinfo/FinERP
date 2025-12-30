import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, Shield, Sparkles, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { useWallet } from '@/react-app/hooks/useWallet';

export default function LoginPage() {
  const { account, loading, error, connect, isConnected, isMobile } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && account) {
      navigate('/');
    }
  }, [isConnected, account, navigate]);

  const openWalletApp = () => {
    const url = window.location.href.replace(/^https?:\/\//, '');
    window.location.href = `https://metamask.app.link/dapp/${url}`;
  };

  return (
    <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 lg:gap-24 relative z-10">
        {/* Left side - Branding & Value Props */}
        <div className="hidden lg:flex flex-col justify-center space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-[#0D99FF] to-[#0066FF] rounded-[22px] shadow-2xl shadow-blue-500/40">
                <Sparkles className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white">
                FinPro
              </h1>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Enterprise <span className="text-gradient">Treasury</span> & Management.
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
              The professional standard for decentralized project governance and secure escrow ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Shield, title: 'Institutional Escrow', desc: 'Secure smart contract vaults for all project funds.' },
              { icon: CheckCircle, title: 'Verified Delivery', desc: 'Automated milestone-based payment disbursements.' },
              { icon: Lock, title: 'Identity-First', desc: 'Secure, passwordless authentication via EVM wallets.' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-5 p-5 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 hover:border-white/20 transition-all group">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Authentication Card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-[#121A2C]/80 backdrop-blur-2xl rounded-[40px] shadow-2xl shadow-black/50 border border-white/10 p-10 md:p-12">
              {/* Mobile Branding */}
              <div className="lg:hidden mb-12 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 rounded-[18px]">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-black text-white tracking-tighter">FinPro</h1>
                </div>
                <p className="text-gray-400 font-medium tracking-wide uppercase text-xs">Financial Management Studio</p>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-3">
                  System Access
                </h2>
                <p className="text-gray-400 font-medium">
                  {isMobile ? 'Connect your authorized mobile wallet' : 'Connect your EVM wallet to initialize session'}
                </p>
              </div>

              {error && (
                <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-[24px] animate-pulse">
                  <p className="text-red-400 text-sm text-center font-bold mb-3">{error}</p>
                  {isMobile && !window.ethereum && (
                    <button
                      onClick={openWalletApp}
                      className="w-full py-3 bg-red-500 text-white rounded-xl text-sm font-bold transition-all hover:bg-red-600 shadow-lg shadow-red-500/20"
                    >
                      Open in Wallet App
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-6">
                <button
                  onClick={connect}
                  disabled={loading}
                  className="w-full group relative flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-[#0D99FF] to-[#0066FF] text-white rounded-[24px] font-black text-lg hover:shadow-[0_12px_40px_rgba(13,153,255,0.4)] hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 border border-white/10"
                >
                  <Wallet className="w-6 h-6" />
                  <span>{loading ? 'Authorizing...' : 'Connect Wallet'}</span>
                  <ArrowRight className="w-5 h-5 absolute right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <div className="text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Supports MetaMask · Trust · Ledger · Gnosis
                  </p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
                {[
                  'Zero account creation needed',
                  'Wallet address is your unique UID',
                  'Encrypted session management'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(13,153,255,0.8)]" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy/Security Footnote */}
            <div className="mt-8 px-6">
              <p className="text-[11px] text-gray-600 text-center font-bold uppercase tracking-tighter leading-relaxed">
                <Lock className="w-3 h-3 inline mr-1.5 mb-0.5 text-gray-700" />
                End-to-end encrypted · Decentralized backend · No central data harvesting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
