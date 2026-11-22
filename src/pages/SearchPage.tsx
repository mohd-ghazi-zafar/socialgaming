import React, { useState, useMemo } from 'react'
import {
  Search as SearchIcon,
  UserPlus,
  UserCheck,
  MessageSquare,
  Trophy,
  Gamepad2,
  Sparkles,
} from 'lucide-react'
import { VipTag } from '../components/account/StatusBadges'
import { PlayerActionSheet } from '../components/social/PlayerActionSheet'
import type { DirectoryUser } from '../types/contracts'

interface SearchPageProps {
  onStartMessageWithUser?: (user: DirectoryUser) => void
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onStartMessageWithUser,
}) => {
  // Directory Users (Mocked matching backend unique ID format e.g. G-XXXXXX-2026)
  const [users, setUsers] = useState<DirectoryUser[]>([
    {
      id: 'usr-1',
      uniqueId: 'G-646940-2026',
      name: 'Tariq Al-Mansoor',
      avatarUrl: '/logo-cutout.png',
      bio: 'Ludo Grandmaster & Dubai tournament champion.',
      level: 42,
      vipTier: 'vip',
      isFriend: true,
      isOnline: true,
      gamesPlayed: 1240,
      winRate: 68,
      favoriteGame: 'ludo',
    },
    {
      id: 'usr-2',
      uniqueId: 'G-839201-2026',
      name: 'Sara_Chess',
      avatarUrl: '/logo-cutout.png',
      bio: 'Blitz 3+0 rating 1920. Always down for rapid chess.',
      level: 35,
      vipTier: 'diamond',
      isFriend: false,
      isOnline: true,
      gamesPlayed: 850,
      winRate: 72,
      favoriteGame: 'chess',
    },
    {
      id: 'usr-3',
      uniqueId: 'G-119304-2026',
      name: 'Kashif Sarwar',
      avatarUrl: '/logo-cutout.png',
      bio: 'Domino strategist & Jackaroo team captain.',
      level: 28,
      vipTier: 'gold',
      isFriend: false,
      isOnline: false,
      gamesPlayed: 620,
      winRate: 59,
      favoriteGame: 'domino',
    },
    {
      id: 'usr-4',
      uniqueId: 'G-552091-2026',
      name: 'Fahad_Pro',
      avatarUrl: '/logo-cutout.png',
      bio: 'Jackaroo master. Team synergy is everything.',
      level: 19,
      vipTier: 'silver',
      isFriend: false,
      isOnline: true,
      gamesPlayed: 310,
      winRate: 54,
      favoriteGame: 'jackaroo',
    },
  ])

  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null)

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.uniqueId.toLowerCase().includes(q) ||
        u.favoriteGame.toLowerCase().includes(q)
    )
  }, [users, query])

  const handleToggleFriend = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFriend: !u.isFriend } : u))
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Search Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <SearchIcon className="h-4 w-4 text-purple-400" />
          <span>Player Directory & Discovery</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Find contenders by Player Name, Unique UADA ID (e.g. G-646940-2026), or Game.
        </p>

        {/* Search Input */}
        <div className="relative mt-3">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID (G-XXXXXX-2026) or Name..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Found {filteredUsers.length} Players</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Verified Gamers</span>
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
            No players found matching &ldquo;{query}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-900 cursor-pointer shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-xl border border-purple-500/30 overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {user.name}
                      </span>
                      <VipTag tier={user.vipTier} compact />
                    </div>
                    <span className="text-[11px] font-mono text-purple-300/80 block">
                      {user.uniqueId}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Lvl {user.level} • Fav: {user.favoriteGame}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p className="my-2 text-[11px] text-slate-300 line-clamp-1 italic">
                  &ldquo;{user.bio}&rdquo;
                </p>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Gamepad2 className="h-3 w-3" />
                      {user.gamesPlayed}
                    </span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <Trophy className="h-3 w-3 text-amber-400" />
                      {user.winRate}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFriend(user.id)
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
                        user.isFriend
                          ? 'border-slate-700 bg-slate-800 text-slate-300'
                          : 'border-purple-500/40 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white'
                      }`}
                      title={user.isFriend ? 'Friends' : 'Add Friend'}
                    >
                      {user.isFriend ? (
                        <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStartMessageWithUser?.(user)
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600"
                      title="Send Message"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reusable Player Action Sheet / Profile Drawer */}
      <PlayerActionSheet
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onAddFriend={handleToggleFriend}
        onMessage={onStartMessageWithUser}
      />
    </div>
  )
}
