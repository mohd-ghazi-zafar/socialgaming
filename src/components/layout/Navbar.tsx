import React from 'react'
import { PlayCircle } from 'lucide-react'
import type { GameType } from '../../types/contracts'

interface ActiveSessionNotice {
  roomId: string
  gameType: GameType
  title: string
}

interface NavbarProps {
  coins?: number
  gems?: number
  onWalletClick: () => void
  onSearchClick: () => void
  onGiftClick?: () => void
  onRankClick?: () => void
  activeSession?: ActiveSessionNotice | null
  onRejoinSession?: (roomId: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  onWalletClick,
  onSearchClick,
  onGiftClick,
  onRankClick,
  activeSession,
  onRejoinSession,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#081a17] select-none">
      {/* Active Session Notice */}
      {activeSession && (
        <div className="flex items-center justify-between border-b border-emerald-500/30 bg-emerald-950/90 px-4 py-1.5 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider">
              Match in Progress: {activeSession.gameType}
            </span>
          </div>
          <button
            onClick={() => onRejoinSession?.(activeSession.roomId)}
            className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300 hover:bg-emerald-500/30"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            <span>Rejoin</span>
          </button>
        </div>
      )}

      {/* Exact Pixel-Perfect Top Header from Custom Reference Screenshot */}
      <div className="relative mx-auto w-full max-w-[531px]">
        <img
          src="/toptop/home_nav_only.png"
          alt="TopTop Header with UADA Emblem"
          className="w-full h-auto block select-none pointer-events-none"
        />

        {/* Interactive Clickable Hotspots */}
        {/* 1. Left Avatar */}
        <button
          type="button"
          onClick={onRankClick}
          className="absolute top-[50%] left-[4%] w-[10%] h-[45%] rounded-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
          title="Profile"
        />

        {/* 2. Coin Pill (Open Wallet) */}
        <button
          type="button"
          onClick={onWalletClick}
          className="absolute top-[52%] left-[16%] w-[16%] h-[38%] rounded-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
          title="Top-Up Coins"
        />

        {/* 3. Center UADA Emblem */}
        <button
          type="button"
          onClick={() => {
            if (onGiftClick) onGiftClick()
            else alert('UADA Champions Arena')
          }}
          className="absolute top-[18%] left-[36%] w-[28%] h-[82%] rounded-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
          title="UADA Social Gaming Emblem"
        />

        {/* 4. Top 1 Rank Avatar */}
        <button
          type="button"
          onClick={onRankClick}
          className="absolute top-[50%] right-[11.5%] w-[8.5%] h-[42%] rounded-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
          title="Top 1 Leaderboard"
        />

        {/* 5. Search Trigger */}
        <button
          type="button"
          onClick={onSearchClick}
          className="absolute top-[52%] right-[3.5%] w-[6.5%] h-[38%] rounded-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
          title="Search Players"
        />
      </div>
    </header>
  )
}
