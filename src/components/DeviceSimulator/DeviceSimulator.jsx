import { useState, useEffect, useRef } from 'react'
import {
  Smartphone,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Wifi,
  Battery,
  Sliders,
  ChevronLeft,
  Circle,
  Square,
  Sparkles,
  Layers,
  Eye,
} from 'lucide-react'
import { DEVICE_PRESETS } from './devicePresets'
import './DeviceSimulator.css'

export default function DeviceSimulator({ children }) {
  // Mobile device viewport detection (<= 820px)
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 820
    }
    return false
  })

  // Manual toggle for desktop users if they want to preview native full-bleed view
  const [forceNativeView, setForceNativeView] = useState(false)

  // Device Selection & Dimensions
  const [selectedPresetId, setSelectedPresetId] = useState('toptop-reference')
  const [customWidth, setCustomWidth] = useState(471)
  const [customHeight, setCustomHeight] = useState(1024)
  const [isLandscape, setIsLandscape] = useState(false)

  // Display & Simulation options - dynamically initialize scale to fit user screen
  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const availH = window.innerHeight - 150
      if (availH > 0) {
        return Math.min(0.85, Math.max(0.4, Math.round((availH / 1060) * 20) / 20))
      }
    }
    return 0.65
  })
  const [hasBezel, setHasBezel] = useState(true)
  const [showStatusBar, setShowStatusBar] = useState(false)
  const [navStyle, setNavStyle] = useState('none') // 'gesture' | 'buttons' | 'none'
  const [currentTime, setCurrentTime] = useState('')

  const stageRef = useRef(null)

  // Current active preset metadata
  const activePreset = DEVICE_PRESETS.find((p) => p.id === selectedPresetId)

  // Update dimensions when preset changes
  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId)
    const preset = DEVICE_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setCustomWidth(preset.width)
      setCustomHeight(preset.height)
    }
  }

  // Handle Orientation Toggle
  const toggleOrientation = () => {
    setIsLandscape((prev) => !prev)
  }

  // Calculate actual rendered viewport width & height
  const baseWidth = customWidth
  const baseHeight = customHeight
  const screenWidth = isLandscape ? Math.max(baseWidth, baseHeight) : Math.min(baseWidth, baseHeight)
  const screenHeight = isLandscape ? Math.min(baseWidth, baseHeight) : Math.max(baseWidth, baseHeight)

  // Auto-fit function
  const handleAutoFit = () => {
    if (!stageRef.current) return
    const stageWidth = stageRef.current.clientWidth - 48
    const stageHeight = stageRef.current.clientHeight - 48
    if (stageWidth <= 0 || stageHeight <= 0) return
    const framePadding = hasBezel ? 36 : 0
    const totalTargetW = screenWidth + framePadding
    const totalTargetH = screenHeight + framePadding

    const scaleX = stageWidth / totalTargetW
    const scaleY = stageHeight / totalTargetH
    const optimalScale = Math.min(scaleX, scaleY, 1.0)
    if (optimalScale > 0.15) {
      setScale(Math.max(0.35, Math.round(optimalScale * 20) / 20))
    }
  }

  // Track window resize and auto-fit on mount & stage dimension changes with ResizeObserver
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 820)
      handleAutoFit()
    }

    window.addEventListener('resize', handleResize)

    let ro
    if (stageRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        handleAutoFit()
      })
      ro.observe(stageRef.current)
    }

    // Auto-fit immediately and after layout settles
    handleAutoFit()
    const timer = setTimeout(handleAutoFit, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (ro) ro.disconnect()
      clearTimeout(timer)
    }
  }, [selectedPresetId, customWidth, customHeight, isLandscape, hasBezel])

  // Initialize clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 10000)
    return () => clearInterval(timer)
  }, [])

  // If on actual mobile screen or mobile viewport (<= 820px), render ONLY the native app
  if (isMobileScreen || forceNativeView) {
    return (
      <div className="mobile-native-container">
        {/* On desktop when previewing native mode, show a small floating exit pill */}
        {forceNativeView && !isMobileScreen && (
          <button
            className="floating-exit-native-btn"
            onClick={() => setForceNativeView(false)}
            title="Return to Device Canvas Simulator"
          >
            <Smartphone size={14} />
            <span>Back to Android Canvas</span>
          </button>
        )}
        {children}
      </div>
    )
  }

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => Math.min(1.2, Math.round((s + 0.1) * 10) / 10))
  const handleZoomOut = () => setScale((s) => Math.max(0.4, Math.round((s - 0.1) * 10) / 10))

  return (
    <div className="simulator-workspace">
      {/* Top Studio Controls Toolbar */}
      <header className="simulator-toolbar">
        {/* Left: Branding */}
        <div className="toolbar-brand">
          <div className="brand-badge">
            <img src="/LOGO.svg" alt="ClickNova Logo" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            <span>Android Canvas</span>
          </div>
          <span className="brand-title">ClickNova Play</span>
        </div>

        {/* Center: Device Controls */}
        <div className="toolbar-controls">
          {/* Preset Selector */}
          <div className="control-group">
            <span className="control-label">Device</span>
            <select
              className="preset-select"
              value={selectedPresetId}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              {DEVICE_PRESETS.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.width}x{device.height})
                </option>
              ))}
              <option value="custom">Custom Resolution</option>
            </select>
          </div>

          {/* Quick Resolution Inputs */}
          <div className="control-group">
            <span className="control-label">Size (px)</span>
            <div className="dimension-inputs">
              <input
                type="number"
                className="dim-input"
                value={customWidth}
                onChange={(e) => {
                  setSelectedPresetId('custom')
                  setCustomWidth(Number(e.target.value) || 360)
                }}
                min="280"
                max="1600"
                title="Width in pixels"
              />
              <span className="dim-separator">×</span>
              <input
                type="number"
                className="dim-input"
                value={customHeight}
                onChange={(e) => {
                  setSelectedPresetId('custom')
                  setCustomHeight(Number(e.target.value) || 640)
                }}
                min="480"
                max="2400"
                title="Height in pixels"
              />
            </div>
          </div>

          {/* Orientation Button */}
          <div className="control-group">
            <button
              className={`tool-btn ${isLandscape ? 'active' : ''}`}
              onClick={toggleOrientation}
              title={`Switch to ${isLandscape ? 'Portrait' : 'Landscape'}`}
            >
              <RotateCw size={14} />
              <span>{isLandscape ? 'Landscape' : 'Portrait'}</span>
            </button>
          </div>

          {/* Scale / Zoom controls */}
          <div className="control-group">
            <button
              className="tool-btn"
              onClick={handleZoomOut}
              disabled={scale <= 0.4}
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center', fontWeight: 600 }}>
              {Math.round(scale * 100)}%
            </span>
            <button
              className="tool-btn"
              onClick={handleZoomIn}
              disabled={scale >= 1.2}
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button className="tool-btn" onClick={handleAutoFit} title="Fit device to screen">
              <Maximize2 size={13} />
              <span>Fit</span>
            </button>
          </div>

          {/* Hardware Frame & UI toggles */}
          <div className="control-group">
            <button
              className={`tool-btn ${hasBezel ? 'active' : ''}`}
              onClick={() => setHasBezel(!hasBezel)}
              title="Toggle hardware bezel frame"
            >
              <Layers size={14} />
              <span>Frame</span>
            </button>
            <button
              className={`tool-btn ${showStatusBar ? 'active' : ''}`}
              onClick={() => setShowStatusBar(!showStatusBar)}
              title="Toggle Android status bar"
            >
              <Wifi size={14} />
              <span>Status</span>
            </button>
            <button
              className="tool-btn"
              onClick={() => {
                if (navStyle === 'gesture') setNavStyle('buttons')
                else if (navStyle === 'buttons') setNavStyle('none')
                else setNavStyle('gesture')
              }}
              title="Toggle Android Navigation bar style"
            >
              <Sliders size={14} />
              <span>Nav: {navStyle}</span>
            </button>
          </div>

          {/* Native View Toggle */}
          <div className="control-group">
            <button
              className="tool-btn"
              onClick={() => setForceNativeView(true)}
              title="Switch to direct native view (full-screen mobile mode)"
            >
              <Eye size={14} />
              <span>Native View</span>
            </button>
          </div>
        </div>

        {/* Right: Meta Details */}
        <div className="toolbar-meta">
          <div className="meta-pill">
            {screenWidth} × {screenHeight} dp
          </div>
        </div>
      </header>

      {/* Stage: Centered Device Mockup */}
      <main className="simulator-stage" ref={stageRef}>
        <div
          className="device-scale-wrapper"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          {/* Android Device Chassis */}
          <div
            className={`android-device-chassis ${hasBezel ? 'has-frame' : 'frameless'}`}
            style={{
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
              borderRadius: hasBezel ? `${activePreset?.borderRadius || 32}px` : '0px',
            }}
          >
            {/* Physical Frame Hardware Buttons (when bezel enabled) */}
            {hasBezel && (
              <>
                <div className="hw-button hw-power" />
                <div className="hw-button hw-volume-up" />
                <div className="hw-button hw-volume-down" />
              </>
            )}

            {/* Inner Device Screen */}
            <div
              className="device-screen-container"
              style={{
                borderRadius: hasBezel ? `${(activePreset?.borderRadius || 32) - 8}px` : '0px',
              }}
            >
              {/* Android Status Bar */}
              {showStatusBar && (
                <div className="android-status-bar">
                  <div className="status-left">
                    <span className="status-time">{currentTime || '12:00'}</span>
                    <div className="status-icons-left">
                      <Sparkles size={11} color="#a855f7" />
                    </div>
                  </div>

                  {/* Punch Hole Camera Cutout */}
                  {hasBezel && <div className="camera-punch-hole" />}

                  <div className="status-right">
                    <span>5G</span>
                    <Wifi size={13} />
                    <div className="status-battery">
                      <span>96%</span>
                      <Battery size={13} />
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Mobile App Root */}
              <div className="app-screen-body">
                {children}
              </div>

              {/* Android Bottom Navigation Bar */}
              {navStyle !== 'none' && (
                <div className="android-nav-bar">
                  {navStyle === 'gesture' ? (
                    <div className="nav-gesture-pill" title="Swipe up for home" />
                  ) : (
                    <div className="nav-three-buttons">
                      <button className="nav-btn" title="Back">
                        <ChevronLeft size={18} />
                      </button>
                      <button className="nav-btn" title="Home">
                        <Circle size={13} />
                      </button>
                      <button className="nav-btn" title="Overview">
                        <Square size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
