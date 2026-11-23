import React from 'react'
import { Search } from 'lucide-react'
import {
  CoinIcon,
  GiftBoxIcon,
  Top1RankBadge,
  LanternsHeaderBg,
} from '../common/SvgIcons'

interface TopTopHeaderProps {
  user?: any
  coins?: number
  onWalletClick?: () => void
  onGiftClick?: () => void
  onRankClick?: () => void
  onSearchClick?: () => void
  onProfileClick?: () => void
}

export const TopTopHeader: React.FC<TopTopHeaderProps> = ({
  user,
  coins = 0,
  onWalletClick,
  onGiftClick,
  onRankClick,
  onSearchClick,
  onProfileClick,
}) => {
  const displayName = user?.name || 'Player'
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <header className="relative w-full bg-[#041d18] overflow-hidden select-none">
      {/* Decorative Night Skyline & Lanterns SVG Vector Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <LanternsHeaderBg className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 px-4 pt-3 pb-3 flex flex-col gap-2">
        {/* Top App Bar with Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Avatar 'L', Coin Pill, and Gift Box */}
          <div className="flex items-center gap-2.5">
            {/* Dynamic Profile Avatar Button */}
            <button
              type="button"
              onClick={onProfileClick}
              className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] shadow-md cursor-pointer transition-transform active:scale-95 focus:outline-none overflow-hidden"
              title={`Profile (${displayName})`}
            >
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#07362d] flex items-center justify-center font-bold text-base text-white">
                  {avatarInitial}
                </div>
              )}
            </button>

            {/* Coin Balance Pill */}
            <button
              type="button"
              onClick={onWalletClick}
              className="flex items-center gap-1.5 bg-[#032922]/85 border border-emerald-600/40 rounded-full py-1 px-2.5 shadow-inner cursor-pointer transition-transform active:scale-95 hover:border-emerald-500"
              title="Wallet Balance"
            >
              <CoinIcon className="w-4 h-4" />
              <span className="text-xs font-bold text-white tracking-wide">{coins}</span>
              <span className="w-4 h-4 rounded-full bg-teal-400 text-[#041d18] font-black text-xs flex items-center justify-center leading-none">
                +
              </span>
            </button>

            {/* 3D Pink Gift Box Button */}
            <button
              type="button"
              onClick={onGiftClick}
              className="cursor-pointer transition-transform duration-200 active:scale-90 hover:scale-105"
              title="Daily Gift Box"
            >
              <GiftBoxIcon className="w-7 h-7" />
            </button>
          </div>

          {/* Right: TOP1 Leaderboard & Search */}
          <div className="flex items-center gap-2.5">
            {/* TOP 1 Profile Badge */}
            <button
              type="button"
              onClick={onRankClick}
              className="cursor-pointer transition-transform duration-200 active:scale-90 hover:scale-105"
              title="Top 1 Ranking"
            >
              <Top1RankBadge className="w-8 h-8" />
            </button>

            {/* Search Glass Button */}
            <button
              type="button"
              onClick={onSearchClick}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer active:scale-95"
              title="Search"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
