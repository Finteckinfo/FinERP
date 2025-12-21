import { useState, useEffect } from 'react';
import type { SwapTransaction, TokenType } from '@/shared/types';
import { supabase } from '@/react-app/lib/supabase';

interface TokenBalances {
  FINe: number;
  USDT: number;
}

export function useTokenBalances(userId: string) {
  const [balances, setBalances] = useState<TokenBalances>({ FINe: 0, USDT: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('token_balances')
        .select('*')
        .eq('user_id', userId.toLowerCase());

      if (error) throw error;

      const balanceMap: TokenBalances = { FINe: 0, USDT: 0 };
      data?.forEach((balance: { token_type: string; balance: number }) => {
        balanceMap[balance.token_type as TokenType] = balance.balance;
      });

      setBalances(balanceMap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [userId]);

  return { balances, loading, error, refetch: fetchBalances };
}

export function useSwapHistory(userId: string) {
  const [swaps, setSwaps] = useState<SwapTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSwaps = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('swap_transactions')
        .select('*')
        .eq('user_id', userId.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSwaps(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load swap history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [userId]);

  return { swaps, loading, error, refetch: fetchSwaps };
}

export function useSwap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSwap = async (fromToken: TokenType, toToken: TokenType, amount: number) => {
    try {
      setLoading(true);
      setError(null);

      const exchangeRate = 1.0;
      const toAmount = amount * exchangeRate;

      // In a real app, you would use the current user's wallet address.
      // For now, we'll use 'demo-user' as a placeholder.
      const { data, error: swapError } = await supabase
        .from('swap_transactions')
        .insert({
          user_id: 'demo-user',
          from_token: fromToken,
          to_token: toToken,
          from_amount: amount,
          to_amount: toAmount,
          exchange_rate: exchangeRate,
          status: 'completed'
        })
        .select()
        .single();

      if (swapError) throw swapError;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Swap failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeSwap, loading, error };
}

export function getBalance(balances: TokenBalances, token: TokenType): number {
  return balances[token] || 0;
}
