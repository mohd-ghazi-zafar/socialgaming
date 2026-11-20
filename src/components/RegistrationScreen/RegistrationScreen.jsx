import { useState } from 'react'
import {
  ChevronLeft,
  Plus,
  ChevronDown,
  Eye,
  EyeOff,
  Delete,
  CheckCircle,
  Copy,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { sendPhoneOtp, signupWithPhone } from '../../services/api'
import './RegistrationScreen.css'

export default function RegistrationScreen({ onBack, onComplete }) {
  // Wizard steps: 'profile' (1) -> 'phone' (2) -> 'otp_password' (3) -> 'success' (4)
  const [step, setStep] = useState('profile')

  // Step 1: Profile fields
  const [nickname, setNickname] = useState('Kashif sarwar')
  const [gender, setGender] = useState('male') // 'male' | 'female'
  const [birthYear, setBirthYear] = useState('2000')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  // Step 2: Phone number
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')

  // Step 3: OTP & Password
  const [otp, setOtp] = useState('')
  const [receivedOtp, setReceivedOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Feedback & Loading
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [createdUser, setCreatedUser] = useState(null)
  const [copiedId, setCopiedId] = useState(false)

  // Generate birth years
  const years = []
  for (let y = 2012; y >= 1970; y--) {
    years.push(y)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  // Step 1 -> Step 2
  const handleProceedToPhone = (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!nickname.trim()) {
      setErrorMsg('Please enter your nickname')
      return
    }
    setStep('phone')
  }

  // Numeric Keypad Handlers for Step 2
  const handleKeypadPress = (val) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber((prev) => prev + val)
    }
  }

  const handleKeypadBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1))
  }

  // Step 2 -> Step 3: Send OTP
  const handleSendOtp = async () => {
    setErrorMsg('')
    const cleanPhone = phoneNumber.trim()
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg('Please enter a valid mobile number (at least 8 digits)')
      return
    }

    setLoading(true)
    try {
      const fullPhone = `${countryCode}${cleanPhone}`
      const res = await sendPhoneOtp(fullPhone)
      if (res.otp) {
        setReceivedOtp(res.otp)
        setOtp(res.otp) // pre-populate for effortless testing
      }
      setStep('otp_password')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3 -> Signup Submit
  const handleFinalSignup = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code')
      return
    }
    if (!password) {
      setErrorMsg('Password is required')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Password and confirm password do not match')
      return
    }

    setLoading(true)
    try {
      const currentYear = new Date().getFullYear()
      const calculatedAge = birthYear ? currentYear - parseInt(birthYear, 10) : 24
      const fullPhone = `${countryCode}${phoneNumber.trim()}`

      const formData = new FormData()
      formData.append('phone_number', fullPhone)
      formData.append('otp', otp.trim())
      formData.append('password', password)
      formData.append('confirm_password', confirmPassword)
      formData.append('name', nickname.trim())
      formData.append('gender', gender)
      formData.append('age', String(calculatedAge))
      formData.append('role', 'user')

      if (avatarFile) {
        formData.append('profile', avatarFile)
      }

      const res = await signupWithPhone(formData)
      setCreatedUser({
        ...res.user,
        unique_id: res.unique_id,
        token: res.token,
      })
      setStep('success')
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed. Please verify the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard?.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // Keypad definitions
  const keypadRows = [
    [
      { num: '1', sub: '' },
      { num: '2', sub: 'ABC' },
      { num: '3', sub: 'DEF' },
    ],
    [
      { num: '4', sub: 'GHI' },
      { num: '5', sub: 'JKL' },
      { num: '6', sub: 'MNO' },
    ],
    [
      { num: '7', sub: 'PQRS' },
      { num: '8', sub: 'TUV' },
      { num: '9', sub: 'WXYZ' },
    ],
  ]

  return (
    <div className="reg-screen-container">
      {/* ======================================================== */}
      {/* STEP 1: WELCOME TO UADA (PROFILE SETUP)                 */}
      {/* ======================================================== */}
      {step === 'profile' && (
        <div className="reg-flow-step animate-step">
          <div>
            <div className="reg-top-bar">
              <button className="reg-back-btn" onClick={onBack} title="Back">
                <ChevronLeft size={24} />
              </button>
            </div>

            <h2 className="reg-title">Welcome to UADA</h2>

            {/* Avatar Upload Placeholder */}
            <div className="avatar-upload-wrapper">
              <label className="avatar-upload-circle" title="Upload avatar">
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="avatar-preview-img" />
                ) : (
                  <Plus size={36} className="avatar-plus-icon" />
                )}
              </label>
            </div>

            {errorMsg && (
              <div className="reg-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Profile Form */}
            <form className="reg-form" onSubmit={handleProceedToPhone}>
              {/* Nickname */}
              <div className="reg-field-group">
                <label className="reg-field-label">
                  <span className="label-required-asterisk">*</span>
                  <span>Nickname</span>
                </label>
                <input
                  type="text"
                  className="reg-pill-input"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  required
                />
              </div>

              {/* Select Gender */}
              <div className="reg-field-group">
                <label className="reg-field-label">Select Gender</label>
                <div className="gender-row">
                  <button
                    type="button"
                    className={`gender-pill-btn gender-pill-male ${gender === 'male' ? 'active' : ''}`}
                    onClick={() => setGender('male')}
                  >
                    <span>♂ Male</span>
                  </button>
                  <button
                    type="button"
                    className={`gender-pill-btn gender-pill-female ${gender === 'female' ? 'active' : ''}`}
                    onClick={() => setGender('female')}
                  >
                    <span>♀ Female</span>
                  </button>
                </div>
              </div>

              {/* Set Age */}
              <div className="reg-field-group">
                <label className="reg-field-label">Set Age</label>
                <div className="age-dropdown-wrapper">
                  <select
                    className="reg-pill-input age-select-input"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                  >
                    <option value="">Select your birth year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="dropdown-arrow-icon" />
                </div>
              </div>
            </form>
          </div>

          {/* Bottom Action */}
          <div className="reg-bottom-section">
            <button
              type="button"
              className="reg-next-btn"
              onClick={handleProceedToPhone}
            >
              Next
            </button>
            <p className="reg-disclaimer-text">
              Your personal information is protected and only used for better matching.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: ENTER YOUR PHONE NUMBER (SCREENSHOT 2 STYLE)     */}
      {/* ======================================================== */}
      {step === 'phone' && (
        <div className="reg-flow-step phone-step animate-step">
          <div className="phone-step-content">
            {/* Top Bar with Back Arrow */}
            <div className="reg-top-bar">
              <button
                className="reg-back-btn"
                onClick={() => {
                  setErrorMsg('')
                  setStep('profile')
                }}
                title="Back to profile"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            <h2 className="phone-step-title">Enter your phone number</h2>

            {errorMsg && (
              <div className="reg-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Phone Input Box matching screenshot */}
            <div className="phone-input-pill-box">
              <div className="country-code-pill">
                <span>{countryCode}</span>
                <ChevronDown size={14} className="country-arrow" />
              </div>
              <div className="phone-input-divider" />
              <input
                type="tel"
                className="phone-native-input"
                placeholder="Enter a mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>

            {/* Next Turquoise Button */}
            <button
              type="button"
              className="reg-next-btn phone-next-btn"
              disabled={loading || !phoneNumber}
              onClick={handleSendOtp}
            >
              {loading ? (
                <span className="btn-loading-row">
                  <Loader2 size={18} className="spin-icon" />
                  <span>Sending code...</span>
                </span>
              ) : (
                'Next'
              )}
            </button>
          </div>

          {/* Authentic Mobile Numeric Keypad matching screenshot */}
          <div className="ios-keypad-container">
            {keypadRows.map((row, rIdx) => (
              <div key={rIdx} className="keypad-row">
                {row.map((btn) => (
                  <button
                    key={btn.num}
                    type="button"
                    className="keypad-digit-btn"
                    onClick={() => handleKeypadPress(btn.num)}
                  >
                    <span className="keypad-digit-num">{btn.num}</span>
                    {btn.sub && <span className="keypad-digit-sub">{btn.sub}</span>}
                  </button>
                ))}
              </div>
            ))}
            <div className="keypad-row">
              <div className="keypad-spacer" />
              <button
                type="button"
                className="keypad-digit-btn"
                onClick={() => handleKeypadPress('0')}
              >
                <span className="keypad-digit-num">0</span>
              </button>
              <button
                type="button"
                className="keypad-backspace-btn"
                onClick={handleKeypadBackspace}
                title="Backspace"
              >
                <Delete size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: VERIFY OTP & SET PASSWORD                       */}
      {/* ======================================================== */}
      {step === 'otp_password' && (
        <div className="reg-flow-step animate-step">
          <div>
            <div className="reg-top-bar">
              <button
                className="reg-back-btn"
                onClick={() => {
                  setErrorMsg('')
                  setStep('phone')
                }}
                title="Back to phone"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            <h2 className="reg-title">Verify & Set Password</h2>
            <p className="reg-step-subtitle">
              Sent 6-digit OTP to <strong>{countryCode} {phoneNumber}</strong>
            </p>

            {receivedOtp && (
              <div className="test-otp-banner">
                <span className="otp-pill-label">Test Mode OTP:</span>
                <span className="otp-code-highlight">{receivedOtp}</span>
                <button
                  type="button"
                  className="otp-autofill-btn"
                  onClick={() => setOtp(receivedOtp)}
                >
                  Use OTP
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="reg-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="reg-form" onSubmit={handleFinalSignup}>
              {/* 6-Digit OTP */}
              <div className="reg-field-group">
                <label className="reg-field-label">
                  <span className="label-required-asterisk">*</span>
                  <span>6-Digit Verification Code</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="reg-pill-input text-center tracking-widest font-mono"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              {/* Password */}
              <div className="reg-field-group">
                <label className="reg-field-label">
                  <span className="label-required-asterisk">*</span>
                  <span>Create Password (min. 6 chars)</span>
                </label>
                <div className="reg-password-box">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="reg-pill-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="reg-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="reg-field-group">
                <label className="reg-field-label">
                  <span className="label-required-asterisk">*</span>
                  <span>Confirm Password</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="reg-pill-input"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </form>
          </div>

          <div className="reg-bottom-section">
            <button
              type="button"
              className="reg-next-btn"
              disabled={loading}
              onClick={handleFinalSignup}
            >
              {loading ? (
                <span className="btn-loading-row">
                  <Loader2 size={18} className="spin-icon" />
                  <span>Creating Account...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </button>
            <p className="reg-disclaimer-text">
              By creating an account, you agree to UADA Terms and Policy.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: SUCCESS MODAL / UNIQUE ID REVEAL                 */}
      {/* ======================================================== */}
      {step === 'success' && createdUser && (
        <div className="reg-flow-step success-step animate-step">
          <div className="success-content-card">
            <div className="success-check-badge">
              <CheckCircle size={56} className="success-icon" />
            </div>

            <h2 className="success-title">Account Created!</h2>
            <p className="success-desc">
              Welcome to UADA, <strong>{createdUser.name}</strong>! Your account has been registered.
            </p>

            <div className="unique-id-showcase-box">
              <span className="unique-id-lbl">YOUR OFFICIAL UADA ID</span>
              <div className="unique-id-row">
                <span className="unique-id-code">{createdUser.unique_id}</span>
                <button
                  type="button"
                  className="id-copy-action-btn"
                  onClick={() => handleCopyId(createdUser.unique_id)}
                  title="Copy UADA ID"
                >
                  <Copy size={16} />
                  <span>{copiedId ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="unique-id-hint">
                Save this Unique ID! You will need it along with your password to log in anytime.
              </p>
            </div>

            <button
              type="button"
              className="reg-next-btn continue-btn"
              onClick={() => onComplete(createdUser)}
            >
              Enter UADA
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
