import React, { useState, useEffect } from 'react'
import {
  Edit2,
  Copy,
  Check,
  Eye,
  Zap,
  Wallet,
  Tag,
  Crown,
  Gift,
  Shield,
  Gem,
  ShoppingBag,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { FlagEG } from '../components/common/SvgIcons'
import { getStoredAuth, setStoredAuth, clearStoredAuth, getAuthToken, viewAllUsers } from '../services/api'
import { EditProfilePage } from './EditProfilePage'

interface AccountPageProps {
  user?: any
  coins?: number
  gems?: number
  onTopUpCoins?: (amount: number) => void
  onLogout?: () => void
  onUpdateUser?: (updatedUser: any) => void
}

interface MenuItem {
  id: string
  icon: React.FC<{ className?: string }>
  iconColor: string
  label: string
  badgeText?: string
  badgeColor?: string
  isUnread?: boolean
}

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  coins: _coins = 25400,
  gems: _gems = 180,
  onLogout,
  onUpdateUser,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    return user || getStoredAuth()?.user || null
  })
  const [copiedId, setCopiedId] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Sync when prop updates
  useEffect(() => {
    if (user) {
      setCurrentUser(user)
    }
  }, [user])

  // Realtime Profile Sync with Backend Database on Mount
  useEffect(() => {
    const token = getAuthToken()
    if (!token) return

    async function syncProfile() {
      try {
        const data = await viewAllUsers(token)
        if (data?.users && currentUser) {
          const matched = data.users.find(
            (u: any) =>
              (currentUser.id && u.id === currentUser.id) ||
              (currentUser.user_uid && u.user_uid === currentUser.user_uid) ||
              (currentUser.unique_id && (u.unique_id === currentUser.unique_id || u.user_uid === currentUser.unique_id))
          )
          if (matched) {
            const merged = { ...currentUser, ...matched }
            setCurrentUser(merged)
            setStoredAuth(token, merged, merged.user_uid || merged.unique_id)
            onUpdateUser?.(merged)
          }
        }
      } catch (err) {
        console.debug('Realtime user sync check completed:', err)
      }
    }

    syncProfile()
  }, [])

  const displayName = currentUser?.name || 'Snapchat Player'
  const displayId = currentUser?.user_uid || currentUser?.unique_id || 'G-311060-2026'
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'S'
  const profileImage = currentUser?.profile_image || null

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleOpenEdit = () => {
    setIsEditingProfile(true)
  }

  if (isEditingProfile) {
    return (
      <EditProfilePage
        user={currentUser}
        onBack={() => setIsEditingProfile(false)}
        onUpdateUser={(updated) => {
          setCurrentUser(updated)
          onUpdateUser?.(updated)
        }}
      />
    )
  }

  const menuItems: MenuItem[] = [
    {
      id: 'viewed-me',
      icon: Eye,
      iconColor: 'text-cyan-400',
      label: 'Viewed me',
      badgeText: '1',
      badgeColor: 'bg-rose-500 text-white font-extrabold',
      isUnread: true,
    },
    {
      id: 'my-moments',
      icon: Zap,
      iconColor: 'text-pink-400',
      label: 'My moments',
    },
    {
      id: 'my-wallet',
      icon: Wallet,
      iconColor: 'text-amber-400',
      label: 'My wallet',
    },
    {
      id: 'offer-center',
      icon: Tag,
      iconColor: 'text-rose-400',
      label: 'Offer Center',
      badgeText: 'To be activated: 0',
      badgeColor: 'text-slate-400 text-xs',
    },
    {
      id: 'vip',
      icon: Crown,
      iconColor: 'text-yellow-400',
      label: 'VIP',
      badgeText: 'Not VIP yet',
      badgeColor: 'text-slate-400 text-xs',
    },
    {
      id: 'mine-benefits',
      icon: Gift,
      iconColor: 'text-orange-400',
      label: 'Mine Benefits',
      badgeText: 'Not Activated',
      badgeColor: 'text-slate-400 text-xs',
    },
    {
      id: 'power-tier',
      icon: Shield,
      iconColor: 'text-amber-500',
      label: 'Power Tier',
    },
    {
      id: 'noble',
      icon: Gem,
      iconColor: 'text-purple-400',
      label: 'Noble',
      badgeText: 'Not yet a noble',
      badgeColor: 'text-slate-400 text-xs',
    },
    {
      id: 'shop',
      icon: ShoppingBag,
      iconColor: 'text-pink-400',
      label: 'Shop',
    },
  ]

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-[#031914] min-h-screen text-white pb-8">
      {/* Profile Header Card */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Realtime Dynamic User Avatar */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shrink-0 overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#0a382f] flex items-center justify-center text-2xl font-black text-white">
                  {avatarInitial}
                </div>
              )}
            </div>

            {/* Name, Verified Tick & ID */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-white truncate max-w-[170px]">
                  {displayName}
                </span>
                {/* Blue Verified Checkmark */}
                <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  ✓
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  ID:{displayId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Star Rating Badges */}
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <span>⭐⭐</span>
              </div>
            </div>
          </div>

          {/* Realtime Edit Profile Button */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="flex items-center gap-1 bg-[#092922] hover:bg-[#0e3b31] active:scale-95 border border-emerald-700/50 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-sm cursor-pointer transition-all shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Edit</span>
          </button>
        </div>

        {/* Tribe Banner Card */}
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-950 via-[#0e2738] to-indigo-950 border border-blue-800/40 p-3 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-500/60 flex items-center justify-center text-xl shadow-inner">
              🛡️
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <FlagEG className="w-4 h-3 rounded-xs" />
                <span className="text-xs font-black text-blue-200">
                  ...دي_ياخاك
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9.5px]">
                <span className="bg-emerald-600/70 text-white px-1.5 py-0.2 rounded-full font-bold">
                  Lv.5
                </span>
                <span className="bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded-full font-bold">
                  R1
                </span>
              </div>
            </div>
          </div>

          <div className="text-2xl animate-bounce">
            🚀
          </div>
        </div>
      </div>

      {/* Profile Menu Actions List */}
      <div className="px-3 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => alert(`Opening ${item.label}...`)}
              className="w-full bg-[#08231e]/80 hover:bg-[#0d2e27] active:bg-[#08231e] rounded-xl px-4 py-3 flex items-center justify-between transition-colors cursor-pointer border border-emerald-950/40 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
                <span className="text-sm font-semibold text-white/90">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.badgeText && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'text-slate-400'
                    }`}
                  >
                    {item.badgeText}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </button>
          )
        })}

        {/* Realtime Logout Button */}
        {onLogout && (
          <button
            type="button"
            onClick={() => {
              clearStoredAuth()
              onLogout()
            }}
            className="w-full mt-4 bg-rose-950/40 hover:bg-rose-900/60 active:scale-98 border border-rose-800/40 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-rose-300 font-bold text-sm transition-all cursor-pointer shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Switch Account</span>
          </button>
        )}
      </div>
    </div>
  )
}
