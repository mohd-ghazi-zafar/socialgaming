import React, { useState, useEffect } from 'react'
import { viewAllUsers, getAuthToken, getStoredAuth, normalizeImageUrl } from '../../services/api'
import { FlagSA, FlagEG } from '../common/SvgIcons'

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
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[17px] font-extrabold text-white tracking-tight drop-shadow-sm">
          Find Friend
        </h2>
        <span className="text-xs text-teal-400 font-bold">
          {users.length} {users.length === 1 ? 'User' : 'Users'} Online
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full py-6 flex items-center justify-center gap-2 text-xs text-emerald-400">
          <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading players from server...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && users.length === 0 && (
        <div className="w-full bg-[#0a231e]/50 border border-emerald-900/40 rounded-2xl p-5 text-center">
          <p className="text-xs text-slate-400">No other players found in the database yet.</p>
        </div>
      )}

      {/* Real Users List directly from Backend Database */}
      {!isLoading && users.length > 0 && (
        <div className="space-y-2.5 w-full">
          {users.map((friend) => {
            const initial = friend.name ? friend.name.trim().charAt(0).toUpperCase() : 'U'
            const avatarUrl = normalizeImageUrl(friend.profile_image)
            const isMale = friend.gender === 'male'

            return (
              <div
                key={friend.id}
                className="w-full bg-[#0a231e]/90 hover:bg-[#0d2a24] border border-emerald-800/40 rounded-2xl p-2.5 flex items-center justify-between shadow-md transition-all duration-150"
              >
                {/* Left Column: Real Profile Photo/Avatar + Identity + Real Metadata */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  {/* Avatar */}
                  <div className="relative w-11 h-11 rounded-full ring-2 ring-emerald-500/50 flex items-center justify-center shadow-inner shrink-0 overflow-hidden bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-900">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={friend.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-black text-white">{initial}</span>
                    )}
                  </div>

                  {/* Identity & Badges Container */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {/* Name */}
                    <span className="text-[13px] font-bold text-white truncate drop-shadow-sm leading-tight">
                      {friend.name}
                    </span>

                    {/* Badges Row from Real Database fields */}
                    <div className="flex items-center gap-1 flex-nowrap overflow-hidden no-scrollbar">
                      {/* Flag */}
                      <div className="rounded-[2px] overflow-hidden shadow-xs shrink-0">
                        {isMale ? (
                          <FlagEG className="w-4 h-3 object-cover block" />
                        ) : (
                          <FlagSA className="w-4 h-3 object-cover block" />
                        )}
                      </div>

                      {/* Gender/Age Pill */}
                      <span className="bg-[#134e4a]/80 text-[#5eead4] text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-0.5">
                        <span>{isMale ? '♂' : '♀'}</span>
                        {friend.age ? <span>{friend.age}</span> : null}
                      </span>

                      {/* Provider Pill */}
                      <span className="bg-[#581c87]/90 text-[#e9d5ff] text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 uppercase">
                        {friend.auth_provider || 'player'}
                      </span>

                      {/* UID Pill */}
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full shrink-0 shadow-xs">
                        {friend.user_uid}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Join Room Button */}
                <button
                  type="button"
                  onClick={() => onJoinRoom(friend.user_uid)}
                  className="shrink-0 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#2dd4bf] hover:to-[#14b8a6] active:scale-95 text-[#042f2e] font-black text-xs px-3.5 py-2 rounded-full shadow-md flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
                  title={`Join ${friend.name}`}
                >
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
      )}
    </div>
  )
}
