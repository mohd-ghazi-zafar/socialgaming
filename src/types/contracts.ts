/**
 * ============================================================================
 * CLICKNOVA PLAY / UADA — CANONICAL REALTIME & API CONTRACTS
 * ============================================================================
 * Strictly typed interfaces and event schemas governing client-server interaction.
 * Adheres to Zero-Trust architecture: Client emits intents only, Server broadcasts
 * canonical state snapshots.
 */

/* ----------------------------------------------------------------------------
 * 1. CORE GAMES & ROLE-BASED ACCESS CONTROL (RBAC)
 * ---------------------------------------------------------------------------- */

export type GameType = 'ludo' | 'chess' | 'domino' | 'jackaroo' | 'carrom' | 'ono'

/**
 * RBAC Table hierarchy:
 * - host: Room creator with table management authority (kick, start, room settings)
 * - player: Active seat with board move and audio transmit rights
 * - spectator: Read-only board and listen-only audio rights
 */
export type RoomRole = 'host' | 'player' | 'spectator'

export type VoiceState = 'off' | 'connected' | 'muted' | 'speaking'

export type AppTab = 'home' | 'room' | 'moment' | 'messages' | 'search' | 'account'

/* ----------------------------------------------------------------------------
 * 2. AUTHORITATIVE REALTIME WEBSOCKET CONTRACTS
 * ---------------------------------------------------------------------------- */

export type ClientIntentType =
  | 'MOVE_INTENT'
  | 'ROLL_INTENT'
  | 'SEAT_INTENT'
  | 'READY_INTENT'
  | 'LEAVE_INTENT'

export interface MoveIntentPayload {
  roomId: string
  playerId: string
  moveType: string
  payload: Record<string, unknown>
  clientTimestamp: number
}

export interface RollIntentPayload {
  roomId: string
  playerId: string
  clientTimestamp: number
}

export interface SeatIntentPayload {
  roomId: string
  targetSeatIndex: number
  role: RoomRole
  pin?: string
}

export type ServerSyncEvent =
  | 'ROOM_SNAPSHOT'
  | 'STATE_DELTA'
  | 'REJECTED_MOVE'
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'ROOM_CLOSED'

export interface RoomSeat {
  seatIndex: number
  userId?: string
  username?: string
  avatarUrl?: string
  role: RoomRole
  isReady: boolean
  isMuted: boolean
  isHost: boolean
}

export interface CanonicalRoomSnapshot {
  roomId: string
  gameType: GameType
  title: string
  turnPlayerId: string
  turnExpiresAt: number
  version: number
  boardState: Record<string, unknown>
  players: RoomSeat[]
}

/* ----------------------------------------------------------------------------
 * 3. LOBBY & ROOM MANAGEMENT
 * ---------------------------------------------------------------------------- */

export interface RoomCardData {
  id: string
  title: string
  gameType: GameType
  currentSeats: number
  maxSeats: number // 5 - 10 seats
  isPrivate: boolean
  hasVoice: boolean
  hostName: string
  hostAvatar: string
  minStake?: number
  userRole?: RoomRole
  status: 'waiting' | 'in_game' | 'full'
}

export interface CreateRoomConfig {
  title: string
  gameType: GameType
  maxSeats: 5 | 6 | 8 | 10
  isPrivate: boolean
  pin?: string
  enableVoice: boolean
  minStake?: number
}

/* ----------------------------------------------------------------------------
 * 4. BANNER & PROMO API (SCHEMA STUB)
 * ---------------------------------------------------------------------------- */

/**
 * JSDoc Schema Stub: Banner API response shape
 * GET /api/banners/active
 */
export interface BannerItem {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  ctaText: string
  targetRoute: string
  priority: number
  badge?: string
}

/* ----------------------------------------------------------------------------
 * 5. MOMENT / REELS CONTRACTS
 * ---------------------------------------------------------------------------- */

export interface MomentPost {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  isVerified?: boolean
  videoUrl?: string
  posterUrl: string
  caption: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  isLiked: boolean
  isFriend: boolean
  createdAt: string
  tags: string[]
}

export interface MomentComment {
  id: string
  momentId: string
  authorId: string
  authorName: string
  authorAvatar: string
  text: string
  createdAt: string
  likesCount: number
  isLiked: boolean
}

/* ----------------------------------------------------------------------------
 * 6. CHAT & MESSAGING CONTRACTS
 * ---------------------------------------------------------------------------- */

export interface ConversationItem {
  id: string
  type: 'direct' | 'group'
  name: string
  avatarUrl: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline?: boolean
  memberCount?: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string
  text: string
  timestamp: string
  isSelf: boolean
  status: 'sent' | 'delivered' | 'read'
}

/* ----------------------------------------------------------------------------
 * 7. USER DIRECTORY & SOCIAL
 * ---------------------------------------------------------------------------- */

export type VipTier = 'none' | 'silver' | 'gold' | 'diamond' | 'vip'

export interface DirectoryUser {
  id: string
  uniqueId: string
  name: string
  avatarUrl: string
  bio: string
  level: number
  vipTier: VipTier
  isFriend: boolean
  isOnline: boolean
  gamesPlayed: number
  winRate: number
  favoriteGame: GameType
}

/* ----------------------------------------------------------------------------
 * 8. WALLET & REVENUE SYSTEM (SCHEMA STUB)
 * ---------------------------------------------------------------------------- */

/**
 * JSDoc Schema Stub: User Wallet & Coins balance
 * GET /api/wallet/balance
 */
export interface WalletBalance {
  coins: number
  gems: number
  vipPoints: number
}

export interface ShopItem {
  id: string
  name: string
  category: 'coins' | 'gems' | 'dice_skin' | 'avatar_frame' | 'table_theme'
  amount?: number
  priceCoins?: number
  priceGems?: number
  realCurrencyPrice?: string
  icon: string
  popular?: boolean
}

/* ----------------------------------------------------------------------------
 * 9. BACKEND AUTH, REPORT, FOLLOW & BLOCK CONTRACTS
 * ---------------------------------------------------------------------------- */

export interface AuthUser {
  id: number | string
  user_uid: string
  role: 'user' | 'admin'
  auth_provider: 'phone' | 'google' | 'apple' | 'facebook' | 'snapchat'
  provider_id?: string | null
  phone_number?: string | null
  email?: string | null
  name: string
  gender?: string | null
  age?: number | null
  profile_image?: string | null
  is_verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  message: string
  unique_id?: string
  token?: string
  user?: AuthUser
  phone_number?: string
  otp?: string
}

export interface ReportPayload {
  reason: string
  description?: string
}

export interface ReportResponse {
  message: string
  totalReportsAgainstUser?: number
  data?: {
    id: number
    reporter_id: number
    reported_user_id: number
    reason: string
    description?: string | null
    status: string
    is_banned: boolean
    created_at: string
  }
}

export interface FollowStatsResponse {
  message: string
  stats: {
    followers: number
    following: number
  }
}

export interface FollowStatusResponse {
  message: string
  isFollowing: boolean
  requestStatus: 'pending' | 'accepted' | 'rejected' | null
}

export interface BlockStatusResponse {
  message: string
  isBlocked: boolean
}

