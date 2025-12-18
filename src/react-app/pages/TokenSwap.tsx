import { useState } from 'react';
import { ArrowDownUp, Coins, AlertCircle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { useTokenBalances, useSwap, getBalance, useSwapHistory } from '../hooks/useTokens';
import { TokenBalance } from '../components/TokenBalance';
import { Navigation } from '../components/Navigation';
import type { TokenType } from '@/shared/types';

export function TokenSwap() {
  const userId = 'demo-user'; // In production, get from auth context
  const { balances, loading, refetch } = useTokenBalances(userId);
  const { swaps, refetch: refetchSwaps } = useSwapHistory(userId);
  const { executeSwap, loading: swapping, error: swapError } = useSwap();

  const [fromToken, setFromToken] = useState<TokenType>('FINe');
  const [toToken, setToToken] = useState<TokenType>('USDT');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);

  const exchangeRate = 1; // 1:1 FINe to USDT
  const receiveAmount = amount ? parseFloat(amount) * exchangeRate : 0;

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    if (amountNum > getBalance(balances, fromToken)) {
      return;
    }

    try {
      await executeSwap(fromToken, toToken, amountNum);
      setSuccess(true);
      setAmount('');
      await refetch();
      await refetchSwaps();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      // Error is handled by useSwap hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950/30 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Loading token balances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950/30 text-white">
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <ArrowDownUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Token Swap
            </h1>
          </div>
          <p className="text-gray-400 ml-16">
            Instantly swap between FINe tokens and USDT at a 1:1 rate
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Balances */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Your Balances
              </h2>
              <div className="space-y-3">
                <TokenBalance token="FINe" balance={balances.FINe} />
                <TokenBalance token="USDT" balance={balances.USDT} />
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-300 mb-1">1:1 Exchange Rate</h3>
                  <p className="text-sm text-blue-400/80">
                    FINe tokens maintain a stable 1:1 peg with USDT for predictable value transfer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Swap Interface */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
              {/* From Token */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-2 block">From</label>
                <div className="bg-black/40 border border-gray-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <select
                      value={fromToken}
                      onChange={(e) => setFromToken(e.target.value as TokenType)}
                      className="bg-transparent text-2xl font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="FINe">FINe</option>
                      <option value="USDT">USDT</option>
                    </select>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="bg-transparent text-2xl font-bold text-white text-right outline-none w-full"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    Balance: {getBalance(balances, fromToken).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-3 relative z-10">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-purple-900/50 hover:scale-110 transition-all border border-purple-500/30"
                >
                  <ArrowDownUp className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* To Token */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-400 mb-2 block">To</label>
                <div className="bg-black/40 border border-gray-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <select
                      value={toToken}
                      onChange={(e) => setToToken(e.target.value as TokenType)}
                      className="bg-transparent text-2xl font-bold text-white outline-none cursor-pointer"
                    >
                      <option value="USDT">USDT</option>
                      <option value="FINe">FINe</option>
                    </select>
                    <div className="text-2xl font-bold text-white">
                      {receiveAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Balance: {getBalance(balances, toToken).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Exchange Rate Info */}
              <div className="bg-black/20 border border-gray-700/50 rounded-lg p-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white font-medium">1 {fromToken} = 1 {toToken}</span>
                </div>
              </div>

              {/* Error Message */}
              {swapError && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <p className="text-red-300 text-sm">{swapError}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                  <p className="text-green-300 text-sm">Swap completed successfully!</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > getBalance(balances, fromToken) || swapping}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-900/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-purple-500/30"
              >
                {swapping ? 'Swapping...' : 'Swap Tokens'}
              </button>
            </form>

            {/* Recent Swaps */}
            {swaps.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Swaps
                </h2>
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
                  <div className="divide-y divide-gray-700/50">
                    {swaps.slice(0, 5).map((swap) => (
                      <div key={swap.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-900/30 rounded-lg">
                              <ArrowDownUp className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {swap.from_amount} {swap.from_token} to {swap.to_amount} {swap.to_token}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(swap.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-green-400">Completed</div>
                            <div className="text-xs text-gray-500">Rate: {swap.exchange_rate}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
