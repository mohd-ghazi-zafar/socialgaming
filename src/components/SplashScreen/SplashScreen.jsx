import { useState, useRef, useEffect } from 'react'
import { ArrowRight, Volume2, VolumeX } from 'lucide-react'
import './SplashScreen.css'

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef(null)

  // Ensure playback starts smoothly
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch((err) => {
        console.warn('Autoplay prevented or video error:', err)
      })
    }
  }, [])

  const handleTimeUpdate = () => {
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
      className="splash-screen"
      onClick={onFinish}
      title="Tap anywhere to skip"
    >
      {/* Dynamic 9:16 Cinematic Video Background */}
      <video
        ref={videoRef}
        className="splash-video-bg"
        src="/gemini_generated_video_1f7433fe.mp4"
        autoPlay
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={onFinish}
      />

      {/* Top Controls: Sound Toggle & Skip */}
      <div className="splash-top-row">
        <button
          className="splash-sound-btn"
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        <button
          className="splash-skip-btn"
          onClick={(e) => {
            e.stopPropagation()
            onFinish()
          }}
          title="Skip Intro"
        >
          <span>Skip</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Center Spacer keeping focus on the 3D animated UADA emblem in the video */}
      <div className="splash-center-spacer" />

      {/* Bottom Area: Sleek Loading Progress Bar (No Text) */}
      <div className="splash-bottom-wrap">
        <div className="splash-progress-track">
          <div
            className="splash-progress-fill"
            style={{ width: `${Math.min(100, Math.max(progress, 3))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
