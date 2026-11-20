import { useState } from 'react'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react'
import './IdLoginScreen.css'

export default function IdLoginScreen({ onBack, onSignIn }) {
  const [topTopId, setTopTopId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSignIn({ topTopId, password })
  }

  return (
    <div className="id-login-container">
      {/* Top Back Navigation Arrow */}
      <div className="id-login-top-bar">
        <button className="id-back-btn" onClick={onBack} title="Back">
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Main Login Form matching Reference */}
      <div className="id-login-body">
        <form onSubmit={handleSubmit}>
          <div className="id-input-list">
            {/* TopTop ID Input */}
            <div className="id-pill-input-box">
              <input
                type="text"
                className="id-pill-input"
                placeholder="Enter TopTop ID"
                value={topTopId}
                onChange={(e) => setTopTopId(e.target.value)}
                required
              />
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="id-pill-input-box">
              <input
                type={showPassword ? 'text' : 'password'}
                className="id-pill-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="id-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Turquoise Sign In Button */}
          <button type="submit" className="id-signin-btn">
            Sign in
          </button>

          {/* Forgot Password Link */}
          <div
            className="forgot-password-link"
            onClick={() => alert('Password recovery link sent to registered email/phone')}
          >
            Forgot password?
          </div>
        </form>
      </div>
    </div>
  )
}
