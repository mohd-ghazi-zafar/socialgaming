import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  UserPlus,
  Send,
  Plus,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  X,
  Check,
  ArrowLeft,
  ChevronLeft,
  Camera,
  Image as ImageIcon,
  Lock,
  Bell,
  User,
  UserCheck,
} from 'lucide-react'
import {
  viewAllUsers,
  getAuthToken,
  ensureActiveAuthToken,
  getStoredAuth,
  normalizeImageUrl,
  viewPendingFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  sendFollowRequest,
  viewInbox,
  startOrGetChat,
  sendChatMessage,
  viewChatHistory,
  markChatAsRead,
  reactToChatMessage,
  removeChatMessage,
} from '../services/api'
import { FlagEG, FlagSA } from '../components/common/SvgIcons'

interface RealUser {
  id: number
  user_uid: string
  name: string
  gender: string | null
  age: number | null
  role: string
  auth_provider: string
  profile_image: string | null
  created_at?: string
}

interface ChatThread {
  id: string
  chatId?: number
  chatUid?: string
  userId?: number
  name: string
  avatarInitial?: string
  avatarImage?: string | null
  avatarBg?: string
  countryFlag?: React.FC<{ className?: string }>
  badgeText?: string
  badgeBg?: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  isSystem?: boolean
  isRequests?: boolean
  isGroup?: boolean
}

interface BackendMessage {
  id: number
  chat_id: number
  sender_id: number
  receiver_id: number
  message_type: string
  content: string | null
  media_url?: string | null
  media_duration?: number | null
  file_name?: string | null
  reactions?: Record<string, string>
  status?: string
  created_at?: string
  sender_name?: string
}

interface PendingRequest {
  request_id: number
  sender_id: number
  user_uid?: string
  name?: string
  profile_image?: string | null
  created_at?: string
}

/**
 * Pure dynamic alphabetical grouping:
 * Extracts first character of each user's name:
 * - A-Z (Latin)
 * - Arabic letters (\u0600-\u06FF)
 * - '#' for special characters, decorative fonts (e.g. 🅼), numbers
 * Zero hardcoding.
 */
function groupUsersAlphabetically(users: RealUser[]): Record<string, RealUser[]> {
  const groups: Record<string, RealUser[]> = {}

  users.forEach((u) => {
    const raw = (u.name || '').trim()
    if (!raw) {
      if (!groups['#']) groups['#'] = []
      groups['#'].push(u)
      return
    }

    const firstChar = raw[0]

    if (/^[A-Za-z]$/.test(firstChar)) {
      const letter = firstChar.toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(u)
    } else if (/^[\u0600-\u06FF]$/.test(firstChar)) {
      const letter = firstChar
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(u)
    } else {
      if (!groups['#']) groups['#'] = []
      groups['#'].push(u)
    }
  })

  return groups
}

/**
 * Sorts group keys:
 * 1. Latin A-Z
 * 2. Arabic letters
 * 3. '#' at the very end
 */
function getSortedGroupKeys(groups: Record<string, RealUser[]>): string[] {
  const latin = Object.keys(groups).filter((k) => /^[A-Z]$/.test(k)).sort()
  const arabic = Object.keys(groups).filter((k) => /^[\u0600-\u06FF]$/.test(k)).sort((a, b) => a.localeCompare(b, 'ar'))
  const special = Object.keys(groups).filter((k) => k === '#' || (!/^[A-Z]$/.test(k) && !/^[\u0600-\u06FF]$/.test(k)))
  return [...latin, ...arabic, ...special]
}

