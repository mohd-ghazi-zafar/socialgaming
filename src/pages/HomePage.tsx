import React, { useState } from 'react'
import { TopTopGameCards } from '../components/home/TopTopGameCards'
import { FindFriendList } from '../components/home/FindFriendList'
import { CreateRoomModal } from '../components/rooms/CreateRoomModal'
import type { CreateRoomConfig, GameType } from '../types/contracts'

interface HomePageProps {
  onJoinRoomSession: (roomId: string, pin?: string) => void
  onQuickMatchLaunch: (game: GameType) => void
}

export const HomePage: React.FC<HomePageProps> = ({
  onJoinRoomSession,
  onQuickMatchLaunch,
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
    } else {
      alert(`Launching ${gameId.toUpperCase()} lobby...`)
    }
  }

  return (
    <div className="relative w-full space-y-3 pb-2 max-w-[531px] mx-auto select-none">
      {/* 1. Casual Games Header Bar with "Private room +" Button */}
      <div className="relative w-full">
        <img
          src="/toptop/home_casual_header_only.png"
          alt="Casual Games"
          className="w-full h-auto block pointer-events-none select-none"
        />
        {/* Clickable Hotspot on "Private room +" pill button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="absolute top-1/2 -translate-y-1/2 right-0 w-[140px] h-[36px] rounded-full cursor-pointer opacity-0 hover:opacity-10 bg-white"
          title="Create Private Room"
        />
      </div>

      {/* 2. Four 3D Custom Game Bento Cards (2x2 Grid) */}
      <TopTopGameCards onSelectGame={handleSelectGame} />

      {/* 3. Find Friend Header Bar */}
      <div className="relative w-full pt-1">
        <img
          src="/toptop/home_find_friend_header.png"
          alt="Find Friend"
          className="w-full h-auto block pointer-events-none select-none"
        />
      </div>

      {/* 4. Active Friends / Rooms List */}
      <FindFriendList onJoinRoom={(roomId) => onJoinRoomSession(roomId)} />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  )
}
