import React from 'react'
import {
  Lock,
  Mic,
  MicOff,
  Users,
  Coins,
  Shield,
  Play,
  Eye,
} from 'lucide-react'
import type { RoomCardData, GameType } from '../../types/contracts'

interface RoomCardProps {
  room: RoomCardData
  onJoin: (room: RoomCardData) => void
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin }) => {
  const getGameLabel = (type: GameType) => {
    switch (type) {
      case 'ludo':
        return 'Ludo Classic'
      case 'chess':
        return 'Chess Master'
      case 'domino':
        return 'Domino Pro'
      case 'jackaroo':
        return 'Jackaroo Arena'
    }
  }

  const getGameBadgeColor = (type: GameType) => {
    switch (type) {
      case 'ludo':
        return 'border-rose-500/30 bg-rose-500/10 text-rose-300'
      case 'chess':
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
      case 'domino':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      case 'jackaroo':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-300'
    }
  }

  const isFull = room.currentSeats >= room.maxSeats
  const fillPercent = Math.min(100, Math.round((room.currentSeats / room.maxSeats) * 100))

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-900 shadow-sm">
      {/* Top Header: Game Tag & Privacy / Voice Indicators */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${getGameBadgeColor(
            room.gameType
          )}`}
        >
          {getGameLabel(room.gameType)}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {/* Voice Indicator */}
          {room.hasVoice ? (
            <span
              className="flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] text-emerald-300 font-medium"
              title="WebRTC Voice Chat Active"
            >
              <Mic className="h-3 w-3 text-emerald-400" />
              <span>Voice</span>
            </span>
          ) : (
            <span
              className="flex items-center rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400"
              title="Voice Chat Disabled"
            >
              <MicOff className="h-3 w-3" />
            </span>
          )}

          {/* PIN Lock Indicator */}
          {room.isPrivate && (
            <span
              className="flex items-center gap-0.5 rounded bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 text-[10px] text-amber-300 font-medium"
              title="PIN Protected Table"
            >
              <Lock className="h-3 w-3 text-amber-400" />
              <span>PIN</span>
            </span>
          )}
        </div>
      </div>

      {/* Room Title & Host Info */}
      <div className="my-2.5">
        <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
          {room.title}
        </h4>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <div className="h-4 w-4 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-[9px] font-bold text-slate-200">
            {room.hostAvatar ? (
              <img
                src={room.hostAvatar}
                alt={room.hostName}
                className="h-full w-full object-cover"
              />
            ) : (
              room.hostName.charAt(0)
            )}
          </div>
          <span className="truncate">Host: {room.hostName}</span>
        </div>
      </div>

      {/* Capacity Meter (5-10 seats) & Stake */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">
              {room.currentSeats} / {room.maxSeats} Seats
            </span>
          </div>

          {room.minStake !== undefined && (
            <div className="flex items-center gap-1 text-amber-300 font-semibold">
              <Coins className="h-3 w-3 text-amber-400" />
              <span>{room.minStake.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isFull ? 'bg-rose-500' : 'bg-purple-500'
            }`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom Action: Join / Spectate */}
      <div className="mt-3 flex items-center justify-between gap-2">
        {room.userRole && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase">
            <Shield className="h-3 w-3 text-purple-400" />
            <span>Role: {room.userRole}</span>
          </span>
        )}

        <button
          onClick={() => onJoin(room)}
          className={`ml-auto flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            isFull
              ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
              : 'border border-purple-500/40 bg-purple-600 text-white hover:bg-purple-500 active:scale-95 shadow-sm'
          }`}
        >
          {isFull ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Spectate</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Join Table</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
