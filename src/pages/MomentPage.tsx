import React, { useState, useEffect, useRef } from 'react'
import {
  Heart,
  MessageCircle,
  UserPlus,
  Edit3,
  Send,
  Check,
  Image as ImageIcon,
  Trash2,
  Smile,
  X,
  Plus,
  Loader2,
} from 'lucide-react'
import {
  viewAllMoments,
  viewUserMoments,
  postMoment,
  reactToMoment,
  removeMoment,
  getAuthToken,
  getStoredAuth,
  normalizeImageUrl,
  sendFollowRequest,
} from '../services/api'

interface MomentItem {
  id: number
  caption: string
  image_url: string
  created_at: string
  user_id: number
  user_uid: string
  user_name: string
  user_profile_image: string | null
  total_reactions: number
  reaction_breakdown?: Record<string, number>
  my_reaction?: string | null
}

const REACTION_EMOJIS: Record<string, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  fire: '🔥',
  sad: '😢',
}

export const MomentPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'recommended' | 'mine'>('recommended')
  const [moments, setMoments] = useState<MomentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [followedUsers, setFollowedUsers] = useState<Record<number, boolean>>({})

  // Post Moment Form States (supports multiple photo uploads)
  const [isPosting, setIsPosting] = useState(false)
  const [caption, setCaption] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Active Reaction Picker
  const [openReactionMomentId, setOpenReactionMomentId] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // Load moments from backend database
  const loadMoments = async () => {
    const token = getAuthToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      if (activeSubTab === 'recommended') {
        const res = await viewAllMoments(token)
        if (res?.moments && Array.isArray(res.moments)) {
          setMoments(res.moments)
        }
      } else {
        const currentUserId = getStoredAuth()?.user?.id
        if (currentUserId) {
          const res = await viewUserMoments(currentUserId, token)
          if (res?.moments && Array.isArray(res.moments)) {
            setMoments(res.moments)
          }
        }
      }
    } catch (err: any) {
      console.debug('Failed to fetch moments:', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMoments()
  }, [activeSubTab])

  // Handle Multi-Image Selection (up to 9 photos)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    if (newFiles.length === 0) return

    // Allow adding up to 9 photos total
    const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 9)
    setSelectedFiles(combinedFiles)

    // Generate fresh preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls(newPreviews)

    // Reset input value so same files can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove single photo from selection
  const handleRemovePhoto = (indexToRemove: number) => {
    if (previewUrls[indexToRemove]) {
      URL.revokeObjectURL(previewUrls[indexToRemove])
    }
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove)
    const updatedPreviews = previewUrls.filter((_, idx) => idx !== indexToRemove)
    setSelectedFiles(updatedFiles)
    setPreviewUrls(updatedPreviews)
  }

  // Clear all selected photos
  const handleClearPhotos = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setSelectedFiles([])
    setPreviewUrls([])
  }

  // Submit Post(s) to Backend
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = getAuthToken()
    if (!token) return showToast('Please log in first')

    if (selectedFiles.length === 0) {
      return showToast('Please select at least one photo for your moment')
    }

    setIsSubmitting(true)
    const total = selectedFiles.length
    setUploadProgress({ current: 0, total })

    try {
      for (let i = 0; i < total; i++) {
        setUploadProgress({ current: i + 1, total })
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append('image', file)

        if (caption.trim()) {
          const postCaption = total > 1 ? `${caption.trim()} (${i + 1}/${total})` : caption.trim()
          formData.append('caption', postCaption)
        }

        await postMoment(formData, token)
      }

      showToast(
        total === 1
          ? 'Moment posted successfully!'
          : `All ${total} photos shared successfully!`
      )
      setCaption('')
      handleClearPhotos()
      setIsPosting(false)
      loadMoments()
    } catch (err: any) {
      showToast(err.message || 'Failed to post moments')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(null)
    }
  }

  // Toggle or Set Reaction (like, love, haha, wow, fire, sad)
  const handleReact = async (momentId: number, reactionType: string = 'like') => {
    const token = getAuthToken()
    if (!token) return showToast('Please log in first')

    // Optimistic UI update
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id !== momentId) return m
        const isRemoving = m.my_reaction === reactionType
        const newReaction = isRemoving ? null : reactionType
        const diff = isRemoving ? -1 : m.my_reaction ? 0 : 1
        return {
          ...m,
          total_reactions: Math.max(0, m.total_reactions + diff),
          my_reaction: newReaction,
        }
      })
    )
    setOpenReactionMomentId(null)

    try {
      await reactToMoment(momentId, reactionType, token)
    } catch (err: any) {
      console.debug('Failed to react to moment:', err.message)
    }
  }

  // Delete Moment
  const handleDeleteMoment = async (momentId: number) => {
    const token = getAuthToken()
    if (!token) return

    if (!window.confirm('Are you sure you want to delete this moment?')) return

    try {
      await removeMoment(momentId, token)
      setMoments((prev) => prev.filter((m) => m.id !== momentId))
      showToast('Moment deleted')
    } catch (err: any) {
      showToast(err.message || 'Failed to delete moment')
    }
  }

  // Follow User
  const handleFollowUser = async (userId: number) => {
    let token = getAuthToken()
    if (!token) {
      token = await ensureActiveAuthToken()
    }
    if (!token) return showToast('Please log in to follow players')

    const currentUserId = getStoredAuth()?.user?.id
    if (currentUserId && Number(currentUserId) === Number(userId)) {
      showToast('You cannot follow yourself')
      return
    }

    try {
      const res = await sendFollowRequest(userId, token)
      setFollowedUsers((prev) => ({ ...prev, [userId]: true }))
      showToast(res.message || 'Follow request sent!')
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('already')) {
        setFollowedUsers((prev) => ({ ...prev, [userId]: true }))
        showToast('Follow request already pending!')
      } else if (msg.toLowerCase().includes('yourself')) {
        showToast('You cannot follow yourself')
      } else {
        showToast(msg || 'Unable to send follow request')
      }
    }
  }

  const currentUserId = getStoredAuth()?.user?.id

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-[#031914] min-h-screen text-white pb-6 font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#00dfb6] text-[#06201a] px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-emerald-950/60 bg-[#06201a] sticky top-0 z-30">
        <div className="flex items-center gap-5 text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('mine')}
            className={`transition-colors cursor-pointer ${
              activeSubTab === 'mine'
                ? 'text-white font-black text-base relative'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mine
            {activeSubTab === 'mine' && (
              <span className="absolute -bottom-2.5 inset-x-0 h-0.5 bg-[#00dfb6] rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('recommended')}
            className={`transition-colors cursor-pointer ${
              activeSubTab === 'recommended'
                ? 'text-white font-black text-base relative'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recommended
            {activeSubTab === 'recommended' && (
              <span className="absolute -bottom-2.5 inset-x-0 h-0.5 bg-[#00dfb6] rounded-full" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsPosting(!isPosting)}
          className="text-[#00dfb6] hover:text-[#2dd4bf] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold bg-[#092b23] px-3.5 py-1.5 rounded-full border border-teal-800/40 shadow-xs"
          title="Share Moment"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </div>

      {/* Write New Post Drawer */}
      {isPosting && (
        <form
          onSubmit={handleCreatePost}
          className="p-3.5 bg-[#07241e] border-b border-emerald-900/50 space-y-3 animate-slide-down"
        >
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Share a gaming moment with the UADA community..."
            rows={2}
            className="w-full bg-[#051c17] border border-emerald-700/50 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00dfb6] resize-none"
          />

          {/* Multi-Photo Grid Preview if Selected */}
          {previewUrls.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-emerald-700/60 shadow-md group bg-black/40"
                  >
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Photo index badge */}
                    <span className="absolute bottom-1 left-1 bg-black/70 text-[#00dfb6] text-[10px] font-black px-1.5 py-0.5 rounded-md">
                      {idx + 1}
                    </span>

                    {/* Delete photo button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 bg-black/80 hover:bg-rose-600 text-white rounded-full p-1 transition-colors cursor-pointer shadow-sm"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                ))}

                {/* Add more photo card if < 9 */}
                {selectedFiles.length < 9 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-emerald-700/60 hover:border-[#00dfb6] bg-[#051c17]/60 hover:bg-[#092b23] flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#00dfb6] transition-all cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Add more</span>
                  </button>
                )}
              </div>

              {/* Status info bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                <span>
                  {selectedFiles.length} of 9 photo{selectedFiles.length > 1 ? 's' : ''} selected
                </span>
                <button
                  type="button"
                  onClick={handleClearPhotos}
                  className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={selectedFiles.length >= 9}
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-300 hover:text-[#00dfb6] disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-semibold p-1 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-[#00dfb6]" />
              <span>
                {selectedFiles.length === 0
                  ? 'Add photos (up to 9)'
                  : selectedFiles.length < 9
                  ? `+ Add more (${selectedFiles.length}/9)`
                  : 'Max 9 photos'}
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPosting(false)
                  handleClearPhotos()
                }}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedFiles.length === 0}
                className={`px-4 py-1.5 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all ${
                  selectedFiles.length > 0 && !isSubmitting
                    ? 'bg-[#00dfb6] hover:bg-[#2dd4bf] text-[#06201a] active:scale-95'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {uploadProgress
                        ? `Posting ${uploadProgress.current}/${uploadProgress.total}...`
                        : 'Posting...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>
                      {selectedFiles.length > 1
                        ? `Share (${selectedFiles.length})`
                        : 'Share'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="w-full py-16 flex items-center justify-center gap-2 text-xs text-[#00dfb6]">
          <div className="w-4 h-4 border-2 border-[#00dfb6] border-t-transparent rounded-full animate-spin" />
          <span>Loading moments from server...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && moments.length === 0 && (
        <div className="py-20 text-center text-xs text-slate-400 px-6">
          <p className="text-sm font-bold text-slate-300 mb-1">No moments yet</p>
          <p>
            {activeSubTab === 'mine'
              ? 'You have not shared any moments yet. Tap "Post" above to share one!'
              : 'Be the first to share a gaming moment or tournament victory!'}
          </p>
        </div>
      )}

      {/* Moments Feed from Real Backend Database */}
      {!isLoading && moments.length > 0 && (
        <div className="space-y-3 p-3">
          {moments.map((post) => {
            const isOwner = Number(post.user_id) === Number(currentUserId)
            const avatarUrl = normalizeImageUrl(post.user_profile_image)
            const postImgUrl = normalizeImageUrl(post.image_url)
            const initial = post.user_name ? post.user_name.trim().charAt(0).toUpperCase() : 'U'
            const formattedTime = post.created_at
              ? new Date(post.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recently'

            return (
              <div
                key={post.id}
                className="bg-[#08231e]/90 border border-emerald-800/30 rounded-2xl p-3.5 shadow-md space-y-3 relative"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-800 to-indigo-950 flex items-center justify-center font-bold text-white ring-1 ring-[#00dfb6] overflow-hidden shadow-xs">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white">{post.user_name}</span>
                      <span className="text-[10px] text-teal-400/80 font-mono">
                        {post.user_uid}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Delete button for post owner */}
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteMoment(post.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Moment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={Boolean(followedUsers[post.user_id])}
                        onClick={() => handleFollowUser(post.user_id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          followedUsers[post.user_id]
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 cursor-pointer'
                        }`}
                        title={followedUsers[post.user_id] ? 'Request Pending' : 'Follow Player'}
                      >
                        {followedUsers[post.user_id] ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Image */}
                {postImgUrl && (
                  <div className="w-full max-h-80 rounded-xl overflow-hidden bg-black/40 border border-emerald-950/60 shadow-inner">
                    <img
                      src={postImgUrl}
                      alt={post.caption || 'Moment photo'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Post Caption */}
                {post.caption && (
                  <p className="text-xs text-slate-100 leading-relaxed font-medium">
                    {post.caption}
                  </p>
                )}

                {/* Reaction Picker Bar (Popover) */}
                {openReactionMomentId === post.id && (
                  <div className="absolute bottom-12 right-4 bg-[#051c17] border border-teal-500/40 rounded-full px-2.5 py-1.5 flex items-center gap-2 shadow-2xl z-20 animate-scale-up">
                    {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleReact(post.id, type)}
                        className="text-base hover:scale-125 transition-transform p-0.5 cursor-pointer"
                        title={type}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Post Footer Actions */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-emerald-950/60">
                  <span className="text-[11px]">{formattedTime}</span>

                  <div className="flex items-center gap-4">
                    {/* Reaction Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          openReactionMomentId === post.id
                            ? setOpenReactionMomentId(null)
                            : setOpenReactionMomentId(post.id)
                        }
                        className={`flex items-center gap-1 transition-colors cursor-pointer ${
                          post.my_reaction ? 'text-[#00dfb6] font-bold' : 'hover:text-white'
                        }`}
                      >
                        {post.my_reaction && REACTION_EMOJIS[post.my_reaction] ? (
                          <span className="text-sm">{REACTION_EMOJIS[post.my_reaction]}</span>
                        ) : (
                          <Heart
                            className={`w-4 h-4 ${post.my_reaction ? 'fill-current' : ''}`}
                          />
                        )}
                        <span>{post.total_reactions || 0}</span>
                      </button>
                    </div>

                    {/* Comments Button */}
                    <button
                      type="button"
                      onClick={() => showToast('Comments section opening...')}
                      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {post.reaction_breakdown
                          ? Object.values(post.reaction_breakdown).reduce((a, b) => a + b, 0)
                          : 0}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
