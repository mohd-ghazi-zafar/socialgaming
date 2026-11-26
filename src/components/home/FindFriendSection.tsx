import React, { useState, useEffect } from 'react'
import {
  viewAllUsers,
  viewFollowing,
  viewFollowers,
  sendFollowRequest,
  getAuthToken,
  getStoredAuth,
  normalizeImageUrl,
} from '../../services/api'
import { UserPlus, Users, Search, Check, X } from 'lucide-react'
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
  // Navigation tabs: 'friends' (User's Friends list) or 'all' (Directory to discover & send requests)
  const [activeTab, setActiveTab] = useState<'friends' | 'all'>('friends')

  const [friends, setFriends] = useState<RealUser[]>([])
  const [allUsers, setAllUsers] = useState<RealUser[]>([])
  const [existingFriendIds, setExistingFriendIds] = useState<Set<number>>(new Set())
  const [sentRequestIds, setSentRequestIds] = useState<Set<number>>(new Set())

  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const loadData = async () => {
    const token = getAuthToken()
    const currentUid = getStoredAuth()?.unique_id || getStoredAuth()?.user?.user_uid

    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const [allUsersRes, followingRes, followersRes] = await Promise.all([
        viewAllUsers(token).catch(() => ({ users: [] })),
        viewFollowing(token).catch(() => ({ following: [] })),
        viewFollowers(token).catch(() => ({ followers: [] })),
      ])

      const rawUsers: RealUser[] = allUsersRes?.users || []
      const others = rawUsers.filter((u: any) => u.user_uid !== currentUid)
      setAllUsers(others)

      const followingList = followingRes?.following || []
      const followersList = followersRes?.followers || []

      const friendIdSet = new Set<number>()
      followingList.forEach((f: any) => friendIdSet.add(Number(f.id)))
      followersList.forEach((f: any) => friendIdSet.add(Number(f.id)))

      setExistingFriendIds(friendIdSet)

      // Map friends with enriched user details
      const matchedFriends = others.filter((u) => friendIdSet.has(Number(u.id)))
      setFriends(matchedFriends)
    } catch (err: any) {
      console.debug('Failed to fetch users in FindFriendSection:', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Send follow / friend request to any user
  const handleSendRequest = async (targetUser: RealUser) => {
    const token = getAuthToken()
    if (!token) return

    setSendingId(targetUser.id)
    try {
      await sendFollowRequest(targetUser.id, token)
      setSentRequestIds((prev) => new Set(prev).add(targetUser.id))
      showToast(`Request sent to ${targetUser.name}!`)
    } catch (err: any) {
      const errMsg = err.message || ''
      if (errMsg.toLowerCase().includes('already')) {
        setSentRequestIds((prev) => new Set(prev).add(targetUser.id))
        showToast(`Request already pending with ${targetUser.name}`)
      } else {
        showToast(errMsg || 'Failed to send request')
      }
    } finally {
      setSendingId(null)
    }
  }

  // Filtered users for "All Players" search
  const filteredAllUsers = allUsers.filter((u) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.user_uid && u.user_uid.toLowerCase().includes(q)) ||
      (u.id && String(u.id).includes(q))
    )
  })

  return (
    <div className="relative w-full px-3.5 pt-2 pb-6 select-none font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#00dfb6] text-[#06201a] px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-fade-in flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Section Header: Dual Tabs + Action Button */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        {/* Toggle Tabs: Friends vs All Players */}
        <div className="flex items-center gap-1 bg-[#091f1a] p-1 rounded-full border border-emerald-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'friends'
                ? 'bg-[#00dfb6] text-[#06201a] shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Friends ({friends.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#00dfb6] text-[#06201a] shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>All Users ({allUsers.length})</span>
          </button>
        </div>

        {/* Quick Shortcut Button */}
        {activeTab === 'friends' ? (
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-1 text-[11.5px] font-bold text-[#00dfb6] hover:text-[#33f5d1] transition-colors cursor-pointer bg-[#0e2a24] hover:bg-[#133830] px-2.5 py-1 rounded-full border border-[#00dfb6]/20 shadow-xs active:scale-95"
            title="Browse all users and send requests"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Friends</span>
          </button>
        ) : (
          <span className="text-[12px] text-[#00dfb6] font-bold">
            {allUsers.length} Players Online
          </span>
        )}
      </div>

      {/* Search Input for All Players Tab */}
      {activeTab === 'all' && (
        <div className="mb-3">
          <div className="flex items-center gap-2 bg-[#091f1a] rounded-full px-3.5 py-2 border border-emerald-950/40 focus-within:border-[#00dfb6]/40 transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name or UID..."
              className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none flex-1 font-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="w-full py-8 flex items-center justify-center gap-2 text-xs text-[#00dfb6]">
          <div className="w-4 h-4 border-2 border-[#00dfb6] border-t-transparent rounded-full animate-spin" />
          <span>Loading players...</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: FRIENDS LIST VIEW                                      */}
      {/* ============================================================ */}
      {!isLoading && activeTab === 'friends' && (
        <>
          {friends.length === 0 ? (
            <div className="w-full bg-[#0e211e] border border-emerald-900/30 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2.5 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#133830] flex items-center justify-center text-[#00dfb6] shadow-xs">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">No Friends Added Yet</h3>
                <p className="text-xs text-slate-400 max-w-[240px]">
                  Send requests to other online users to start playing and voice chatting together!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="mt-1 px-4 py-2 rounded-full bg-[#00dfb6] hover:bg-[#00c59e] active:scale-95 text-[#06201a] font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Browse All Users & Send Requests</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 w-full">
              {friends.map((friend, idx) => {
                const avatarUrl =
                  friend.profile_image && normalizeImageUrl(friend.profile_image)
                    ? normalizeImageUrl(friend.profile_image)
                    : DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]

                const isMale = friend.gender ? friend.gender.toLowerCase() === 'male' : idx % 2 === 0
                const userAge = friend.age || (idx === 1 ? 19 : isMale ? 24 : 21)
                const FlagComponent = idx % 3 === 0 ? FlagUS : idx % 3 === 1 ? FlagSA : FlagBH

                return (
                  <div
                    key={friend.id || friend.user_uid}
                    className="w-full bg-[#0e211e] hover:bg-[#122a25] rounded-[18px] p-2.5 px-3 flex items-center justify-between shadow-sm transition-all duration-150 border border-white/[0.04]"
                  >
                    {/* Left: Avatar + Name + Badges */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
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

                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-[14px] font-bold text-white tracking-wide truncate leading-tight">
                          {friend.name}
                        </span>

                        {/* TopTop Badges Row */}
                        <div className="flex items-center gap-1 flex-nowrap overflow-hidden no-scrollbar">
                          <div className="rounded-[3px] overflow-hidden shadow-xs shrink-0 w-4 h-3 flex items-center justify-center">
                            <FlagComponent className="w-4 h-3 object-cover block" />
                          </div>

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

                          {idx % 2 === 1 && (
                            <span className="bg-[#8b5cf6] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 shadow-xs tracking-wider">
                              ENTP
                            </span>
                          )}

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

                          <span
                            className={`text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 shadow-xs ${
                              idx % 2 === 0
                                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#c026d3]'
                                : 'bg-gradient-to-r from-[#0284c7] to-[#06b6d4]'
                            }`}
                          >
                            <span className="text-[8.5px]">{idx % 2 === 0 ? '👑' : '🔥'}</span>
                            <span>{idx % 2 === 0 ? '75' : '64'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Join Voice Room Button */}
                    <button
                      type="button"
                      onClick={() => onJoinRoom(friend.user_uid)}
                      className="shrink-0 bg-[#13423b] hover:bg-[#1a554c] active:scale-95 text-[#00dfb6] font-extrabold text-[13px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transition-all duration-150 cursor-pointer border border-[#00dfb6]/15"
                      title={`Join ${friend.name}'s Room`}
                    >
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
        </>
      )}

      {/* ============================================================ */}
      {/* TAB 2: ALL USERS DIRECTORY VIEW (Send Requests)               */}
      {/* ============================================================ */}
      {!isLoading && activeTab === 'all' && (
        <div className="space-y-2.5 w-full">
          {filteredAllUsers.length === 0 ? (
            <div className="w-full bg-[#0e211e] border border-emerald-900/30 rounded-2xl p-5 text-center">
              <p className="text-xs text-slate-400">No users found matching your search.</p>
            </div>
          ) : (
            filteredAllUsers.map((user, idx) => {
              const isFriend = existingFriendIds.has(Number(user.id))
              const isRequested = sentRequestIds.has(Number(user.id))
              const isSending = sendingId === user.id

              const avatarUrl =
                user.profile_image && normalizeImageUrl(user.profile_image)
                  ? normalizeImageUrl(user.profile_image)
                  : DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]

              const isMale = user.gender ? user.gender.toLowerCase() === 'male' : idx % 2 === 0
              const userAge = user.age || (isMale ? 23 : 20)
              const FlagComponent = idx % 3 === 0 ? FlagUS : idx % 3 === 1 ? FlagSA : FlagBH

              return (
                <div
                  key={user.id || user.user_uid}
                  className="w-full bg-[#0e211e] hover:bg-[#122a25] rounded-[18px] p-2.5 px-3 flex items-center justify-between shadow-sm transition-all duration-150 border border-white/[0.04]"
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-sm bg-[#17302b]">
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.src = DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-white tracking-wide truncate leading-tight">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {user.user_uid || user.id}
                        </span>
                      </div>

                      {/* TopTop Badges Row */}
                      <div className="flex items-center gap-1 flex-nowrap overflow-hidden no-scrollbar">
                        <div className="rounded-[3px] overflow-hidden shadow-xs shrink-0 w-4 h-3 flex items-center justify-center">
                          <FlagComponent className="w-4 h-3 object-cover block" />
                        </div>

                        <span
                          className={`w-4 h-4 rounded-full ${
                            isMale ? 'bg-[#1877f2]' : 'bg-[#ec4899]'
                          } text-white text-[10px] font-black shrink-0 flex items-center justify-center shadow-xs`}
                        >
                          {isMale ? '♂' : '♀'}
                        </span>

                        <span className="bg-[#3b82f6] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 shadow-xs">
                          <span className="text-[8.5px]">🎂</span>
                          <span>{userAge}</span>
                        </span>

                        <span className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 shadow-xs">
                          <span className="text-[9px]">🌐</span>
                          <span>V{3 + (idx % 8)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Send Request / Status Button */}
                  <div className="shrink-0">
                    {isFriend ? (
                      <span className="px-3 py-1 rounded-full bg-slate-800/80 text-emerald-400 font-bold text-xs border border-emerald-500/20 shadow-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Friends</span>
                      </span>
                    ) : isRequested ? (
                      <span className="px-3 py-1 rounded-full bg-teal-950/80 text-teal-300 font-bold text-xs border border-teal-500/30 shadow-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Requested</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => handleSendRequest(user)}
                        className="bg-[#00dfb6] hover:bg-[#00c59e] active:scale-95 text-[#06201a] font-extrabold text-[12.5px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transition-all duration-150 cursor-pointer disabled:opacity-50"
                        title={`Send follow request to ${user.name}`}
                      >
                        {isSending ? (
                          <div className="w-3.5 h-3.5 border-2 border-[#06201a] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                        <span>Request</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
