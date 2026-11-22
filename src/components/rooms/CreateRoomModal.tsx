import React, { useState } from 'react'
import { X, Lock, Unlock, Mic, MicOff, Users, Coins, AlertCircle } from 'lucide-react'
import type { CreateRoomConfig, GameType } from '../../types/contracts'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateRoom: (config: CreateRoomConfig) => void
  defaultGame?: GameType
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  defaultGame = 'ludo',
}) => {
  const [title, setTitle] = useState('High Rollers Lounge')
  const [gameType, setGameType] = useState<GameType>(defaultGame)
  const [maxSeats, setMaxSeats] = useState<5 | 6 | 8 | 10>(6)
  const [isPrivate, setIsPrivate] = useState(false)
  const [pin, setPin] = useState('')
  const [enableVoice, setEnableVoice] = useState(true)
  const [minStake, setMinStake] = useState(500)
  const [validationError, setValidationError] = useState('')

  if (!isOpen) return null

  const games: { id: GameType; name: string }[] = [
    { id: 'ludo', name: 'Ludo Classic' },
    { id: 'chess', name: 'Chess Master' },
    { id: 'domino', name: 'Domino Pro' },
    { id: 'jackaroo', name: 'Jackaroo Arena' },
  ]

  const seatOptions: (5 | 6 | 8 | 10)[] = [5, 6, 8, 10]
  const stakeOptions = [100, 500, 1000, 2500, 5000]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!title.trim()) {
      setValidationError('Please provide a room title')
      return
    }

    if (isPrivate) {
      if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setValidationError('Private rooms require a 4-digit numeric PIN')
        return
      }
    }

    onCreateRoom({
      title: title.trim(),
      gameType,
      maxSeats,
      isPrivate,
      pin: isPrivate ? pin : undefined,
      enableVoice,
      minStake,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Private Room</h3>
              <p className="text-[11px] text-slate-400">Configure table rules and access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {validationError && (
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Room Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Room Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              placeholder="e.g. VIP Championship"
            />
          </div>

          {/* Game Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Game Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {games.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGameType(g.id)}
                  className={`rounded-lg border p-2 text-xs font-bold transition-all ${
                    gameType === g.id
                      ? 'border-purple-500 bg-purple-600/20 text-purple-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Seat Capacity (5 - 10 seats) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Seat Capacity (5–10 Players)
            </label>
            <div className="flex items-center gap-2">
              {seatOptions.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setMaxSeats(s)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-all ${
                    maxSeats === s
                      ? 'border-cyan-500 bg-cyan-600/20 text-cyan-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {s} Seats
                </button>
              ))}
            </div>
          </div>

          {/* Stakes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Minimum Table Stake
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {stakeOptions.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setMinStake(amt)}
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                    minStake === amt
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Coins className="h-3 w-3 text-amber-400" />
                  <span>{amt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Voice Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Voice Chat Toggle */}
            <button
              type="button"
              onClick={() => setEnableVoice(!enableVoice)}
              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium transition-all ${
                enableVoice
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {enableVoice ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <span>Voice Chat</span>
              </div>
              <span className="font-bold">{enableVoice ? 'ON' : 'OFF'}</span>
            </button>

            {/* PIN Lock Toggle */}
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium transition-all ${
                isPrivate
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                <span>PIN Code</span>
              </div>
              <span className="font-bold">{isPrivate ? 'LOCKED' : 'OPEN'}</span>
            </button>
          </div>

          {/* 4-digit PIN input if private */}
          {isPrivate && (
            <div className="animate-in fade-in duration-100">
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Enter 4-Digit Table PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-lg font-mono rounded-xl border border-amber-500/40 bg-slate-950 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl border border-purple-500/40 bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-500 active:scale-98 transition-all shadow-md"
            >
              Initialize Table & Launch
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
