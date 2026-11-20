import { useState, useRef, useEffect } from 'react'
import { ArrowRight, Sparkles, Film, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import uadaLogo from '/logo-cutout.png'
import animatedGameBoard from '/game-board-animated.svg'
import './SplashScreen.css'

export default function SplashScreen({ onFinish }) {
  // Mode: 'vector' (Animated SVG Game Board) vs 'video' (Cinematic MP4)
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('uada_splash_mode') || 'vector'
  })
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef(null)

  // Switch mode and persist preference
  const switchMode = (newMode) => {
    setMode(newMode)
    localStorage.setItem('uada_splash_mode', newMode)
    setProgress(0)
  }

  // Replay active animation/video from start
  const replayCurrent = () => {
    setProgress(0)
    if (mode === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(console.warn)
    }
  }

  // Vector mode loading progress (2.4s)
  useEffect(() => {
    if (mode !== 'vector') return

    const duration = 2400
    const intervalTime = 30
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
  }, [mode, onFinish])

  // Video mode initialization
  useEffect(() => {
    if (mode !== 'video') return

    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      video.play().catch(console.warn)
    }
  }, [mode])

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current
    if (video && video.duration) {
      const pct = (video.currentTime / video.duration) * 100
      setProgress(pct)
    }
  }

  const handleToggleMute = (e) => {
    e.stopPropagation()
    const video = videoRef.current
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div
      className={`splash-screen ${mode === 'vector' ? 'brutal-mode' : 'video-mode'}`}
      onClick={onFinish}
      title="Tap anywhere to skip"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. CINEMATIC VIDEO BACKGROUND (ACTIVE IN VIDEO MODE)          */}
      {/* ------------------------------------------------------------- */}
      {mode === 'video' && (
        <video
          ref={videoRef}
          className="splash-video-bg"
          src="/gemini_generated_video_1f7433fe.mp4"
          autoPlay
          muted={isMuted}
          playsInline
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={onFinish}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. VECTOR VISUAL FX & SKYLINE (ACTIVE IN VECTOR MODE)         */}
      {/* ------------------------------------------------------------- */}
      {mode === 'vector' && (
        <>
          {/* Rotating Sunburst God-Rays for Flashy Arcade Aura */}
          <div className="splash-sunburst-rays" />

          {/* Atmospheric Arabian Skyline Silhouette */}
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

          {/* Ambient Pulsing Shockwave Aura behind central board */}
          <div className="splash-ambient-aura brutal-aura" />
          <div className="splash-shockwave-ring" />

          {/* Laser Shimmer Sweep */}
          <div className="splash-shimmer-sweep brutal-laser-sweep" />
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. TOP BAR: DEV MODE TOGGLE + REPLAY + AUDIO + SKIP           */}
      {/* ------------------------------------------------------------- */}
      <div className="splash-top-row">
        {/* Testing / Development Mode Switcher */}
        <div className="splash-dev-switcher" onClick={(e) => e.stopPropagation()}>
          <div className="splash-toggle-pill">
            <button
              type="button"
              className={`splash-toggle-btn ${mode === 'vector' ? 'active' : ''}`}
              onClick={() => switchMode('vector')}
              title="Switch to Animated Vector SVG Mode"
            >
              <Sparkles size={11} />
              <span>Vector</span>
            </button>
            <button
              type="button"
              className={`splash-toggle-btn ${mode === 'video' ? 'active' : ''}`}
              onClick={() => switchMode('video')}
              title="Switch to Cinematic Video Mode"
            >
              <Film size={11} />
              <span>Video</span>
            </button>
          </div>

          {/* Quick Replay Button */}
          <button
            type="button"
            className="splash-dev-icon-btn"
            onClick={replayCurrent}
            title="Replay from start"
          >
            <RotateCcw size={12} />
          </button>

          {/* Video Mute / Unmute Button */}
          {mode === 'video' && (
            <button
              type="button"
              className="splash-dev-icon-btn"
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          )}
        </div>

        {/* Skip to Login Button */}
        <button
          type="button"
          className="splash-skip-btn"
          onClick={(e) => {
            e.stopPropagation()
            onFinish()
          }}
          title="Skip to App"
        >
          <span>Skip</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. HERO SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      {mode === 'vector' ? (
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
      ) : (
        /* In video mode, spacer lets the video take center stage */
        <div className="splash-video-spacer" />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. BOTTOM AREA: PROGRESS LOADING BAR                          */}
      {/* ------------------------------------------------------------- */}
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
