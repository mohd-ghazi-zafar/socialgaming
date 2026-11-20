import { useState } from 'react'
import { Mail, RotateCcw, UserPlus, LogIn } from 'lucide-react'
import toptopLogo from '../../assets/toptop-logo.png'
import './LoginScreen.css'

export default function LoginScreen({ onReplaySplash, onOpenRegistration, onOpenIdLogin }) {
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage('')
    }, 3000)
  }

  const handleAction = (provider) => {
    showToast(`Connecting with ${provider}...`)
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
        {/* Sign in with Apple - Fixed Pixel-Perfect SVG Logo */}
        <button
          className="btn-apple"
          onClick={() => handleAction('Apple')}
        >
          <svg width="16" height="20" viewBox="0 0 384 512" fill="currentColor">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
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

      {/* Circular Buttons Row: Facebook | Registration Form | Login Form | Snapchat */}
      <div className="social-circle-row">
        {/* 1. Facebook */}
        <button
          className="circle-btn"
          onClick={() => handleAction('Facebook')}
          title="Sign in with Facebook"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* 2. Registration Form (Welcome to TopTop screen) */}
        <button
          className="circle-btn circle-btn-register"
          onClick={onOpenRegistration}
          title="Registration Form"
        >
          <UserPlus size={21} />
        </button>

        {/* 3. Login Form (TopTop ID Login screen) */}
        <button
          className="circle-btn circle-btn-login"
          onClick={onOpenIdLogin}
          title="Login Form"
        >
          <LogIn size={21} />
        </button>

        {/* 4. Snapchat */}
        <button
          className="circle-btn"
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
