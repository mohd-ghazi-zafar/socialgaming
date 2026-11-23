import { useState, useEffect } from 'react'
import uadaLogo from '/logo-cutout.png'
import animatedGameBoard from '/game-board-animated.svg'
import './SplashScreen.css'

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)

  // Vector splash loading animation progress (2.4s)
  useEffect(() => {
    const duration = 2400
    const intervalTime = 30
    const increment = (intervalTime / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          setTimeout(onFinish, 180)
          return 100
        }
        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [onFinish])

  return (
    <div
      className="splash-screen brutal-mode"
      onClick={onFinish}
      title="Tap anywhere to continue"
    >
      {/* 1. Rotating Sunburst God-Rays for Flashy Arcade Aura */}
      <div className="splash-sunburst-rays" />

      {/* 2. Atmospheric Arabian Skyline Silhouette */}
      <div className="splash-skyline-wrap">
        <svg
          className="splash-skyline"
          viewBox="0 0 400 180"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,180 L0,115 Q25,115 35,90 Q40,65 45,35 Q50,65 55,90 Q65,115 90,115 L105,115 Q115,95 120,40 Q125,10 130,0 Q135,10 140,40 Q145,95 155,115 L170,115 Q185,80 200,42 Q215,80 230,115 L245,115 Q255,95 260,40 Q265,10 270,0 Q275,10 280,40 Q285,95 295,115 L310,115 Q335,115 345,90 Q350,65 355,35 Q360,65 365,90 Q375,115 400,115 L400,180 Z"
            fill="rgba(38, 2, 80, 0.45)"
          />
          <path
            d="M20,180 L20,135 Q55,135 70,105 Q85,75 95,65 Q105,75 120,105 Q135,135 170,135 L230,135 Q265,135 280,105 Q295,75 305,65 Q315,75 330,105 Q345,135 380,135 L380,180 Z"
            fill="rgba(24, 1, 52, 0.38)"
          />
        </svg>
      </div>

      {/* 3. Ambient Pulsing Shockwave Aura behind central board */}
      <div className="splash-ambient-aura brutal-aura" />
      <div className="splash-shockwave-ring" />

      {/* 4. Laser Shimmer Sweep */}
      <div className="splash-shimmer-sweep brutal-laser-sweep" />

      {/* 5. HERO SECTION: Vector Game Board & UADA Brand */}
      <div className="splash-hero-container">
        {/* Floating 3D Animated Vector Game Board with Slam Entrance */}
        <div className="splash-board-wrap brutal-slam">
          <img
            src={animatedGameBoard}
            alt="UADA Social Gaming Board"
            className="splash-board-img"
          />
        </div>

        {/* UADA Branding Banner with Gold Flare */}
        <div className="splash-brand-banner brutal-brand">
          <div className="splash-emblem-mini-box">
            <img src={uadaLogo} alt="UADA Emblem" className="splash-emblem-mini" />
          </div>
          <h1 className="splash-app-title">UADA</h1>
          <p className="splash-app-subtext">
            <span className="splash-sub-arabic">يادا</span> • Social Gaming
          </p>
        </div>
      </div>

      {/* 6. BOTTOM AREA: PROGRESS LOADING BAR */}
      <div className="splash-bottom-wrap">
        <div className="splash-progress-track brutal-track">
          <div
            className="splash-progress-fill brutal-fill"
            style={{ width: `${Math.min(100, Math.max(progress, 3))}%` }}
          >
            <div className="progress-plasma-head" />
          </div>
        </div>
      </div>
    </div>
  )
}
