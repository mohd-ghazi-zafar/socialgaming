import React, { useState, useEffect, useRef, useMemo } from 'react'
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
  UserMinus,
  Ban,
  Pin,
  Trash2,
  SmilePlus,
  Play,
  Pause,
  Radio,
  MessageSquare,
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
  unfollowUser,
  blockUser,
  viewFollowing,
  viewFollowers,
  viewInbox,
  startOrGetChat,
  sendChatMessage,
  sendVoiceNote,
  voiceNotePlayed,
  fetchUserOnlineStatus,
  viewChatHistory,
  markChatAsRead,
  reactToChatMessage,
  removeChatMessage,
  pinChatMessage,
} from '../services/api'
import {
  getChatSocket,
  connectChatUser,
  joinChatRoom,
  leaveChatRoom,
  emitTyping,
  emitStopTyping,
  emitMarkRead,
  emitRecordingVoice,
  emitStopRecordingVoice,
  isUserOnline,
  subscribeToOnlineUsers,
} from '../services/chatSocket'
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
  waveform?: number[] | null
  is_voice_played?: boolean
  file_name?: string | null
  reactions?: Record<string, string>
  status?: string
  read_at?: string | null
  is_edited?: boolean
  is_pinned?: boolean
  is_deleted_for_everyone?: boolean
  reply_to_message_id?: number | null
  reply_content?: string | null
  created_at?: string
  sender_name?: string
  sender_image?: string | null
}

interface PendingRequest {
  request_id: number
  sender_id?: number
  id?: number
  user_uid?: string
  name?: string
  profile_image?: string | null
  last_message?: string | null
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

