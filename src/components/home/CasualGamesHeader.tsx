import React from 'react'
import { Plus } from 'lucide-react'

interface CasualGamesHeaderProps {
  onCreatePrivateRoom: () => void
}

export const CasualGamesHeader: React.FC<CasualGamesHeaderProps> = ({
  onCreatePrivateRoom,
}) => {
  return (
    <div className="w-full flex items-center justify-between px-4 py-2 select-none">
      <h2 className="text-[17px] font-extrabold text-white tracking-tight drop-shadow-sm">
        Casual Games
      </h2>

      <button
        type="button"
        onClick={onCreatePrivateRoom}
        className="flex items-center gap-1 bg-[#10332c]/90 hover:bg-[#164239] active:scale-95 border border-emerald-600/50 rounded-full px-3 py-1 shadow-sm transition-all duration-150 cursor-pointer"
        title="Create Private Room"
      >
        <span className="text-xs font-bold text-emerald-100">Private room</span>
        <Plus className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
      </button>
    </div>
  )
}
