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
  const isSearch = currentTab === 'search'

  return (
    <div
      className={`relative min-h-screen ${
        isSearch ? 'bg-white text-slate-800' : 'bg-[#031914] text-white'
      } flex flex-col antialiased select-none font-sans overflow-x-hidden`}
    >
      {/* Main Viewport Content */}
      <main
        className={`flex-1 w-full max-w-[471px] mx-auto overflow-y-auto ${
          isSearch ? 'pb-0' : 'pb-[76px]'
        } px-0 pt-0`}
      >
        {children}
      </main>

      {/* Pure Coded Bottom 5-Tab Navigation Bar with Real SVGs (Hidden on full-screen Search) */}
      {!isSearch && (
        <BottomNavBar
          currentTab={currentTab}
          onTabChange={onTabChange}
          unreadMessagesCount={unreadMessagesCount}
        />
      )}
    </div>
  )
}
