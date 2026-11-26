/**
 * CLICKNOVA PLAY / UADA — REALTIME & REST API CLIENT
 * Strictly connects to backend endpoints:
 * - Auth & Users (/api/signuproute/auth & /api/signuproute/all_user)
 * - Reports (/api/report)
 * - Followers & Following (/api/follow)
 * - Blocks (/api/block)
 */

export const API_BASE_ROOT = 'https://72-61-235-208.sslip.io'
export const AUTH_BASE_URL = `${API_BASE_ROOT}/api/signuproute`
export const REPORT_BASE_URL = `${API_BASE_ROOT}/api/report/report`
export const FOLLOW_BASE_URL = `${API_BASE_ROOT}/api/follow`
export const BLOCK_BASE_URL = `${API_BASE_ROOT}/api/blockroute`
export const CHAT_BASE_URL = `${API_BASE_ROOT}/api/chatroute`
export const MOMENT_BASE_URL = `${API_BASE_ROOT}/api/momentroute`
export const BANNER_BASE_URL = `${API_BASE_ROOT}/api/banner`

export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null
  if (url.startsWith('http://72-61-235-208.sslip.io')) {
    return url.replace('http://72-61-235-208.sslip.io', 'https://72-61-235-208.sslip.io')
  }
  return url
}

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
    localStorage.removeItem('uada_splash_mode')
    sessionStorage.clear()
  } catch (e) {
    console.error('Failed to clear auth:', e)
  }
}

export function getAuthToken() {
  const stored = getStoredAuth()
  return stored?.token || null
}

/**
 * Ensures an active session token exists, auto-provisions one if missing
 */
export async function ensureActiveAuthToken() {
  const existing = getAuthToken()
  if (existing) return existing

  try {
    const res = await socialAuth({
      provider: 'google',
      provider_id: `browser_player_${Date.now()}`,
      name: 'Mohd Ghazi',
    })
    return res?.token || null
  } catch (err) {
    console.debug('Failed to auto-authenticate session:', err.message)
    return null
  }
}

