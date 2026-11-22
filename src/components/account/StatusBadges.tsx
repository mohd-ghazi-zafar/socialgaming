import React from 'react'
import { Coins, Gem, Crown, Shield } from 'lucide-react'
import type { VipTier } from '../../types/contracts'

interface WalletBadgeProps {
  coins: number
  gems?: number
  onClick?: () => void
  size?: 'sm' | 'md'
  showGems?: boolean
}

export const WalletBadge: React.FC<WalletBadgeProps> = ({
  coins,
  gems,
  onClick,
  size = 'md',
  showGems = false,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const isSmall = size === 'sm'

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-semibold transition-all ${
        onClick
          ? 'cursor-pointer hover:border-amber-400/50 hover:bg-amber-500/20 active:scale-95'
          : ''
      } ${isSmall ? 'text-xs py-0.5 px-2' : 'text-sm'}`}
      title="Coins Balance (Click to Top-Up)"
    >
      <div className="flex items-center justify-center rounded-full bg-amber-400 text-slate-950 p-0.5 shadow-sm">
        <Coins className={isSmall ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </div>
      <span className="tabular-nums tracking-tight">{formatNumber(coins)}</span>

      {showGems && gems !== undefined && (
        <div className="ml-1 flex items-center gap-1 border-l border-amber-500/30 pl-1.5 text-cyan-300">
          <Gem className={isSmall ? 'h-3 w-3 text-cyan-400' : 'h-3.5 w-3.5 text-cyan-400'} />
          <span className="tabular-nums">{formatNumber(gems)}</span>
        </div>
      )}
    </div>
  )
}

interface VipTagProps {
  tier: VipTier
  level?: number
  compact?: boolean
}

export const VipTag: React.FC<VipTagProps> = ({ tier, level, compact = false }) => {
  if (tier === 'none') return null

  const getTierStyles = () => {
    switch (tier) {
      case 'vip':
        return {
          bg: 'bg-purple-950/80',
          border: 'border-purple-500/40',
          text: 'text-purple-300',
          icon: <Crown className="h-3 w-3 text-purple-400" />,
          label: 'VIP',
        }
      case 'diamond':
        return {
          bg: 'bg-cyan-950/80',
          border: 'border-cyan-500/40',
          text: 'text-cyan-300',
          icon: <Gem className="h-3 w-3 text-cyan-400" />,
          label: 'DIAMOND',
        }
      case 'gold':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500/40',
          text: 'text-amber-300',
          icon: <Shield className="h-3 w-3 text-amber-400" />,
          label: 'GOLD',
        }
      case 'silver':
        return {
          bg: 'bg-slate-800/80',
          border: 'border-slate-500/40',
          text: 'text-slate-300',
          icon: <Shield className="h-3 w-3 text-slate-400" />,
          label: 'SILVER',
        }
    }
  }

  const { bg, border, text, icon, label } = getTierStyles()

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${border} ${bg} ${text} font-bold uppercase tracking-wider ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
    >
      {icon}
      <span>{label}</span>
      {level !== undefined && <span className="opacity-90">{level}</span>}
    </span>
  )
}
