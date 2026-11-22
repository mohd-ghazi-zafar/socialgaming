import React from 'react'

export interface ArchedGameCardProps {
  id: string
  title: string
  subtitle?: string
  bgGradient: string
  cardArt: React.ReactNode
  isNew?: boolean
  onClick?: () => void
}

export const ArchedGameCard: React.FC<ArchedGameCardProps> = ({
  title,
  subtitle,
  bgGradient,
  cardArt,
  isNew = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="group relative flex flex-col items-center justify-between cursor-pointer select-none transition-all duration-200 active:scale-95 hover:brightness-105"
      style={{
        width: '100%',
        aspectRatio: '108 / 140',
        minHeight: '138px',
      }}
    >
      {/* Golden Metallic Ornate Arch Frame Overlay */}
      <svg
        viewBox="0 0 100 136"
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gold Gradient for Arch Rim */}
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="25%" stopColor="#e5be6b" />
            <stop offset="50%" stopColor="#ffd885" />
            <stop offset="75%" stopColor="#c59132" />
            <stop offset="100%" stopColor="#875815" />
          </linearGradient>

          {/* Inner Golden Highlight Line */}
          <linearGradient id="goldInnerLine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#fde68a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.4" />
          </linearGradient>

          {/* SVG Clip Path for Content */}
          <clipPath id={`clip-${title.replace(/\s+/g, '')}`}>
            <path
              d="
                M 10,134
                L 90,134
                A 10,10 0 0 0 100,124
                L 100,24
                C 100,18 95,15 88,15
                C 80,15 72,16 66,11
                C 60,6 55,2 50,0.5
                C 45,2 40,6 34,11
                C 28,16 20,15 12,15
                C 5,15 0,18 0,24
                L 0,124
                A 10,10 0 0 0 10,134
                Z
              "
            />
          </clipPath>
        </defs>

        {/* Outer Heavy Gold Rim */}
        <path
          d="
            M 10,134
            L 90,134
            A 10,10 0 0 0 100,124
            L 100,24
            C 100,18 95,15 88,15
            C 80,15 72,16 66,11
            C 60,6 55,2 50,0.5
            C 45,2 40,6 34,11
            C 28,16 20,15 12,15
            C 5,15 0,18 0,24
            L 0,124
            A 10,10 0 0 0 10,134
            Z
          "
          fill="none"
          stroke="url(#goldRim)"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Inner Golden Metallic Accent Trace */}
        <path
          d="
            M 11,132
            L 89,132
            A 8,8 0 0 0 97,124
            L 97,25
            C 97,20 93,17 87,17
            C 79,17 71,18 65,13
            C 59,8 54,4 50,2.5
            C 46,4 41,8 35,13
            C 29,18 21,17 13,17
            C 7,17 3,20 3,25
            L 3,124
            A 8,8 0 0 0 11,132
            Z
          "
          fill="none"
          stroke="url(#goldInnerLine)"
          strokeWidth="1.2"
          opacity="0.85"
        />
      </svg>

      {/* Card Body Clipped by Exact Arch Shape */}
      <div
        className={`relative w-full h-full flex flex-col items-center justify-between overflow-hidden shadow-lg ${bgGradient}`}
        style={{
          borderRadius: '14px 14px 12px 12px',
          clipPath:
            'polygon(0% 22%, 10% 14%, 22% 13%, 35% 10%, 50% 1%, 65% 10%, 78% 13%, 90% 14%, 100% 22%, 100% 100%, 0% 100%)',
        }}
      >
        {/* Top Vignette / Ambient Radial Shimmer */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_20%,_rgba(255,255,255,0.4),_transparent_70%)]" />

        {/* Artwork Area (Center) */}
        <div className="relative flex-1 w-full flex items-center justify-center pt-3 pb-1">
          {cardArt}
        </div>

        {/* Bottom Clean Bold Subtitle / Game Title */}
        <div className="relative z-10 w-full pb-2 px-1 text-center">
          <span
            className="block text-[13px] sm:text-[14px] font-extrabold text-white tracking-normal font-sans"
            style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.85), 0 2px 6px rgba(0, 0, 0, 0.6)',
            }}
          >
            {subtitle || title}
          </span>
        </div>

        {/* "New" Pink Badge (Bottom Left, Exactly Matching Reference) */}
        {isNew && (
          <div className="absolute bottom-1 left-1.5 z-30">
            <span
              className="inline-flex items-center justify-center rounded-full bg-[#ff2d6c] px-2 py-0.2 text-[9px] font-black text-white shadow-md uppercase tracking-tighter"
              style={{
                boxShadow: '0 2px 5px rgba(255, 45, 108, 0.5)',
              }}
            >
              New
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
