import React, { useState, useEffect } from 'react'
import {
  viewAllUsers,
  viewFollowing,
  viewFollowers,
  viewInbox,
  sendFollowRequest,
  unfollowUser,
  getAuthToken,
  getStoredAuth,
  parseJwt,
  normalizeImageUrl,
} from '../../services/api'
import {
  getChatSocket,
  connectChatUser,
  subscribeToOnlineUsers,
  getOnlineUserIds,
} from '../../services/chatSocket'
import { UserPlus, Users, Search, Check, X, MessageSquare, UserMinus, Loader2 } from 'lucide-react'
import { FlagUS, FlagSA, FlagBH } from '../common/SvgIcons'

interface FindFriendSectionProps {
  onJoinRoom: (roomId: string) => void
  onOpenMessages?: (friend: RealUser) => void
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

/**
 * Extracts all identifiers of the logged-in user to guarantee they never appear in discovery
 */
function getSelfIdentifiers(token: string | null, storedAuth: any) {
  const ids = new Set<number>()
  const uids = new Set<string>()
  const names = new Set<string>()

  if (storedAuth?.user?.id) ids.add(Number(storedAuth.user.id))
  if (storedAuth?.user?.user_uid) uids.add(String(storedAuth.user.user_uid).trim().toLowerCase())
  if (storedAuth?.unique_id) uids.add(String(storedAuth.unique_id).trim().toLowerCase())
  if (storedAuth?.user?.unique_id) uids.add(String(storedAuth.user.unique_id).trim().toLowerCase())
  if (storedAuth?.user?.name) names.add(String(storedAuth.user.name).trim().toLowerCase())

  if (token) {
    const parsed = parseJwt(token)
    if (parsed) {
      if (parsed.id) ids.add(Number(parsed.id))
      if (parsed.user_uid) uids.add(String(parsed.user_uid).trim().toLowerCase())
      if (parsed.unique_id) uids.add(String(parsed.unique_id).trim().toLowerCase())
      if (parsed.name) names.add(String(parsed.name).trim().toLowerCase())
    }
  }
  return { ids, uids, names }
}

export const FindFriendSection: React.FC<FindFriendSectionProps> = ({ onJoinRoom, onOpenMessages }) => {
  // Navigation tabs: 'friends' (User's Friends list) or 'all' (Directory to discover & send requests)
  const [activeTab, setActiveTab] = useState<'friends' | 'all'>('friends')

  const [friends, setFriends] = useState<RealUser[]>([])
  const [allUsers, setAllUsers] = useState<RealUser[]>([])
  const [existingFriendIds, setExistingFriendIds] = useState<Set<number>>(new Set())
  const [existingFriendUids, setExistingFriendUids] = useState<Set<string>>(new Set())
  const [existingFriendNames, setExistingFriendNames] = useState<Set<string>>(new Set())
  const [sentRequestIds, setSentRequestIds] = useState<Set<number>>(new Set())
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(() => getOnlineUserIds())

  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [removingFriendId, setRemovingFriendId] = useState<number | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  // Persistent tracking of removed friend IDs so removals persist across reloads
  const [removedFriendIds, setRemovedFriendIds] = useState<Set<number>>(() => {
    try {
      const myId = getStoredAuth()?.user?.id
      const saved = localStorage.getItem(`removed_friends_${myId}`)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const handleMessageFriend = (friend: RealUser) => {
    try {
      sessionStorage.setItem('open_chat_user', JSON.stringify(friend))
    } catch {}
    if (onOpenMessages) {
      onOpenMessages(friend)
    }
  }

  const handleRemoveFriend = async (friend: RealUser) => {
    const token = getAuthToken()
    if (!token) return

    const fid = Number(friend.id)
    setRemovingFriendId(fid)

    // 1. Persist to removed friends cache so reloads never resurrect them
    setRemovedFriendIds((prev) => {
      const next = new Set(prev)
      next.add(fid)
      try {
        const myId = getStoredAuth()?.user?.id
        localStorage.setItem(`removed_friends_${myId}`, JSON.stringify([...next]))
      } catch {}
      return next
    })

    // 2. Immediately remove from local friends list with robust type-safe filtering
    setFriends((prev) =>
      prev.filter(
        (f) =>
          Number(f.id) !== fid &&
          (f.user_uid && friend.user_uid
            ? f.user_uid.toLowerCase() !== friend.user_uid.toLowerCase()
            : true)
      )
    )

    // 3. Remove from existing friends sets so they become discoverable in All Users tab
    setExistingFriendIds((prev) => {
      const next = new Set(prev)
      next.delete(fid)
      return next
    })
    if (friend.user_uid) {
      setExistingFriendUids((prev) => {
        const next = new Set(prev)
        next.delete(friend.user_uid.toLowerCase())
        return next
      })
    }
    if (friend.name) {
      setExistingFriendNames((prev) => {
        const next = new Set(prev)
        next.delete(friend.name.toLowerCase())
        return next
      })
    }

    showToast(`${friend.name} removed from friends`)

    // 4. Send API request to backend (gracefully caught if target was only a follower)
    try {
      await unfollowUser(friend.id, token).catch(() => {})
    } finally {
      setRemovingFriendId(null)
    }
  }

  // Real-time Socket.IO Online Presence Subscription
  useEffect(() => {
    const currentUserId = getStoredAuth()?.user?.id
    if (currentUserId) {
      connectChatUser(currentUserId)
    }

    // Subscribe to continuous live updates from WebSocket
    const unsubscribe = subscribeToOnlineUsers((onlineIds) => {
      setOnlineUserIds(onlineIds)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const loadData = async () => {
    const token = getAuthToken()
    const storedAuth = getStoredAuth()

    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const [allUsersRes, followingRes, followersRes, inboxRes] = await Promise.all([
        viewAllUsers(token).catch(() => ({ users: [] })),
        viewFollowing(token).catch(() => ({ following: [] })),
        viewFollowers(token).catch(() => ({ followers: [] })),
        viewInbox(token).catch(() => ({ chats: [] })),
      ])

      const rawUsers: RealUser[] = allUsersRes?.users || []

      // Identify logged-in user completely so they never appear in the discover list
      const self = getSelfIdentifiers(token, storedAuth)
      const others = rawUsers.filter((u: any) => {
        if (u.id && self.ids.has(Number(u.id))) return false
        if (u.user_uid && self.uids.has(String(u.user_uid).trim().toLowerCase())) return false
        if (u.unique_id && self.uids.has(String(u.unique_id).trim().toLowerCase())) return false
        if (u.name && self.names.has(String(u.name).trim().toLowerCase()) && self.ids.has(Number(u.id))) return false
        return true
      })
      setAllUsers(others)

      const followingList = followingRes?.following || []
      const followersList = followersRes?.followers || []

      // Read current removed friend IDs from storage
      let currentRemoved = new Set<number>()
      try {
        const myId = getStoredAuth()?.user?.id
        const saved = localStorage.getItem(`removed_friends_${myId}`)
        if (saved) currentRemoved = new Set(JSON.parse(saved))
      } catch {}

      // Build comprehensive friend identifiers from followers & following (excluding removed)
      const friendIdSet = new Set<number>()
      const friendUidSet = new Set<string>()
      const friendNameSet = new Set<string>()

      followingList.forEach((f: any) => {
        const fid = Number(f.id || f.following_id)
        if (fid && !currentRemoved.has(fid)) {
          friendIdSet.add(fid)
          if (f.unique_id) friendUidSet.add(String(f.unique_id).toLowerCase())
          if (f.user_uid) friendUidSet.add(String(f.user_uid).toLowerCase())
          if (f.name) friendNameSet.add(String(f.name).toLowerCase())
        }
      })

      followersList.forEach((f: any) => {
        const fid = Number(f.id || f.follower_id)
        if (fid && !currentRemoved.has(fid)) {
          friendIdSet.add(fid)
          if (f.unique_id) friendUidSet.add(String(f.unique_id).toLowerCase())
          if (f.user_uid) friendUidSet.add(String(f.user_uid).toLowerCase())
          if (f.name) friendNameSet.add(String(f.name).toLowerCase())
        }
      })

      setExistingFriendIds(friendIdSet)
      setExistingFriendUids(friendUidSet)
      setExistingFriendNames(friendNameSet)

      // Map friends with enriched user details (excluding any removed user)
      const matchedFriends = others.filter((u) => {
        const uid = Number(u.id)
        if (currentRemoved.has(uid)) return false
        return (
          friendIdSet.has(uid) ||
          (u.user_uid && friendUidSet.has(String(u.user_uid).toLowerCase())) ||
          (u.name && friendNameSet.has(String(u.name).toLowerCase()))
        )
      })
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
      const res = await sendFollowRequest(targetUser.id, token)
      if (res?.alreadyFriend) {
        setExistingFriendIds((prev) => new Set(prev).add(targetUser.id))
        if (targetUser.user_uid) {
          setExistingFriendUids((prev) => new Set(prev).add(targetUser.user_uid.toLowerCase()))
        }
        setFriends((prev) => (prev.some((f) => f.id === targetUser.id) ? prev : [...prev, targetUser]))
        showToast(`${targetUser.name} is already your friend!`)
      } else {
        setSentRequestIds((prev) => new Set(prev).add(targetUser.id))
        showToast(res?.message || `Request sent to ${targetUser.name}!`)
      }
    } catch (err: any) {
      const errMsg = (err.message || '').toLowerCase()
      if (
        errMsg.includes('already') ||
        errMsg.includes('following') ||
        errMsg.includes('friend') ||
        errMsg.includes('500') ||
        errMsg.includes('400')
      ) {
        // Mark as already connected gracefully
        setExistingFriendIds((prev) => new Set(prev).add(targetUser.id))
        if (targetUser.user_uid) {
          setExistingFriendUids((prev) => new Set(prev).add(targetUser.user_uid.toLowerCase()))
        }
        setFriends((prev) => (prev.some((f) => f.id === targetUser.id) ? prev : [...prev, targetUser]))
        showToast(`${targetUser.name} is already your friend!`)
      } else {
        showToast(err.message || 'Failed to send request')
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

  // Calculate live count of friends currently online
  const onlineFriendsCount = friends.filter(
    (f) =>
      onlineUserIds.has(String(f.id)) ||
      (f.user_uid && onlineUserIds.has(String(f.user_uid)))
  ).length

  return (
    <div className="relative w-full px-3.5 pt-2 pb-6 select-none font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#00dfb6] text-[#06201a] px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-fade-in flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Section Header: Dual Tabs + Real-Time Online Status */}
      <div className="flex items-center justify-between gap-2 mb-3 px-0.5">
        {/* Toggle Tabs: Friends vs All Players */}
        <div className="flex items-center gap-1 bg-[#091f1a] p-1 rounded-full border border-emerald-950/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'friends'
                ? 'bg-[#00dfb6] text-[#06201a] shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Friends ({friends.length})</span>
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
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">All Users ({allUsers.length})</span>
          </button>
        </div>

        {/* Real-time Online Indicator (Only displayed for actual Friends) */}
        {activeTab === 'friends' && (
          <div className="flex items-center gap-1.5 shrink-0 text-right">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                onlineFriendsCount > 0
                  ? 'bg-[#00dfb6] animate-pulse shadow-[0_0_8px_#00dfb6]'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-[12px] font-bold text-[#00dfb6] tracking-wide whitespace-nowrap">
              {onlineFriendsCount} Online
            </span>
          </div>
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

      {/* Skeleton Loading State (TopTop Dark Theme) */}
      {isLoading && (
        <div className="space-y-2.5 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-full bg-[#0e211e]/80 border border-emerald-900/30 rounded-2xl p-2.5 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-emerald-950/70 border border-emerald-850/40 shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <div className="h-3.5 bg-emerald-900/50 rounded-md w-28" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 bg-emerald-900/40 rounded-full w-12" />
                    <div className="h-3 bg-emerald-900/30 rounded-full w-8" />
                  </div>
                </div>
              </div>
              <div className="h-7 w-20 bg-emerald-900/50 rounded-full shrink-0" />
            </div>
          ))}
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
                const isOnline = onlineUserIds.has(String(friend.id))

                return (
                  <div
                    key={friend.id || friend.user_uid}
                    className="w-full bg-[#0e211e] hover:bg-[#122a25] rounded-[18px] p-2.5 px-3 flex items-center justify-between shadow-sm transition-all duration-150 border border-white/[0.04]"
                  >
                    {/* Left: Avatar + Name + Badges */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shadow-sm bg-[#17302b]">
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
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#0e211e] ${
                            isOnline ? 'bg-[#00dfb6]' : 'bg-slate-500'
                          }`}
                          title={isOnline ? 'Online now' : 'Offline'}
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

                    {/* Right: Message & Remove Friend Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMessageFriend(friend)}
                        className="bg-[#00dfb6] hover:bg-[#00f5c8] active:scale-95 text-[#06201a] font-black text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
                        title={`Message ${friend.name}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Message</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFriend(friend)
                        }}
                        disabled={Number(removingFriendId) === Number(friend.id)}
                        className="p-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 active:scale-90 text-rose-400 border border-rose-500/20 transition-all duration-150 cursor-pointer disabled:opacity-50"
                        title={`Remove ${friend.name}`}
                      >
                        {Number(removingFriendId) === Number(friend.id) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserMinus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
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
              const isFriend =
                existingFriendIds.has(Number(user.id)) ||
                (user.user_uid && existingFriendUids.has(String(user.user_uid).toLowerCase())) ||
                (user.name && existingFriendNames.has(String(user.name).toLowerCase())) ||
                friends.some(
                  (f) =>
                    Number(f.id) === Number(user.id) ||
                    (f.user_uid && user.user_uid && f.user_uid.toLowerCase() === user.user_uid.toLowerCase()) ||
                    (f.name && user.name && f.name.toLowerCase() === user.name.toLowerCase())
                )
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
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shadow-sm bg-[#17302b]">
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