  // Real-time Chat States (Socket.IO + 04_files & 05_files)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [isOtherRecordingVoice, setIsOtherRecordingVoice] = useState(false)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [activeAudioPlayingId, setActiveAudioPlayingId] = useState<number | null>(null)
  const [otherUserOnlineInfo, setOtherUserOnlineInfo] = useState<{ is_online: boolean; last_seen?: string | null } | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null)
  const [activeMessageActionId, setActiveMessageActionId] = useState<number | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeChat])

  // Modal States
  const [isChooseFriendsOpen, setIsChooseFriendsOpen] = useState(false)
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([])
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false)
  const [deleteModalMsg, setDeleteModalMsg] = useState<BackendMessage | null>(null)

  // Filtered friends list (excluding currently logged in user & removed friends)
  const currentUid = getStoredAuth()?.unique_id || getStoredAuth()?.user?.user_uid
  const friendsList = useMemo(() => {
    let currentRemoved = new Set<number>()
    try {
      const myId = getStoredAuth()?.user?.id
      const saved = localStorage.getItem(`removed_friends_${myId}`)
      if (saved) currentRemoved = new Set(JSON.parse(saved).map(Number))
    } catch {}

    return allDbUsers.filter(
      (u) => u.user_uid !== currentUid && !currentRemoved.has(Number(u.id))
    )
  }, [allDbUsers, currentUid])

  // Real-time Online Users Presence for Top Horizontal Friends Row
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const unsubscribe = subscribeToOnlineUsers((onlineIds) => {
      setOnlineUserIds(new Set(onlineIds))
    })
    return () => {
      unsubscribe()
    }
  }, [])

  // Friends row: online friends prioritized, sorted and displayed as interactive avatars
  const displayedOnlineFriends = useMemo(() => {
    if (!friendsList || friendsList.length === 0) return []
    const online = friendsList.filter((f) => {
      return (
        onlineUserIds.has(String(f.id)) ||
        isUserOnline(f.id) ||
        (f.user_uid && onlineUserIds.has(String(f.user_uid)))
      )
    })
    if (online.length > 0) return online
    return friendsList
  }, [friendsList, onlineUserIds])

  // Follow & Chat Requests
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // Unfriend / Unfollow handler from active chat
  const handleUnfriendFromChat = async () => {
    if (!activeChat?.userId) return
    const token = getAuthToken()
    if (!token) return

    const fid = Number(activeChat.userId)
    try {
      await unfollowUser(fid, token).catch(() => {})
      showToast(`Removed ${activeChat.name} from friends`)

      // Add to persistent removed friends cache
      try {
        const myId = getStoredAuth()?.user?.id
        const saved = localStorage.getItem(`removed_friends_${myId}`)
        const next = saved ? new Set(JSON.parse(saved)) : new Set()
        next.add(fid)
        localStorage.setItem(`removed_friends_${myId}`, JSON.stringify([...next]))
      } catch {}

      setAllDbUsers((prev) => prev.filter((f) => Number(f.id) !== fid))
      setThreads((prev) => prev.filter((t) => Number(t.userId) !== fid))
      setIsChatMenuOpen(false)
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove friend')
    }
  }

  // Block handler from active chat
  const handleBlockFromChat = async () => {
    if (!activeChat?.userId) return
    const token = getAuthToken()
    if (!token) return

    const fid = Number(activeChat.userId)
    try {
      await blockUser(fid, token).catch(() => {})
      showToast(`Blocked ${activeChat.name}`)

      // Add to persistent removed friends cache
      try {
        const myId = getStoredAuth()?.user?.id
        const saved = localStorage.getItem(`removed_friends_${myId}`)
        const next = saved ? new Set(JSON.parse(saved)) : new Set()
        next.add(fid)
        localStorage.setItem(`removed_friends_${myId}`, JSON.stringify([...next]))
      } catch {}

      setAllDbUsers((prev) => prev.filter((f) => Number(f.id) !== fid))
      setThreads((prev) => prev.filter((t) => Number(t.userId) !== fid))
      setActiveChat(null)
      setIsChatMenuOpen(false)
    } catch (err: any) {
      showToast(err?.message || 'Failed to block user')
    }
  }

  // Socket.IO Global Registration & Real-time Inbox Updates
  useEffect(() => {
    const currentUserId = getStoredAuth()?.user?.id
    if (currentUserId) {
      connectChatUser(currentUserId)
    }

    const socket = getChatSocket()

    const handleInboxUpdated = (payload: any) => {
      if (!payload) return
      const { chat_id, message } = payload
      if (message) {
        setThreads((prev) => {
          const idx = prev.findIndex((t) => t.chatId === chat_id)
          if (idx !== -1) {
            const updated = [...prev]
            updated[idx] = {
              ...updated[idx],
              lastMessage: message.content || 'Media message',
              timestamp: 'Now',
              unreadCount: (updated[idx].unreadCount || 0) + 1,
            }
            return updated
          }
          return prev
        })
      }
    }

    socket.on('inbox_updated', handleInboxUpdated)

    return () => {
      socket.off('inbox_updated', handleInboxUpdated)
    }
  }, [])

  // Socket.IO Active Conversation Real-time Listeners (04_files socket engine)
  useEffect(() => {
    if (!activeChat?.chatId || activeChat.isSystem) return
    const activeChatId = activeChat.chatId
    const currentUserId = getStoredAuth()?.user?.id

    joinChatRoom(activeChatId)

    if (currentUserId) {
      emitMarkRead(activeChatId, currentUserId)
    }

    const socket = getChatSocket()

    // 1. New Message received in active chat room
    const handleNewMessage = (newMsg: BackendMessage) => {
      if (Number(newMsg.chat_id) === Number(activeChatId)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        if (currentUserId && Number(newMsg.sender_id) !== Number(currentUserId)) {
          emitMarkRead(activeChatId, currentUserId)
        }
      }
    }

    // 2. Typing Indicators
    const handleUserTyping = (data: { chat_id: number; sender_id: number }) => {
      if (Number(data.chat_id) === Number(activeChatId) && currentUserId && Number(data.sender_id) !== Number(currentUserId)) {
        setIsOtherTyping(true)
      }
    }

    const handleUserStopTyping = (data: { chat_id: number; sender_id: number }) => {
      if (Number(data.chat_id) === Number(activeChatId)) {
        setIsOtherTyping(false)
      }
    }

    // 3. Messages Read Receipts
    const handleMessagesRead = (data: { chat_id: number; reader_id: number; read_message_ids: number[] }) => {
      if (Number(data.chat_id) === Number(activeChatId) && data.read_message_ids?.length) {
        const idSet = new Set(data.read_message_ids)
        setMessages((prev) =>
          prev.map((m) => (idSet.has(m.id) ? { ...m, status: 'read' } : m))
        )
      }
    }

    // 4. Message Reaction Updated
    const handleMessageReacted = (data: { message_id: number; reactions: Record<string, string> }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.message_id ? { ...m, reactions: data.reactions } : m))
      )
    }

    // 5. Message Edited
    const handleMessageEdited = (updatedMsg: BackendMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
      )
    }

    // 6. Message Deleted
    const handleMessageDeleted = (data: { message_id: number; chat_id: number }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.message_id
            ? { ...m, content: 'This message was deleted', is_deleted_for_everyone: true }
            : m
        )
      )
    }

    // 7. Message Pinned / Unpinned
    const handleMessagePinned = (data: { message_id: number; is_pinned: boolean }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.message_id ? { ...m, is_pinned: data.is_pinned } : m))
      )
    }

    // 8. Live Voice Recording Indicator (from 05_files)
    const handleUserRecordingVoice = (data: { chat_id: number; sender_id: number }) => {
      if (Number(data.chat_id) === Number(activeChatId) && currentUserId && Number(data.sender_id) !== Number(currentUserId)) {
        setIsOtherRecordingVoice(true)
      }
    }

    const handleUserStopRecordingVoice = (data: { chat_id: number; sender_id: number }) => {
      if (Number(data.chat_id) === Number(activeChatId)) {
        setIsOtherRecordingVoice(false)
      }
    }

    // 9. Voice Note Played Receipt (from 05_files)
    const handleVoicePlayed = (data: { message_id: number; chat_id: number; is_voice_played: boolean }) => {
      if (Number(data.chat_id) === Number(activeChatId)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.message_id ? { ...m, is_voice_played: true } : m))
        )
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('user_stop_typing', handleUserStopTyping)
    socket.on('user_recording_voice', handleUserRecordingVoice)
    socket.on('user_stop_recording_voice', handleUserStopRecordingVoice)
    socket.on('voice_played', handleVoicePlayed)
    socket.on('messages_read', handleMessagesRead)
    socket.on('message_reacted', handleMessageReacted)
    socket.on('message_edited', handleMessageEdited)
    socket.on('message_deleted', handleMessageDeleted)
    socket.on('message_pinned', handleMessagePinned)

    return () => {
      leaveChatRoom(activeChatId)
      setIsOtherTyping(false)
      setIsOtherRecordingVoice(false)
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleUserTyping)
      socket.off('user_stop_typing', handleUserStopTyping)
      socket.off('user_recording_voice', handleUserRecordingVoice)
      socket.off('user_stop_recording_voice', handleUserStopRecordingVoice)
      socket.off('voice_played', handleVoicePlayed)
      socket.off('messages_read', handleMessagesRead)
      socket.off('message_reacted', handleMessageReacted)
      socket.off('message_edited', handleMessageEdited)
      socket.off('message_deleted', handleMessageDeleted)
      socket.off('message_pinned', handleMessagePinned)
    }
  }, [activeChat?.chatId, activeChat?.isSystem])

  // Sync recipient's live online & last seen status from 05_files endpoint
  useEffect(() => {
    if (!activeChat?.userId || activeChat.isSystem) {
      setOtherUserOnlineInfo(null)
      return
    }

    const token = getAuthToken()
    if (token) {
      fetchUserOnlineStatus(activeChat.userId, token)
        .then((res) => {
          if (res?.data) {
            setOtherUserOnlineInfo(res.data)
          }
        })
        .catch(() => {})
    }
  }, [activeChat?.userId, activeChat?.isSystem])

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
        viewPendingFollowRequests(token).catch(() => ({ requests: [] })),
        viewFollowing(token).catch(() => ({ following: [] })),
        viewFollowers(token).catch(() => ({ followers: [] })),
      ])
        .then(([inboxRes, usersRes, requestsRes, followingRes, followersRes]) => {
          const usersList: RealUser[] = usersRes?.users || []
          setAllDbUsers(usersList)

          const pendingList: PendingRequest[] = requestsRes?.requests || []
          const pendingSenderIds = new Set(
            pendingList.map((r: any) => Number(r.id || r.sender_id)).filter(Boolean)
          )

          const inboxChats = inboxRes?.chats || []

          // Attach message preview to pending request if available
          const chatBySenderId = new Map(inboxChats.map((c: any) => [Number(c.player_id), c]))
          const enrichedPendingRequests = pendingList.map((r: any) => {
            const senderId = Number(r.id || r.sender_id)
            const chat = chatBySenderId.get(senderId)
            return {
              ...r,
              sender_id: senderId,
              last_message: chat?.last_message || null,
            }
          })
          setPendingRequests(enrichedPendingRequests)

          // Collect all accepted connections (following + followers, excluding removed)
          let currentRemoved = new Set<number>()
          try {
            const myId = getStoredAuth()?.user?.id
            const saved = localStorage.getItem(`removed_friends_${myId}`)
            if (saved) currentRemoved = new Set(JSON.parse(saved))
          } catch {}

          const friendsMap = new Map<number, any>()
          ;(followingRes?.following || []).forEach((u: any) => {
            const fid = Number(u?.id)
            if (fid && !currentRemoved.has(fid)) friendsMap.set(fid, u)
          })
          ;(followersRes?.followers || []).forEach((u: any) => {
            const fid = Number(u?.id)
            if (fid && !currentRemoved.has(fid)) friendsMap.set(fid, u)
          })

          const existingThreadUserIds = new Set<number>()

          // 1. Active chats from inbox
          const acceptedInboxThreads: ChatThread[] = inboxChats
            .filter((c: any) => !pendingSenderIds.has(Number(c.player_id)))
            .map((c: any) => {
              existingThreadUserIds.add(Number(c.player_id))
              return {
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
              }
            })

          // 2. Include any accepted friends who do not yet have an inbox chat row
          const myId = getStoredAuth()?.user?.id
          friendsMap.forEach((friend, friendId) => {
            if (
              !existingThreadUserIds.has(friendId) &&
              !pendingSenderIds.has(friendId) &&
              (!myId || Number(myId) !== Number(friendId))
            ) {
              existingThreadUserIds.add(friendId)
              acceptedInboxThreads.push({
                id: `friend-${friendId}`,
                userId: friendId,
                name: friend.name || 'Friend',
                avatarInitial: friend.name ? friend.name.trim().charAt(0).toUpperCase() : 'U',
                avatarImage: normalizeImageUrl(friend.profile_image),
                avatarBg: 'bg-[#00c59e]',
                lastMessage: 'Connected - tap to chat',
                timestamp: 'Connected',
                unreadCount: 0,
              })
            }
          })

          // Set only actual active accepted conversations in the main message hub
          setThreads(acceptedInboxThreads)
        })
        .catch((err) => {
          console.debug('Failed to fetch message contacts:', err.message)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    initData()

    // Background periodic polling for live incoming requests and messages
    const syncInterval = setInterval(async () => {
      const token = getAuthToken()
      if (!token) return

      try {
        const [inboxRes, requestsRes, followingRes, followersRes] = await Promise.all([
          viewInbox(token).catch(() => ({ chats: [] })),
          viewPendingFollowRequests(token).catch(() => ({ requests: [] })),
          viewFollowing(token).catch(() => ({ following: [] })),
          viewFollowers(token).catch(() => ({ followers: [] })),
        ])

        const pendingList: PendingRequest[] = requestsRes?.requests || []
        const pendingSenderIds = new Set(
          pendingList.map((r: any) => Number(r.id || r.sender_id)).filter(Boolean)
        )
        const inboxChats = inboxRes?.chats || []

        const chatBySenderId = new Map(inboxChats.map((c: any) => [Number(c.player_id), c]))
        const enrichedPendingRequests = pendingList.map((r: any) => {
          const senderId = Number(r.id || r.sender_id)
          const chat = chatBySenderId.get(senderId)
          return {
            ...r,
            sender_id: senderId,
            last_message: chat?.last_message || null,
          }
        })
        setPendingRequests(enrichedPendingRequests)

        const friendsMap = new Map<number, any>()
        ;(followingRes?.following || []).forEach((u: any) => {
          if (u?.id) friendsMap.set(Number(u.id), u)
        })
        ;(followersRes?.followers || []).forEach((u: any) => {
          if (u?.id) friendsMap.set(Number(u.id), u)
        })

        const existingThreadUserIds = new Set<number>()

        const acceptedInboxThreads: ChatThread[] = inboxChats
          .filter((c: any) => !pendingSenderIds.has(Number(c.player_id)))
          .map((c: any) => {
            existingThreadUserIds.add(Number(c.player_id))
            return {
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
            }
          })

        const myId = getStoredAuth()?.user?.id
        friendsMap.forEach((friend, friendId) => {
          if (
            !existingThreadUserIds.has(friendId) &&
            !pendingSenderIds.has(friendId) &&
            (!myId || Number(myId) !== Number(friendId))
          ) {
            existingThreadUserIds.add(friendId)
            acceptedInboxThreads.push({
              id: `friend-${friendId}`,
              userId: friendId,
              name: friend.name || 'Friend',
              avatarInitial: friend.name ? friend.name.trim().charAt(0).toUpperCase() : 'U',
              avatarImage: normalizeImageUrl(friend.profile_image),
              avatarBg: 'bg-[#00c59e]',
              lastMessage: 'Connected - tap to chat',
              timestamp: 'Connected',
              unreadCount: 0,
            })
          }
        })

        setThreads(acceptedInboxThreads)
      } catch {
        // Silent periodic background sync
      }
    }, 6000)

    return () => clearInterval(syncInterval)
  }, [])

  // Helper to filter out locally deleted messages
  const filterDeletedMessages = (raw: BackendMessage[]): BackendMessage[] => {
    if (!Array.isArray(raw)) return []
    let deletedSet = new Set<number>()
    try {
      const myId = getStoredAuth()?.user?.id
      const saved = localStorage.getItem(`deleted_messages_${myId}`)
      if (saved) deletedSet = new Set(JSON.parse(saved).map(Number))
    } catch {}
    return raw.filter((m) => !deletedSet.has(Number(m.id)))
  }

  // Auto-sync active conversation messages in real time
  useEffect(() => {
    if (!activeChat?.chatId || activeChat.isSystem) return
    const activeChatId = activeChat.chatId

    const msgInterval = setInterval(async () => {
      const token = getAuthToken()
      if (!token) return
      try {
        const historyRes = await viewChatHistory(activeChatId, token)
        if (historyRes?.messages && Array.isArray(historyRes.messages)) {
          setMessages(filterDeletedMessages(historyRes.messages))
        }
      } catch {
        // Silent poll
      }
    }, 3500)

    return () => clearInterval(msgInterval)
  }, [activeChat?.chatId, activeChat?.isSystem])

  const fetchPendingRequests = async (token: string) => {
    try {
      setRequestsLoading(true)
      const res = await viewPendingFollowRequests(token)
      if (res?.requests && Array.isArray(res.requests)) {
        setPendingRequests(res.requests)
      }
    } catch {
      // Handled gracefully
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
      const existingReq = pendingRequests.find((r) => r.request_id === requestId)
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Request accepted! Conversation moved to Messages.')

      // Move conversation immediately into main active inbox threads
      if (senderId) {
        startOrGetChat(senderId, token).catch(() => null)
        sendFollowRequest(senderId, token).catch(() => {})

        const targetUser = allDbUsers.find((u) => Number(u.id) === Number(senderId))
        const res = await startOrGetChat(senderId, token).catch(() => null)
        const chatId = res?.chat?.id
        const chatUid = res?.chat?.chat_uid

        const newThread: ChatThread = {
          id: chatId ? `chat-${chatId}` : `user-${senderId}`,
          chatId,
          chatUid,
          userId: senderId,
          name: targetUser?.name || existingReq?.name || 'Player',
          avatarInitial: targetUser?.name
            ? targetUser.name.charAt(0).toUpperCase()
            : existingReq?.name
            ? existingReq.name.charAt(0).toUpperCase()
            : 'U',
          avatarImage: normalizeImageUrl(targetUser?.profile_image || existingReq?.profile_image),
          avatarBg: 'bg-[#00c59e]',
          lastMessage: existingReq?.last_message || 'Request accepted - say hello!',
          timestamp: 'Just now',
          unreadCount: 0,
        }

        setThreads((prev) => [
          newThread,
          ...prev.filter((t) => Number(t.userId) !== Number(senderId)),
        ])
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
      handleStartChatWithFriend(u)
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

  // 1. Permanent Friend & Follow Requests Channel (dynamically synced to live requests)
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

  // Combined threads: Requests channel followed by active chats (Platform Announcements removed)
  const combinedThreads: ChatThread[] = [
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
          setMessages(filterDeletedMessages(historyRes.messages))
        }
        markChatAsRead(res.chat.id, token).catch(() => {})
      }
    } catch (err: any) {
      console.debug('Failed to get/start chat room:', err.message)
      showToast(err.message || 'Could not connect chat room')
    }
  }

  // Auto-open chat if navigated from external buttons (e.g. FindFriendSection or SearchPage)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('open_chat_user')
      if (raw) {
        const user = JSON.parse(raw)
        sessionStorage.removeItem('open_chat_user')
        if (user && user.id) {
          handleStartChatWithFriend(user)
        }
      }
    } catch {}
  }, [allDbUsers])

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
          setMessages(filterDeletedMessages(historyRes.messages))
        }
        markChatAsRead(chatId, token).catch(() => {})
      }
    } catch (err: any) {
      console.debug('Failed to fetch chat history:', err.message)
      showToast(err.message || 'Failed to fetch chat history')
    }
  }

  // Input Change with Real-time Typing Indicator
  const handleInputChange = (text: string) => {
    setChatInput(text)
    if (activeChat?.chatId) {
      const currentUserId = getStoredAuth()?.user?.id
      if (currentUserId) {
        emitTyping(activeChat.chatId, currentUserId)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
          if (activeChat?.chatId) {
            emitStopTyping(activeChat.chatId, currentUserId)
          }
        }, 2000)
      }
    }
  }

  // React to a Message with Emoji (04_files reactToMessage)
  const handleReactToMessage = async (messageId: number, emoji: string) => {
    let token = getAuthToken()
    if (!token) token = await ensureActiveAuthToken()
    if (!token) return

    try {
      const res = await reactToChatMessage(messageId, emoji, token)
      if (res?.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions: res.data.reactions } : m))
        )
      }
      setActiveMessageActionId(null)
    } catch {
      showToast('Could not update reaction')
    }
  }

  // Pin / Unpin Message (04_files pinChatMessage)
  const handleTogglePin = async (messageId: number) => {
    let token = getAuthToken()
    if (!token) token = await ensureActiveAuthToken()
    if (!token) return

    try {
      const res = await pinChatMessage(messageId, token)
      if (res?.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, is_pinned: res.data.is_pinned } : m))
        )
        showToast(res.data.is_pinned ? 'Message pinned 📌' : 'Message unpinned')
      }
      setActiveMessageActionId(null)
    } catch {
      showToast('Could not pin message')
    }
  }

  // Delete Message for Me or Everyone (04_files removeChatMessage)
  const handleDeleteMessage = async (messageId: number, forEveryone: boolean) => {
    let token = getAuthToken()
    if (!token) token = await ensureActiveAuthToken()

    const mid = Number(messageId)

    // 1. Immediately update local state so user sees instant response
    if (forEveryone) {
      setMessages((prev) =>
        prev.map((m) =>
          Number(m.id) === mid
            ? { ...m, content: 'This message was deleted', media_url: null, is_deleted_for_everyone: true }
            : m
        )
      )
      showToast('Message deleted for everyone')
    } else {
      // Add to persistent storage for "delete for me" so it never resurrects on poll
      try {
        const myId = getStoredAuth()?.user?.id
        const saved = localStorage.getItem(`deleted_messages_${myId}`)
        const next = saved ? new Set(JSON.parse(saved).map(Number)) : new Set()
        next.add(mid)
        localStorage.setItem(`deleted_messages_${myId}`, JSON.stringify([...next]))
      } catch {}

      setMessages((prev) => prev.filter((m) => Number(m.id) !== mid))
      showToast('Message deleted for you')
    }

    setActiveMessageActionId(null)
    setDeleteModalMsg(null)

    // 2. Send API request to backend
    if (token) {
      try {
        await removeChatMessage(mid, forEveryone, token)
      } catch (err: any) {
        console.warn('Backend delete returned:', err)
        // If delete for everyone failed on server (e.g. sender mismatch or 404), fall back to delete for me locally
        if (forEveryone) {
          try {
            const myId = getStoredAuth()?.user?.id
            const saved = localStorage.getItem(`deleted_messages_${myId}`)
            const next = saved ? new Set(JSON.parse(saved).map(Number)) : new Set()
            next.add(mid)
            localStorage.setItem(`deleted_messages_${myId}`, JSON.stringify([...next]))
          } catch {}
          setMessages((prev) => prev.filter((m) => Number(m.id) !== mid))
        }
      }
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

    if (activeChat.chatId) {
      emitStopTyping(activeChat.chatId, currentUserId)
    }

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
        // Ensure follow/message request is registered on backend for recipient so it lands in recipient's Requests if not already accepted/connected
        if (activeChat.userId && Number(activeChat.userId) !== Number(currentUserId)) {
          sendFollowRequest(activeChat.userId, token).catch(() => {})
        }

        const res = await sendChatMessage(chatId, { message_type: 'text', content }, token)
        if (res?.data) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === res.data.id)) return prev
            return [...prev, res.data]
          })
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

  // Real Voice Note Recording (from 05_files MediaRecorder API)
  const startVoiceRecording = async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        showToast('Voice recording is not supported in this browser')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Determine optimal browser-supported audio mimeType
      let chosenMimeType = ''
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          chosenMimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          chosenMimeType = 'audio/mp4'
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          chosenMimeType = 'audio/ogg;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          chosenMimeType = 'audio/webm'
        }
      }

      const mediaRecorder = chosenMimeType
        ? new MediaRecorder(stream, { mimeType: chosenMimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      // Start with 100ms timeslice to ensure continuous chunk buffering
      mediaRecorder.start(100)
      setIsRecordingVoice(true)
      setRecordingDuration(0)

      const currentUserId = getStoredAuth()?.user?.id
      if (activeChat?.chatId && currentUserId) {
        emitRecordingVoice(activeChat.chatId, currentUserId)
      }

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      console.warn('Microphone permission error:', err.message)
      showToast('Microphone access is required for voice snap')
    }
  }

  const stopAndSendVoice = async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    const currentUserId = getStoredAuth()?.user?.id
    if (activeChat?.chatId && currentUserId) {
      emitStopRecordingVoice(activeChat.chatId, currentUserId)
    }

    // Flush any pending data before stopping
    if (recorder.state === 'recording') {
      try {
        recorder.requestData()
      } catch {}
    }

    recorder.onstop = async () => {
      const actualMime = recorder.mimeType || 'audio/webm'
      const audioBlob = new Blob(audioChunksRef.current, { type: actualMime })
      recorder.stream.getTracks().forEach((track) => track.stop())
      setIsRecordingVoice(false)

      if (audioBlob.size === 0) {
        showToast('Voice recording was empty. Please try again.')
        return
      }

      let token = getAuthToken()
      if (!token) token = await ensureActiveAuthToken()
      let chatId = activeChat?.chatId

      if (!chatId && activeChat?.userId && token) {
        const res = await startOrGetChat(activeChat.userId, token)
        chatId = res?.chat?.id
        if (chatId) setActiveChat((prev) => (prev ? { ...prev, chatId } : prev))
      }

      if (chatId && token) {
        const ext = actualMime.includes('mp4') ? 'm4a' : actualMime.includes('ogg') ? 'ogg' : 'webm'
        const voiceFileName = `voice_${Date.now()}.${ext}`

        const fd = new FormData()
        // Provide under 'voice' matching backend 06_files uploadChatMedia.single("voice") and uploadChatMedia.fields([{ name: "voice" }])
        fd.append('voice', audioBlob, voiceFileName)
        fd.append('message_type', 'voice')
        fd.append('media_duration', String(recordingDuration || 1))
        fd.append('waveform', JSON.stringify([25, 50, 85, 60, 35, 95, 75, 45, 65, 35, 90, 45]))

        try {
          showToast('Sending voice snap...')
          const res = await sendVoiceNote(chatId, fd, token).catch(() =>
            sendChatMessage(chatId, fd, token)
          )
          if (res?.data) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === res.data.id)) return prev
              return [...prev, res.data]
            })
            setThreads((prev) =>
              prev.map((t) =>
                t.chatId === chatId ? { ...t, lastMessage: '🎙️ Voice Note', timestamp: 'Now' } : t
              )
            )
          }
        } catch {
          showToast('Voice note failed to send')
        }
      }
    }

    recorder.stop()
  }

  const cancelVoiceRecording = () => {
    const recorder = mediaRecorderRef.current
    if (recorder) {
      recorder.stream.getTracks().forEach((track) => track.stop())
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    const currentUserId = getStoredAuth()?.user?.id
    if (activeChat?.chatId && currentUserId) {
      emitStopRecordingVoice(activeChat.chatId, currentUserId)
    }
    setIsRecordingVoice(false)
    setRecordingDuration(0)
  }

  // Interactive Voice Note Playback & Blue Mic Receipt (from 05_files)
  const handleTogglePlayAudio = async (message: BackendMessage) => {
    if (!message.media_url) {
      showToast('Audio file not found')
      return
    }

    // Toggle pause if already playing this message
    if (activeAudioPlayingId === message.id) {
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause()
        activeAudioElementRef.current = null
      }
      setActiveAudioPlayingId(null)
      return
    }

    // Stop any existing playing audio
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause()
      activeAudioElementRef.current = null
    }

    const rawUrl = message.media_url
    const normalizedUrl = normalizeImageUrl(rawUrl) || rawUrl

    try {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.src = normalizedUrl
      activeAudioElementRef.current = audio
      setActiveAudioPlayingId(message.id)

      audio.onended = () => {
        setActiveAudioPlayingId(null)
        activeAudioElementRef.current = null
      }

      audio.onerror = (e) => {
        console.warn('Voice note playback error for URL:', normalizedUrl, e)
        setActiveAudioPlayingId(null)
        activeAudioElementRef.current = null
        showToast('Could not play audio file (unsupported format or expired link)')
      }

      await audio.play().catch((playErr) => {
        console.warn('Audio play() rejected:', playErr)
        setActiveAudioPlayingId(null)
        activeAudioElementRef.current = null
        showToast('Tap again to play audio')
      })
    } catch (err) {
      setActiveAudioPlayingId(null)
      activeAudioElementRef.current = null
      showToast('Unable to play voice note')
    }

    // Mark as played if recipient (from 05_files endpoint)
    const currentUserId = getStoredAuth()?.user?.id
    if (currentUserId && Number(message.sender_id) !== Number(currentUserId) && !message.is_voice_played) {
      const token = getAuthToken()
      if (token) {
        voiceNotePlayed(message.id, token).catch(() => {})
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, is_voice_played: true } : m))
      )
    }
  }

  // Media Attachment Upload
  const handleMediaFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeChat) return

    let token = getAuthToken()
    if (!token) token = await ensureActiveAuthToken()
    let chatId = activeChat.chatId

    if (chatId && token) {
      const fd = new FormData()
      fd.append('media', file)
      fd.append(
        'message_type',
        file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file'
      )

      try {
        showToast('Uploading media snap...')
        const res = await sendChatMessage(chatId, fd, token)
        if (res?.data) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === res.data.id)) return prev
            return [...prev, res.data]
          })
        }
      } catch {
        showToast('Failed to upload media')
      }
    }
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

          {/* Skeleton Friends Loading */}
          {isLoading && (
            <div className="px-4 py-3 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-slate-200 rounded-md w-28" />
                      <div className="h-2.5 bg-slate-100 rounded-md w-16" />
                    </div>
                  </div>
                  <div className="h-7 w-16 bg-slate-100 rounded-full" />
                </div>
              ))}
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

          {/* Top Horizontal Row: Friends That Are Online (Avatars Only) */}
          {!isLoading && displayedOnlineFriends.length > 0 && (
            <div className="px-4 py-1.5 border-b border-slate-100/80 bg-white">
              <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-none py-1">
                {displayedOnlineFriends.map((friend) => {
                  const avatarUrl = normalizeImageUrl(friend.profile_image)
                  const isOnline =
                    onlineUserIds.has(String(friend.id)) ||
                    isUserOnline(friend.id) ||
                    (friend.user_uid && onlineUserIds.has(String(friend.user_uid)))

                  return (
                    <button
                      key={friend.id || friend.user_uid}
                      type="button"
                      onClick={() => handleStartChatWithFriend(friend)}
                      className="relative shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-90"
                      title={friend.name}
                    >
                      <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#00dfb6] via-sky-400 to-indigo-500 shadow-xs hover:shadow-md transition-shadow">
                        <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={friend.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm">
                              {friend.name ? friend.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        {/* Active Emerald Online Dot */}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs ring-1 ring-emerald-400/50" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}



          {/* Skeleton Chats List Loading */}
          {isLoading && (
            <div className="flex-1 divide-y divide-slate-50 mt-1 px-4 py-2 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 bg-slate-200 rounded-md w-28" />
                      <div className="h-2.5 bg-slate-200 rounded-md w-12" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-slate-100 rounded-md w-40" />
                      <div className="h-4 bg-slate-100 rounded-full w-8" />
                    </div>
                  </div>
                </div>
              ))}
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
        <div className="fixed inset-0 z-[70] flex flex-col bg-white max-w-[471px] mx-auto animate-slide-up shadow-2xl">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsChooseFriendsOpen(false)
                setSelectedFriendIds([])
              }}
              className="p-1 -ml-1 text-slate-800 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-base font-bold text-slate-900">Choose friends</h2>

            {/* Top Right Header Action Button */}
            <button
              type="button"
              disabled={selectedFriendIds.length === 0}
              onClick={handleConfirmChooseFriends}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                selectedFriendIds.length > 0
                  ? 'bg-[#00dfb6] text-[#06201a] active:scale-95 shadow-xs cursor-pointer hover:bg-[#00c59e]'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat {selectedFriendIds.length > 0 ? `(${selectedFriendIds.length})` : ''}</span>
            </button>
          </div>

          {/* Search Bar matching Image 2 */}
          <div className="px-4 py-2.5 shrink-0">
            <div className="flex items-center gap-2 bg-[#f2f3f5] rounded-full px-3.5 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={chooseSearchQuery}
                onChange={(e) => setChooseSearchQuery(e.target.value)}
                placeholder="Search friend by name or ID..."
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none flex-1 font-normal"
              />
              {chooseSearchQuery && (
                <button
                  type="button"
                  onClick={() => setChooseSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Grouped Friends List with Checkboxes and Direct Message Button */}
          <div className="flex-1 overflow-y-auto px-1 pb-4">
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

                          {/* Right: Direct Message Button + Circular Selection Radio */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartChatWithFriend(user)
                                setIsChooseFriendsOpen(false)
                                setSelectedFriendIds([])
                              }}
                              className="px-2.5 py-1 rounded-full bg-[#00dfb6] hover:bg-[#00c59e] active:scale-95 text-[#06201a] font-black text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                              title={`Direct message ${user.name}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Message</span>
                            </button>

                            {/* Circular Selection Radio */}
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
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Sticky Footer Action Button */}
          <div className="shrink-0 bg-white border-t border-slate-100 p-3 px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20">
            <button
              type="button"
              disabled={selectedFriendIds.length === 0}
              onClick={handleConfirmChooseFriends}
              className={`w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 ${
                selectedFriendIds.length > 0
                  ? 'bg-[#00dfb6] text-[#06201a] hover:bg-[#00c59e] active:scale-95 shadow-md cursor-pointer'
                  : 'bg-[#f2f4f7] text-[#9da2ad] cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>
                {selectedFriendIds.length === 0
                  ? 'Select a friend or tap Message'
                  : selectedFriendIds.length === 1
                  ? `Message ${friendsList.find((u) => u.id === selectedFriendIds[0])?.name || 'Selected Friend'}`
                  : `Start Group Chat (${selectedFriendIds.length})`}
              </span>
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
                  ) : isOtherRecordingVoice ? (
                    <span className="text-rose-500 font-bold flex items-center gap-1 animate-pulse">
                      <Radio className="w-3 h-3 animate-spin" />
                      recording voice snap...
                    </span>
                  ) : isOtherTyping ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1 animate-pulse">
                      typing...
                    </span>
                  ) : isUserOnline(activeChat.userId || 0) || otherUserOnlineInfo?.is_online ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active now
                    </span>
                  ) : (
                    <>
                      <span className="text-slate-400">
                        {otherUserOnlineInfo?.last_seen
                          ? `Last seen ${new Date(otherUserOnlineInfo.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Offline'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">Snapchat Tap</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Options menu (Unfriend, Block, Close) */}
            <div className="relative flex items-center gap-2 text-slate-400">
              <button
                type="button"
                onClick={() => setIsChatMenuOpen((prev) => !prev)}
                className="hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-5 h-5 stroke-[2]" />
              </button>

              {isChatMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsChatMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-10 z-50 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 animate-scale-in text-xs font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={handleUnfriendFromChat}
                      className="w-full px-3.5 py-2.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-left"
                    >
                      <UserMinus className="w-4 h-4 text-rose-500" />
                      <span>Remove Friend</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBlockFromChat}
                      className="w-full px-3.5 py-2.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-left"
                    >
                      <Ban className="w-4 h-4 text-rose-500" />
                      <span>Block Player</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChat(null)
                        setIsChatMenuOpen(false)
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer text-left"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                      <span>Close Chat</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Snapchat Messages Canvas */}
          <div className="flex-1 min-h-0 p-3.5 overflow-y-auto space-y-3 bg-white overscroll-contain">
            {/* Pinned Message Banner (04_files) */}
            {(() => {
              const pinnedMsg = messages.find((m) => m.is_pinned && !m.is_deleted_for_everyone)
              if (!pinnedMsg) return null
              return (
                <div className="w-full flex items-center justify-between px-3 py-1.5 bg-amber-50/90 border border-amber-200/80 rounded-xl shadow-2xs mb-1 animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-900 shrink-0">Pinned:</span>
                    <span className="text-[11px] text-amber-800 truncate font-medium">
                      {pinnedMsg.content}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePin(pinnedMsg.id)}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 ml-2 shrink-0 cursor-pointer"
                  >
                    Unpin
                  </button>
                </div>
              )
            })()}
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
              const isActionOpen = activeMessageActionId === m.id

              return (
                <div
                  key={m.id || idx}
                  className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'} my-1.5`}
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
                    onClick={() => setActiveMessageActionId(isActionOpen ? null : m.id)}
                    className={`relative max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-xs break-words cursor-pointer transition-transform active:scale-[0.99] ${
                      m.is_deleted_for_everyone
                        ? 'bg-slate-100 text-slate-400 italic rounded-2xl'
                        : isMe
                        ? 'bg-[#0099ff] text-white rounded-tr-xs font-normal'
                        : 'bg-[#f2f3f5] text-slate-900 rounded-tl-xs font-normal'
                    }`}
                  >
                    {m.is_pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 mr-1.5">
                        <Pin className="w-3 h-3 fill-amber-300" />
                      </span>
                    )}

                    {/* 0. Deleted Message State */}
                    {m.is_deleted_for_everyone || m.content === 'This message was deleted' ? (
                      <p className="italic text-slate-400 text-xs py-0.5">This message was deleted</p>
                    ) : m.message_type === 'voice' || (m.media_url && (m.media_url.includes('.webm') || m.media_url.includes('.m4a') || m.media_url.includes('.ogg') || m.media_url.includes('audio') || m.media_url.includes('.wav') || m.media_url.includes('.mp3') || m.media_url.includes('voice_'))) ? (
                      <div className="flex items-center gap-2.5 py-0.5 min-w-[180px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTogglePlayAudio(m)
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-transform active:scale-90 ${
                            isMe ? 'bg-white text-[#0099ff]' : 'bg-[#0099ff] text-white'
                          }`}
                        >
                          {activeAudioPlayingId === m.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current translate-x-0.5" />
                          )}
                        </button>

                        {/* Waveform bars visualization */}
                        <div className="flex-1 flex items-center gap-[2.5px] h-6 overflow-hidden">
                          {(m.waveform && m.waveform.length > 0 ? m.waveform : [30, 60, 95, 45, 80, 60, 30, 90, 40, 70, 50, 85, 30, 60]).map((h, bIdx) => (
                            <span
                              key={bIdx}
                              style={{ height: `${Math.max(15, Math.min(100, Number(h)))}%` }}
                              className={`w-[2.5px] rounded-full transition-all ${
                                activeAudioPlayingId === m.id
                                  ? 'bg-amber-300 animate-pulse'
                                  : isMe ? 'bg-white/80' : 'bg-[#0099ff]/60'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Duration & Mic Status (blue mic if listened) */}
                        <div className="flex items-center gap-1 text-[11px] font-mono shrink-0">
                          <span className={isMe ? 'text-white/90' : 'text-slate-600'}>
                            {m.media_duration ? `0:${m.media_duration < 10 ? '0' : ''}${m.media_duration}` : '0:03'}
                          </span>
                          <Mic
                            className={`w-3.5 h-3.5 ${
                              m.is_voice_played
                                ? 'text-[#0099ff] fill-[#0099ff]'
                                : isMe
                                ? 'text-white/70'
                                : 'text-slate-400'
                            }`}
                            title={m.is_voice_played ? 'Listened' : 'Unheard'}
                          />
                        </div>
                      </div>
                    ) : m.message_type === 'image' || (m.media_url && (m.media_url.endsWith('.png') || m.media_url.endsWith('.jpg') || m.media_url.endsWith('.jpeg'))) ? (
                      /* 2. Image Snap Bubble */
                      <div className="space-y-1 relative group">
                        <img
                          src={normalizeImageUrl(m.media_url) || m.media_url}
                          alt="Snap media"
                          className="rounded-xl max-h-56 max-w-full object-cover shadow-xs cursor-pointer hover:opacity-95"
                          loading="lazy"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMessageActionId(isActionOpen ? null : m.id)
                          }}
                        />
                        {text && <p className="text-xs mt-1">{text}</p>}

                        {/* Direct Quick Trash Button on media attachment */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteModalMsg(m)
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-rose-300 opacity-90 transition-all active:scale-90 cursor-pointer shadow-md"
                          title="Delete attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      /* 3. Text Message */
                      <p>{text}</p>
                    )}
                  </div>

                  {/* Floating Emoji Reactions & Actions Menu (04_files) */}
                  {isActionOpen && !m.is_deleted_for_everyone && (
                    <div
                      className={`absolute z-30 -top-10 ${
                        isMe ? 'right-0' : 'left-0'
                      } bg-white border border-slate-200/90 rounded-full px-2 py-1 shadow-lg flex items-center gap-1.5 animate-scale-up`}
                    >
                      {['❤️', '😂', '🔥', '👍', '😮', '😢'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReactToMessage(m.id, emoji)
                          }}
                          className="hover:scale-125 transition-transform text-sm p-1 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}

                      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                      {/* Pin Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePin(m.id)
                        }}
                        className="p-1 hover:text-amber-500 text-slate-400 cursor-pointer"
                        title={m.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteModalMsg(m)
                          setActiveMessageActionId(null)
                        }}
                        className="p-1 hover:text-rose-500 text-slate-400 cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Message Reactions Pills */}
                  {m.reactions && Object.keys(m.reactions).length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                      {Object.entries(
                        Object.values(m.reactions).reduce((acc: Record<string, number>, em: string) => {
                          acc[em] = (acc[em] || 0) + 1
                          return acc
                        }, {})
                      ).map(([em, cnt]) => (
                        <span
                          key={em}
                          onClick={() => handleReactToMessage(m.id, em)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-white border border-slate-200 rounded-full text-[11px] shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                        >
                          <span>{em}</span>
                          {cnt > 1 && <span className="text-[9px] font-bold text-slate-600">{cnt}</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Snapchat-style status indicator with Blue Ticks / Read status */}
                  <div
                    className={`flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-medium ${
                      isMe ? 'pr-1' : 'pl-1'
                    }`}
                  >
                    {isMe ? (
                      <>
                        <span className={`text-[9px] font-black ${m.status === 'read' ? 'text-[#0099ff]' : 'text-slate-400'}`}>
                          {m.status === 'read' ? '✓✓' : '▶'}
                        </span>
                        <span>{m.status === 'read' ? 'Opened' : 'Delivered'}</span>
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
              {/* Hidden file input for photos/media */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />

              {isRecordingVoice ? (
                /* Active Voice Snap Recording Bar (from 05_files) */
                <div className="flex-1 flex items-center justify-between bg-rose-50 border border-rose-200/80 rounded-full px-4 py-2 animate-pulse shadow-xs">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span>Recording Voice Snap... 0:{recordingDuration < 10 ? '0' : ''}{recordingDuration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={cancelVoiceRecording}
                      className="p-1 rounded-full text-slate-500 hover:text-rose-600 cursor-pointer transition-colors"
                      title="Cancel Recording"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendVoice}
                      className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                      title="Send Voice Note"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Snapchat Iconic Round Camera Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full bg-[#f2f3f5] hover:bg-[#e8eaed] active:scale-95 text-slate-800 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs transition-all"
                    title="Camera & Photos"
                  >
                    <Camera className="w-5 h-5 stroke-[2] text-slate-800" />
                  </button>

                  {/* "Send a chat" Pill Container */}
                  <div className="flex-1 bg-[#f2f3f5] rounded-full px-4 py-2 flex items-center gap-2 border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all shadow-inner">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => handleInputChange(e.target.value)}
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
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Upload Photo / Media"
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
                      onClick={startVoiceRecording}
                      className="w-10 h-10 rounded-full bg-[#f2f3f5] hover:bg-[#e8eaed] active:scale-95 text-slate-800 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs transition-all"
                      title="Record Voice Snap"
                    >
                      <Mic className="w-4 h-4 text-slate-800" />
                    </button>
                  )}
                </>
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
            {/* Skeleton Requests Loading */}
            {requestsLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-slate-200 rounded-md w-24" />
                        <div className="h-2.5 bg-slate-100 rounded-md w-16" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 bg-slate-200 rounded-full" />
                      <div className="h-8 w-8 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                ))}
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
                        {req.last_message ? (
                          <p className="text-xs text-slate-700 truncate mt-0.5 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            💬 "{req.last_message}"
                          </p>
                        ) : (
                          <span className="text-[10px] text-slate-400">Wants to chat with you</span>
                        )}
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

      {/* Delete Message / Attachment Confirmation Dialog */}
      {deleteModalMsg && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDeleteModalMsg(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Message?</h3>
              <p className="text-xs text-slate-500 mt-1">
                {deleteModalMsg.media_url
                  ? 'Are you sure you want to delete this media attachment?'
                  : 'Are you sure you want to delete this message?'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* If sent by current user, offer Delete for Everyone */}
              {((deleteModalMsg.sender_id &&
                Number(deleteModalMsg.sender_id) === Number(getStoredAuth()?.user?.id)) ||
                deleteModalMsg.sender_name === 'Me') && (
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(deleteModalMsg.id, true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-semibold text-xs transition-all cursor-pointer shadow-sm shadow-rose-500/20"
                >
                  Delete for Everyone
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteMessage(deleteModalMsg.id, false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                Delete for Me
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalMsg(null)}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-600 font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
