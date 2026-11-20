import { useState, useEffect } from 'react'
import splashArtwork from '../../assets/splash-artwork.jpg'
import './SplashScreen.css'

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 2800 // 2.8s splash screen duration
    const intervalTime = 50
    const increment = (intervalTime / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          setTimeout(onFinish, 200)
          return 100
        }
        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [onFinish])

  return (
    <div className="splash-screen" onClick={onFinish} title="Click anywhere to skip">
      {/* Background TopTop Artwork */}
      <img
        src={splashArtwork}
        alt="TopTop Splash Screen"
        className="splash-bg-image"
      />

      {/* Subtle Light Shimmer Sweep */}
      <div className="splash-shimmer" />

      {/* Top Skip Pill */}
      <div className="splash-skip-pill">
        <span>Skip</span>
      </div>

      {/* Bottom Progress Bar */}
      <div
        className="splash-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
