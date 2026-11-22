import React, { useState } from 'react'
import { X, Send, Heart } from 'lucide-react'
import type { MomentComment } from '../../types/contracts'

interface CommentDrawerProps {
  isOpen: boolean
  onClose: () => void
  momentId: string
  comments: MomentComment[]
  onAddComment: (momentId: string, text: string) => void
  onLikeComment?: (commentId: string) => void
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  isOpen,
  onClose,
  momentId,
  comments,
  onAddComment,
  onLikeComment,
}) => {
  const [inputText, setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = inputText.trim()
    if (!clean || isSubmitting) return

    setIsSubmitting(true)
    onAddComment(momentId, clean)
    setInputText('')
    setTimeout(() => setIsSubmitting(false), 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md h-[70vh] sm:h-[600px] flex flex-col rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 shrink-0">
          <span className="text-sm font-bold text-white">
            Comments ({comments.length})
          </span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Comment Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {comments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500 text-xs">
              <p>No comments yet.</p>
              <p className="mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5 text-xs">
                <img
                  src={c.authorAvatar}
                  alt={c.authorName}
                  className="h-8 w-8 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {c.authorName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {c.createdAt}
                    </span>
                  </div>
                  <p className="mt-0.5 text-slate-300 break-words leading-relaxed">
                    {c.text}
                  </p>
                </div>
                <button
                  onClick={() => onLikeComment?.(c.id)}
                  className={`flex flex-col items-center gap-0.5 pt-1 text-[10px] ${
                    c.isLiked ? 'text-rose-400' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      c.isLiked ? 'fill-current' : ''
                    }`}
                  />
                  <span>{c.likesCount}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom Input Field */}
        <form
          onSubmit={handleSend}
          className="border-t border-slate-800 p-3 bg-slate-950/80 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add a comment..."
            maxLength={200}
            className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white disabled:opacity-40 hover:bg-purple-500 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
