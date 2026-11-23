import React, { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Eye, Camera, Check, X } from 'lucide-react'
import { getAuthToken, setStoredAuth, editUser, normalizeImageUrl } from '../services/api'

interface EditProfilePageProps {
  user: any
  onBack: () => void
  onUpdateUser: (updatedUser: any) => void
}

type ActiveField =
  | 'nickname'
  | 'gender'
  | 'birthday'
  | 'age'
  | 'mbti'
  | 'bio'
  | 'hometown'
  | 'residency'
  | null

export const EditProfilePage: React.FC<EditProfilePageProps> = ({
  user,
  onBack,
  onUpdateUser,
}) => {
  const [profile, setProfile] = useState({
    name: user?.name || 'Laraib Husain',
    gender: user?.gender || 'Male',
    birthday: user?.birthday || '12/12',
    age: user?.age ? String(user.age) : '24',
    mbti: user?.mbti || '',
    bio: user?.bio || '',
    hometown: user?.hometown || '',
    residency: user?.residency || '',
    profile_image: user?.profile_image || null,
  })

  const [activeField, setActiveField] = useState<ActiveField>(null)
  const [fieldValue, setFieldValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // Calculate Data Completion Percentage dynamically
  const calculateCompletion = () => {
    const fields = [
      profile.profile_image || profile.name,
      profile.name,
      profile.gender,
      profile.birthday,
      profile.age,
      profile.mbti,
      profile.bio,
      profile.hometown,
      profile.residency,
    ]
    const filledCount = fields.filter((f) => Boolean(f && String(f).trim())).length
    return Math.round((filledCount / fields.length) * 100)
  }

  const completionPercent = calculateCompletion()
  const avatarInitial = profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'L'
  const displayAvatar = normalizeImageUrl(profile.profile_image)

  const handleOpenField = (field: ActiveField) => {
    setActiveField(field)
    switch (field) {
      case 'nickname':
        setFieldValue(profile.name)
        break
      case 'gender':
        setFieldValue(profile.gender)
        break
      case 'birthday':
        setFieldValue(profile.birthday)
        break
      case 'age':
        setFieldValue(profile.age)
        break
      case 'mbti':
        setFieldValue(profile.mbti)
        break
      case 'bio':
        setFieldValue(profile.bio)
        break
      case 'hometown':
        setFieldValue(profile.hometown)
        break
      case 'residency':
        setFieldValue(profile.residency)
        break
      default:
        setFieldValue('')
    }
  }

  const handleSaveField = async () => {
    if (!activeField) return

    const updatedProfile = { ...profile }
    switch (activeField) {
      case 'nickname':
        if (!fieldValue.trim()) return
        updatedProfile.name = fieldValue.trim()
        break
      case 'gender':
        updatedProfile.gender = fieldValue
        break
      case 'birthday':
        updatedProfile.birthday = fieldValue.trim()
        break
      case 'age':
        updatedProfile.age = fieldValue.trim()
        break
      case 'mbti':
        updatedProfile.mbti = fieldValue.trim().toUpperCase()
        break
      case 'bio':
        updatedProfile.bio = fieldValue.trim()
        break
      case 'hometown':
        updatedProfile.hometown = fieldValue.trim()
        break
      case 'residency':
        updatedProfile.residency = fieldValue.trim()
        break
    }

    setProfile(updatedProfile)
    setActiveField(null)

    // Save to App State & LocalStorage
    const token = getAuthToken()
    const mergedUser = {
      ...user,
      ...updatedProfile,
      age: parseInt(updatedProfile.age, 10) || user?.age || 24,
    }
    if (token) {
      setStoredAuth(token, mergedUser, user?.user_uid || user?.unique_id)
    }
    onUpdateUser(mergedUser)

    // Sync to Backend Database API
    if (token && user?.id) {
      setIsSaving(true)
      try {
        await editUser(
          user.id,
          {
            name: mergedUser.name,
            gender: mergedUser.gender.toLowerCase(),
            age: mergedUser.age,
          },
          token
        )
      } catch (err: any) {
        console.debug('Backend profile sync note:', err.message)
      } finally {
        setIsSaving(false)
      }
    }

    showToast('Saved successfully!')
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    const updatedProfile = { ...profile, profile_image: localUrl }
    setProfile(updatedProfile)

    const token = getAuthToken()
    const mergedUser = { ...user, profile_image: localUrl }
    if (token) {
      setStoredAuth(token, mergedUser, user?.user_uid || user?.unique_id)
    }
    onUpdateUser(mergedUser)

    // Send multipart form-data to backend
    if (token && user?.id) {
      const formData = new FormData()
      formData.append('profile', file)
      formData.append('name', profile.name)
      formData.append('gender', profile.gender.toLowerCase())
      formData.append('age', profile.age)

      try {
        const res = await editUser(user.id, formData, token)
        if (res?.user?.profile_image) {
          const remoteUrl = normalizeImageUrl(res.user.profile_image)
          setProfile((prev) => ({ ...prev, profile_image: remoteUrl }))
        }
      } catch (err: any) {
        console.debug('Image upload note:', err.message)
      }
    }

    showToast('Avatar updated!')
  }

  return (
    <div className="fixed inset-0 z-40 w-full max-w-[471px] mx-auto min-h-screen bg-white text-[#111827] flex flex-col font-sans select-none overflow-x-hidden overflow-y-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#111827] text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="relative px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-gray-800 hover:text-black transition-colors cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2]" />
        </button>

        {/* Center Title & Data Completion */}
        <div className="flex flex-col items-center">
          <h1 className="text-[17px] font-bold text-[#111827] leading-tight">
            Edit Profile
          </h1>
          <span className="text-[11px] text-gray-400 font-medium mt-0.5">
            Current Data Completion: {completionPercent}%
          </span>
        </div>

        {/* Spacer to keep center alignment */}
        <div className="w-7" />
      </div>

      {/* Profile Form Items List */}
      <div className="flex-1 divide-y divide-gray-100 bg-white px-4">
        {/* 1. Avatar */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">Avatar</span>
          <div className="flex items-center gap-2">
            <div className="relative w-11 h-11 rounded-full bg-[#008075] flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-xs">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{avatarInitial}</span>
              )}
              <div className="absolute inset-0 bg-black/15 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 2. Nickname */}
        <div
          onClick={() => handleOpenField('nickname')}
          className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">Nickname</span>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-[#111827]">{profile.name}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 3. Gender */}
        <div
          onClick={() => handleOpenField('gender')}
          className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">Gender</span>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-[15px] font-semibold text-[#111827]">{profile.gender}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 4. Birthday */}
        <div
          onClick={() => handleOpenField('birthday')}
          className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">Birthday</span>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-[15px] font-semibold text-[#111827]">{profile.birthday}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 5. Age */}
        <div
          onClick={() => handleOpenField('age')}
          className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">Age</span>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-[15px] font-semibold text-[#111827]">{profile.age}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 6. MBTI */}
        <div
          onClick={() => handleOpenField('mbti')}
          className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">MBTI</span>
          <div className="flex items-center gap-2">
            {profile.mbti ? (
              <span className="text-xs font-extrabold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {profile.mbti}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 7. Self-Introduction */}
        <div
          onClick={() => handleOpenField('bio')}
          className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">Self-Introduction</span>
          <div className="flex items-center gap-2">
            {profile.bio ? (
              <span className="text-xs text-gray-500 max-w-[150px] truncate">{profile.bio}</span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 8. My hometown */}
        <div
          onClick={() => handleOpenField('hometown')}
          className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">My hometown</span>
          <div className="flex items-center gap-2">
            {profile.hometown && (
              <span className="text-sm font-medium text-gray-600">{profile.hometown}</span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 9. Residency */}
        <div
          onClick={() => handleOpenField('residency')}
          className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-[15px] font-medium text-gray-800">Residency</span>
          <div className="flex items-center gap-2">
            {profile.residency && (
              <span className="text-sm font-medium text-gray-600">{profile.residency}</span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Interactive Bottom Sheet Editor for Fields */}
      {activeField && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl w-full max-w-[471px] p-5 shadow-2xl animate-slide-up space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900 capitalize">
                Edit {activeField === 'bio' ? 'Self-Introduction' : activeField}
              </h3>
              <button
                type="button"
                onClick={() => setActiveField(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Field-Specific Inputs */}
            {activeField === 'gender' ? (
              <div className="grid grid-cols-2 gap-3 py-2">
                {['Male', 'Female'].map((gen) => (
                  <button
                    key={gen}
                    type="button"
                    onClick={() => setFieldValue(gen)}
                    className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all cursor-pointer ${
                      fieldValue === gen
                        ? 'border-[#008075] bg-[#008075]/10 text-[#008075]'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            ) : activeField === 'mbti' ? (
              <div className="grid grid-cols-4 gap-2 py-2 max-h-48 overflow-y-auto no-scrollbar">
                {[
                  'INTJ', 'INTP', 'ENTJ', 'ENTP',
                  'INFJ', 'INFP', 'ENFJ', 'ENFP',
                  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
                  'ISTP', 'ISFP', 'ESTP', 'ESFP',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFieldValue(type)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      fieldValue === type
                        ? 'border-[#008075] bg-[#008075] text-white'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            ) : activeField === 'bio' ? (
              <textarea
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                rows={3}
                placeholder="Tell others about yourself..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-sm text-gray-800 focus:outline-none focus:border-[#008075]"
              />
            ) : (
              <input
                type={activeField === 'age' ? 'number' : 'text'}
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                placeholder={`Enter ${activeField}`}
                autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#008075]"
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveField(null)}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveField}
                className="px-6 py-2.5 bg-[#008075] hover:bg-[#006e64] active:scale-95 text-white font-extrabold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
