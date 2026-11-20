import { useState } from 'react'
import {
  LogOut,
  Copy,
  Trash2,
  Shield,
  Phone,
  User as UserIcon,
  Calendar,
  Sparkles,
  ChevronLeft
} from 'lucide-react'
import appLogo from '/logo-cutout.png'
import { removeUser } from '../../services/api'
import './UserProfileScreen.css'

export default function UserProfileScreen({ user, token, onLogout, onBackToMain }) {
  const [copiedId, setCopiedId] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const uniqueId = user?.user_uid || user?.unique_id || 'UADA-PLAYER'

  const handleCopyId = () => {
    if (!uniqueId) return
    navigator.clipboard?.writeText(uniqueId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      'Are you sure you want to delete your UADA account? This action cannot be undone.'
    )
    if (!ok) return

    setDeleting(true)
    try {
      await removeUser(user?.id || uniqueId, token)
      alert('Your account has been deleted.')
      onLogout()
    } catch (err) {
      alert(err.message || 'Failed to delete account.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="profile-screen-container">
      {/* Top Header */}
      <div className="profile-top-bar">
        <button
          className="profile-back-btn"
          onClick={onBackToMain}
          title="Back to Landing"
        >
          <ChevronLeft size={22} />
          <span>Lobby</span>
        </button>

        <button
          className="profile-logout-btn"
          onClick={onLogout}
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="profile-scroll-body">
        {/* Official UADA VIP Player Card */}
        <div className="profile-card">
          <div className="card-top-shine" />
          <div className="card-header">
            <div className="card-logo-box">
              <img src={appLogo} alt="UADA" className="card-logo-img" />
              <span className="card-brand-title">UADA</span>
            </div>
            <div className="card-role-chip">
              <Shield size={12} />
              <span>{user?.role?.toUpperCase() || 'USER'}</span>
            </div>
          </div>

          <div className="card-avatar-row">
            <div className="profile-avatar-wrapper">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.name}
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="card-player-info">
              <h2 className="card-player-name">{user?.name || 'UADA Player'}</h2>
              <span className="card-provider-pill">
                Auth: {user?.auth_provider || 'phone'}
              </span>
            </div>
          </div>

          {/* UADA Unique ID Pill with One-Tap Copy */}
          <div className="card-id-strip">
            <div className="id-strip-label">
              <Sparkles size={12} />
              <span>OFFICIAL UNIQUE ID</span>
            </div>
            <div className="id-strip-content">
              <span className="id-strip-number">{uniqueId}</span>
              <button
                type="button"
                className="id-strip-copy-btn"
                onClick={handleCopyId}
              >
                <Copy size={13} />
                <span>{copiedId ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Details List */}
        <div className="profile-details-section">
          <h3 className="section-title">Player Details</h3>

          <div className="details-list">
            {/* Phone */}
            {user?.phone_number && (
              <div className="detail-item">
                <div className="detail-icon-box">
                  <Phone size={18} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{user.phone_number}</span>
                </div>
              </div>
            )}

            {/* Email */}
            {user?.email && (
              <div className="detail-item">
                <div className="detail-icon-box">
                  <UserIcon size={18} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>
              </div>
            )}

            {/* Gender */}
            <div className="detail-item">
              <div className="detail-icon-box">
                <UserIcon size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Gender</span>
                <span className="detail-value capitalize">
                  {user?.gender || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Age */}
            <div className="detail-item">
              <div className="detail-icon-box">
                <Calendar size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Age</span>
                <span className="detail-value">
                  {user?.age ? `${user.age} years old` : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="profile-danger-zone">
          <button
            type="button"
            className="delete-acc-btn"
            disabled={deleting}
            onClick={handleDeleteAccount}
          >
            <Trash2 size={16} />
            <span>{deleting ? 'Deleting...' : 'Delete Account'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
