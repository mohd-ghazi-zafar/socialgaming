import React, { useState } from 'react'
import {
  Settings,
  Share2,
  ShoppingBag,
  CreditCard,
  Crown,
  Volume2,
  Mic,
  Bell,
  LogOut,
  Edit3,
  Check,
  Copy,
  Coins,
  X,
} from 'lucide-react'
import { VipTag } from '../components/account/StatusBadges'
import type { VipTier, ShopItem } from '../types/contracts'

interface AccountPageProps {
  user: {
    name?: string
    user_uid?: string
    unique_id?: string
    email?: string
    phone_number?: string
    role?: string
  } | null
  coins: number
  gems?: number
  onTopUpCoins?: (amount: number) => void
  onLogout?: () => void
}

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  coins,
  onTopUpCoins,
  onLogout,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [nickname, setNickname] = useState(user?.name || 'Kashif Sarwar')
  const [bio, setBio] = useState('High stakes Ludo & Jackaroo player.')
  const [copiedId, setCopiedId] = useState(false)

  // Sub-drawers: 'wallet' | 'shop' | 'vip' | 'settings' | null
  const [activeDrawer, setActiveDrawer] = useState<'wallet' | 'shop' | 'vip' | 'settings' | null>(
    null
  )

  // Settings State
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [voiceMicActive, setVoiceMicActive] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const uniqueId = user?.user_uid || user?.unique_id || 'G-646940-2026'
  const vipTier: VipTier = 'vip'

  const handleCopyId = () => {
    navigator.clipboard?.writeText(uniqueId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // Shop Items (mocked typed data)
  const shopItems: ShopItem[] = [
    {
      id: 'coin-pack-1',
      name: 'Pouch of 10,000 Coins',
      category: 'coins',
      amount: 10000,
      realCurrencyPrice: '$1.99',
      icon: '💰',
      popular: true,
    },
    {
      id: 'skin-dice-gold',
      name: 'Gilded Royal Gold Dice',
      category: 'dice_skin',
      priceCoins: 5000,
      icon: '🎲',
    },
    {
      id: 'frame-neon-cyan',
      name: 'Cyberpunk Diamond Frame',
      category: 'avatar_frame',
      priceGems: 80,
      icon: '🖼️',
    },
  ]

  // Invite friends handler
  const handleInviteFriends = () => {
    const inviteUrl = window.location.origin
    if (navigator.share) {
      navigator.share({
        title: 'Join me on UADA Social Gaming!',
        text: `Play Ludo, Chess & Domino with me! Use my referral ID: ${uniqueId}`,
        url: inviteUrl,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(
        `Join me on UADA Social Gaming! Referral ID: ${uniqueId} - ${inviteUrl}`
      )
      alert('Referral invite link copied to clipboard!')
    }
  }

  return (
    <div className="w-full space-y-4 max-w-lg mx-auto">
      {/* 1. VIP Profile Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/60 via-slate-900 to-slate-950 p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative h-16 w-16 rounded-2xl border-2 border-purple-500/50 bg-slate-800 overflow-hidden shadow-md">
              <img
                src="/logo-cutout.png"
                alt="Profile Avatar"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {nickname}
                </h3>
                <VipTag tier={vipTier} compact />
              </div>

              {/* UADA Unique ID Pill */}
              <button
                onClick={handleCopyId}
                className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-purple-500/30 bg-slate-950/80 px-2 py-0.5 text-xs font-mono text-purple-300 hover:border-purple-400"
                title="Copy UADA ID"
              >
                <span>{uniqueId}</span>
                {copiedId ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 opacity-60" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
            title="Edit Profile"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>

        {/* Bio Preview or Inline Edit */}
        {isEditingProfile ? (
          <div className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-xs">
            <label className="text-[11px] font-semibold text-slate-400">Edit Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white text-xs"
            />
            <label className="text-[11px] font-semibold text-slate-400">Edit Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white text-xs"
            />
            <button
              onClick={() => setIsEditingProfile(false)}
              className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white"
            >
              Save Profile
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-300 italic border-t border-slate-800/60 pt-2.5">
            &ldquo;{bio}&rdquo;
          </p>
        )}

        {/* Quick Wallet Summary Pill */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300">Balance:</span>
            <span className="text-xs font-bold text-amber-300 tabular-nums">
              {coins.toLocaleString()} Coins
            </span>
          </div>

          <button
            onClick={() => setActiveDrawer('wallet')}
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
          >
            + Top Up
          </button>
        </div>
      </div>

      {/* 2. Menu Navigation Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveDrawer('wallet')}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-left hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Wallet & Ledger</h4>
            <p className="text-[10px] text-slate-400">Deposit & Payouts</p>
          </div>
        </button>

        <button
          onClick={() => setActiveDrawer('shop')}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-left hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">UADA Shop</h4>
            <p className="text-[10px] text-slate-400">Skins & Avatars</p>
          </div>
        </button>

        <button
          onClick={() => setActiveDrawer('vip')}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-left hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Crown className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">VIP Status</h4>
            <p className="text-[10px] text-slate-400">Tier Privileges</p>
          </div>
        </button>

        <button
          onClick={handleInviteFriends}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-left hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Share2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Invite Friends</h4>
            <p className="text-[10px] text-slate-400">Earn 5,000 Coins</p>
          </div>
        </button>
      </div>

      {/* 3. Settings & Account Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-400" />
          <span>System & Hardware Settings</span>
        </h4>

        <div className="space-y-2 text-xs divide-y divide-slate-800/60">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Volume2 className="h-4 w-4 text-purple-400" />
              <span>Sound Effects & Ambience</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`h-5 w-9 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'left-4' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Mic className="h-4 w-4 text-emerald-400" />
              <span>WebRTC Mic Sensitivity</span>
            </div>
            <button
              onClick={() => setVoiceMicActive(!voiceMicActive)}
              className={`h-5 w-9 rounded-full transition-colors relative ${
                voiceMicActive ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  voiceMicActive ? 'left-4' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Bell className="h-4 w-4 text-amber-400" />
              <span>Table & Match Notifications</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`h-5 w-9 rounded-full transition-colors relative ${
                notificationsEnabled ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'left-4' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {/* Sub Drawer: Wallet / Shop / VIP */}
      {activeDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white capitalize">
                {activeDrawer === 'wallet' && 'Coins Top-Up & Wallet'}
                {activeDrawer === 'shop' && 'UADA Items Shop'}
                {activeDrawer === 'vip' && 'VIP Rewards & Perks'}
              </h3>
              <button
                onClick={() => setActiveDrawer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Wallet Content */}
            {activeDrawer === 'wallet' && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-400">
                  Select a coin tier to top-up your authoritative balance:
                </p>
                <div className="space-y-2">
                  {[
                    { coins: 5000, price: '$0.99' },
                    { coins: 15000, price: '$2.99' },
                    { coins: 50000, price: '$7.99' },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">
                          {p.coins.toLocaleString()} Coins
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          onTopUpCoins?.(p.coins)
                          alert(`Added ${p.coins.toLocaleString()} Coins!`)
                          setActiveDrawer(null)
                        }}
                        className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-400"
                      >
                        {p.price}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shop Content */}
            {activeDrawer === 'shop' && (
              <div className="mt-3 space-y-2.5">
                {shopItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {item.category.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Purchased ${item.name}!`)}
                      className="rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-purple-500"
                    >
                      {item.realCurrencyPrice || `${item.priceCoins || item.priceGems} Pts`}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* VIP Content */}
            {activeDrawer === 'vip' && (
              <div className="mt-3 space-y-3 text-xs text-slate-300">
                <div className="rounded-xl border border-purple-500/30 bg-purple-950/40 p-3">
                  <div className="flex items-center justify-between font-bold text-purple-200">
                    <span>Current Tier: VIP Contender</span>
                    <Crown className="h-4 w-4 text-purple-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    3,200 / 5,000 XP to next tier (Diamond)
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-500 w-[64%]" />
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <p>✓ +15% bonus coins on table wins</p>
                  <p>✓ Exclusive VIP crown badge at table seats</p>
                  <p>✓ Priority WebRTC voice channels</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
