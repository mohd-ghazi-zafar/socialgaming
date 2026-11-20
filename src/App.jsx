import { useState, useEffect } from 'react'
import DeviceSimulator from './components/DeviceSimulator/DeviceSimulator'
import SplashScreen from './components/SplashScreen/SplashScreen'
import LoginScreen from './components/LoginScreen/LoginScreen'
import RegistrationScreen from './components/RegistrationScreen/RegistrationScreen'
import IdLoginScreen from './components/IdLoginScreen/IdLoginScreen'
import UserProfileScreen from './components/UserProfileScreen/UserProfileScreen'
import { getStoredAuth, clearStoredAuth } from './services/api'

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash')
  const [authUser, setAuthUser] = useState(null)
  const [authToken, setAuthToken] = useState(null)

  useEffect(() => {
    // Check if user is already signed in
    const stored = getStoredAuth()
    if (stored?.user && stored?.token) {
      setAuthUser(stored.user)
      setAuthToken(stored.token)
    }
  }, [])

  const handleAuthSuccess = (user, token) => {
    setAuthUser(user)
    setAuthToken(token)
    setCurrentScreen('profile')
  }

  const handleLogout = () => {
    clearStoredAuth()
    setAuthUser(null)
    setAuthToken(null)
    setCurrentScreen('main')
  }

  return (
    <DeviceSimulator>
      {/* 1. Splash Screen */}
      {currentScreen === 'splash' && (
        <SplashScreen
          onFinish={() => {
            if (authUser) {
              setCurrentScreen('profile')
            } else {
              setCurrentScreen('main')
            }
          }}
        />
      )}

      {/* 2. Main Login / Landing Screen */}
      {currentScreen === 'main' && (
        <LoginScreen
          onReplaySplash={() => setCurrentScreen('splash')}
          onOpenRegistration={() => setCurrentScreen('register')}
          onOpenIdLogin={() => setCurrentScreen('id-login')}
          onLoginSuccess={handleAuthSuccess}
        />
      )}

      {/* 3. Registration Wizard (Profile -> Phone with Keypad -> OTP & Password -> ID Reveal) */}
      {currentScreen === 'register' && (
        <RegistrationScreen
          onBack={() => setCurrentScreen('main')}
          onComplete={(createdUser) => {
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

      {/* 5. User Profile Screen (VIP Card, UADA ID, Details, Logout) */}
      {currentScreen === 'profile' && (
        <UserProfileScreen
          user={authUser}
          token={authToken}
          onLogout={handleLogout}
          onBackToMain={() => setCurrentScreen('main')}
        />
      )}
    </DeviceSimulator>
  )
}

export default App
