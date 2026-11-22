import React from 'react'
import type { AppTab } from '../../types/contracts'
import { BottomNavBar } from './BottomNavBar'

interface AppLayoutProps {
  currentTab: AppTab
  onTabChange: (tab: AppTab) => void
  coins?: number
  gems?: number
  unreadMessagesCount?: number
  onWalletClick?: () => void
  onGiftClick?: () => void
  onRankClick?: () => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  unreadMessagesCount = 3,
  children,
}) => {
  return (
    <div className="relative min-h-screen bg-[#031914] text-white flex flex-col antialiased select-none font-sans overflow-x-hidden">
      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-[471px] mx-auto overflow-y-auto pb-[76px] px-0 pt-0">
        {children}
      </main>

      {/* Pure Coded Bottom 5-Tab Navigation Bar with Real SVGs */}
      <BottomNavBar
        currentTab={currentTab}
        onTabChange={onTabChange}
        unreadMessagesCount={unreadMessagesCount}
      />
    </div>
  )
}
