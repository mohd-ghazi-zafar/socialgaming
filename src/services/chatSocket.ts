import { io, Socket } from 'socket.io-client'
import { API_BASE_ROOT } from './api'

let socket: Socket | null = null
let currentConnectedUserId: string | number | null = null
const activeOnlineUserIds = new Set<string>()
const onlineSubscribers = new Set<(onlineIds: Set<string>) => void>()

function notifySubscribers() {
  onlineSubscribers.forEach((cb) => {
    try {
      cb(new Set(activeOnlineUserIds))
    } catch (e) {
      console.debug('Error in online presence subscriber callback:', e)
    }
  })
}

/**
 * Initializes and returns the global Socket.IO instance
 */
export function getChatSocket(userId?: string | number): Socket {
  if (!socket) {
    socket = io(API_BASE_ROOT, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    socket.on('connect', () => {
      console.debug('[Socket] Connected to backend chat server:', socket?.id)
      if (currentConnectedUserId) {
        socket?.emit('user_online', currentConnectedUserId)
      }
    })

    socket.on('online_users', (userIds: (string | number)[]) => {
      if (Array.isArray(userIds)) {
        activeOnlineUserIds.clear()
        userIds.forEach((id) => activeOnlineUserIds.add(String(id)))
        notifySubscribers()
      }
    })

    // Listen for granular user status changes from 05_files
    socket.on('user_status_changed', (payload: { user_id: number; is_online: boolean; last_seen: string }) => {
      if (payload?.user_id) {
        const uid = String(payload.user_id)
        if (payload.is_online) {
          activeOnlineUserIds.add(uid)
        } else {
          activeOnlineUserIds.delete(uid)
        }
        notifySubscribers()
      }
    })

    socket.on('disconnect', (reason) => {
      console.debug('[Socket] Disconnected from backend chat server:', reason)
    })

    socket.on('connect_error', (err) => {
      console.debug('[Socket] Connection error (falling back to REST):', err.message)
    })
  }

  if (userId && userId !== currentConnectedUserId) {
    currentConnectedUserId = userId
    activeOnlineUserIds.add(String(userId))
    notifySubscribers()
    if (socket.connected) {
      socket.emit('user_online', userId)
    }
  }

  return socket
}

/**
 * Connects the current user to Socket.io and announces online presence
 */
export function connectChatUser(userId: string | number) {
  currentConnectedUserId = userId
  activeOnlineUserIds.add(String(userId))
  notifySubscribers()
  const s = getChatSocket(userId)
  if (s.connected) {
    s.emit('user_online', userId)
  }
}

/**
 * Subscribes to real-time online users updates
 */
export function subscribeToOnlineUsers(cb: (onlineIds: Set<string>) => void): () => void {
  onlineSubscribers.add(cb)
  // Immediately call with current active set
  cb(new Set(activeOnlineUserIds))
  return () => {
    onlineSubscribers.delete(cb)
  }
}

/**
 * Returns current set of online user IDs
 */
export function getOnlineUserIds(): Set<string> {
  return new Set(activeOnlineUserIds)
}

/**
 * Checks whether a specific user ID is online
 */
export function isUserOnline(userId: string | number): boolean {
  return activeOnlineUserIds.has(String(userId))
}

/**
 * Total count of online users
 */
export function getOnlineUsersCount(): number {
  return activeOnlineUserIds.size > 0 ? activeOnlineUserIds.size : 1
}

/**
 * Joins a specific 1-on-1 chat room
 */
export function joinChatRoom(chatId: number | string) {
  if (!chatId) return
  const s = getChatSocket()
  s.emit('join_chat', chatId)
}

/**
 * Leaves a specific 1-on-1 chat room
 */
export function leaveChatRoom(chatId: number | string) {
  if (!chatId) return
  const s = getChatSocket()
  s.emit('leave_chat', chatId)
}

/**
 * Dispatches a typing indicator
 */
export function emitTyping(chatId: number | string, senderId: number | string) {
  if (!chatId || !senderId) return
  const s = getChatSocket()
  s.emit('typing', { chat_id: chatId, sender_id: senderId })
}

/**
 * Dispatches a stop typing indicator
 */
export function emitStopTyping(chatId: number | string, senderId: number | string) {
  if (!chatId || !senderId) return
  const s = getChatSocket()
  s.emit('stop_typing', { chat_id: chatId, sender_id: senderId })
}

/**
 * Dispatches a mark-read event via Socket.IO
 */
export function emitMarkRead(chatId: number | string, readerId: number | string) {
  if (!chatId || !readerId) return
  const s = getChatSocket()
  s.emit('mark_read', { chat_id: chatId, reader_id: readerId })
}

/**
 * Dispatches a voice recording indicator (from 05_files)
 */
export function emitRecordingVoice(chatId: number | string, senderId: number | string) {
  if (!chatId || !senderId) return
  const s = getChatSocket()
  s.emit('recording_voice', { chat_id: chatId, sender_id: senderId })
}

/**
 * Dispatches a stop recording voice indicator (from 05_files)
 */
export function emitStopRecordingVoice(chatId: number | string, senderId: number | string) {
  if (!chatId || !senderId) return
  const s = getChatSocket()
  s.emit('stop_recording_voice', { chat_id: chatId, sender_id: senderId })
}

/**
 * Checks a specific user's status on demand via socket (from 05_files)
 */
export function checkUserStatus(
  targetUserId: number | string,
  callback?: (res: { success: boolean; data?: { user_id: number; is_online: boolean; last_seen: string | null } }) => void
) {
  if (!targetUserId) return
  const s = getChatSocket()
  s.emit('check_user_status', targetUserId, callback)
}

/**
 * Closes the active socket connection
 */
export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    currentConnectedUserId = null
  }
}
