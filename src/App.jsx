import { useState } from 'react'
import DeviceSimulator from './components/DeviceSimulator/DeviceSimulator'
import SplashScreen from './components/SplashScreen/SplashScreen'
import LoginScreen from './components/LoginScreen/LoginScreen'
import RegistrationScreen from './components/RegistrationScreen/RegistrationScreen'
import IdLoginScreen from './components/IdLoginScreen/IdLoginScreen'

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash')

  return (
    <DeviceSimulator>
      {currentScreen === 'splash' && (
        <SplashScreen onFinish={() => setCurrentScreen('main')} />
      )}

      {currentScreen === 'main' && (
        <LoginScreen
          onReplaySplash={() => setCurrentScreen('splash')}
          onOpenRegistration={() => setCurrentScreen('register')}
          onOpenIdLogin={() => setCurrentScreen('id-login')}
        />
      )}

      {currentScreen === 'register' && (
        <RegistrationScreen
          onBack={() => setCurrentScreen('main')}
          onComplete={(data) => {
            alert(`Welcome to TopTop, ${data.nickname || 'Player'}! Profile setup complete.`)
            setCurrentScreen('main')
          }}
        />
      )}

      {currentScreen === 'id-login' && (
        <IdLoginScreen
          onBack={() => setCurrentScreen('main')}
          onSignIn={(data) => {
            alert(`Signed in successfully with TopTop ID: ${data.topTopId}!`)
            setCurrentScreen('main')
          }}
        />
      )}
    </DeviceSimulator>
  )
}

export default App
