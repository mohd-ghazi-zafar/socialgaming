import { useState } from 'react'
import { ChevronLeft, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { loginWithUniqueId } from '../../services/api'
import './IdLoginScreen.css'

export default function IdLoginScreen({ onBack, onSignIn }) {
  const [uadaId, setUadaId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanId = uadaId.trim()
    if (!cleanId) {
      setErrorMsg('Please enter your UADA ID')
      return
    }
    if (!password) {
      setErrorMsg('Please enter your password')
      return
    }

    setLoading(true)
    try {
      const res = await loginWithUniqueId(cleanId, password)
      if (onSignIn) {
        onSignIn(res.user, res.token)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your ID and password.')
    } finally {
      setLoading(false)
    }
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
        <h2 className="id-login-title">Sign in with UADA ID</h2>

        {errorMsg && (
          <div className="id-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="id-input-list">
            {/* UADA ID Input */}
            <div className="id-pill-input-box">
              <input
                type="text"
                className="id-pill-input"
                placeholder="Enter UADA ID (e.g. G-839201-2026)"
                value={uadaId}
                onChange={(e) => setUadaId(e.target.value)}
                required
                autoFocus
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
          <button
            type="submit"
            className="id-signin-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading-row">
                <Loader2 size={18} className="spin-icon" />
                <span>Signing in...</span>
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Forgot Password Link */}
          <div
            className="forgot-password-link"
            onClick={() => alert('Please contact UADA Support or your administrator to reset your password.')}
          >
            Forgot password?
          </div>
        </form>
      </div>
    </div>
  )
}
