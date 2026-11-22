import React, { useState, useMemo } from 'react'
import {
  Search,
  Users,
  Send,
  PlusCircle,
  CheckCheck,
  Check,
  X,
  ArrowLeft,
  Circle,
} from 'lucide-react'
import type { ConversationItem, ChatMessage } from '../types/contracts'

export const MessagesPage: React.FC = () => {
  // Mock conversations wired to typed contract
  const [conversations, setConversations] = useState<ConversationItem[]>([
    {
      id: 'conv-1',
      type: 'direct',
      name: 'Tariq Al-Mansoor',
      avatarUrl: '/logo-cutout.png',
      lastMessage: 'Are you ready for the 1000 coin Ludo table?',
      lastMessageTime: '12:45 PM',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 'conv-2',
      type: 'group',
      name: 'Dubai Jackaroo Syndicate',
      avatarUrl: '/logo-cutout.png',
      lastMessage: 'Sultan: Let’s host a 10-player room tonight',
      lastMessageTime: '11:10 AM',
      unreadCount: 0,
      memberCount: 8,
    },
    {
      id: 'conv-3',
      type: 'direct',
      name: 'Sara_Chess',
      avatarUrl: '/logo-cutout.png',
      lastMessage: 'Rematch pending on table #104 ♟️',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: false,
    },
  ])

  // Active chat thread messages
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({
    'conv-1': [
      {
        id: 'm-1',
        conversationId: 'conv-1',
        senderId: 'tariq-1',
        senderName: 'Tariq Al-Mansoor',
        senderAvatar: '/logo-cutout.png',
        text: 'Assalamu alaikum! GGs in the tournament earlier.',
        timestamp: '12:40 PM',
        isSelf: false,
        status: 'read',
      },
      {
        id: 'm-2',
        conversationId: 'conv-1',
        senderId: 'self',
        senderName: 'You',
        senderAvatar: '/logo-cutout.png',
        text: 'Wa alaikum assalam! You played great defense.',
        timestamp: '12:42 PM',
        isSelf: true,
        status: 'read',
      },
      {
        id: 'm-3',
        conversationId: 'conv-1',
        senderId: 'tariq-1',
        senderName: 'Tariq Al-Mansoor',
        senderAvatar: '/logo-cutout.png',
        text: 'Are you ready for the 1000 coin Ludo table?',
        timestamp: '12:45 PM',
        isSelf: false,
        status: 'delivered',
      },
    ],
  })

  const [activeConvId, setActiveConvId] = useState<string | null>('conv-1')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  const activeConversation = conversations.find((c) => c.id === activeConvId)
  const currentMessages = activeConvId ? messagesMap[activeConvId] || [] : []

  // Send message handler (sanitizes text, updates real-time thread)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = messageInput.trim()
    if (!clean || !activeConvId) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: activeConvId,
      senderId: 'self',
      senderName: 'You',
      senderAvatar: '/logo-cutout.png',
      text: clean,
      timestamp: 'Just now',
      isSelf: true,
      status: 'sent',
    }

    setMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }))

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, lastMessage: clean, lastMessageTime: 'Just now', unreadCount: 0 }
          : c
      )
    )

    setMessageInput('')
  }

  // Create Group Handler
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = newGroupName.trim()
    if (!clean) return

    const newGroup: ConversationItem = {
      id: `grp-${Date.now()}`,
      type: 'group',
      name: clean,
      avatarUrl: '/logo-cutout.png',
      lastMessage: 'Group created. Welcome everyone!',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      memberCount: 1,
    }

    setConversations([newGroup, ...conversations])
    setActiveConvId(newGroup.id)
    setNewGroupName('')
    setIsCreateGroupOpen(false)
  }

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[680px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      {/* Left Column: Conversations List */}
      <div
        className={`w-full md:w-80 flex-col border-r border-slate-800 bg-slate-950/60 ${
          activeConvId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header & Create Group Trigger */}
        <div className="flex items-center justify-between border-b border-slate-800 p-3.5">
          <h3 className="text-base font-bold text-white">Messages</h3>
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all"
            title="Create New Group"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Group</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat or friends..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.id === activeConvId
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-600/15 border-l-2 border-purple-500'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                    />
                    {c.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {c.lastMessageTime}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                      {c.lastMessage}
                    </p>
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-500 px-1 text-[10px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Thread (or Empty View) */}
      <div
        className={`flex-1 flex-col bg-slate-900 ${
          activeConvId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4 bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <img
                  src={activeConversation.avatarUrl}
                  alt={activeConversation.name}
                  className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {activeConversation.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    {activeConversation.type === 'group' ? (
                      <span>{activeConversation.memberCount || 2} members</span>
                    ) : activeConversation.isOnline ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Circle className="h-1.5 w-1.5 fill-current" /> Online
                      </span>
                    ) : (
                      <span>Offline</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.isSelf ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                      m.isSelf
                        ? 'bg-purple-600 text-white rounded-br-sm'
                        : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {!m.isSelf && activeConversation.type === 'group' && (
                      <span className="block text-[10px] font-bold text-purple-300 mb-0.5">
                        {m.senderName}
                      </span>
                    )}
                    <p className="break-words">{m.text}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 px-1">
                    <span>{m.timestamp}</span>
                    {m.isSelf &&
                      (m.status === 'read' ? (
                        <CheckCheck className="h-3 w-3 text-cyan-400" />
                      ) : (
                        <Check className="h-3 w-3" />
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-slate-800 p-3 bg-slate-950/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                maxLength={300}
                className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white disabled:opacity-40 hover:bg-purple-500 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500 text-xs">
            <Users className="h-10 w-10 text-slate-700 mb-2" />
            <p className="font-semibold text-slate-400">Select a conversation</p>
            <p className="mt-1">Connect with friends, team members, or room hosts.</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-white">New Gaming Group</span>
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="mt-3 space-y-3">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group title (e.g. Ludo Squad)"
                maxLength={25}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="flex-1 rounded-xl border border-slate-700 py-1.5 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="flex-1 rounded-xl bg-purple-600 py-1.5 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
