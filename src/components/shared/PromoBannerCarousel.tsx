import React, { useState, useEffect } from 'react'
import { ChevronRight, Sparkles, ChevronLeft } from 'lucide-react'
import type { BannerItem } from '../../types/contracts'

interface PromoBannerCarouselProps {
  banners: BannerItem[]
  onBannerClick?: (banner: BannerItem) => void
  autoPlayIntervalMs?: number
}

export const PromoBannerCarousel: React.FC<PromoBannerCarouselProps> = ({
  banners,
  onBannerClick,
  autoPlayIntervalMs = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayIntervalMs)
    return () => clearInterval(timer)
  }, [banners.length, autoPlayIntervalMs])

  if (!banners || banners.length === 0) return null

  const current = banners[currentIndex]

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md">
      {/* Banner Card Container */}
      <div
        onClick={() => onBannerClick?.(current)}
        className="group relative flex min-h-[140px] sm:min-h-[160px] cursor-pointer flex-col justify-between overflow-hidden p-4 sm:p-5 transition-all"
      >
        {/* Ambient Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-slate-950/95 -z-10" />

        {/* Decorative subtle texture */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 to-transparent -z-10" />

        {/* Top Tag */}
        <div className="flex items-center justify-between">
          {current.badge ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {current.badge}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-purple-300 tracking-wider uppercase">
              UADA Event
            </span>
          )}

          {/* Navigation Arrows for Desktop */}
          {banners.length > 1 && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                title="Next"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Banner Content */}
        <div className="my-2 max-w-sm">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {current.title}
          </h3>
          <p className="mt-1 text-xs text-slate-300 line-clamp-2">
            {current.subtitle}
          </p>
        </div>

        {/* Bottom CTA & Progress Dots */}
        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
            {current.ctaText}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>

          {/* Indicator Dots */}
          {banners.length > 1 && (
            <div className="flex items-center gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(i)
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === i
                      ? 'w-4 bg-purple-400'
                      : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
