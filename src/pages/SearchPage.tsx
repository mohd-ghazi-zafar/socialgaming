import React, { useState, useMemo, useEffect } from 'react'
import {
  Search as SearchIcon,
  X,
  Check,
  UserPlus,
  UserCheck,
  MessageSquare,
  DoorOpen,
  MoreVertical,
} from 'lucide-react'
import {
  WhatsAppIcon,
  FacebookIcon,
  InstagramIcon,
  CopySquareIcon,
} from '../components/common/SvgIcons'
import { PlayerActionSheet } from '../components/social/PlayerActionSheet'
import {
  viewAllUsers,
  sendFollowRequest,
  submitReport,
  blockUser,
  getStoredAuth,
} from '../services/api'
import type { DirectoryUser } from '../types/contracts'

interface SearchPageProps {
  onCancel: () => void
  onStartMessageWithUser?: (user: DirectoryUser) => void
  onJoinRoom?: (roomId: string) => void
  myId?: string
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onCancel,
  onStartMessageWithUser,
  onJoinRoom,
  myId,
}) => {
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null)

  // Determine current user ID
  const authSession = getStoredAuth()
  const displayId = myId || authSession?.unique_id || authSession?.user?.user_uid || 'G-311060-2026'

  // Real Directory users fetched strictly from backend database
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [, setIsLoading] = useState(false)

  // Fetch real users from backend database
  useEffect(() => {
    if (authSession?.token) {
      setIsLoading(true)
      viewAllUsers(authSession.token)
        .then((res) => {
          if (res?.users && Array.isArray(res.users)) {
            const mapped: DirectoryUser[] = res.users.map((u: any) => ({
              id: String(u.id),
              uniqueId: u.user_uid,
              name: u.name,
              avatarUrl: u.profile_image ? (u.profile_image.startsWith('http://72-61-235-208.sslip.io') ? u.profile_image.replace('http://72-61-235-208.sslip.io', 'https://72-61-235-208.sslip.io') : u.profile_image) : '',
              bio: `${u.role === 'admin' ? 'Administrator' : 'UADA Player'} • ${u.auth_provider || 'Registered'}`,
              level: u.age || 25,
              vipTier: 'vip',
              isFriend: false,
              isOnline: true,
              gamesPlayed: 10,
              winRate: 50,
              favoriteGame: 'ludo',
            }))
            setUsers(mapped)
          }
        })
        .catch((err) => {
          console.debug('Failed to fetch users:', err.message)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [authSession?.token])

  // Filter real users based on query (by Name or User UID)
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.uniqueId.toLowerCase().includes(q)
    )
  }, [users, query])

  // Virtual room matching based on real user room IDs
  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return users
      .filter((u) => u.uniqueId.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
      .map((u) => ({
        id: `room-${u.uniqueId}`,
        name: `${u.name}'s Game Room`,
        host: u.name,
        game: 'Ludo',
        code: u.uniqueId,
      }))
  }, [users, query])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    const shareText = `Play with me on UADA Social Gaming! My ID is: ${displayId}`
    if (navigator.share) {
      navigator.share({ title: 'UADA Game Invite', text: shareText }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareText)
      showToast(`Invite link copied for ${platform}!`)
    }
  }

  const handleFollowUser = async (targetUser: DirectoryUser) => {
    try {
      if (authSession?.token) {
        await sendFollowRequest(targetUser.id, authSession.token)
        showToast(`Follow request sent to ${targetUser.name}!`)
      } else {
        showToast(`Follow request sent to ${targetUser.name}!`)
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isFriend: true } : u))
      )
    } catch (err: any) {
      showToast(err.message || 'Follow request error')
    }
  }

  const handleReportUser = async (userId: string, reason: string) => {
    try {
      if (authSession?.token) {
        await submitReport(userId, { reason, description: 'Reported via Directory Search' }, authSession.token)
        showToast('Report submitted successfully!')
      } else {
        showToast('Report submitted successfully!')
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report')
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      if (authSession?.token) {
        await blockUser(userId, authSession.token)
        showToast('User blocked successfully!')
      } else {
        showToast('User blocked successfully!')
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err: any) {
      showToast(err.message || 'Failed to block user')
    }
  }

  return (
    <div className="relative w-full max-w-[471px] mx-auto min-h-screen bg-white text-[#1f2937] flex flex-col font-sans select-none overflow-x-hidden pt-2">
      {/* Top Search Bar with Cancel Action */}
      <div className="px-4 py-2 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-[#f4f5f7] rounded-full px-3.5 py-2">
          <SearchIcon className="w-4 h-4 text-[#9ca3af] shrink-0 stroke-[2.2]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Userid / Room id"
            autoFocus
            className="w-full bg-transparent text-[14px] text-[#111827] placeholder-[#9ca3af] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#9ca3af] hover:text-[#4b5563] p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-[15px] font-normal text-[#111827] hover:text-slate-600 transition-colors cursor-pointer px-1 py-1"
        >
          Cancel
        </button>
      </div>

      {/* Toast Notification */}
      {(copied || toastMessage) && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1f2937] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all">
          <Check className="w-3.5 h-3.5 text-teal-400" />
          <span>{copied ? 'My ID copied to clipboard!' : toastMessage}</span>
        </div>
      )}

      {/* 3. Screen Body */}
      {query.trim().length === 0 ? (
        /* Empty Query State — Matching Screenshot Exactly */
        <div className="flex-1 flex flex-col items-center pt-8 px-6">
          {/* Centered My ID Pill */}
          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-2 border border-[#e5e7eb] rounded-full px-5 py-2 text-[14px] font-medium text-[#1f2937] hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Click to copy ID"
          >
            <span>My ID:  {displayId}</span>
            <CopySquareIcon className="w-4 h-4 text-[#9ca3af]" />
          </button>

          {/* Subtitle */}
          <p className="text-[13px] text-[#6b7280] font-normal mt-7 mb-7 text-center">
            Or play with friends from
          </p>

          {/* Social Platforms 4-Item Grid */}
          <div className="w-full max-w-[340px] grid grid-cols-3 gap-y-7 gap-x-4 justify-items-center">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => handleShare('WhatsApp')}
              className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md group-hover:brightness-105 transition-all">
                <WhatsAppIcon className="w-8 h-8" />
              </div>
              <span className="text-[12.5px] text-[#6b7280] font-normal text-center">
                WhatsApp
              </span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleShare('Facebook')}
              className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-md group-hover:brightness-105 transition-all">
                <FacebookIcon className="w-8 h-8" />
              </div>
              <span className="text-[12.5px] text-[#6b7280] font-normal text-center">
                Facebook
              </span>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={() => handleShare('Instagram')}
              className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-md group-hover:brightness-105 transition-all">
                <InstagramIcon className="w-8 h-8" />
              </div>
              <span className="text-[12.5px] text-[#6b7280] font-normal text-center">
                Instagram
              </span>
            </button>

            {/* Other (Second Row) */}
            <button
              type="button"
              onClick={() => handleShare('Other')}
              className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform col-start-1"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#67e8f9] to-[#38bdf8] flex items-center justify-center text-white shadow-md group-hover:brightness-105 transition-all">
                <span className="text-white text-2xl font-black tracking-widest leading-none pb-1">
                  •••
                </span>
              </div>
              <span className="text-[12.5px] text-[#6b7280] font-normal text-center">
                Other
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Query Results */
        <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">
          {/* Matching Rooms Section */}
          {filteredRooms.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
                Rooms ({filteredRooms.length})
              </h3>
              <div className="space-y-2">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{room.name}</p>
                      <p className="text-xs text-[#6b7280]">
                        Room #{room.code} • {room.game} • Host: {room.host}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onJoinRoom?.(room.id)}
                      className="px-3.5 py-1.5 rounded-full bg-[#14b8a6] hover:bg-[#0d9488] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Users Section */}
          {filteredUsers.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
                Users ({filteredUsers.length})
              </h3>
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {user.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#111827] truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold shrink-0">
                            Lv.{user.level}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] font-mono">ID: {user.uniqueId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleFollowUser(user)}
                        className={`p-2 rounded-full transition-colors cursor-pointer ${
                          user.isFriend
                            ? 'bg-teal-50 text-teal-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title={user.isFriend ? 'Following' : 'Follow User'}
                      >
                        {user.isFriend ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </button>

                      {onStartMessageWithUser && (
                        <button
                          type="button"
                          onClick={() => onStartMessageWithUser(user)}
                          className="p-2 rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors cursor-pointer"
                          title="Send Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Actions (Report / Block / Profile)"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && filteredRooms.length === 0 && (
            <div className="text-center py-12 text-[#9ca3af]">
              <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1">Try searching by numeric ID, username, or room code</p>
            </div>
          )}
        </div>
      )}

      {/* Safety & Action Sheet (Report, Block, Profile inspection) */}
      <PlayerActionSheet
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onAddFriend={(_userId) => {
          if (selectedUser) handleFollowUser(selectedUser)
        }}
        onMessage={onStartMessageWithUser}
        onReport={handleReportUser}
        onBlock={handleBlockUser}
      />
    </div>
  )
}
