import { useState } from 'react'
import DeviceSimulator from './components/DeviceSimulator/DeviceSimulator'
import SplashScreen from './components/SplashScreen/SplashScreen'
import LoginScreen from './components/LoginScreen/LoginScreen'

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash')

  return (
    <DeviceSimulator>
      {currentScreen === 'splash' ? (
        <SplashScreen onFinish={() => setCurrentScreen('login')} />
      ) : (
        <LoginScreen onReplaySplash={() => setCurrentScreen('splash')} />
      )}
    </DeviceSimulator>
  )
}

export default App
