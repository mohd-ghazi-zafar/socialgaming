import { useState, useEffect } from 'react'
import DeviceSimulator from './components/DeviceSimulator/DeviceSimulator'
import SplashScreen from './components/SplashScreen/SplashScreen'
import LoginScreen from './components/LoginScreen/LoginScreen'
import RegistrationScreen from './components/RegistrationScreen/RegistrationScreen'
import IdLoginScreen from './components/IdLoginScreen/IdLoginScreen'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { RoomPage } from './pages/RoomPage'
import { MomentPage } from './pages/MomentPage'
import { MessagesPage } from './pages/MessagesPage'
import { SearchPage } from './pages/SearchPage'
import { AccountPage } from './pages/AccountPage'
import { getStoredAuth, clearStoredAuth } from './services/api'
import type { AppTab, GameType, DirectoryUser } from './types/contracts'

type ScreenState = 'splash' | 'main' | 'register' | 'id-login' | 'platform'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash')
  const [currentTab, setCurrentTab] = useState<AppTab>('home')
  const [authUser, setAuthUser] = useState<any>(null)
  const [coins, setCoins] = useState(25400)
  const [gems] = useState(180)

  // Restore authenticated session from localStorage
  useEffect(() => {
    const stored = getStoredAuth()
    if (stored?.user) {
      setAuthUser(stored.user)
    }
  }, [])

  const handleAuthSuccess = (user: any, _token: string) => {
    setAuthUser(user)
    setCurrentScreen('platform')
  }

  const handleLogout = () => {
    clearStoredAuth()
    setAuthUser(null)
    setCurrentScreen('main')
  }

  const handleTopUpCoins = (amount: number) => {
    setCoins((prev) => prev + amount)
  }

  const handleQuickMatchLaunch = (game: GameType) => {
    alert(`Matching with authoritative queue for ${game.toUpperCase()}... Connected!`)
  }

  const handleJoinRoomSession = (roomId: string, pin?: string) => {
    alert(`Joined Table: ${roomId}${pin ? ` (PIN: ${pin})` : ''}`)
  }

  const handleStartMessageWithUser = (_user: DirectoryUser) => {
    setCurrentTab('messages')
  }

  return (
    <DeviceSimulator>
      {/* 1. Dual-Mode Splash Screen with Toggle Switcher */}
      {currentScreen === 'splash' && (
        <SplashScreen
          onFinish={() => {
            // Smoothly transitions into the UADA Social Gaming Platform
            setCurrentScreen('platform')
          }}
        />
      )}

      {/* 2. Main Login / Landing Screen (TopTop-inspired) */}
      {currentScreen === 'main' && (
        <LoginScreen
          onReplaySplash={() => setCurrentScreen('splash')}
          onOpenRegistration={() => setCurrentScreen('register')}
          onOpenIdLogin={() => setCurrentScreen('id-login')}
          onLoginSuccess={handleAuthSuccess}
        />
      )}

      {/* 3. Registration Wizard (Profile -> Phone Keypad -> OTP -> ID Reveal) */}
      {currentScreen === 'register' && (
        <RegistrationScreen
          onBack={() => setCurrentScreen('main')}
          onComplete={(createdUser: any) => {
            handleAuthSuccess(createdUser, createdUser.token)
          }}
        />
      )}

      {/* 4. ID Login Screen (Unique ID + Password) */}
      {currentScreen === 'id-login' && (
        <IdLoginScreen
          onBack={() => setCurrentScreen('main')}
          onSignIn={handleAuthSuccess}
        />
      )}

      {/* 5. Phase-02 Platform Shell (Navbar + 5-Tab Navigation + 5 Typed Pages) */}
      {currentScreen === 'platform' && (
        <AppLayout
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          coins={coins}
          gems={gems}
          unreadMessagesCount={2}
          onWalletClick={() => {
            setCurrentTab('account')
          }}
        >
          {/* 1. TopTop Casual Games Home */}
          {currentTab === 'home' && (
            <HomePage
              coins={coins}
              onJoinRoomSession={handleJoinRoomSession}
              onQuickMatchLaunch={handleQuickMatchLaunch}
              onOpenWallet={() => setCurrentTab('account')}
              onOpenSearch={() => alert('Search Players and Rooms')}
            />
          )}

          {/* 2. Room Explore Lobby */}
          {currentTab === 'room' && (
            <RoomPage onJoinRoom={handleJoinRoomSession} />
          )}

          {/* 3. Moments Feed */}
          {currentTab === 'moment' && <MomentPage />}

          {/* 4. Messages Thread */}
          {currentTab === 'messages' && <MessagesPage />}

          {/* Search Page fallback */}
          {currentTab === 'search' && (
            <SearchPage onStartMessageWithUser={handleStartMessageWithUser} />
          )}

          {/* 5. Me / Profile (Laraib Husain) */}
          {currentTab === 'account' && (
            <AccountPage
              user={authUser}
              coins={coins}
              gems={gems}
              onTopUpCoins={handleTopUpCoins}
              onLogout={handleLogout}
            />
          )}
        </AppLayout>
      )}
    </DeviceSimulator>
  )
}
