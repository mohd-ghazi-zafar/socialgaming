import React from 'react'
import { Navbar } from './Navbar'
import type { AppTab } from '../../types/contracts'

interface AppLayoutProps {
  currentTab: AppTab
  onTabChange: (tab: AppTab) => void
  coins: number
  gems?: number
  unreadMessagesCount?: number
  onWalletClick: () => void
  onGiftClick?: () => void
  onRankClick?: () => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  onTabChange,
  coins,
  gems,
  onWalletClick,
  onGiftClick,
  onRankClick,
  children,
}) => {
  return (
    <div className="relative min-h-screen bg-[#061914] text-white flex flex-col antialiased select-none font-sans overflow-x-hidden">
      {/* 1. Exact Pixel-Perfect Top Header */}
      <Navbar
        coins={coins}
        gems={gems}
        onWalletClick={onWalletClick}
        onSearchClick={() => onTabChange('search')}
        onGiftClick={onGiftClick}
        onRankClick={onRankClick}
      />

      {/* 2. Main Scrollable Content */}
      <main className="flex-1 w-full max-w-[471px] mx-auto overflow-y-auto pb-28 px-3.5 pt-2">
        {children}
      </main>

      {/* 3. Exact Pixel-Perfect Bottom 5-Tab Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#061914] flex justify-center">
        <div className="relative w-full max-w-[471px]">
          <img
            src="/toptop/bottom_nav_exact.png"
            alt="TopTop Navigation Bar"
            className="w-full h-auto block select-none pointer-events-none"
          />

          {/* Interactive Click Hotspots across the 5 Tabs */}
          {/* Tab 1: TopTop (Home) */}
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className="absolute top-0 left-0 w-[20%] h-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
            title="TopTop Games"
          />

          {/* Tab 2: Room */}
          <button
            type="button"
            onClick={() => onTabChange('moment')}
            className="absolute top-0 left-[20%] w-[20%] h-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
            title="Rooms"
          />

          {/* Tab 3: Moment */}
          <button
            type="button"
            onClick={() => onTabChange('search')}
            className="absolute top-0 left-[40%] w-[20%] h-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
            title="Moments"
          />

          {/* Tab 4: Message */}
          <button
            type="button"
            onClick={() => onTabChange('messages')}
            className="absolute top-0 left-[60%] w-[20%] h-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
            title="Messages"
          />

          {/* Tab 5: Me */}
          <button
            type="button"
            onClick={() => onTabChange('account')}
            className="absolute top-0 left-[80%] w-[20%] h-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
            title="Profile"
          />
        </div>
      </div>
    </div>
  )
}
