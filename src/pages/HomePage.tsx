import React, { useState } from 'react'
import { TopTopHeader } from '../components/layout/TopTopHeader'
import { CasualGamesHeader } from '../components/home/CasualGamesHeader'
import { GameCardsGrid } from '../components/home/GameCardsGrid'
import { FindFriendSection } from '../components/home/FindFriendSection'
import { CreateRoomModal } from '../components/rooms/CreateRoomModal'
import type { CreateRoomConfig, GameType } from '../types/contracts'

interface HomePageProps {
  user?: any
  coins?: number
  onJoinRoomSession: (roomId: string, pin?: string) => void
  onQuickMatchLaunch: (game: GameType) => void
  onOpenWallet?: () => void
  onOpenSearch?: () => void
  onOpenMessages?: (friend: any) => void
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  coins = 0,
  onJoinRoomSession,
  onQuickMatchLaunch,
  onOpenWallet,
  onOpenSearch,
  onOpenMessages,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreateRoom = (config: CreateRoomConfig) => {
    onJoinRoomSession(`room-${Date.now().toString().slice(-4)}`, config.pin)
  }

  const handleSelectGame = (gameId: string) => {
    if (
      gameId === 'ludo' ||
      gameId === 'chess' ||
      gameId === 'domino' ||
      gameId === 'jackaroo'
    ) {
      onQuickMatchLaunch(gameId as GameType)
    } else if (gameId === 'draw_guess') {
      alert('🎨 Launching Draw & Guess lobby...')
    } else if (gameId === 'more') {
      alert('🎮 Opening All Games directory...')
    } else {
      alert(`Launching ${gameId.toUpperCase()} lobby...`)
    }
  }

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-[#031914] min-h-full">
      {/* 1. Authentic TopTop Header Bar with Real SVGs & Interactive Controls */}
      <TopTopHeader
        user={user}
        coins={coins}
        onWalletClick={onOpenWallet}
        onGiftClick={() => alert('🎁 Daily Lucky Gift: +500 Coins Collected!')}
        onRankClick={() => alert('🏆 Top 1 Global Rank Leaderboard')}
        onSearchClick={onOpenSearch || (() => alert('Search Players and Rooms'))}
        onProfileClick={onOpenWallet}
      />

      {/* 2. Casual Games Section Header */}
      <CasualGamesHeader onCreatePrivateRoom={() => setIsCreateModalOpen(true)} />

      {/* 3. Six 3D Game Cards with Arabesque Crests & SVG Art */}
      <GameCardsGrid onSelectGame={handleSelectGame} />

      {/* 4. Active Friends Rooms (Find Friend List) */}
      <FindFriendSection
        onJoinRoom={(roomId) => onJoinRoomSession(roomId)}
        onOpenMessages={onOpenMessages}
      />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  )
}
