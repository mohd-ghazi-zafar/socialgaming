import React from 'react'
import type { AppTab } from '../../types/contracts'
import {
  GamepadNavIcon,
  AudioRoomNavIcon,
  DiscoveryNavIcon,
  MessageNavIcon,
  UserNavIcon,
} from '../common/SvgIcons'

interface BottomNavBarProps {
  currentTab: AppTab
  onTabChange: (tab: AppTab) => void
  unreadMessagesCount?: number
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  unreadMessagesCount = 3,
}) => {
  const tabs = [
    {
      id: 'home' as AppTab,
      label: 'TopTop',
      Icon: GamepadNavIcon,
    },
    {
      id: 'room' as AppTab,
      label: 'Room',
      Icon: AudioRoomNavIcon,
    },
    {
      id: 'moment' as AppTab,
      label: 'Moment',
      Icon: DiscoveryNavIcon,
    },
    {
      id: 'messages' as AppTab,
      label: 'Message',
      Icon: MessageNavIcon,
      badge: unreadMessagesCount,
    },
    {
      id: 'account' as AppTab,
      label: 'Me',
      Icon: UserNavIcon,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-auto">
      <div className="w-full max-w-[471px] bg-[#0c2420]/95 backdrop-blur-md border-t border-emerald-900/40 px-2 py-2 flex items-center justify-around shadow-2xl">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id
          const { Icon } = tab

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 cursor-pointer select-none ${
                isActive
                  ? 'text-teal-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  active={isActive}
                  className={`w-6 h-6 transition-transform duration-150 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />

                {/* Unread Message Notification Badge */}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-teal-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {/* Active Tab Indicator Pip */}
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-teal-400 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
