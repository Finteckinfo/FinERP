import { Coins } from 'lucide-react';
import type { TokenType } from '@/shared/types';

interface TokenBalanceProps {
  token: TokenType;
  balance: number;
}

const TOKEN_ICONS: Record<TokenType, string> = {
  FINe: '💎',
  USDT: '💵',
};

const TOKEN_COLORS: Record<TokenType, { bg: string; text: string; border: string }> = {
  FINe: {
    bg: 'from-purple-600 to-pink-600',
    text: 'text-purple-200',
    border: 'border-purple-500/30',
  },
  USDT: {
    bg: 'from-green-600 to-emerald-600',
    text: 'text-green-200',
    border: 'border-green-500/30',
  },
};

export function TokenBalance({ token, balance }: TokenBalanceProps) {
  const colors = TOKEN_COLORS[token];
  const icon = TOKEN_ICONS[token];

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${colors.bg} rounded-2xl p-6 border ${colors.border} shadow-lg hover:shadow-xl transition-all`}>
      <div className="absolute top-0 right-0 text-6xl opacity-10 transform translate-x-4 -translate-y-2">
        {icon}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="w-5 h-5 text-white" />
          <span className="text-sm font-medium text-white/80">{token}</span>
        </div>
        
        <div className="text-3xl font-bold text-white mb-1">
          {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className={`text-sm ${colors.text}`}>
          {token === 'FINe' ? 'Platform Token' : 'Stablecoin'}
        </div>
      </div>
    </div>
  );
}
