import React, { useState } from 'react'
import { Flame, PartyPopper, Search, Volume2 } from 'lucide-react'
import { FlagUS } from '../components/common/SvgIcons'

interface RoomPageProps {
  onJoinRoom?: (roomId: string) => void
}

interface VoiceRoomItem {
  id: string
  title: string
  subtitle?: string
  avatarText: string
  avatarBg: string
  countryFlag?: React.FC<{ className?: string }>
  pkBadge?: boolean
  tierBadge?: string
  tierColor?: string
  levelTag: string
  listenersCount: number
  isHourlyTop?: boolean
}

export const RoomPage: React.FC<RoomPageProps> = ({ onJoinRoom }) => {
  const [activeFilter, setActiveFilter] = useState<'Recommend' | 'Game' | 'PK' | 'Super Winner'>('Recommend')

  const rooms: VoiceRoomItem[] = [
    {
      id: 'room-1',
      title: 'مثل العصر مره 🌷',
      subtitle: 'فرش عن الجلسات التي هجرتها ..',
      avatarText: '👧',
      avatarBg: 'bg-gradient-to-tr from-amber-700 to-rose-900',
      countryFlag: FlagUS,
      pkBadge: true,
      tierBadge: 'Silver',
      tierColor: 'bg-slate-400 text-slate-900',
      levelTag: 'Lv.23',
      listenersCount: 34,
    },
    {
      id: 'room-2',
      title: 'كتيبة التعناع 🥰❤️',
      avatarText: '🎭',
      avatarBg: 'bg-gradient-to-tr from-slate-900 to-zinc-800',
      levelTag: 'Lv.11',
      listenersCount: 17,
    },
    {
      id: 'room-3',
      title: 'فخر العرب 🦅',
      subtitle: 'لا تهان العصات قبل انتهاء الجولة',
      avatarText: '👑',
      avatarBg: 'bg-gradient-to-tr from-amber-600 to-yellow-800',
      pkBadge: true,
      isHourlyTop: true,
      tierBadge: 'Legend',
      tierColor: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950',
      levelTag: 'Lv.103',
      listenersCount: 38,
    },
    {
      id: 'room-4',
      title: 'بذكر الله تحلم الحياة 🕊️',
      subtitle: 'استمع يامن كشفت عليلك الدنيا ...',
      avatarText: '🕌',
      avatarBg: 'bg-gradient-to-tr from-emerald-950 to-teal-900',
      pkBadge: true,
      levelTag: 'Lv.95',
      listenersCount: 24,
    },
    {
      id: 'room-5',
      title: 'تحديات بنت اب 🥰',
      subtitle: 'هنا الذوق ❤️',
      avatarText: '💃',
      avatarBg: 'bg-gradient-to-tr from-pink-900 to-purple-900',
      countryFlag: FlagUS,
      pkBadge: true,
      tierBadge: 'Silver',
      tierColor: 'bg-slate-400 text-slate-900',
      levelTag: 'Lv.109',
      listenersCount: 21,
    },
  ]

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-[#031914] min-h-screen text-white pb-6">
      {/* Top Bar with Tabs and Quick Actions */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-emerald-950/60 bg-[#06201a]">
        {/* Main Tabs */}
        <div className="flex items-center gap-5 text-sm font-bold">
          <button type="button" className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            Mine
          </button>
          <button type="button" className="relative text-white font-black text-base cursor-pointer">
            Explore
            <span className="absolute -bottom-2 inset-x-0 h-0.5 bg-teal-400 rounded-full" />
          </button>
          <button type="button" className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            Country
          </button>
        </div>

        {/* Right Icon Actions */}
        <div className="flex items-center gap-3">
          <button type="button" className="text-amber-400 hover:scale-110 transition-transform cursor-pointer" title="News">
            <Flame className="w-5 h-5 fill-current" />
          </button>
          <button type="button" className="text-purple-400 hover:scale-110 transition-transform cursor-pointer" title="Party">
            <PartyPopper className="w-5 h-5" />
          </button>
          <button type="button" className="text-slate-300 hover:text-white transition-colors cursor-pointer" title="Search">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Moroccan National Day Promo Event Banner */}
      <div className="p-3">
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-red-900 via-rose-950 to-amber-950 p-4 border border-amber-500/40 shadow-xl flex flex-col justify-between min-h-[110px]">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-black text-amber-200 drop-shadow-md">
                اليوم الوطني المغربي 🇲🇦
              </span>
              <span className="text-[11px] text-amber-300/80 font-bold mt-0.5">
                Moroccan National Celebration Arena
              </span>
            </div>
            <div className="bg-amber-500/20 border border-amber-400/50 rounded-full px-2.5 py-0.5 text-[10px] font-black text-amber-300">
              2026.11.17 - 2026.11.19
            </div>
          </div>
          {/* Subtle Fireworks Dots */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,191,36,0.25)_0,transparent_50%)]" />
        </div>
      </div>

      {/* Room Gifts & Room Tier Quick Actions */}
      <div className="grid grid-cols-2 gap-3 px-3">
        <button
          type="button"
          onClick={() => alert('Opening Room Gifts Showcase')}
          className="bg-[#0b2721] hover:bg-[#0f342c] active:scale-98 border border-emerald-800/40 rounded-xl p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🌻</span>
            <span className="text-xs font-bold text-white">Room Gifts</span>
          </div>
          <span className="w-6 h-6 rounded-lg bg-teal-900/60 flex items-center justify-center text-xs">🎁</span>
        </button>

        <button
          type="button"
          onClick={() => alert('Opening Room Tier Benefits')}
          className="bg-[#0b2721] hover:bg-[#0f342c] active:scale-98 border border-emerald-800/40 rounded-xl p-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="text-xs font-bold text-white">Room Tier</span>
          </div>
          <span className="w-6 h-6 rounded-lg bg-amber-900/60 flex items-center justify-center text-xs">👑</span>
        </button>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-2 overflow-x-auto no-scrollbar">
        {(['Recommend', 'Game', 'PK', 'Super Winner'] as const).map((filter) => {
          const isActive = activeFilter === filter
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-400 text-[#04241d] font-extrabold shadow-sm'
                  : 'bg-[#0a231e] text-slate-300 hover:text-white border border-emerald-900/30'
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>

      {/* Voice Room Cards List */}
      <div className="space-y-2.5 px-3 pt-2">
        {rooms.map((room) => {
          const Flag = room.countryFlag

          return (
            <div
              key={room.id}
              onClick={() => onJoinRoom?.(room.id)}
              className={`w-full rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.99] shadow-md ${
                room.isHourlyTop
                  ? 'bg-gradient-to-r from-amber-950/80 via-[#172017] to-amber-950/80 border border-amber-500/60 shadow-amber-950/40'
                  : 'bg-[#09221d]/90 hover:bg-[#0d2d27] border border-emerald-800/30'
              }`}
            >
              {/* Left Column: Avatar & Room Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <div className={`w-12 h-12 rounded-2xl ${room.avatarBg} flex items-center justify-center text-2xl shadow-inner shrink-0 ring-1 ring-white/10`}>
                  {room.avatarText}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  {/* Title Row with Flag and PK */}
                  <div className="flex items-center gap-1.5">
                    {Flag && <Flag className="w-4 h-3 rounded-xs shrink-0" />}
                    <span className="text-[13px] font-black text-white truncate leading-tight">
                      {room.title}
                    </span>
                    {room.pkBadge && (
                      <span className="bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-sm shadow-xs shrink-0">
                        PK
                      </span>
                    )}
                  </div>

                  {/* Subtitle if available */}
                  {room.subtitle && (
                    <span className="text-[11px] text-slate-300 truncate">
                      {room.subtitle}
                    </span>
                  )}

                  {/* Badges Row */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    {room.tierBadge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${room.tierColor}`}>
                        {room.tierBadge}
                      </span>
                    )}
                    <span className="bg-[#6b21a8]/80 text-amber-200 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      {room.levelTag}
                    </span>
                    {room.isHourlyTop && (
                      <span className="bg-amber-500 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                        Hourly Top 1
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Audio Waves & Listener Count */}
              <div className="flex items-center gap-1.5 text-teal-300 font-extrabold text-xs shrink-0 bg-[#061b17] px-2 py-1 rounded-lg border border-teal-800/30">
                <Volume2 className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span>{room.listenersCount}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
