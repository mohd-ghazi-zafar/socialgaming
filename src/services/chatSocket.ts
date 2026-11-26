import { io, Socket } from 'socket.io-client'
import { API_BASE_ROOT } from './api'

let socket: Socket | null = null
let currentConnectedUserId: string | number | null = null

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

    socket.on('disconnect', (reason) => {
      console.debug('[Socket] Disconnected from backend chat server:', reason)
    })

    socket.on('connect_error', (err) => {
      console.debug('[Socket] Connection error (falling back to REST):', err.message)
    })
  }

  if (userId && userId !== currentConnectedUserId) {
    currentConnectedUserId = userId
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
  const s = getChatSocket(userId)
  if (s.connected) {
    s.emit('user_online', userId)
  }
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
 * Closes the active socket connection
 */
export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    currentConnectedUserId = null
  }
}
