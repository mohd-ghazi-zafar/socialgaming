import React, { useState, useEffect } from 'react'
import { viewAllUsers, getAuthToken, getStoredAuth, normalizeImageUrl } from '../../services/api'
import { FlagUS, FlagSA, FlagBH, FlagFR, FlagEG } from '../common/SvgIcons'

interface FindFriendSectionProps {
  onJoinRoom: (roomId: string) => void
}

interface RealUser {
  id: number
  user_uid: string
  name: string
  gender: string | null
  age: number | null
  role: string
  auth_provider: string
  profile_image: string | null
}

const DEFAULT_AVATARS = [
  '/toptop/avatar_mal_doo.png',
  '/toptop/avatar_ran_oosh.png',
  '/toptop/avatar_fahad.png',
]

export const FindFriendSection: React.FC<FindFriendSectionProps> = ({ onJoinRoom }) => {
  const [users, setUsers] = useState<RealUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    const currentUid = getStoredAuth()?.unique_id || getStoredAuth()?.user?.user_uid

    if (!token) {
      setIsLoading(false)
      return
    }

    viewAllUsers(token)
      .then((res) => {
        if (res?.users && Array.isArray(res.users)) {
          // Filter out currently logged-in user so we show other discoverable friends
          const others = res.users.filter((u: any) => u.user_uid !== currentUid)
          setUsers(others)
        }
      })
      .catch((err) => {
        console.debug('Failed to fetch users for Find Friend section:', err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="w-full px-3.5 pt-2 pb-6 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <h2 className="text-[17px] font-extrabold text-white tracking-tight drop-shadow-sm">
          Find Friend
        </h2>
        <span className="text-[12px] text-[#00dfb6] font-bold">
          {users.length} {users.length === 1 ? 'User' : 'Users'} Online
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full py-6 flex items-center justify-center gap-2 text-xs text-[#00dfb6]">
          <div className="w-3.5 h-3.5 border-2 border-[#00dfb6] border-t-transparent rounded-full animate-spin" />
          <span>Loading players...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && users.length === 0 && (
        <div className="w-full bg-[#0e211e] border border-emerald-900/30 rounded-2xl p-5 text-center">
          <p className="text-xs text-slate-400">No other players online right now.</p>
        </div>
      )}

      {/* Real Users List styled to precisely match authentic TopTop reference */}
      {!isLoading && users.length > 0 && (
        <div className="space-y-2.5 w-full">
          {users.map((friend, idx) => {
            const avatarUrl =
              friend.profile_image && normalizeImageUrl(friend.profile_image)
                ? normalizeImageUrl(friend.profile_image)
                : DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]

            const isMale = friend.gender ? friend.gender.toLowerCase() === 'male' : idx % 2 === 0
            const userAge = friend.age || (idx === 1 ? 19 : isMale ? 24 : 21)

            // Select Flag matching reference sequence: US/FR -> SA -> BH
            const FlagComponent =
              idx % 3 === 0 ? FlagUS : idx % 3 === 1 ? FlagSA : FlagBH

            return (
              <div
                key={friend.id || friend.user_uid}
                className="w-full bg-[#0e211e] hover:bg-[#122a25] rounded-[18px] p-2.5 px-3 flex items-center justify-between shadow-sm transition-all duration-150 border border-white/[0.04]"
              >
                {/* Left Column: Avatar + Name + Badges */}
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  {/* Circular Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-sm bg-[#17302b]">
                    <img
                      src={avatarUrl}
                      alt={friend.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.src = DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]
                      }}
                    />
                  </div>

                  {/* Identity & Badges Container */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {/* Name */}
                    <span className="text-[14px] font-bold text-white tracking-wide truncate leading-tight">
                      {friend.name}
                    </span>

                    {/* Authentic TopTop Badges Row */}
                    <div className="flex items-center gap-1 flex-nowrap overflow-hidden no-scrollbar">
                      {/* Flag */}
                      <div className="rounded-[3px] overflow-hidden shadow-xs shrink-0 w-4 h-3 flex items-center justify-center">
                        <FlagComponent className="w-4 h-3 object-cover block" />
                      </div>

                      {/* Gender / Age Pill */}
                      {idx % 3 === 1 ? (
                        <span className="bg-[#3b82f6] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 shadow-xs">
                          <span className="text-[8.5px]">🎂</span>
                          <span>{userAge}</span>
                        </span>
                      ) : (
                        <span
                          className={`w-4 h-4 rounded-full ${
                            isMale ? 'bg-[#1877f2]' : 'bg-[#ec4899]'
                          } text-white text-[10px] font-black shrink-0 flex items-center justify-center shadow-xs`}
                        >
                          {isMale ? '♂' : '♀'}
                        </span>
                      )}

                      {/* MBTI Pill (e.g. ENTP for row 2 or alternating) */}
                      {idx % 2 === 1 && (
                        <span className="bg-[#8b5cf6] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 shadow-xs tracking-wider">
                          ENTP
                        </span>
                      )}

                      {/* VIP Level Badge */}
                      {idx % 2 === 0 ? (
                        <span className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 shadow-xs">
                          <span className="text-[9px]">🌐</span>
                          <span>V11</span>
                        </span>
                      ) : (
                        <span className="bg-gradient-to-r from-[#0d9488] to-[#06b6d4] text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 shadow-xs">
                          <span className="text-[9px]">🦅</span>
                          <span>V3</span>
                        </span>
                      )}

                      {/* Noble / Clan Crest (N4 / N6) */}
                      {idx % 2 === 0 && (
                        <span className="bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#6366f1] text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 shadow-xs">
                          <span className="text-[8.5px]">⚜️</span>
                          <span>{idx === 0 ? 'N4' : 'N6'}</span>
                        </span>
                      )}

                      {/* Charm / Honor Level Circle/Pill (75 / 64 / 87) */}
                      <span
                        className={`text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 shadow-xs ${
                          idx % 3 === 0
                            ? 'bg-gradient-to-r from-[#8b5cf6] to-[#c026d3]'
                            : idx % 3 === 1
                            ? 'bg-gradient-to-r from-[#0284c7] to-[#06b6d4]'
                            : 'bg-gradient-to-r from-[#9333ea] to-[#e11d48]'
                        }`}
                      >
                        <span className="text-[8.5px]">
                          {idx % 3 === 0 ? '👑' : idx % 3 === 1 ? '🔥' : '⭐'}
                        </span>
                        <span>{idx % 3 === 0 ? '75' : idx % 3 === 1 ? '64' : '87'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Authentic TopTop Join Voice Room Button */}
                <button
                  type="button"
                  onClick={() => onJoinRoom(friend.user_uid)}
                  className="shrink-0 bg-[#13423b] hover:bg-[#1a554c] active:scale-95 text-[#00dfb6] font-extrabold text-[13px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transition-all duration-150 cursor-pointer border border-[#00dfb6]/15"
                  title={`Join ${friend.name}'s Room`}
                >
                  {/* Iconic Voice Room Squircle Badge with Audio Wave Bars */}
                  <div className="w-5 h-5 rounded-[5px] bg-[#00dfb6] flex items-center justify-center shrink-0 shadow-xs">
                    <div className="flex items-center gap-[1.5px]">
                      <span className="w-[2px] h-[7px] bg-[#0d332d] rounded-full" />
                      <span className="w-[2px] h-[11px] bg-[#0d332d] rounded-full" />
                      <span className="w-[2px] h-[6px] bg-[#0d332d] rounded-full" />
                    </div>
                  </div>
                  <span className="tracking-wide">Join</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

