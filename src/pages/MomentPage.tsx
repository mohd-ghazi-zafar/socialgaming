import React, { useState } from 'react'
import { Bell, Search, Heart, MessageCircle, UserPlus, Edit3 } from 'lucide-react'

export const MomentPage: React.FC = () => {
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))
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

        <button type="button" className="text-slate-300 hover:text-white transition-colors cursor-pointer" title="Notifications">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar + Trending Hashtag Chips */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 bg-[#08231e] border border-emerald-800/40 rounded-full px-3 py-1.5 shadow-inner">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search moments, topics..."
            className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none flex-1"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['# OOTD', '# حديقة البوح', '# الوصول للتمارين', '# Gaming'].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-[#0a2721] text-teal-300 text-xs font-semibold shrink-0 border border-emerald-900/40 hover:bg-[#0f342c] cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Moments Feed Posts */}
      <div className="space-y-3 px-3">
        {/* Post 1 */}
        <div className="bg-[#08231e]/90 border border-emerald-800/30 rounded-2xl p-3.5 shadow-md space-y-3">
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-800 to-indigo-950 flex items-center justify-center font-bold text-white ring-1 ring-teal-400">
                🧔
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-white">
                  الباش الخزرجي
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="bg-blue-600/80 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    💎 V6
                  </span>
                  <span className="bg-amber-600/80 text-amber-100 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    NT
                  </span>
                  <span className="bg-purple-600/80 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    🔥 68
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 flex items-center justify-center transition-colors cursor-pointer"
              title="Follow"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Post Body Quote */}
          <p className="text-xs text-slate-100 leading-relaxed font-medium text-right dir-rtl" dir="rtl">
            أحقر الرجال من يجلس يتكلم عن عرض امراة كان يوماً يناديها حبيبتي
          </p>

          {/* Media Container Placeholder */}
          <div className="w-full h-44 rounded-xl bg-gradient-to-b from-[#0b2b25] to-[#041914] border border-emerald-900/40 flex items-center justify-center text-slate-500 text-xs font-semibold">
            <span>📷 Moment Visual Asset</span>
          </div>

          {/* Post Footer Actions */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-950/60">
            <span>7 days ago</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => toggleLike('post-1')}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  likedPosts['post-1'] ? 'text-rose-400' : 'hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedPosts['post-1'] ? 'fill-current' : ''}`} />
                <span>{likedPosts['post-1'] ? 862 : 861}</span>
              </button>
              <button type="button" className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>262</span>
              </button>
            </div>
          </div>
        </div>

        {/* Post 2 (Meme Post) */}
        <div className="bg-[#08231e]/90 border border-emerald-800/30 rounded-2xl p-3.5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-950 flex items-center justify-center font-bold text-white ring-1 ring-purple-400">
                🖤
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-white">
                  c_il__adman_oal
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="bg-blue-600/80 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    💎 V6
                  </span>
                  <span className="bg-teal-600/80 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    🔵 52
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 flex items-center justify-center transition-colors cursor-pointer"
              title="Follow"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-100 leading-relaxed font-medium text-right dir-rtl" dir="rtl">
            الله يرحمك يا جدي 😭😭😭 #حقيقة البوح #OOTD
          </p>

          {/* Meme Card */}
          <div className="w-full rounded-xl bg-black/70 border border-slate-800 p-4 text-center space-y-2">
            <p className="text-sm font-black text-white leading-relaxed" dir="rtl">
              جدي وهو بيموت قالي سبتلك ورث تاكل بيه طول عمرك فتحت الصندوق لقيت معلقه 🥺🥄
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-950/60">
            <span>2 days ago</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => toggleLike('post-2')}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  likedPosts['post-2'] ? 'text-rose-400' : 'hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedPosts['post-2'] ? 'fill-current' : ''}`} />
                <span>{likedPosts['post-2'] ? 450 : 449}</span>
              </button>
              <button type="button" className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>88</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Compose Moment) */}
      <button
        type="button"
        onClick={() => alert('Compose new Moment post')}
        className="fixed bottom-20 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-[#04241d] font-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        title="Compose Moment"
      >
        <Edit3 className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  )
}
