import { useState } from 'react'
import {
  Gamepad2,
  Users,
  ShieldCheck,
  User,
  Coins,
  Mic,
  MicOff,
  Dices,
  Lock,
  CheckCircle2,
  Radio,
  Flame,
  Award,
} from 'lucide-react'
import './MobileApp.css'

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('lobby')
  const [diceValues, setDiceValues] = useState([4, 6])
  const [isRolling, setIsRolling] = useState(false)
  const [lastVerifiedTime, setLastVerifiedTime] = useState('Just now')
  const [isMuted, setIsMuted] = useState(false)
  const [chips, setChips] = useState(25400)
  const [roomCodeInput, setRoomCodeInput] = useState('')

  // Simulate server-authoritative dice roll (crypto.getRandomValues backend contract)
  const rollDice = () => {
    if (isRolling) return
    setIsRolling(true)
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1
      const d2 = Math.floor(Math.random() * 6) + 1
      setDiceValues([d1, d2])
      setIsRolling(false)
      setLastVerifiedTime(`${Math.floor(Math.random() * 20 + 25)}ms via Redis`)
      if (d1 === d2) {
        setChips((c) => c + 500)
      }
    }, 400)
  }

  return (
    <div className="mobile-app">
      {/* App Top Bar */}
      <header className="app-header">
        <div className="user-profile-badge">
          <div className="user-avatar-wrap">
            <div className="user-avatar">AN</div>
            <div className="online-dot" />
          </div>
          <div className="user-info">
            <span className="user-name">Alex Nova</span>
            <span className="user-rank">
              <Award size={11} color="#f59e0b" /> ELO 1420 • Host
            </span>
          </div>
        </div>

        <div className="header-chips">
          <Coins size={14} />
          <span>{chips.toLocaleString()}</span>
        </div>
      </header>

      {/* Voice WebRTC Pipeline Indicator Banner */}
      <div className="voice-banner">
        <div className="voice-status">
          <div className="voice-pulse" />
          <span>Table Voice: Active (4 players)</span>
        </div>
        <button
          className={`voice-mic-btn ${isMuted ? 'active' : ''}`}
          onClick={() => setIsMuted(!isMuted)}
          title="Toggle Voice"
        >
          {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
          <span>{isMuted ? 'Muted' : 'Speaking'}</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="app-content">
        {activeTab === 'lobby' && (
          <>
            {/* Live Authoritative Game Arena */}
            <div className="card-section game-arena-card">
              <span className="arena-badge">High Stakes Table • Room #8841</span>
              <div className="dice-container">
                <div className={`dice-box ${isRolling ? 'rolling' : ''}`}>{diceValues[0]}</div>
                <div className={`dice-box ${isRolling ? 'rolling' : ''}`}>{diceValues[1]}</div>
              </div>
              <button className="roll-btn" onClick={rollDice} disabled={isRolling}>
                {isRolling ? 'Rolling (Server Sync)...' : 'Roll Authoritative Dice'}
              </button>
              <div className="engine-status-pill">
                <CheckCircle2 size={12} />
                <span>Zero-Trust Validation: {lastVerifiedTime}</span>
              </div>
            </div>

            {/* Quick Matchmaking & Tables */}
            <div className="card-section">
              <div className="section-title">
                <span>Active Tables</span>
                <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Radio size={10} /> 124 Online
                </span>
              </div>
              <div className="room-grid">
                <div className="room-item">
                  <div>
                    <div className="room-title">Cyber Ludo & Dice Club</div>
                    <div className="room-meta">Host: Tyler Durden • 4/6 Players</div>
                  </div>
                  <button className="room-join-btn">Join</button>
                </div>
                <div className="room-item">
                  <div>
                    <div className="room-title">Midnight Poker Stakes</div>
                    <div className="room-meta">Host: Elena Ray • 7/10 Players</div>
                  </div>
                  <button className="room-join-btn">Join</button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'rooms' && (
          <div className="card-section">
            <div className="section-title">
              <span>Private Room Access</span>
              <Lock size={14} color="#a855f7" />
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
              Tables are protected by unique Redis room codes and PIN access control.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Enter 6-digit Code"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  background: '#1b2030',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
              <button
                className="room-join-btn"
                style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}
                onClick={() => alert(`Connecting to room ${roomCodeInput || 'AUTO'}...`)}
              >
                Enter
              </button>
            </div>

            <div style={{ padding: '12px', background: '#121622', borderRadius: '10px', fontSize: '12px' }}>
              <div style={{ fontWeight: 600, color: '#c084fc', marginBottom: '4px' }}>RBAC Role Capabilities:</div>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', lineHeight: 1.6 }}>
                <li><strong>Host:</strong> Start match, kick users, modify stakes</li>
                <li><strong>Active Player:</strong> Game actions, full voice & chat</li>
                <li><strong>Spectator:</strong> Read-only view & listening access</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card-section">
            <div className="section-title">
              <span>Anti-Cheat & Security</span>
              <ShieldCheck size={16} color="#10b981" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#1b2030', borderRadius: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Authoritative Engine</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Active (Server)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#1b2030', borderRadius: '8px' }}>
                <span style={{ color: '#94a3b8' }}>WebSocket Protocol</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>Socket.io + Redis</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#1b2030', borderRadius: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Cryptographic PRNG</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>crypto.getRandomValues</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#1b2030', borderRadius: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Device Token</span>
                <span style={{ color: '#818cf8', fontFamily: 'monospace' }}>DEV-F928-88A</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="card-section" style={{ textAlign: 'center' }}>
            <div className="user-avatar" style={{ width: '64px', height: '64px', margin: '0 auto 12px auto', fontSize: '22px' }}>
              AN
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Alex Nova</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>Player ID: #994821</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left' }}>
              <div style={{ background: '#1b2030', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Matches Won</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>148</div>
              </div>
              <div style={{ background: '#1b2030', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Win Rate</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#c084fc' }}>68.4%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* App Bottom Navigation Bar */}
      <nav className="mobile-bottom-tabs">
        <button
          className={`tab-btn ${activeTab === 'lobby' ? 'active' : ''}`}
          onClick={() => setActiveTab('lobby')}
        >
          <Gamepad2 size={18} />
          <span>Lobby</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          <Users size={18} />
          <span>Rooms</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheck size={18} />
          <span>Security</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  )
}
