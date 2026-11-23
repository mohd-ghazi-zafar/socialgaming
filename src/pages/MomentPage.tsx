import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, UserPlus, Edit3, Send, Check } from 'lucide-react'
import { viewAllUsers, getAuthToken, normalizeImageUrl, sendFollowRequest } from '../services/api'

interface MomentPost {
  id: string
  userId: number
  authorName: string
  avatarInitial: string
  avatarImage?: string | null
  timeAgo: string
  content: string
  likes: number
  comments: number
  role: string
}

export const MomentPage: React.FC = () => {
  const [posts, setPosts] = useState<MomentPost[]>([])
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [followedUsers, setFollowedUsers] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [newMomentText, setNewMomentText] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  // Fetch real database users to generate moments feed
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    viewAllUsers(token)
      .then((res) => {
        if (res?.users && Array.isArray(res.users)) {
          const generated: MomentPost[] = res.users.map((u: any, idx: number) => {
            const initial = u.name ? u.name.trim().charAt(0).toUpperCase() : 'U'
            const avatarImg = normalizeImageUrl(u.profile_image)

            const sampleCaptions = [
              'Ready for the upcoming UADA weekend tournament! 🏆 Who is up for a match?',
              'Great games played today! Keep leveling up. 🎮✨',
              'Welcome everyone to the social gaming arena! Feel free to join my table.',
            ]

            return {
              id: `moment-${u.id}-${u.user_uid}`,
              userId: u.id,
              authorName: u.name,
              avatarInitial: initial,
              avatarImage: avatarImg,
              timeAgo: idx === 0 ? 'Just now' : `${idx + 1}d ago`,
              content: sampleCaptions[idx % sampleCaptions.length],
              likes: 12 + (u.id * 5),
              comments: 3 + u.id,
              role: u.role || 'user',
            }
          })
          setPosts(generated)
        }
      })
      .catch((err) => {
        console.debug('Failed to fetch moments feed:', err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleFollowUser = async (userId: number) => {
    const token = getAuthToken()
    if (!token) {
      alert('Please log in to follow players')
      return
    }

    try {
      await sendFollowRequest(userId, token)
      setFollowedUsers((prev) => ({ ...prev, [userId]: true }))
    } catch (err: any) {
      alert(err.message || 'Follow request sent!')
      setFollowedUsers((prev) => ({ ...prev, [userId]: true }))
    }
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMomentText.trim()) return

    const newPost: MomentPost = {
      id: `local-${Date.now()}`,
      userId: 9999,
      authorName: 'Me',
      avatarInitial: 'M',
      timeAgo: 'Just now',
      content: newMomentText.trim(),
      likes: 0,
      comments: 0,
      role: 'user',
    }

    setPosts((prev) => [newPost, ...prev])
    setNewMomentText('')
    setIsPosting(false)
  }

  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none bg-[#031914] min-h-screen text-white pb-6">
      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-emerald-950/60 bg-[#06201a]">
        <div className="flex items-center gap-5 text-sm font-bold">
          <button type="button" className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            Mine
          </button>
          <button type="button" className="relative text-white font-black text-base cursor-pointer">
            Recommended
            <span className="absolute -bottom-2 inset-x-0 h-0.5 bg-teal-400 rounded-full" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsPosting(!isPosting)}
          className="text-teal-400 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold bg-[#092b23] px-3 py-1.5 rounded-full border border-teal-800/40"
          title="Share Moment"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </div>

      {/* Write New Post Drawer */}
      {isPosting && (
        <form onSubmit={handleCreatePost} className="p-3 bg-[#07241e] border-b border-emerald-900/50 space-y-2">
          <textarea
            value={newMomentText}
            onChange={(e) => setNewMomentText(e.target.value)}
            placeholder="Share what is on your mind with UADA players..."
            rows={2}
            className="w-full bg-[#051c17] border border-emerald-700/50 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Share</span>
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="w-full py-8 flex items-center justify-center gap-2 text-xs text-emerald-400">
          <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading moments from server...</span>
        </div>
      )}

      {/* Moments Feed Posts */}
      {!isLoading && (
        <div className="space-y-3 p-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#08231e]/90 border border-emerald-800/30 rounded-2xl p-3.5 shadow-md space-y-3"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-800 to-indigo-950 flex items-center justify-center font-bold text-white ring-1 ring-teal-400 overflow-hidden">
                    {post.avatarImage ? (
                      <img src={post.avatarImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{post.avatarInitial}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-white">
                      {post.authorName}
                    </span>
                    <span className="text-[10px] text-teal-400/80 font-semibold uppercase">
                      {post.role}
                    </span>
                  </div>
                </div>

                {post.userId !== 9999 && (
                  <button
                    type="button"
                    onClick={() => handleFollowUser(post.userId)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      followedUsers[post.userId]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30'
                    }`}
                    title="Follow User"
                  >
                    {followedUsers[post.userId] ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Post Body */}
              <p className="text-xs text-slate-100 leading-relaxed font-medium">
                {post.content}
              </p>

              {/* Post Footer Actions */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-950/60">
                <span>{post.timeAgo}</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      likedPosts[post.id] ? 'text-rose-400' : 'hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-current' : ''}`} />
                    <span>{likedPosts[post.id] ? post.likes + 1 : post.likes}</span>
                  </button>
                  <button type="button" className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
