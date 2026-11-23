import React, { useState, useEffect } from 'react'
import { Search, UserPlus, Send } from 'lucide-react'
import { viewAllUsers, getAuthToken, getStoredAuth, normalizeImageUrl } from '../services/api'
import { FlagEG, FlagSA } from '../components/common/SvgIcons'

interface ChatThread {
  id: string
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

export const MessagesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([])

  // Load real users from database as message contacts
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
          const userThreads: ChatThread[] = res.users
            .filter((u: any) => u.user_uid !== currentUid)
            .map((u: any, idx: number) => {
              const initial = u.name ? u.name.trim().charAt(0).toUpperCase() : 'U'
              const avatarImg = normalizeImageUrl(u.profile_image)
              const isMale = u.gender === 'male'

              return {
                id: `chat-${u.user_uid}`,
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

          // Add official system channel at the top
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
  }, [])

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
  }

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-[#031914] min-h-screen text-white pb-6 flex flex-col">
      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-emerald-950/60 bg-[#06201a]">
        <h1 className="text-xl font-black text-white tracking-tight">Message</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert('Add friend via User ID in Search')}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Add Friend"
          >
            <UserPlus className="w-5 h-5" />
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
                  setMessages([])
                }}
                className="px-4 py-3 hover:bg-[#082620] active:bg-[#061e19] transition-colors cursor-pointer flex items-center justify-between"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div className={`relative w-12 h-12 rounded-full ${thread.avatarBg} flex items-center justify-center text-lg font-black text-white shrink-0 overflow-hidden shadow-inner ring-1 ring-white/10`}>
                    {thread.avatarImage ? (
                      <img src={thread.avatarImage} alt={thread.name} className="w-full h-full object-cover" />
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
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${thread.badgeBg}`}>
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

      {/* Realtime Chat Popup Modal */}
      {activeChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-[#07241e] border-t border-emerald-600/40 rounded-t-3xl w-full max-w-[471px] h-[70vh] flex flex-col shadow-2xl animate-slide-up">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-emerald-900/60 flex items-center justify-between bg-[#051c17] rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-900 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                  {activeChat.avatarImage ? (
                    <img src={activeChat.avatarImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{activeChat.avatarInitial}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">{activeChat.name}</h3>
                  <p className="text-[10px] text-emerald-400">Direct Message Channel</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveChat(null)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-[#0a2e26] rounded-full"
              >
                Close
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
              <div className="text-center text-[11px] text-slate-500 my-2">
                Conversation started with {activeChat.name}
              </div>

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.sender === 'me' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs ${
                      m.sender === 'me'
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-black font-semibold'
                        : 'bg-[#0e3b31] text-white'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-emerald-900/60 flex items-center gap-2 bg-[#051c17]">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Message ${activeChat.name}...`}
                className="flex-1 bg-[#092b23] border border-emerald-800/40 rounded-full px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-teal-400 text-[#041d18] flex items-center justify-center hover:bg-teal-300 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
