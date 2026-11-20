import { useState } from 'react'
import { Mail, RotateCcw } from 'lucide-react'
import toptopLogo from '../../assets/toptop-logo.png'
import './LoginScreen.css'

export default function LoginScreen({ onReplaySplash }) {
  const [toastMessage, setToastMessage] = useState('')

  const handleAction = (provider) => {
    setToastMessage(`Connecting with ${provider}...`)
    setTimeout(() => {
      setToastMessage('')
    }, 3000)
  }

  return (
    <div className="login-screen">
      {/* Toast popup */}
      {toastMessage && <div className="login-toast">{toastMessage}</div>}

      {/* Top Bar: Replay Splash & Need Help */}
      <div className="login-top-bar">
        <button
          className="replay-splash-pill"
          onClick={onReplaySplash}
          title="Replay Splash Screen"
        >
          <RotateCcw size={11} />
          <span>Splash</span>
        </button>

        <button
          className="need-help-btn"
          onClick={() => handleAction('Support Desk')}
        >
          <Mail size={13} />
          <span>Need help?</span>
        </button>
      </div>

      {/* Center Branding Hero */}
      <div className="login-hero-section">
        <div
          className="toptop-icon-container"
          onClick={onReplaySplash}
          title="TopTop"
        >
          <img
            src={toptopLogo}
            alt="TopTop Logo"
            className="toptop-icon-img"
          />
        </div>
        <h1 className="toptop-app-title">TopTop</h1>
      </div>

      {/* Action Buttons Section */}
      <div className="login-actions-section">
        {/* Sign in with Apple */}
        <button
          className="btn-apple"
          onClick={() => handleAction('Apple')}
        >
          {/* Apple Logo SVG */}
          <svg width="17" height="20" viewBox="0 0 170 170" fill="currentColor">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.44-6.3-9.74-11.2-20.91-14.7-33.51-3.5-12.61-5.25-24.16-5.25-34.66 0-14.36 3.65-26.04 10.96-35.02 7.3-8.99 16.51-13.57 27.63-13.76 4.79 0 10.23 1.25 16.33 3.75 6.1 2.5 10.15 3.8 12.16 3.9 1.63 0 5.86-1.35 12.68-4.04 6.82-2.69 12.62-3.88 17.4-3.58 13.51.76 24.36 5.68 32.55 14.76-11.75 7.12-17.5 16.9-17.26 29.35.25 10.13 4.11 18.52 11.59 25.17 7.48 6.64 16.29 10.37 26.43 11.19-2.22 6.81-4.8 13.43-7.75 19.86zM119.22 33.64c0-7.39 2.68-14.41 8.04-21.07 5.36-6.66 12.01-10.98 19.95-12.97.66 1.77.99 3.55.99 5.34 0 7.39-2.78 14.46-8.34 21.21-5.56 6.75-12.19 11.02-19.89 12.82-.25-1.78-.75-3.56-.75-5.33z" />
          </svg>
          <span>Sign in with Apple</span>
        </button>

        {/* Sign in with Google (with Last Login badge) */}
        <div className="google-btn-wrapper">
          <button
            className="btn-google"
            onClick={() => handleAction('Google')}
          >
            {/* Google colored G logo */}
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
          <div className="last-login-badge">Last login</div>
        </div>
      </div>

      {/* Or Divider */}
      <div className="or-divider">
        <div className="or-line" />
        <span>Or</span>
        <div className="or-line" />
      </div>

      {/* Circular Social Buttons Row */}
      <div className="social-circle-row">
        {/* Facebook */}
        <button
          className="circle-btn circle-btn-facebook"
          onClick={() => handleAction('Facebook')}
          title="Sign in with Facebook"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* Mobile / Phone */}
        <button
          className="circle-btn circle-btn-phone"
          onClick={() => handleAction('Phone SMS')}
          title="Sign in with Phone"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#22c55e">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </button>

        {/* ID Login */}
        <button
          className="circle-btn circle-btn-id"
          onClick={() => handleAction('TopTop ID')}
          title="Sign in with TopTop ID"
        >
          <span>ID</span>
        </button>

        {/* Snapchat */}
        <button
          className="circle-btn circle-btn-snapchat"
          onClick={() => handleAction('Snapchat')}
          title="Sign in with Snapchat"
        >
          <svg width="22" height="22" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11" fill="#FFFC00"/>
            <path fill="#000" d="M12 4.5c-2.4 0-3.9 1.6-4.1 3.9-.1.9.1 1.7.3 2.5-.5.2-1.1.4-1.2.9-.2.5.3.8.7 1 .2.1.4.3.4.5s-.3.6-.8.8c-.8.4-1.3 1.1-1.3 1.6 0 .8 1.1 1.1 2.2 1.2.3 0 .7.1.9.3.3.4.6 1.1 1.6 1.1.5 0 1-.2 1.3-.4.3-.2.7-.2 1 0 .3.2.8.4 1.3.4 1 0 1.3-.7 1.6-1.1.2-.2.6-.3.9-.3 1.1-.1 2.2-.4 2.2-1.2 0-.5-.5-1.2-1.3-1.6-.5-.2-.8-.6-.8-.8s.2-.4.4-.5c.4-.2.9-.5.7-1-.1-.5-.7-.7-1.2-.9.2-.8.4-1.6.3-2.5-.2-2.3-1.7-3.9-4.1-3.9z"/>
          </svg>
        </button>
      </div>

      {/* Bottom Legal Disclaimer */}
      <div className="login-disclaimer">
        <span>By continuing you agree to the </span>
        <span className="disclaimer-link" onClick={() => handleAction('Terms')}>Terms of Service</span>
        <span> and </span>
        <span className="disclaimer-link" onClick={() => handleAction('Privacy Policy')}>Privacy Policy</span>
      </div>
    </div>
  )
}
