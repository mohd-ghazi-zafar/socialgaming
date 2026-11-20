import { useState } from 'react'
import { ChevronLeft, Plus, ChevronDown } from 'lucide-react'
import './RegistrationScreen.css'

export default function RegistrationScreen({ onBack, onComplete }) {
  const [nickname, setNickname] = useState('Kashif sarwar')
  const [gender, setGender] = useState('male') // 'male' | 'female'
  const [birthYear, setBirthYear] = useState('')
  const [avatar, setAvatar] = useState(null)

  // Generate birth years from 2012 down to 1970
  const years = []
  for (let y = 2012; y >= 1970; y--) {
    years.push(y)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onComplete({ nickname, gender, birthYear })
  }

  return (
    <div className="reg-screen-container">
      {/* Top Bar with Back Arrow */}
      <div>
        <div className="reg-top-bar">
          <button className="reg-back-btn" onClick={onBack} title="Back">
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* Page Heading */}
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
            {avatar ? (
              <img src={avatar} alt="Avatar" className="avatar-preview-img" />
            ) : (
              <Plus size={36} className="avatar-plus-icon" />
            )}
          </label>
        </div>

        {/* Registration Form */}
        <form className="reg-form" onSubmit={handleSubmit}>
          {/* 1. Nickname */}
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

          {/* 2. Select Gender */}
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

          {/* 3. Set Age */}
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

      {/* Bottom Action & Privacy Note */}
      <div className="reg-bottom-section">
        <button
          type="button"
          className="reg-next-btn"
          onClick={handleSubmit}
        >
          Next
        </button>
        <p className="reg-disclaimer-text">
          Your personal information is protected and only used for better matching.
        </p>
      </div>
    </div>
  )
}
