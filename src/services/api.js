const API_BASE_URL = 'https://72-61-235-208.sslip.io/api/signuproute'

export const AUTH_STORAGE_KEY = 'uada_auth_session'

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredAuth(token, user, unique_id) {
  try {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token,
        user,
        unique_id: unique_id || user?.user_uid || user?.unique_id,
        savedAt: Date.now(),
      })
    )
  } catch (e) {
    console.error('Failed to store auth:', e)
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear auth:', e)
  }
}

/**
 * 1. Send 6-digit OTP for phone signup
 * POST /auth/phone/send-otp
 */
export async function sendPhoneOtp(phoneNumber) {
  const cleanPhone = String(phoneNumber).trim()
  const res = await fetch(`${API_BASE_URL}/auth/phone/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: cleanPhone }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to send OTP (${res.status})`)
  }
  return data
}

/**
 * 2. Complete Phone Signup with OTP, password, profile image & role
 * POST /auth/phone/signup (multipart/form-data)
 */
export async function signupWithPhone(formData) {
  const res = await fetch(`${API_BASE_URL}/auth/phone/signup`, {
    method: 'POST',
    body: formData, // FormData automatically sets boundary & multipart
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Signup failed (${res.status})`)
  }

  if (data.token && data.user) {
    setStoredAuth(data.token, data.user, data.unique_id)
  }
  return data
}

/**
 * 3. Login using Unique ID (e.g. G-839201-2026) & password
 * POST /auth/login
 */
export async function loginWithUniqueId(uniqueId, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      unique_id: String(uniqueId).trim(),
      password,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Login failed (${res.status})`)
  }

  if (data.token && data.user) {
    setStoredAuth(data.token, data.user, data.user.user_uid)
  }
  return data
}

/**
 * 4. Social Auth (Google, Apple, Facebook, Snapchat)
 * POST /auth/social
 */
export async function socialAuth(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Social login failed (${res.status})`)
  }

  if (data.token && data.user) {
    setStoredAuth(data.token, data.user, data.unique_id)
  }
  return data
}

/**
 * 5. Update user profile
 * PUT /auth/users/update/:id
 */
export async function editUser(userId, formDataOrJson, token) {
  const isFormData = formDataOrJson instanceof FormData
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE_URL}/auth/users/update/${userId}`, {
    method: 'PUT',
    headers,
    body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to update profile (${res.status})`)
  }
  return data
}

/**
 * 6. Delete account
 * DELETE /auth/users/delete/:id
 */
export async function removeUser(userId, token) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}/auth/users/delete/${userId}`, {
    method: 'DELETE',
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to delete account (${res.status})`)
  }
  clearStoredAuth()
  return data
}
