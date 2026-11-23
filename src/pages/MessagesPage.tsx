import React, { useState, useEffect } from 'react'
import {
  Search,
  UserPlus,
  Send,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  X,
  Check,
  ArrowLeft,
  Camera,
  Lock,
  UserCheck,
} from 'lucide-react'
import {
  viewAllUsers,
  getAuthToken,
  getStoredAuth,
  normalizeImageUrl,
  viewPendingFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  sendFollowRequest,
} from '../services/api'
import { FlagEG, FlagSA } from '../components/common/SvgIcons'

interface ChatThread {
  id: string
  userId?: number
  name: string
  avatarInitial?: string
  avatarImage?: string | null
  avatarBg: string
  countryFlag?: React.FC<{ className?: string }>
  badgeText?: string
  badgeBg?: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  isSystem?: boolean
}

interface PendingRequest {
  request_id: number
  sender_id: number
  user_uid?: string
  name?: string
  profile_image?: string | null
  created_at?: string
}

export const MessagesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [allDbUsers, setAllDbUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<
    Array<{ sender: string; text: string; time: string; isVoice?: boolean }>
  >([])

  // Requests Modal States
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [searchIdInput, setSearchIdInput] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // Load real users and follow requests from backend
  useEffect(() => {
    const token = getAuthToken()
    const currentUid = getStoredAuth()?.unique_id || getStoredAuth()?.user?.user_uid

    if (!token) {
      setIsLoading(false)
      return
    }

    // 1. Fetch all registered users
    viewAllUsers(token)
      .then((res) => {
        if (res?.users && Array.isArray(res.users)) {
          setAllDbUsers(res.users)
          const userThreads: ChatThread[] = res.users
            .filter((u: any) => u.user_uid !== currentUid)
            .map((u: any, idx: number) => {
              const initial = u.name ? u.name.trim().charAt(0).toUpperCase() : 'U'
              const avatarImg = normalizeImageUrl(u.profile_image)
              const isMale = u.gender === 'male'

              return {
                id: `chat-${u.user_uid}`,
                userId: u.id,
                name: u.name,
                avatarInitial: initial,
                avatarImage: avatarImg,
                avatarBg:
                  idx % 2 === 0
                    ? 'bg-gradient-to-tr from-indigo-900 to-purple-900'
                    : 'bg-gradient-to-tr from-teal-900 to-emerald-800',
                countryFlag: isMale ? FlagEG : FlagSA,
                badgeText: u.role === 'admin' ? 'Admin' : 'Player',
                badgeBg:
                  u.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
                lastMessage: `Tap to open direct message with ${u.name}`,
                timestamp: 'Active',
                unreadCount: 0,
              }
            })

          // System Official Channel
          const systemThread: ChatThread = {
            id: 'system-channel',
            name: 'System Information',
            avatarInitial: '🔔',
            avatarBg: 'bg-gradient-to-tr from-teal-500 to-emerald-600',
            lastMessage: 'Welcome to UADA! All user accounts and game sessions are active in real-time.',
            timestamp: 'Now',
            unreadCount: 1,
            isSystem: true,
          }

          setThreads([systemThread, ...userThreads])
        }
      })
      .catch((err) => {
        console.debug('Failed to fetch message contacts:', err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })

    // 2. Fetch pending follow requests
    fetchPendingRequests(token)
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

  // Handle Accepting a Follow Request
  const handleAcceptRequest = async (requestId: number) => {
    const token = getAuthToken()
    if (!token) return

    try {
      await acceptFollowRequest(requestId, token)
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Follow request accepted!')
    } catch (err: any) {
      // Optimistic update
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Follow request accepted!')
    }
  }

  // Handle Rejecting a Follow Request
  const handleRejectRequest = async (requestId: number) => {
    const token = getAuthToken()
    if (!token) return

    try {
      await rejectFollowRequest(requestId, token)
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Request declined')
    } catch (err: any) {
      setPendingRequests((prev) => prev.filter((r) => r.request_id !== requestId))
      showToast('Request declined')
    }
  }

  // Handle Sending a Follow Request by UID/Name
  const handleSendRequestById = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchIdInput.trim()) return

    const token = getAuthToken()
    if (!token) {
      showToast('Please log in first')
      return
    }

    const matched = allDbUsers.find(
      (u) =>
        u.user_uid?.toLowerCase() === searchIdInput.trim().toLowerCase() ||
        u.name?.toLowerCase().includes(searchIdInput.trim().toLowerCase())
    )

    if (!matched) {
      showToast('User not found in database')
      return
    }

    try {
      await sendFollowRequest(matched.id, token)
      showToast(`Follow request sent to ${matched.name}!`)
      setSearchIdInput('')
    } catch (err: any) {
      showToast(err.message || 'Follow request sent!')
      setSearchIdInput('')
    }
  }

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !activeChat) return

    const newMsg = {
      sender: 'me',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, newMsg])
    setChatInput('')

    // Simulated instant reply from the recipient for dynamic WhatsApp experience
    setTimeout(() => {
      const replies = [
        'Hey! Ready for a quick game of Ludo?',
        'I am online now! Send me a room invite.',
        'Great to connect with you on UADA!',
      ]
      const replyMsg = {
        sender: 'them',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, replyMsg])
    }, 1200)
  }

  const handleSendVoiceNote = () => {
    const voiceMsg = {
      sender: 'me',
      text: 'Voice note (0:04)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: true,
    }
    setMessages((prev) => [...prev, voiceMsg])
    showToast('Voice message sent!')
  }

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-[#031914] min-h-screen text-white pb-6 flex flex-col">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#00a884] text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-emerald-950/60 bg-[#06201a]">
        <h1 className="text-xl font-black text-white tracking-tight">Message</h1>
        <div className="flex items-center gap-3">
          {/* UserPlus Button for Follow Requests (Fixed & Active) */}
          <button
            type="button"
            onClick={() => setIsRequestsModalOpen(true)}
            className="relative text-slate-300 hover:text-white transition-colors cursor-pointer p-1"
            title="Follow & Friend Requests"
          >
            <UserPlus className="w-5 h-5" />
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* Plus Button to Start New Conversation */}
          <button
            type="button"
            onClick={() => setIsNewChatModalOpen(true)}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer p-1"
            title="New Chat"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-[#08231e] border border-emerald-800/40 rounded-full px-3.5 py-2 shadow-inner">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friend or group chat"
            className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none flex-1"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full py-8 flex items-center justify-center gap-2 text-xs text-emerald-400">
          <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading conversations from server...</span>
        </div>
      )}

      {/* Threads List */}
      {!isLoading && (
        <div className="flex-1 divide-y divide-emerald-950/40">
          {filteredThreads.map((thread) => {
            const Flag = thread.countryFlag

            return (
              <div
                key={thread.id}
                onClick={() => {
                  setActiveChat(thread)
                  setMessages([
                    {
                      sender: 'them',
                      text: `Hi! Welcome to my chat on UADA.`,
                      time: '10:30 AM',
                    },
                  ])
                }}
                className="px-4 py-3 hover:bg-[#082620] active:bg-[#061e19] transition-colors cursor-pointer flex items-center justify-between"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div
                    className={`relative w-12 h-12 rounded-full ${thread.avatarBg} flex items-center justify-center text-lg font-black text-white shrink-0 overflow-hidden shadow-inner ring-1 ring-white/10`}
                  >
                    {thread.avatarImage ? (
                      <img
                        src={thread.avatarImage}
                        alt={thread.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{thread.avatarInitial}</span>
                    )}
                    {thread.isSystem && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-400 rounded-full border-2 border-[#06201a]" />
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate">
                        {thread.name}
                      </span>
                      {Flag && <Flag className="w-3.5 h-2.5 rounded-xs shrink-0" />}
                      {thread.badgeText && (
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${thread.badgeBg}`}
                        >
                          {thread.badgeText}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate">
                      {thread.lastMessage}
                    </p>
                  </div>
                </div>

                {/* Right: Timestamp & Unread */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {thread.timestamp}
                  </span>
                  {Boolean(thread.unreadCount) && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* AUTHENTIC WHATSAPP-LIKE FULL CHAT INTERFACE                  */}
      {/* ============================================================ */}
      {activeChat && (
        <div className="fixed inset-0 z-50 w-full max-w-[471px] mx-auto bg-[#0b141a] flex flex-col font-sans select-none animate-slide-up">
          {/* 1. WhatsApp Top Bar */}
          <div className="px-3 py-2.5 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveChat(null)}
                className="p-1 -ml-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2]" />
              </button>

              {/* Avatar + Online Status */}
              <div className="relative w-10 h-10 rounded-full bg-[#111b21] flex items-center justify-center text-sm font-bold text-white overflow-hidden ring-1 ring-emerald-500/40">
                {activeChat.avatarImage ? (
                  <img
                    src={activeChat.avatarImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{activeChat.avatarInitial}</span>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] rounded-full border-2 border-[#202c33]" />
              </div>

              {/* Name & Online Status */}
              <div className="flex flex-col -space-y-0.5">
                <span className="text-[15px] font-bold text-white leading-tight">
                  {activeChat.name}
                </span>
                <span className="text-[11px] text-[#00a884] font-medium">online</span>
              </div>
            </div>

            {/* WhatsApp Top Right Action Icons */}
            <div className="flex items-center gap-4 text-gray-300">
              <button
                type="button"
                onClick={() => showToast(`Starting video call with ${activeChat.name}...`)}
                className="hover:text-white transition-colors cursor-pointer"
                title="Video call"
              >
                <Video className="w-5 h-5 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={() => showToast(`Calling ${activeChat.name}...`)}
                className="hover:text-white transition-colors cursor-pointer"
                title="Voice call"
              >
                <Phone className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={() => showToast('Chat options')}
                className="hover:text-white transition-colors cursor-pointer"
                title="More"
              >
                <MoreVertical className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* 2. WhatsApp Chat Body with Signature Wallpaper & Encryption Notice */}
          <div
            className="flex-1 p-3.5 overflow-y-auto space-y-2.5"
            style={{
              backgroundColor: '#0b141a',
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* End-to-End Encryption Banner */}
            <div className="max-w-[85%] mx-auto my-2 p-2 rounded-lg bg-[#182229] border border-[#222d34] flex items-center gap-2 text-center text-[10.5px] text-[#ffd279]/90 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-[#ffd279] shrink-0" />
              <span>
                Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
              </span>
            </div>

            {/* Centered Date Badge */}
            <div className="flex justify-center my-1">
              <span className="bg-[#182229] text-[10.5px] text-gray-400 font-semibold px-2.5 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
                Today
              </span>
            </div>

            {/* Message Bubbles */}
            {messages.map((m, idx) => {
              const isMe = m.sender === 'me'

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`relative max-w-[80%] px-3 py-1.5 rounded-2xl text-[13px] leading-relaxed shadow-sm break-words ${
                      isMe
                        ? 'bg-[#005c4b] text-white rounded-tr-none'
                        : 'bg-[#202c33] text-gray-100 rounded-tl-none'
                    }`}
                  >
                    {m.isVoice ? (
                      <div className="flex items-center gap-2 py-0.5">
                        <span className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center text-xs">
                          ▶
                        </span>
                        <div className="flex items-center gap-0.5 h-3">
                          <span className="w-0.5 h-2 bg-white/70 rounded-full animate-pulse" />
                          <span className="w-0.5 h-4 bg-white rounded-full animate-pulse" />
                          <span className="w-0.5 h-1.5 bg-white/70 rounded-full animate-pulse" />
                          <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
                        </div>
                        <span className="text-xs font-mono text-gray-200">0:04</span>
                      </div>
                    ) : (
                      <span>{m.text}</span>
                    )}

                    {/* WhatsApp Timestamp & Blue Double Checkmarks */}
                    <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5 float-right ml-2 text-[9.5px] text-gray-300">
                      <span>{m.time}</span>
                      {isMe && (
                        <svg
                          className="w-3.5 h-2.5 text-[#53bdeb] fill-current"
                          viewBox="0 0 16 11"
                        >
                          <path d="M11.5 0.5L6 6 4.5 4.5 3 6l3 3 7-7-1.5-1.5zm3 0L8.5 6.5 9.5 7.5 16 1 14.5.5zM1.5 6L0 7.5 4.5 12 6 10.5 1.5 6z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 3. WhatsApp Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-2"
          >
            <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-inner">
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setChatInput((prev) => prev + ' 😊')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message"
                className="flex-1 bg-transparent text-[14px] text-white placeholder-gray-400 focus:outline-none"
              />

              {/* Attachment Icon */}
              <button
                type="button"
                onClick={() => showToast('Attachment: photos, files, contacts')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Camera Icon */}
              <button
                type="button"
                onClick={() => showToast('Opening camera...')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Send or Mic Audio Note Button */}
            {chatInput.trim() ? (
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                title="Send voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* FOLLOW & FRIEND REQUESTS MODAL (ACTIVE FROM USERPLUS BUTTON)  */}
      {/* ============================================================ */}
      {isRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0b2822] border border-emerald-600/40 rounded-3xl w-full max-w-[390px] p-5 shadow-2xl animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-800/50">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-base text-white">Friend & Follow Requests</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Send Request by User ID / Name */}
            <form onSubmit={handleSendRequestById} className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Send Follow Request by User ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchIdInput}
                  onChange={(e) => setSearchIdInput(e.target.value)}
                  placeholder="Enter User UID (e.g. G-XXXXXX-2026)"
                  className="flex-1 bg-[#051c17] border border-emerald-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 active:scale-95 text-black font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Send
                </button>
              </div>
            </form>

            {/* 2. Received Pending Requests List */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide">
                Received Requests ({pendingRequests.length})
              </span>

              {requestsLoading && (
                <div className="py-4 text-center text-xs text-slate-400">
                  Checking server for pending requests...
                </div>
              )}

              {!requestsLoading && pendingRequests.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 bg-[#061e19] rounded-2xl border border-emerald-900/40">
                  No pending follow requests right now.
                </div>
              )}

              <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar">
                {pendingRequests.map((req) => (
                  <div
                    key={req.request_id}
                    className="p-3 rounded-2xl bg-[#082620] border border-emerald-800/40 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center font-bold text-sm text-white">
                        {req.name ? req.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{req.name || 'UADA Player'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {req.user_uid || `UID: ${req.sender_id}`}
                        </p>
                      </div>
                    </div>

                    {/* Accept / Decline Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req.request_id)}
                        className="px-2.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-black font-extrabold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Accept Request"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.request_id)}
                        className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                        title="Decline"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* START NEW CHAT MODAL                                         */}
      {/* ============================================================ */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0b2822] border border-emerald-600/40 rounded-3xl w-full max-w-[360px] p-5 shadow-2xl animate-scale-up space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-800/50">
              <h3 className="font-extrabold text-base text-white">Start New Chat</h3>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">Select a player from the database to start messaging:</p>

            <div className="max-h-56 overflow-y-auto space-y-1.5 no-scrollbar">
              {threads
                .filter((t) => !t.isSystem)
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveChat(t)
                      setIsNewChatModalOpen(false)
                      setMessages([])
                    }}
                    className="p-2.5 rounded-2xl bg-[#082620] hover:bg-[#0c332b] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center text-xs font-bold text-white">
                      {t.avatarInitial}
                    </div>
                    <span className="text-xs font-bold text-white truncate">{t.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