function authHeader(token) {
  const t = token || getAuthToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

/* ============================================================================
 * 1. AUTHENTICATION & USER MANAGEMENT
 * ============================================================================ */

/**
 * Send 6-digit OTP for phone signup
 * POST /api/signuproute/auth/phone/send-otp
 */
export async function sendPhoneOtp(phoneNumber) {
  const cleanPhone = String(phoneNumber).trim()
  const res = await fetch(`${AUTH_BASE_URL}/auth/phone/send-otp`, {
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
 * Complete Phone Signup with OTP, password, profile image & role
 * POST /api/signuproute/auth/phone/signup (multipart/form-data)
 */
export async function signupWithPhone(formData) {
  const res = await fetch(`${AUTH_BASE_URL}/auth/phone/signup`, {
    method: 'POST',
    body: formData,
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
 * Login using Unique ID (e.g. G-839201-2026) & password
 * POST /api/signuproute/auth/login
 */
export async function loginWithUniqueId(uniqueId, password) {
  const res = await fetch(`${AUTH_BASE_URL}/auth/login`, {
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
 * Social Auth (Google, Apple, Facebook, Snapchat)
 * POST /api/signuproute/auth/social
 */
export async function socialAuth(payload) {
  const res = await fetch(`${AUTH_BASE_URL}/auth/social`, {
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
 * Get My Profile (with is_banned status)
 * GET /api/signuproute/auth/users/me
 */
export async function getMyProfile(token) {
  const res = await fetch(`${AUTH_BASE_URL}/auth/users/me`, {
    method: 'GET',
    headers: {
      ...authHeader(token),
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch profile (${res.status})`)
  }
  return data
}

/**
 * View All Registered Users
 * GET /api/signuproute/all_user
 */
export async function viewAllUsers(token) {
  const res = await fetch(`${AUTH_BASE_URL}/all_user`, {
    method: 'GET',
    headers: {
      ...authHeader(token),
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch users (${res.status})`)
  }
  return data
}

/**
 * Update user profile
 * PUT /api/signuproute/auth/users/update/:id
 */
export async function editUser(userId, formDataOrJson, token) {
  const isFormData = formDataOrJson instanceof FormData
  const headers = { ...authHeader(token) }
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${AUTH_BASE_URL}/auth/users/update/${userId}`, {
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
 * Delete account (admin role)
 * DELETE /api/signuproute/auth/users/delete/:id
 */
export async function removeUser(userId, token) {
  const res = await fetch(`${AUTH_BASE_URL}/auth/users/delete/${userId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to delete account (${res.status})`)
  }
  clearStoredAuth()
  return data
}

/* ============================================================================
 * 2. REPORT SYSTEM
 * ============================================================================ */

/**
 * Submit a report against a user
 * POST /api/report/:userId
 */
export async function submitReport(reportedUserId, { reason, description }, token) {
  const res = await fetch(`${REPORT_BASE_URL}/${reportedUserId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    body: JSON.stringify({ reason, description }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to submit report (${res.status})`)
  }
  return data
}

/**
 * View reports submitted by the logged-in user
 * GET /api/report/my-reports
 */
export async function viewMyReports(token) {
  const res = await fetch(`${REPORT_BASE_URL}/my-reports`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch reports (${res.status})`)
  }
  return data
}

/* ============================================================================
 * 3. FOLLOWERS & FOLLOWING SYSTEM
 * ============================================================================ */

/**
 * Send follow request to a user
 * POST /api/follow/request/:userId
 */
export async function sendFollowRequest(targetUserId, token) {
  const res = await fetch(`${FOLLOW_BASE_URL}/request/${targetUserId}`, {
    method: 'POST',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // If already sent or pending, handle gracefully without crashing
    if (res.status === 400 && data.message && data.message.toLowerCase().includes('already')) {
      return { success: true, alreadySent: true, message: data.message }
    }
    throw new Error(data.message || `Failed to send follow request (${res.status})`)
  }
  return data
}

/**
 * Accept a received follow request
 * PUT /api/follow/accept/:requestId
 */
export async function acceptFollowRequest(requestId, token) {
  const res = await fetch(`${FOLLOW_BASE_URL}/accept/${requestId}`, {
    method: 'PUT',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to accept follow request (${res.status})`)
  }
  return data
}

/**
 * Reject a received follow request
 * DELETE /api/follow/reject/:requestId
 */
export async function rejectFollowRequest(requestId, token) {
  const res = await fetch(`${FOLLOW_BASE_URL}/reject/${requestId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to reject follow request (${res.status})`)
  }
  return data
}

/**
 * Unfollow user
 * DELETE /api/follow/:userId
 */
export async function unfollowUser(targetUserId, token) {
  const res = await fetch(`${FOLLOW_BASE_URL}/${targetUserId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to unfollow user (${res.status})`)
  }
  return data
}

/**
 * View pending follow requests received by logged-in user
 * GET /api/follow/requests
 */
export async function viewPendingFollowRequests(token) {
  try {
    const res = await fetch(`${FOLLOW_BASE_URL}/requests`, {
      method: 'GET',
      headers: { ...authHeader(token) },
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.warn(`[API] /api/follow/requests responded with ${res.status}:`, data.message)
      return { success: false, requests: [] }
    }
    return data
  } catch (err) {
    console.warn('[API] /api/follow/requests network fallback:', err.message)
    return { success: false, requests: [] }
  }
}

/**
 * Get followers list for logged-in user
 * GET /api/follow/followers/my
 */
export async function viewFollowers(token) {
  const res = await fetch(`${FOLLOW_BASE_URL}/followers/my`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch followers (${res.status})`)
  }
  return data
}

/**
 * Get following list for logged-in user
 * GET /api/follow/following/my
 */
export async function viewFollowing(token) {
  const res = await fetch(`${FOLLOW_BASE_URL}/following/my`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch following list (${res.status})`)
  }
  return data
}

/**
 * Get follow stats (followers + following count)
 * GET /api/follow/stats/combine
 */
export async function viewFollowStats(token) {
  const res = await fetch(`${FOLLOW_BASE_URL}/stats/combine`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch follow stats (${res.status})`)
  }
  return data
}

/**
 * Check follow & request status between current user and target user
 * GET /api/follow/status/:userId
 */
export async function checkFollowStatus(targetUserId, token) {
  const res = await fetch(`${FOLLOW_BASE_URL}/status/${targetUserId}`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to check follow status (${res.status})`)
  }
  return data
}

/* ============================================================================
 * 4. BLOCK SYSTEM
 * ============================================================================ */

/**
 * Block a user
 * POST /api/block/:userId
 */
export async function blockUser(targetUserId, token) {
  const res = await fetch(`${BLOCK_BASE_URL}/${targetUserId}`, {
    method: 'POST',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to block user (${res.status})`)
  }
  return data
}

/**
 * Unblock a user
 * DELETE /api/block/:userId
 */
export async function unblockUser(targetUserId, token) {
  const res = await fetch(`${BLOCK_BASE_URL}/${targetUserId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to unblock user (${res.status})`)
  }
  return data
}

/**
 * Check if a user is blocked
 * GET /api/block/status/:userId
 */
export async function checkBlockStatus(targetUserId, token) {
  const res = await fetch(`${BLOCK_BASE_URL}/status/${targetUserId}`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to check block status (${res.status})`)
  }
  return data
}

/**
 * Get list of blocked users
 * GET /api/block/list
 */
export async function viewBlockedUsers(token) {
  const res = await fetch(`${BLOCK_BASE_URL}/list`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch blocked users (${res.status})`)
  }
  return data
}

/**
 * Get count of blocked users
 * GET /api/blockroute/count
 */
export async function viewBlockedCount(token) {
  const res = await fetch(`${BLOCK_BASE_URL}/count`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch blocked count (${res.status})`)
  }
  return data
}

/* ============================================================================
 * 5. PRIVATE CHAT SYSTEM (/api/chatroute)
 * ============================================================================ */

/**
 * Get user's inbox (all conversations)
 * GET /api/chatroute/inbox
 */
export async function viewInbox(token) {
  const res = await fetch(`${CHAT_BASE_URL}/inbox`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch inbox (${res.status})`)
  }
  return data
}

/**
 * Start or get 1-on-1 chat room with another player
 * POST /api/chatroute/start/:receiverId
 */
export async function startOrGetChat(receiverId, token) {
  const res = await fetch(`${CHAT_BASE_URL}/start/${receiverId}`, {
    method: 'POST',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to start chat (${res.status})`)
  }
  return data
}

/**
 * Send a chat message (text, voice, image, video, file, sticker)
 * POST /api/chatroute/:chatId/send
 */
export async function sendChatMessage(chatId, payload, token) {
  const isFormData = payload instanceof FormData
  const headers = { ...authHeader(token) }
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${CHAT_BASE_URL}/${chatId}/send`, {
    method: 'POST',
    headers,
    body: isFormData ? payload : JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to send message (${res.status})`)
  }
  return data
}

/**
 * Get chat history by chat ID (paginated)
 * GET /api/chatroute/:chatId/messages?limit=50&offset=0
 */
export async function viewChatHistory(chatId, token, limit = 50, offset = 0) {
  const res = await fetch(`${CHAT_BASE_URL}/${chatId}/messages?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch chat history (${res.status})`)
  }
  return data
}

/**
 * Mark messages in a chat as read
 * PUT /api/chatroute/:chatId/read
 */
export async function markChatAsRead(chatId, token) {
  const res = await fetch(`${CHAT_BASE_URL}/${chatId}/read`, {
    method: 'PUT',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to mark read (${res.status})`)
  }
  return data
}

/**
 * React or unreact to a message with an emoji
 * PUT /api/chatroute/message/:messageId/react
 */
export async function reactToChatMessage(messageId, emoji, token) {
  const res = await fetch(`${CHAT_BASE_URL}/message/${messageId}/react`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    body: JSON.stringify({ emoji }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to react to message (${res.status})`)
  }
  return data
}

/**
 * Edit a text message (sender only)
 * PUT /api/chatroute/message/:messageId/edit
 */
export async function editChatMessage(messageId, content, token) {
  const res = await fetch(`${CHAT_BASE_URL}/message/${messageId}/edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    body: JSON.stringify({ content }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to edit message (${res.status})`)
  }
  return data
}

/**
 * Delete a message ("for me" or "for everyone")
 * DELETE /api/chatroute/message/:messageId?forEveryone=true
 */
export async function removeChatMessage(messageId, token, forEveryone = true) {
  const res = await fetch(`${CHAT_BASE_URL}/message/${messageId}?forEveryone=${Boolean(forEveryone)}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to delete message (${res.status})`)
  }
  return data
}

/**
 * Toggle pin / unpin message in chat
 * PUT /api/chatroute/message/:messageId/pin
 */
export async function pinChatMessage(messageId, token) {
  const res = await fetch(`${CHAT_BASE_URL}/message/${messageId}/pin`, {
    method: 'PUT',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to pin message (${res.status})`)
  }
  return data
}

/**
 * Search messages in a chat
 * GET /api/chatroute/:chatId/search?q=keyword
 */
export async function searchMessagesInChat(chatId, query, token) {
  const res = await fetch(`${CHAT_BASE_URL}/${chatId}/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to search messages (${res.status})`)
  }
  return data
}

/* ============================================================================
 * 6. MOMENTS SYSTEM (/api/momentroute)
 * ============================================================================ */

/**
 * Post a new moment (image file + caption)
 * POST /api/momentroute/moments
 */
export async function postMoment(formData, token) {
  const res = await fetch(`${MOMENT_BASE_URL}/moments`, {
    method: 'POST',
    headers: { ...authHeader(token) },
    body: formData,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to post moment (${res.status})`)
  }
  return data
}

/**
 * Get all moments feed (with reactions & user info)
 * GET /api/momentroute/moments?limit=20&offset=0
 */
export async function viewAllMoments(token, limit = 20, offset = 0) {
  const res = await fetch(`${MOMENT_BASE_URL}/moments?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch moments (${res.status})`)
  }
  return data
}

/**
 * Get moments of a specific user
 * GET /api/momentroute/moments/user/:userId
 */
export async function viewUserMoments(userId, token) {
  const res = await fetch(`${MOMENT_BASE_URL}/moments/user/${userId}`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch user moments (${res.status})`)
  }
  return data
}

/**
 * Get single moment by ID
 * GET /api/momentroute/moments/:momentId
 */
export async function viewMomentById(momentId, token) {
  const res = await fetch(`${MOMENT_BASE_URL}/moments/${momentId}`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch moment (${res.status})`)
  }
  return data
}

/**
 * React to a moment (like, love, haha, wow, fire, sad)
 * POST /api/momentroute/moments/:momentId/react
 */
export async function reactToMoment(momentId, reactionType, token) {
  const res = await fetch(`${MOMENT_BASE_URL}/moments/${momentId}/react`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    body: JSON.stringify({ reaction_type: reactionType }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to react to moment (${res.status})`)
  }
  return data
}

/**
 * View all reactions on a moment
 * GET /api/momentroute/moments/:momentId/reactions
 */
export async function viewMomentReactions(momentId, token) {
  const res = await fetch(`${MOMENT_BASE_URL}/moments/${momentId}/reactions`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch reactions (${res.status})`)
  }
  return data
}

/**
 * Delete a moment (owner or admin)
 * DELETE /api/momentroute/moments/:momentId
 */
export async function removeMoment(momentId, token) {
  const res = await fetch(`${MOMENT_BASE_URL}/moments/${momentId}`, {
    method: 'DELETE',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to delete moment (${res.status})`)
  }
  return data
}

/* ============================================================================
 * 7. PROMO BANNER SYSTEM (/api/banner)
 * ============================================================================ */

/**
 * Get active promotional banners
 * GET /api/banner
 */
export async function getActiveBanners(token) {
  const res = await fetch(`${BANNER_BASE_URL}`, {
    method: 'GET',
    headers: { ...authHeader(token) },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch banners (${res.status})`)
  }
  return data
}
