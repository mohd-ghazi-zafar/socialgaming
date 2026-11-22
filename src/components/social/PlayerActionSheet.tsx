import React, { useState } from 'react'
import {
  X,
  UserPlus,
  UserCheck,
  MessageSquare,
  ShieldAlert,
  Ban,
  Copy,
  Check,
  Gamepad2,
  Trophy,
} from 'lucide-react'
import { VipTag } from '../account/StatusBadges'
import type { DirectoryUser } from '../../types/contracts'

interface PlayerActionSheetProps {
  user: DirectoryUser | null
  isOpen: boolean
  onClose: () => void
  onAddFriend?: (userId: string) => void
  onMessage?: (user: DirectoryUser) => void
  onReport?: (userId: string, reason: string) => void
  onBlock?: (userId: string) => void
}

export const PlayerActionSheet: React.FC<PlayerActionSheetProps> = ({
  user,
  isOpen,
  onClose,
  onAddFriend,
  onMessage,
  onReport,
  onBlock,
}) => {
  const [copiedId, setCopiedId] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'stats'>('profile')
  const [safetyAction, setSafetyAction] = useState<'report' | 'block' | null>(null)
  const [reportReason, setReportReason] = useState('Abusive text / hate speech')

  if (!isOpen || !user) return null

  const handleCopyId = () => {
    navigator.clipboard?.writeText(user.uniqueId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleConfirmReport = () => {
    onReport?.(user.id, reportReason)
    setSafetyAction(null)
    onClose()
  }

  const handleConfirmBlock = () => {
    onBlock?.(user.id)
    setSafetyAction(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
        {/* Top Handle / Close */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                user.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-400">
              {user.isOnline ? 'Online Now' : 'Offline'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Safety Dialog Mode */}
        {safetyAction === 'report' ? (
          <div className="py-4 space-y-3">
            <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Report Player: {user.name}</span>
            </h4>
            <p className="text-xs text-slate-400">
              Select reason for violation report to UADA Security telemetry:
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option value="Abusive text / hate speech">Abusive text / hate speech</option>
              <option value="Suspected bot / macro script">Suspected bot / macro script</option>
              <option value="Voice channel harassment">Voice channel harassment</option>
              <option value="Table stall / intentional AFK">Table stall / intentional AFK</option>
            </select>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSafetyAction(null)}
                className="flex-1 rounded-xl border border-slate-700 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-500"
              >
                Submit Report
              </button>
            </div>
          </div>
        ) : safetyAction === 'block' ? (
          <div className="py-4 space-y-3">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Ban className="h-4 w-4" />
              <span>Block Player: {user.name}?</span>
            </h4>
            <p className="text-xs text-slate-400">
              Blocked players cannot send you direct messages, invite you to tables, or comment on your moments.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSafetyAction(null)}
                className="flex-1 rounded-xl border border-slate-700 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlock}
                className="flex-1 rounded-xl bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-500"
              >
                Confirm Block
              </button>
            </div>
          </div>
        ) : (
          /* Normal User Profile Content */
          <>
            <div className="my-4 flex items-center gap-3.5">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-purple-500/40 bg-slate-800">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white truncate">
                    {user.name}
                  </h3>
                  <VipTag tier={user.vipTier} compact />
                </div>

                {/* UADA ID Pill with Copy */}
                <button
                  onClick={handleCopyId}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/70 px-2 py-0.5 text-xs font-mono text-purple-300 hover:border-purple-500/40 transition-colors"
                  title="Click to copy ID"
                >
                  <span>{user.uniqueId}</span>
                  {copiedId ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-60" />
                  )}
                </button>
              </div>
            </div>

            {/* Sub Tabs: Profile vs Stats */}
            <div className="flex items-center border-b border-slate-800 text-xs font-semibold text-slate-400">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                  activeTab === 'profile'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2 text-center transition-colors border-b-2 ${
                  activeTab === 'stats'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                Game Record
              </button>
            </div>

            {/* Tab Body */}
            {activeTab === 'profile' ? (
              <div className="py-3 text-xs text-slate-300 space-y-2">
                <p className="italic text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  &ldquo;{user.bio || 'Casual gamer climbing the ranks on UADA.'}&rdquo;
                </p>
                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>Level {user.level} Contender</span>
                  <span className="capitalize">Fav: {user.favoriteGame}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 py-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                    <Gamepad2 className="h-3.5 w-3.5" />
                    <span>Games</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {user.gamesPlayed}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mb-1">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>Win Rate</span>
                  </div>
                  <span className="text-sm font-bold text-amber-300">
                    {user.winRate}%
                  </span>
                </div>
              </div>
            )}

            {/* Main Action Bar */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => onAddFriend?.(user.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                  user.isFriend
                    ? 'border-slate-700 bg-slate-800 text-slate-300'
                    : 'border-purple-500/40 bg-purple-600 text-white hover:bg-purple-500'
                }`}
              >
                {user.isFriend ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Friends</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Add Friend</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onMessage?.(user)
                  onClose()
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-bold text-slate-200 hover:border-slate-600 hover:bg-slate-700 transition-all"
              >
                <MessageSquare className="h-4 w-4 text-purple-400" />
                <span>Message</span>
              </button>
            </div>

            {/* Safety Actions */}
            <div className="mt-3 flex items-center justify-end gap-3 pt-2 border-t border-slate-800/60 text-xs">
              <button
                onClick={() => setSafetyAction('report')}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Report</span>
              </button>
              <button
                onClick={() => setSafetyAction('block')}
                className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Block</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
