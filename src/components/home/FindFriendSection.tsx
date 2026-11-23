import React from 'react'
import { FlagUS, FlagSA, FlagBH } from '../common/SvgIcons'

interface FindFriendSectionProps {
  onJoinRoom: (roomId: string) => void
}

interface FriendItem {
  id: string
  name: string
  avatarText?: string
  avatarBg: string
  flagComponent: React.FC<{ className?: string }>
  genderOrAge: string
  isMale?: boolean
  vipTier: string
  nobleTier?: string
  level: number
  extraTag?: string
}

export const FindFriendSection: React.FC<FindFriendSectionProps> = ({ onJoinRoom }) => {
  const friends: FriendItem[] = [
    {
      id: 'room-mal-doo',
      name: 'MAL 🇫🇷 DOO.',
      avatarBg: 'bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-900',
      avatarText: '✦',
      flagComponent: FlagUS,
      genderOrAge: '♂',
      isMale: true,
      vipTier: 'V11',
      nobleTier: 'N4',
      level: 75,
    },
    {
      id: 'room-ran-oosh',
      name: 'رنـــــ ran__oosh 🦋',
      avatarBg: 'bg-gradient-to-tr from-rose-950 via-purple-950 to-pink-900',
      avatarText: '🌸',
      flagComponent: FlagSA,
      genderOrAge: '19',
      extraTag: 'ENTP',
      vipTier: 'V3',
      level: 64,
    },
    {
      id: 'room-fahad',
      name: 'فـهـد الـبـحـريـنـي',
      avatarBg: 'bg-gradient-to-tr from-red-950 via-slate-950 to-amber-950',
      avatarText: '👔',
      flagComponent: FlagBH,
      genderOrAge: '♂',
      isMale: true,
      vipTier: 'V11',
      nobleTier: 'N6',
      level: 87,
    },
  ]

  return (
    <div className="w-full px-3.5 pt-2 pb-6 select-none">
      {/* Section Header */}
      <h2 className="text-[17px] font-extrabold text-white tracking-tight drop-shadow-sm mb-2.5">
        Find Friend
      </h2>

      {/* Friends List - Clean CSS Cards without overflow scrollbars */}
      <div className="space-y-2.5 w-full">
        {friends.map((friend) => {
          const Flag = friend.flagComponent

          return (
            <div
              key={friend.id}
              className="w-full bg-[#0a231e]/90 hover:bg-[#0d2a24] border border-emerald-800/40 rounded-2xl p-2.5 flex items-center justify-between shadow-md transition-all duration-150"
            >
              {/* Left Column: Avatar + Identity + Badge Pills */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                {/* Avatar with Glow Ring */}
                <div
                  className={`w-11 h-11 rounded-full ${friend.avatarBg} ring-2 ring-emerald-500/50 flex items-center justify-center text-lg shadow-inner shrink-0`}
                >
                  <span>{friend.avatarText}</span>
                </div>

                {/* Identity & Badges Container */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  {/* Name */}
                  <span className="text-[13px] font-bold text-white truncate drop-shadow-sm leading-tight">
                    {friend.name}
                  </span>

                  {/* Badges Row - Clean and compact, zero scrollbar */}
                  <div className="flex items-center gap-1 flex-nowrap overflow-hidden no-scrollbar">
                    {/* Country Flag */}
                    <div className="rounded-[2px] overflow-hidden shadow-xs shrink-0">
                      <Flag className="w-4 h-3 object-cover block" />
                    </div>

                    {/* Gender or Age Pill */}
                    <span className="bg-[#134e4a]/80 text-[#5eead4] text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 flex items-center">
                      {friend.genderOrAge}
                    </span>

                    {/* Extra tag (e.g. ENTP) */}
                    {friend.extraTag && (
                      <span className="bg-[#581c87]/90 text-[#e9d5ff] text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0">
                        {friend.extraTag}
                      </span>
                    )}

                    {/* VIP Tier Badge */}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full shrink-0 shadow-xs flex items-center gap-0.5">
                      <span>💎</span>
                      <span>{friend.vipTier}</span>
                    </span>

                    {/* Noble Tier Badge */}
                    {friend.nobleTier && (
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full shrink-0 shadow-xs flex items-center gap-0.5">
                        <span>🦋</span>
                        <span>{friend.nobleTier}</span>
                      </span>
                    )}

                    {/* Level Badge */}
                    <span className="bg-[#6b21a8]/90 text-amber-200 text-[9.5px] font-black px-1.5 py-0.2 rounded-full shrink-0 shadow-xs flex items-center gap-0.5">
                      <span>🔥</span>
                      <span>{friend.level}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Teal Join Button with Audio Wave Icon */}
              <button
                type="button"
                onClick={() => onJoinRoom(friend.id)}
                className="shrink-0 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#2dd4bf] hover:to-[#14b8a6] active:scale-95 text-[#042f2e] font-black text-xs px-3.5 py-2 rounded-full shadow-md flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
                title={`Join ${friend.name}`}
              >
                {/* Audio wave bars icon */}
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-[#042f2e] rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-[#042f2e] rounded-full animate-pulse" />
                  <span className="w-0.5 h-1.5 bg-[#042f2e] rounded-full animate-pulse" />
                </div>
                <span>Join</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
