import React, { useState } from 'react'
import { Search, UserPlus, MessageSquarePlus, Bell, Check } from 'lucide-react'
import { FlagEG } from '../components/common/SvgIcons'

interface ChatThread {
  id: string
  name: string
  avatarText?: string
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

  const threads: ChatThread[] = [
    {
      id: 'thread-1',
      name: '...دي_ياخاك',
      countryFlag: FlagEG,
      badgeText: 'Tribe Group',
      badgeBg: 'bg-blue-600/30 text-blue-300 border border-blue-500/40',
      avatarText: '🧔',
      avatarBg: 'bg-gradient-to-tr from-slate-800 to-zinc-700',
      lastMessage: 'Welcome to the tribe chat, منعم الشوري ...',
      timestamp: '10:40',
    },
    {
      id: 'thread-2',
      name: 'System Information',
      avatarText: '🔔',
      avatarBg: 'bg-gradient-to-tr from-teal-500 to-emerald-600',
      lastMessage: 'The tribe rocket has been launched! Check your clan inventory.',
      timestamp: '00:09',
      unreadCount: 3,
      isSystem: true,
    },
    {
      id: 'thread-3',
      name: 'Brother Of Martyrs 🤍🥀',
      avatarText: '👨',
      avatarBg: 'bg-gradient-to-tr from-rose-900 to-amber-950',
      lastMessage: 'How a re tou doing',
      timestamp: '11-20',
    },
  ]

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-[#031914] min-h-screen text-white pb-6">
      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-emerald-950/60 bg-[#06201a]">
        <h1 className="text-xl font-black text-white tracking-tight">Message</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert('Add New Friend')}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Add Friend"
          >
            <UserPlus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => alert('Create Group Chat')}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Create Group"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3">
        <div className="flex items-center gap-2 bg-[#08231e] border border-emerald-800/40 rounded-full px-3 py-1.5 shadow-inner">
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

      {/* Sync Status Badge */}
      <div className="px-4 pb-2 flex items-center gap-1.5 text-xs text-slate-400">
        <Check className="w-3.5 h-3.5 text-teal-400" />
        <span>Chats restored</span>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-emerald-950/40">
        {filteredThreads.map((thread) => {
          const Flag = thread.countryFlag

          return (
            <div
              key={thread.id}
              onClick={() => alert(`Opening chat with ${thread.name}`)}
              className="px-4 py-3 flex items-center justify-between hover:bg-[#07241e] active:bg-[#0a2f27] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full ${thread.avatarBg} flex items-center justify-center text-xl shadow-md shrink-0 ring-1 ring-white/10`}
                >
                  {thread.isSystem ? <Bell className="w-6 h-6 text-[#041d18]" /> : thread.avatarText}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  {/* Name and Tags */}
                  <div className="flex items-center gap-1.5">
                    {Flag && <Flag className="w-4 h-3 rounded-xs shrink-0" />}
                    <span className="text-[13px] font-bold text-white truncate">
                      {thread.name}
                    </span>
                    {thread.badgeText && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${thread.badgeBg} shrink-0`}>
                        {thread.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Last message preview */}
                  <span className="text-xs text-slate-400 truncate">
                    {thread.lastMessage}
                  </span>
                </div>
              </div>

              {/* Timestamp & Unread Badge */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">
                  {thread.timestamp}
                </span>
                {thread.unreadCount && (
                  <span className="min-w-[18px] h-4 px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-sm">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
