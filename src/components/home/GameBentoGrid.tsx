import React from 'react'
import { Play, Users, Sparkles } from 'lucide-react'
import type { GameType } from '../../types/contracts'

interface GameItem {
  id: GameType
  title: string
  subtitle: string
  activePlayers: string
  badge?: string
  accentColor: string
  borderColor: string
  posterUrl: string
}

interface GameBentoGridProps {
  onSelectGame: (game: GameType) => void
  onQuickMatch: (game: GameType) => void
}

export const GameBentoGrid: React.FC<GameBentoGridProps> = ({
  onSelectGame,
  onQuickMatch,
}) => {
  const games: GameItem[] = [
    {
      id: 'ludo',
      title: 'Ludo Classic',
      subtitle: '2–4 Players • Roll & Race',
      activePlayers: '14.2K Online',
      badge: 'HOT',
      accentColor: 'from-rose-950/70 via-slate-900 to-slate-950',
      borderColor: 'border-rose-500/30 hover:border-rose-500/60',
      posterUrl: '/game-board-illustration.png',
    },
    {
      id: 'domino',
      title: 'Domino Pro',
      subtitle: 'Draw & Block • Tactical',
      activePlayers: '8.9K Online',
      accentColor: 'from-amber-950/70 via-slate-900 to-slate-950',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60',
      posterUrl: '/game-board-illustration.png',
    },
    {
      id: 'chess',
      title: 'Chess Master',
      subtitle: '1v1 Blitz • ELO Ranked',
      activePlayers: '5.4K Online',
      accentColor: 'from-cyan-950/70 via-slate-900 to-slate-950',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/60',
      posterUrl: '/game-board-illustration.png',
    },
    {
      id: 'jackaroo',
      title: 'Jackaroo Arena',
      subtitle: '4-Player Board Cards',
      activePlayers: '11.8K Online',
      badge: 'FEATURED',
      accentColor: 'from-purple-950/70 via-slate-900 to-slate-950',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      posterUrl: '/game-board-illustration.png',
    },
  ]

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
          <span>Featured Games</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-normal">
            Authoritative Matchmaking
          </span>
        </h3>
      </div>

      {/* 4-Game Bento Grid: 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {games.map((g) => (
          <div
            key={g.id}
            onClick={() => onSelectGame(g.id)}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border ${g.borderColor} bg-gradient-to-b ${g.accentColor} p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm cursor-pointer`}
          >
            {/* Top Row: Badge & Online count */}
            <div className="flex items-center justify-between gap-1 z-10">
              {g.badge ? (
                <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-400/40 bg-amber-400/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  {g.badge}
                </span>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <Users className="h-3 w-3 text-slate-500" />
                <span>{g.activePlayers}</span>
              </div>
            </div>

            {/* Middle Preview Artwork Container (Vertical Ratio) */}
            <div className="my-3 flex items-center justify-center py-2">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-slate-950/50 border border-slate-800/80 p-1 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <img
                  src={g.posterUrl}
                  alt={g.title}
                  className="h-full w-full object-contain drop-shadow"
                />
              </div>
            </div>

            {/* Game Title & Subtitle */}
            <div className="z-10">
              <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                {g.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {g.subtitle}
              </p>
            </div>

            {/* Quick Launch CTA Button */}
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between z-10">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Find Match
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickMatch(g.id)
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-500 active:scale-95 transition-all shadow-sm"
                title={`Quick launch ${g.title}`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
