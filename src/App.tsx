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
import { getStoredAuth, setStoredAuth, clearStoredAuth } from './services/api'
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
    if (stored?.user && stored?.token) {
      setAuthUser(stored.user)
    } else {
      setAuthUser(null)
    }
  }, [])

  const handleAuthSuccess = (user: any, token: string) => {
    setAuthUser(user)
    if (token) {
      setStoredAuth(token, user, user?.user_uid || user?.unique_id)
    }
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
      {/* 1. Vector Splash Screen */}
      {currentScreen === 'splash' && (
        <SplashScreen
          onFinish={() => {
            // Verify authenticated session: if logged in, go to platform; if logged out, go to login screen
            const stored = getStoredAuth()
            if (stored?.user && stored?.token) {
              setAuthUser(stored.user)
              setCurrentScreen('platform')
            } else {
              setAuthUser(null)
              setCurrentScreen('main')
            }
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
              user={authUser}
              coins={coins}
              onJoinRoomSession={handleJoinRoomSession}
              onQuickMatchLaunch={handleQuickMatchLaunch}
              onOpenWallet={() => setCurrentTab('account')}
              onOpenSearch={() => setCurrentTab('search')}
            />
          )}

          {/* 2. Room Explore Lobby */}
          {currentTab === 'room' && (
            <RoomPage
              onJoinRoom={handleJoinRoomSession}
              onOpenSearch={() => setCurrentTab('search')}
            />
          )}

          {/* 3. Moments Feed */}
          {currentTab === 'moment' && <MomentPage />}

          {/* 4. Messages Thread */}
          {currentTab === 'messages' && <MessagesPage />}

          {/* 5. Search Page Screen (Search by Userid / Room id & Social Friends) */}
          {currentTab === 'search' && (
            <SearchPage
              onCancel={() => setCurrentTab('home')}
              onStartMessageWithUser={handleStartMessageWithUser}
              onJoinRoom={handleJoinRoomSession}
            />
          )}

          {/* 6. Me / Profile */}
          {currentTab === 'account' && (
            <AccountPage
              user={authUser}
              coins={coins}
              gems={gems}
              onTopUpCoins={handleTopUpCoins}
              onLogout={handleLogout}
              onUpdateUser={(updated) => setAuthUser(updated)}
            />
          )}
        </AppLayout>
      )}
    </DeviceSimulator>
  )
}
