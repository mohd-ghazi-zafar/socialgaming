import React from 'react'
import { Search } from 'lucide-react'
import {
  CoinIcon,
  GiftBoxIcon,
  Top1RankBadge,
  LanternsHeaderBg,
} from '../common/SvgIcons'

interface TopTopHeaderProps {
  coins?: number
  onWalletClick?: () => void
  onGiftClick?: () => void
  onRankClick?: () => void
  onSearchClick?: () => void
  onProfileClick?: () => void
}

export const TopTopHeader: React.FC<TopTopHeaderProps> = ({
  coins = 0,
  onWalletClick,
  onGiftClick,
  onRankClick,
  onSearchClick,
  onProfileClick,
}) => {
  return (
    <header className="relative w-full bg-[#041d18] overflow-hidden select-none">
      {/* Decorative Night Skyline & Lanterns SVG Vector Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <LanternsHeaderBg className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 px-4 pt-3 pb-3 flex flex-col gap-2">
        {/* iOS-style Status Bar Info */}
        <div className="flex items-center justify-between text-xs font-semibold text-white/90 px-1">
          <span className="tracking-tight text-[13px]">8:10</span>
          <div className="flex items-center gap-1.5">
            {/* Cellular signal bars */}
            <svg className="w-4 h-3.5 fill-current" viewBox="0 0 16 12">
              <rect x="0" y="8" width="2.5" height="4" rx="0.5" />
              <rect x="4" y="6" width="2.5" height="6" rx="0.5" />
              <rect x="8" y="3" width="2.5" height="9" rx="0.5" />
              <rect x="12" y="0" width="2.5" height="12" rx="0.5" />
            </svg>
            {/* Wi-Fi Icon */}
            <svg className="w-4 h-3.5 fill-current" viewBox="0 0 16 12">
              <path d="M8 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2.8 5.7a7.5 7.5 0 0 1 10.4 0l-1.4 1.4a5.5 5.5 0 0 0-7.6 0L2.8 5.7zM0 3a11.5 11.5 0 0 1 16 0l-1.4 1.4A9.5 9.5 0 0 0 1.4 4.4L0 3z" />
            </svg>
            {/* Battery Pill */}
            <div className="flex items-center gap-0.5">
              <div className="h-3 w-6 rounded-[4px] border border-white/80 p-[1.5px] flex items-center justify-end">
                <div className="h-full w-[49%] bg-white rounded-[1.5px]" />
              </div>
              <div className="h-1.5 w-[1.5px] bg-white/80 rounded-r-sm" />
              <span className="text-[10px] ml-0.5 font-bold">49</span>
            </div>
          </div>
        </div>

        {/* Top App Bar with Controls */}
        <div className="flex items-center justify-between mt-1">
          {/* Left: Avatar 'L', Coin Pill, and Gift Box */}
          <div className="flex items-center gap-2.5">
            {/* 'L' Initial Profile Avatar */}
            <button
              type="button"
              onClick={onProfileClick}
              className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] shadow-md cursor-pointer transition-transform active:scale-95 focus:outline-none"
              title="Profile"
            >
              <div className="w-full h-full rounded-full bg-[#07362d] flex items-center justify-center font-bold text-base text-white">
                L
              </div>
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