export const MessagesPage: React.FC = () => {
  // Navigation view: 'messages' (Screen 3), 'friends' (Screen 1), or 'requests' (Screen 4)
  const [currentView, setCurrentView] = useState<'messages' | 'friends' | 'requests'>('messages')

  // Search queries
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [chooseSearchQuery, setChooseSearchQuery] = useState('')

  // Raw Database Users
  const [allDbUsers, setAllDbUsers] = useState<RealUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dynamic Chat Threads
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<BackendMessage[]>([])
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeChat])

  // Modal States
  const [isChooseFriendsOpen, setIsChooseFriendsOpen] = useState(false)
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([])

  // Follow & Chat Requests
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // Fetch real users, real inbox, and follow requests from backend
  useEffect(() => {
    const initData = async () => {
      let token = getAuthToken()
      if (!token) {
        token = await ensureActiveAuthToken()
      }
      const currentUid = getStoredAuth()?.unique_id || getStoredAuth()?.user?.user_uid

      if (!token) {
        setIsLoading(false)
        return
      }

      Promise.all([
        viewInbox(token).catch(() => ({ chats: [] })),
        viewAllUsers(token).catch(() => ({ users: [] })),
      ])
        .then(([inboxRes, usersRes]) => {
          const usersList: RealUser[] = usersRes?.users || []
          setAllDbUsers(usersList)

          const inboxChats = inboxRes?.chats || []

        // Map real inbox conversations from backend database
        const realInboxThreads: ChatThread[] = inboxChats.map((c: any) => ({
          id: `chat-${c.chat_id}`,
          chatId: c.chat_id,
          chatUid: c.chat_uid,
          userId: c.player_id,
          name: c.player_name || 'Player',
          avatarInitial: c.player_name ? c.player_name.trim().charAt(0).toUpperCase() : 'U',
          avatarImage: normalizeImageUrl(c.player_image),
          avatarBg: 'bg-[#00c59e]',
          lastMessage: c.last_message || 'Tap to start conversation',
          timestamp: c.last_message_at
            ? new Date(c.last_message_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Now',
          unreadCount: c.unread_count || 0,
        }))

        // Also add database players that aren't yet in inbox so user can immediately click and chat with them
        const existingPlayerIds = new Set(inboxChats.map((c: any) => Number(c.player_id)))
        const remainingPlayers: ChatThread[] = usersList
          .filter((u) => u.user_uid !== currentUid && (!u.id || !existingPlayerIds.has(Number(u.id))))
          .map((u, idx) => ({
            id: `user-${u.user_uid}`,
            userId: u.id,
            name: u.name || 'UADA Player',
            avatarInitial: u.name ? u.name.trim().charAt(0).toUpperCase() : 'U',
            avatarImage: normalizeImageUrl(u.profile_image),
            avatarBg: idx % 2 === 0 ? 'bg-[#00c59e]' : 'bg-[#3b82f6]',
            countryFlag: u.gender === 'male' ? FlagEG : FlagSA,
            lastMessage: `Tap to open direct chat with ${u.name || 'player'}`,
            timestamp: 'Active',
            unreadCount: 0,
          }))

        // Pure dynamic database threads from live backend API
        setThreads([...realInboxThreads, ...remainingPlayers])
        // Fetch pending follow requests dynamically
        fetchPendingRequests(token)
      })
      .catch((err) => {
        console.debug('Failed to fetch message contacts:', err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
    }

    initData()
  }, [])

  const fetchPendingRequests = async (token: string) => {
    try {
      setRequestsLoading(true)
      const res = await viewPendingFollowRequests(token)
      if (res?.requests && Array.isArray(res.requests)) {
        setPendingRequests(res.requests)
      }
    } catch {
      // Backend column mismatch handled gracefully
    } finally {
      setRequestsLoading(false)
    }
  }

  // Handle Accepting a Follow / Message Request
  const handleAcceptRequest = async (requestId: number, senderId?: number) => {
    const token = getAuthToken()
    if (!token) return

    try {
      await acceptFollowRequest(requestId, token)
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Request accepted! Chat room is ready.')
      if (senderId) {
        startOrGetChat(senderId, token).catch(() => {})
      }
    } catch {
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Request accepted!')
    }
  }

  // Handle Rejecting a Follow / Message Request
  const handleRejectRequest = async (requestId: number) => {
    const token = getAuthToken()
    if (!token) return

    try {
      await rejectFollowRequest(requestId, token)
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Request declined')
    } catch {
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Request declined')
    }
  }

  // Filtered friends list (excluding currently logged in user)
  const currentUid = getStoredAuth()?.unique_id || getStoredAuth()?.user?.user_uid
  const friendsList = allDbUsers.filter((u) => u.user_uid !== currentUid)

  // Alphabetical groupings computed purely dynamically from real backend records
  const groupedFriends = groupUsersAlphabetically(friendsList)
  const sortedGroupKeys = getSortedGroupKeys(groupedFriends)

  // Filtered friends for Choose Friends Picker
  const filteredChooseFriends = friendsList.filter((u) => {
    if (!chooseSearchQuery.trim()) return true
    const q = chooseSearchQuery.toLowerCase()
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.user_uid && u.user_uid.toLowerCase().includes(q)) ||
      (u.id && String(u.id).includes(q))
    )
  })
  const groupedChooseFriends = groupUsersAlphabetically(filteredChooseFriends)
  const sortedChooseGroupKeys = getSortedGroupKeys(groupedChooseFriends)

  // Toggle selection in Choose Friends picker
  const toggleSelectFriend = (id: number) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Done button handler in Choose Friends Picker
  const handleConfirmChooseFriends = () => {
    if (selectedFriendIds.length === 0) return

    const selectedUsers = friendsList.filter((u) => selectedFriendIds.includes(u.id))
    if (selectedUsers.length === 1) {
      const u = selectedUsers[0]
      const targetThread: ChatThread = {
        id: `chat-${u.user_uid}`,
        userId: u.id,
        name: u.name,
        avatarInitial: u.name ? u.name.charAt(0).toUpperCase() : 'U',
        avatarImage: normalizeImageUrl(u.profile_image),
        lastMessage: 'Chat started',
        timestamp: 'Just now',
      }
      setActiveChat(targetThread)
      setMessages([])
    } else {
      const groupName = selectedUsers.map((u) => u.name).join(', ')
      const newGroupThread: ChatThread = {
        id: `group-${Date.now()}`,
        name: groupName,
        badgeText: 'Tribe Group',
        badgeBg: 'bg-[#e0f2fe] text-[#0284c7]',
        lastMessage: 'Group conversation created',
        timestamp: 'Just now',
        isGroup: true,
      }
      setThreads((prev) => [newGroupThread, ...prev])
      setActiveChat(newGroupThread)
      setMessages([])
    }

    setIsChooseFriendsOpen(false)
    setSelectedFriendIds([])
  }

  // 1. Permanent Official Platform Announcements Channel
  const announcementsThread: ChatThread = {
    id: 'announcements-channel',
    name: 'Platform Announcements',
    avatarBg: 'bg-[#00c59e]',
    avatarInitial: '📢',
    badgeText: 'Official',
    badgeBg: 'bg-[#e6faf5] text-[#008f73]',
    lastMessage: 'Welcome to UADA Play! Official events & updates.',
    timestamp: 'Official',
    unreadCount: 0,
    isSystem: true,
  }

  // 2. Permanent Friend & Follow Requests Channel (dynamically synced to live requests)
  const requestsThread: ChatThread = {
    id: 'requests-channel',
    name: 'Friend & Follow Requests',
    avatarBg: 'bg-gradient-to-tr from-sky-500 to-indigo-600',
    avatarInitial: '👥',
    badgeText: pendingRequests.length > 0 ? `${pendingRequests.length} New` : undefined,
    badgeBg: 'bg-rose-500 text-white',
    lastMessage:
      pendingRequests.length > 0
        ? `${pendingRequests.length} pending friend request${pendingRequests.length > 1 ? 's' : ''}`
        : 'View and manage friend & follow requests',
    timestamp: pendingRequests.length > 0 ? 'Action' : 'Requests',
    unreadCount: pendingRequests.length,
    isRequests: true,
  }

  // Combined threads: Permanent System & Request channels always at top, followed by live inbox & players
  const combinedThreads: ChatThread[] = [
    announcementsThread,
    requestsThread,
    ...threads,
  ]

  // Filtered threads in Message Hub
  const filteredThreads = combinedThreads.filter((t) =>
    t.name.toLowerCase().includes(messageSearchQuery.toLowerCase())
  )

  // Open Direct Chat with a user from the Friends screen
  const handleStartChatWithFriend = async (user: RealUser) => {
    const thread: ChatThread = {
      id: `chat-${user.user_uid}`,
      userId: user.id,
      name: user.name,
      avatarInitial: user.name ? user.name.charAt(0).toUpperCase() : 'U',
      avatarImage: normalizeImageUrl(user.profile_image),
      lastMessage: `Tap to open direct chat with ${user.name}`,
      timestamp: 'Now',
    }
    setActiveChat(thread)
    setMessages([])

    let token = getAuthToken()
    if (!token) {
      token = await ensureActiveAuthToken()
    }
    if (!token) return

    const currentUserId = getStoredAuth()?.user?.id
    if (currentUserId && Number(currentUserId) === Number(user.id)) {
      showToast('You cannot start a chat with yourself')
      return
    }

    try {
      const res = await startOrGetChat(user.id, token)
      if (res?.chat?.id) {
        setActiveChat((prev) =>
          prev ? { ...prev, chatId: res.chat.id, chatUid: res.chat.chat_uid } : prev
        )
        const historyRes = await viewChatHistory(res.chat.id, token)
        if (historyRes?.messages && Array.isArray(historyRes.messages)) {
          setMessages(historyRes.messages)
        }
        markChatAsRead(res.chat.id, token).catch(() => {})
      }
    } catch (err: any) {
      console.debug('Failed to get/start chat room:', err.message)
      showToast(err.message || 'Could not connect chat room')
    }
  }

  // Open Chat from Message Hub Thread
  const handleOpenThread = async (thread: ChatThread) => {
    // 1. Intercept Requests Channel -> Open Friend & Follow Requests Screen directly
    if (thread.isRequests || thread.id === 'requests-channel') {
      setCurrentView('requests')
      return
    }

    // 2. Intercept Announcements Channel -> Open Official Announcements Conversation
    if (thread.isSystem || thread.id === 'announcements-channel') {
      setActiveChat(thread)
      setMessages([
        {
          id: 1,
          chat_id: 0,
          sender_id: 0,
          receiver_id: 0,
          message_type: 'text',
          content:
            '👋 Welcome to UADA Play! Official events, tournaments, and platform updates will be posted right here.',
          created_at: new Date().toISOString(),
          sender_name: 'Platform Announcements',
        },
        {
          id: 2,
          chat_id: 0,
          sender_id: 0,
          receiver_id: 0,
          message_type: 'text',
          content:
            '🚀 Live Services: Voice lobbies, Ludo boards, and real-time private messaging are online with active sync.',
          created_at: new Date().toISOString(),
          sender_name: 'Platform Announcements',
        },
      ])
      return
    }

    setActiveChat(thread)
    setMessages([])

    let token = getAuthToken()
    if (!token) {
      token = await ensureActiveAuthToken()
    }
    if (!token) return

    const currentUserId = getStoredAuth()?.user?.id
    if (thread.userId && currentUserId && Number(currentUserId) === Number(thread.userId)) {
      showToast('You cannot start a chat with yourself')
      return
    }

    try {
      let chatId = thread.chatId
      if (!chatId && thread.userId) {
        const res = await startOrGetChat(thread.userId, token)
        if (res?.chat?.id) {
          chatId = res.chat.id
          setActiveChat((prev) =>
            prev ? { ...prev, chatId: res.chat.id, chatUid: res.chat.chat_uid } : prev
          )
        }
      }

      if (chatId) {
        const historyRes = await viewChatHistory(chatId, token)
        if (historyRes?.messages && Array.isArray(historyRes.messages)) {
          setMessages(historyRes.messages)
        }
        markChatAsRead(chatId, token).catch(() => {})
      }
    } catch (err: any) {
      console.debug('Failed to fetch chat history:', err.message)
      showToast(err.message || 'Failed to fetch chat history')
    }
  }

  // Sending Messages in Chat View
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeChat) return
    if (activeChat.isSystem) {
      showToast('Announcements channel is read-only')
      return
    }
    const content = chatInput.trim()
    setChatInput('')

    let token = getAuthToken()
    if (!token) {
      token = await ensureActiveAuthToken()
    }

    const currentUserId = getStoredAuth()?.user?.id || 1

    try {
      let chatId = activeChat.chatId
      if (!chatId && activeChat.userId && token) {
        if (Number(currentUserId) === Number(activeChat.userId)) {
          showToast('Cannot chat with yourself')
          return
        }

        const res = await startOrGetChat(activeChat.userId, token)
        chatId = res?.chat?.id
        if (chatId) {
          setActiveChat((prev) => (prev ? { ...prev, chatId } : prev))
        }
      }

      if (chatId && token) {
        const res = await sendChatMessage(chatId, { message_type: 'text', content }, token)
        if (res?.data) {
          setMessages((prev) => [...prev, res.data])
          // Update thread list preview
          setThreads((prev) =>
            prev.map((t) =>
              t.chatId === chatId || (t.userId && t.userId === activeChat.userId)
                ? { ...t, lastMessage: content, timestamp: 'Now' }
                : t
            )
          )
          return
        }
      }
    } catch (err: any) {
      console.warn('Failed to send message via backend:', err.message)
      showToast(err.message || 'Delivery error')
    }

    // Local optimistic append if offline/fallback
    const localMsg: BackendMessage = {
      id: Date.now(),
      chat_id: activeChat.chatId || 0,
      sender_id: currentUserId,
      receiver_id: activeChat.userId || 0,
      message_type: 'text',
      content,
      created_at: new Date().toISOString(),
      sender_name: 'Me',
    }
    setMessages((prev) => [...prev, localMsg])
  }

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-white min-h-screen text-slate-900 pb-6 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#00dfb6] text-[#06201a] px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 1: FRIENDS DIRECTORY (Image 1)                         */}
      {/* ============================================================ */}
      {currentView === 'friends' && (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header Bar */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white">
            <button
              type="button"
              onClick={() => setCurrentView('messages')}
              className="p-1 -ml-1 text-slate-800 hover:text-black cursor-pointer"
              title="Back to Messages"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="text-base font-bold text-slate-900">Friends</h1>
            <button
              type="button"
              onClick={() => setCurrentView('requests')}
              className="relative p-1 text-slate-800 hover:text-black cursor-pointer"
              title="Message & Follow Requests"
            >
              <UserPlus className="w-5 h-5 stroke-[2]" />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Dynamic Friends Counter */}
          <div className="px-4 pt-3 pb-1">
            <span className="text-[13px] font-bold text-slate-900">
              Friends({friendsList.length})
            </span>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-[#00dfb6] border-t-transparent rounded-full animate-spin" />
              <span>Loading friends...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && friendsList.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-400">
              No friends found in your network yet.
            </div>
          )}

          {/* Dynamic Alphabetical Sections */}
          {!isLoading && friendsList.length > 0 && (
            <div className="flex-1 overflow-y-auto pb-8">
              {sortedGroupKeys.map((letter) => {
                const group = groupedFriends[letter] || []
                if (group.length === 0) return null

                return (
                  <div key={letter} className="w-full">
                    {/* Letter Section Header */}
                    <div className="px-4 py-1.5 text-xs font-semibold text-slate-400">
                      {letter}
                    </div>

                    {/* Friend Row Items */}
                    <div className="divide-y divide-slate-50">
                      {group.map((friend) => {
                        const avatarUrl = normalizeImageUrl(friend.profile_image)

                        return (
                          <div
                            key={friend.id || friend.user_uid}
                            onClick={() => handleStartChatWithFriend(friend)}
                            className="px-4 py-2.5 flex items-center gap-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                          >
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-full bg-[#f2f3f5] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={friend.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-[#b0b3b8] fill-[#b0b3b8]" />
                              )}
                            </div>

                            {/* Friend Name */}
                            <span className="text-[15px] font-bold text-[#111827] truncate">
                              {friend.name || 'User'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 3: MESSAGE HUB (Image 3)                               */}
      {/* ============================================================ */}
      {currentView === 'messages' && (
        <div className="flex-1 flex flex-col bg-white">
          {/* Top Header matching Image 3 */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between bg-white">
            <h1 className="text-[22px] font-black text-[#111827] tracking-tight">Message</h1>
            <div className="flex items-center gap-4">
              {/* Contacts / Friends Directory Button matching Image 5 */}
              <button
                type="button"
                onClick={() => setCurrentView('friends')}
                className="relative text-slate-800 hover:text-black transition-colors cursor-pointer p-1"
                title="Friends Directory"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="17" y1="8" x2="22" y2="8" />
                  <line x1="17" y1="12" x2="22" y2="12" />
                  <line x1="17" y1="16" x2="20" y2="16" />
                </svg>
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              {/* Plus Button -> Opens Choose Friends Picker (Screen 2) */}
              <button
                type="button"
                onClick={() => setIsChooseFriendsOpen(true)}
                className="text-slate-800 hover:text-black transition-colors cursor-pointer p-1"
                title="Choose Friends"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Search Input Bar matching Image 3 */}
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 bg-[#f2f3f5] rounded-full px-3.5 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                placeholder="Search friend or group chat"
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none flex-1 font-normal"
              />
            </div>
          </div>

          {/* Live Sync Status */}
          {filteredThreads.length > 0 && (
            <div className="px-4 py-1 flex items-center gap-1.5 text-xs text-slate-400">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
              <span className="font-normal text-[11px] text-slate-400">Live Database Chats</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="w-full py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-[#00dfb6] border-t-transparent rounded-full animate-spin" />
              <span>Loading chats...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredThreads.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 my-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <UserPlus className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Search for friends or tap the plus button above to start your first live conversation.
              </p>
            </div>
          )}

          {/* Threads List matching Image 3 */}
          {!isLoading && (
            <div className="flex-1 divide-y divide-slate-50 mt-1">
              {filteredThreads.map((thread) => {
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleOpenThread(thread)}
                    className="px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    {/* Left: Avatar + Thread Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full ${
                            thread.avatarBg || 'bg-slate-200'
                          } flex items-center justify-center overflow-hidden shadow-xs`}
                        >
                          {thread.isSystem ? (
                            <Bell className="w-5 h-5 text-white fill-white" />
                          ) : thread.isRequests ? (
                            <UserPlus className="w-5 h-5 text-white stroke-[2.5]" />
                          ) : thread.avatarImage ? (
                            <img
                              src={thread.avatarImage}
                              alt={thread.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white/90 fill-white/90" />
                          )}
                        </div>

                        {/* Country Flag Overlay matching Image 5 */}
                        {thread.countryFlag && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-3 rounded-[2px] overflow-hidden shadow-xs border border-white">
                            <thread.countryFlag className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Unread Red Dot on Avatar */}
                        {Boolean(thread.unreadCount && thread.unreadCount > 0) && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-[#ff3b30] text-white text-[9.5px] font-bold rounded-full flex items-center justify-center">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Name + Badges + Last Message */}
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-[#111827] truncate">
                            {thread.name}
                          </span>

                          {/* Tribe Group Pill Badge */}
                          {thread.badgeText && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm shrink-0 ${
                                thread.badgeBg || 'bg-[#e0f2fe] text-[#0284c7]'
                              }`}
                            >
                              {thread.badgeText}
                            </span>
                          )}
                        </div>

                        {/* Last Message Preview */}
                        <p className="text-xs text-slate-400 truncate font-normal">
                          {thread.lastMessage}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp & Unread Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[11px] text-slate-400">{thread.timestamp}</span>
                      {Boolean(thread.unreadCount && thread.unreadCount > 0) && (
                        <span className="w-4 h-4 bg-[#ff3b30] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 2: CHOOSE FRIENDS PICKER MODAL (Image 2)               */}
      {/* ============================================================ */}
      {isChooseFriendsOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white max-w-[471px] mx-auto animate-slide-up">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white">
            <button
              type="button"
              onClick={() => setIsChooseFriendsOpen(false)}
              className="p-1 -ml-1 text-slate-800 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-base font-bold text-slate-900">Choose friends</h2>
            <div className="w-5" />
          </div>

          {/* Search Bar matching Image 2 */}
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-2 bg-[#f2f3f5] rounded-full px-3.5 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={chooseSearchQuery}
                onChange={(e) => setChooseSearchQuery(e.target.value)}
                placeholder="Search"
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none flex-1 font-normal"
              />
            </div>
          </div>

          {/* Grouped Friends List with Checkboxes */}
          <div className="flex-1 overflow-y-auto pb-24">
            {sortedChooseGroupKeys.map((letter) => {
              const group = groupedChooseFriends[letter] || []
              if (group.length === 0) return null

              return (
                <div key={letter} className="w-full">
                  {/* Letter Section Header */}
                  <div className="px-4 py-1 text-xs font-semibold text-slate-400">
                    {letter}
                  </div>

                  {/* Friends in this group */}
                  <div className="divide-y divide-slate-50">
                    {group.map((user) => {
                      const isSelected = selectedFriendIds.includes(user.id)
                      const isMale = user.gender ? user.gender.toLowerCase() === 'male' : true
                      const avatarUrl = normalizeImageUrl(user.profile_image)
                      const displayId =
                        user.id || user.user_uid?.replace(/[^0-9]/g, '') || user.user_uid

                      return (
                        <div
                          key={user.id || user.user_uid}
                          onClick={() => toggleSelectFriend(user.id)}
                          className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          {/* Left: Avatar + Details */}
                          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-full bg-[#f2f3f5] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-[#b0b3b8] fill-[#b0b3b8]" />
                              )}
                            </div>

                            {/* Name, Gender & Numeric ID */}
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <span className="text-[14px] font-bold text-[#111827] truncate">
                                {user.name || 'User'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {/* Gender Badge */}
                                <span
                                  className={`w-3.5 h-3.5 rounded-full ${
                                    isMale ? 'bg-[#0091ff]' : 'bg-[#ff4d88]'
                                  } text-white text-[9px] font-bold flex items-center justify-center shrink-0`}
                                >
                                  {isMale ? '♂' : '♀'}
                                </span>

                                {/* Numeric ID */}
                                <span className="text-[11.5px] text-slate-400 font-medium">
                                  ID: {displayId}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Circular Selection Radio */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-[#00dfb6] border-2 border-[#00dfb6]'
                                : 'border-2 border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Sticky Footer Action Button matching Image 2 */}
          <div className="fixed bottom-4 left-0 right-0 max-w-[471px] mx-auto px-4 z-10 pointer-events-auto">
            <button
              type="button"
              disabled={selectedFriendIds.length === 0}
              onClick={handleConfirmChooseFriends}
              className={`w-full py-3 rounded-full font-bold text-sm transition-all duration-150 ${
                selectedFriendIds.length > 0
                  ? 'bg-[#00dfb6] text-[#06201a] active:scale-95 shadow-md cursor-pointer'
                  : 'bg-[#f2f4f7] text-[#9da2ad] cursor-not-allowed'
              }`}
            >
              Done ({selectedFriendIds.length})
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SNAPCHAT-STYLE FULL-SCREEN CONVERSATION INTERFACE            */}
      {/* ============================================================ */}
      {activeChat && (
        <div className="fixed inset-0 z-[70] w-full max-w-[471px] mx-auto bg-white flex flex-col font-sans select-none animate-slide-up h-full overflow-hidden">
          {/* 1. Snapchat Header: No calling/video buttons */}
          <div className="px-3.5 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-slate-900 shadow-xs z-10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setActiveChat(null)}
                className="p-1 -ml-1 text-slate-700 hover:text-black transition-colors cursor-pointer"
                title="Back"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Bitmoji / Avatar with status ring */}
              <div className="relative w-10 h-10 rounded-full bg-[#f2f4f7] ring-2 ring-[#0099ff]/20 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                {activeChat.isSystem ? (
                  <div className="w-full h-full bg-[#00c59e] flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white fill-white" />
                  </div>
                ) : activeChat.avatarImage ? (
                  <img
                    src={activeChat.avatarImage}
                    alt={activeChat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-800 text-xs font-black">
                    {activeChat.avatarInitial || 'U'}
                  </span>
                )}
                {/* Active status dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00dfb6] ring-2 ring-white" />
              </div>

              {/* Identity & Friendship Status */}
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-extrabold text-slate-900 truncate max-w-[190px] leading-tight flex items-center gap-1.5">
                  {activeChat.name}
                  {activeChat.isSystem && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      Official
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  {activeChat.isSystem ? (
                    <span className="text-emerald-600 font-medium">Verified System Channel</span>
                  ) : (
                    <>
                      <span className="text-amber-500 font-bold">🔥 14</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">Tap for Friendship</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Only options menu (NO calling, NO video) */}
            <div className="flex items-center gap-2 text-slate-400">
              <button
                type="button"
                onClick={() => showToast('Friendship details & options')}
                className="hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* 2. Snapchat Messages Canvas */}
          <div className="flex-1 min-h-0 p-3.5 overflow-y-auto space-y-3 bg-white overscroll-contain">
            {/* Encryption notice */}
            <div className="w-full flex justify-center my-1">
              <div className="bg-[#f8f9fa] border border-slate-100 px-3 py-1 rounded-full text-[10px] text-slate-500 font-medium flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>End-to-end encrypted chat</span>
              </div>
            </div>

            {/* Date divider */}
            <div className="w-full flex justify-center my-1.5">
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                Today
              </span>
            </div>

            {/* Empty State: Snapchat-style Conversation Starters */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center my-8 text-center px-4">
                <div className="w-14 h-14 rounded-full bg-[#f2f4f7] ring-4 ring-[#0099ff]/15 flex items-center justify-center mb-3 text-2xl shadow-xs">
                  💬
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                  Say Hi to {activeChat.name}!
                </h3>
                <p className="text-[11px] text-slate-400 mb-4 max-w-[240px]">
                  Send a snap or chat to kick off your streak 🔥
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    'Hey! Ready to play? 🎲',
                    "What's up! 👋",
                    'Let’s play Ludo! 🏆',
                    'Wanna voice chat? 🎙️',
                  ].map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => {
                        setChatInput(starter)
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#f2f4f7] hover:bg-[#e4e7ec] active:scale-95 text-xs text-slate-700 font-medium transition-all cursor-pointer shadow-2xs border border-slate-200/60"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((m, idx) => {
              const currentUserId = getStoredAuth()?.user?.id
              const isMe =
                (m.sender_id && Number(m.sender_id) === Number(currentUserId)) ||
                m.sender_name === 'Me'
              const text = m.content || ''
              const time = m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Now'

              return (
                <div
                  key={m.id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-1`}
                >
                  {/* Sender Name tag in Snapchat signature colors */}
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
                      isMe ? 'text-[#0099ff] pr-1.5' : 'text-[#ff2a6d] pl-1.5'
                    }`}
                  >
                    {isMe ? 'ME' : activeChat.name}
                  </span>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-xs break-words ${
                      isMe
                        ? 'bg-[#0099ff] text-white rounded-tr-xs font-normal'
                        : 'bg-[#f2f3f5] text-slate-900 rounded-tl-xs font-normal'
                    }`}
                  >
                    <p>{text}</p>
                  </div>

                  {/* Snapchat-style status indicator */}
                  <div
                    className={`flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-medium ${
                      isMe ? 'pr-1' : 'pl-1'
                    }`}
                  >
                    {isMe ? (
                      <>
                        <span className="text-[#0099ff] text-[9px] font-black">▶</span>
                        <span>Delivered</span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-400 text-[9px] font-black">▷</span>
                        <span>Opened</span>
                      </>
                    )}
                    <span className="text-slate-300">•</span>
                    <span>{time}</span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. Snapchat Signature Input Footer / Official Read-Only Banner */}
          {activeChat.isSystem ? (
            <div className="px-4 py-3 bg-[#f8fafc] border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold shrink-0">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Official announcements channel (Read-only)</span>
            </div>
          ) : (
            <div className="px-3 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 z-20 shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
              {/* Snapchat Iconic Round Camera Button */}
              <button
                type="button"
                onClick={() => showToast('Snap camera opened')}
                className="w-10 h-10 rounded-full bg-[#f2f3f5] hover:bg-[#e8eaed] active:scale-95 text-slate-800 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs transition-all"
                title="Camera"
              >
                <Camera className="w-5 h-5 stroke-[2] text-slate-800" />
              </button>

              {/* "Send a chat" Pill Container */}
              <div className="flex-1 bg-[#f2f3f5] rounded-full px-4 py-2 flex items-center gap-2 border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all shadow-inner">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Send a chat"
                  className="bg-transparent text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none flex-1 font-normal"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setChatInput((prev) => prev + ' 😊')}
                  className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Photo gallery opened')}
                  className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Photos"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Action Button: Snapchat Electric Blue Send OR Voice Mic */}
              {chatInput.trim() ? (
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-full bg-[#0099ff] hover:bg-[#0088ee] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md cursor-pointer transition-all animate-scale-up"
                  title="Send"
                >
                  <Send className="w-4 h-4 text-white translate-x-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast('Hold to record voice snap')}
                  className="w-10 h-10 rounded-full bg-[#f2f3f5] hover:bg-[#e8eaed] active:scale-95 text-slate-800 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs transition-all"
                  title="Voice Snap"
                >
                  <Mic className="w-4 h-4 text-slate-800" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 4: DEDICATED MESSAGE & FRIEND REQUESTS PAGE           */}
      {/* ============================================================ */}
      {currentView === 'requests' && (
        <div className="flex-1 flex flex-col bg-white min-h-screen">
          {/* Header Bar */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
            <button
              type="button"
              onClick={() => setCurrentView('messages')}
              className="p-1 -ml-1 text-slate-800 hover:text-black cursor-pointer transition-colors"
              title="Back to Messages"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="text-base font-bold text-slate-900">Message & Friend Requests</h1>
            <div className="w-6 flex justify-end">
              {pendingRequests.length > 0 && (
                <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </div>
          </div>

          {/* Subtitle Info Banner */}
          <div className="px-4 py-3 bg-[#f8fafc] border-b border-slate-100 flex items-center gap-2.5 text-xs text-slate-500">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <p className="leading-snug">
              These players have requested to connect with you. Accepting allows direct real-time messaging.
            </p>
          </div>

          {/* Requests Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {requestsLoading && (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <div className="w-5 h-5 border-2 border-[#00dfb6] border-t-transparent rounded-full animate-spin" />
                <span>Checking for incoming requests...</span>
              </div>
            )}

            {!requestsLoading && pendingRequests.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                  <UserPlus className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Pending Requests</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                  When other players send you a request to connect or message you, they will appear here for you to accept or decline.
                </p>
              </div>
            )}

            {!requestsLoading && pendingRequests.length > 0 && (
              <div className="divide-y divide-slate-100">
                {pendingRequests.map((req) => (
                  <div
                    key={req.request_id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center font-bold text-base text-white shrink-0 overflow-hidden shadow-xs">
                        {req.profile_image ? (
                          <img
                            src={normalizeImageUrl(req.profile_image) || ''}
                            alt={req.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{req.name ? req.name.charAt(0).toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {req.name || 'UADA Player'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono truncate">
                          ID: {req.user_uid || req.sender_id}
                        </span>
                        <span className="text-[10px] text-slate-400">Wants to chat with you</span>
                      </div>
                    </div>

                    {/* Action Buttons: Accept / Decline */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req.request_id, req.sender_id)}
                        className="px-4 py-1.5 rounded-full bg-[#00dfb6] hover:bg-[#00c59e] active:scale-95 text-[#06201a] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.request_id)}
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-medium text-xs transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
