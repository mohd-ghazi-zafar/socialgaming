import React from 'react'

export const FlagUS: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <g fillRule="evenodd">
      <path fill="#bd3d44" d="M0 0h640v480H0z" />
      <path stroke="#fff" strokeWidth="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640" />
      <path fill="#192f5d" d="M0 0h256v258.5H0z" />
      <circle fill="#fff" cx="30" cy="30" r="10" />
      <circle fill="#fff" cx="80" cy="30" r="10" />
      <circle fill="#fff" cx="130" cy="30" r="10" />
      <circle fill="#fff" cx="180" cy="30" r="10" />
      <circle fill="#fff" cx="230" cy="30" r="10" />
      <circle fill="#fff" cx="55" cy="70" r="10" />
      <circle fill="#fff" cx="105" cy="70" r="10" />
      <circle fill="#fff" cx="155" cy="70" r="10" />
      <circle fill="#fff" cx="205" cy="70" r="10" />
    </g>
  </svg>
)

export const FlagSA: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#006c35" d="M0 0h640v480H0z" />
    <path fill="#fff" d="M160 300h320v20H160zm160-80c-40 0-60 20-60 40h120c0-20-20-40-60-40z" />
    <text x="320" y="240" fill="#fff" fontSize="64" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">لا إله إلا الله</text>
  </svg>
)

export const FlagBH: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#ce1126" d="M0 0h640v480H0z" />
    <path fill="#fff" d="M0 0h160l80 48-80 48 80 48-80 48 80 48-80 48 80 48-80 48 80 48-80 48 80 48H0z" />
  </svg>
)

export const FlagEG: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#ce1126" d="M0 0h640v160H0z" />
    <path fill="#fff" d="M0 160h640v160H0z" />
    <path fill="#000" d="M0 320h640v160H0z" />
    <circle cx="320" cy="240" r="30" fill="#c09300" />
  </svg>
)

export const CoinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="url(#coin_gold_grad)" stroke="#fef08a" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7.5" stroke="#ca8a04" strokeWidth="1" strokeDasharray="2 2" />
    <path d="M12 7l1.5 3.5 3.5.5-2.5 2.5.5 3.5-3-1.8-3 1.8.5-3.5-2.5-2.5 3.5-.5L12 7z" fill="#fef08a" />
    <defs>
      <linearGradient id="coin_gold_grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="0.5" stopColor="#eab308" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
  </svg>
)

export const GiftBoxIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Box Body */}
    <rect x="5" y="12" width="22" height="16" rx="3" fill="url(#gift_body)" />
    {/* Box Lid */}
    <rect x="3.5" y="8" width="25" height="5" rx="2" fill="url(#gift_lid)" stroke="#fda4af" strokeWidth="0.5" />
    {/* Vertical Gold Ribbon */}
    <rect x="14" y="8" width="4" height="20" fill="url(#gift_gold)" />
    {/* Horizontal Ribbon on Lid */}
    <rect x="3.5" y="9.5" width="25" height="2" fill="url(#gift_gold)" opacity="0.8" />
    {/* Bow Loops */}
    <path d="M16 8C13 3 8 4 10 7C12 9 15 8 16 8Z" fill="url(#gift_gold)" />
    <path d="M16 8C19 3 24 4 22 7C20 9 17 8 16 8Z" fill="url(#gift_gold)" />
    <circle cx="16" cy="8" r="2" fill="#fef08a" />
    <defs>
      <linearGradient id="gift_body" x1="5" y1="12" x2="27" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fb7185" />
        <stop offset="1" stopColor="#e11d48" />
      </linearGradient>
      <linearGradient id="gift_lid" x1="3.5" y1="8" x2="28.5" y2="13" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fda4af" />
        <stop offset="1" stopColor="#f43f5e" />
      </linearGradient>
      <linearGradient id="gift_gold" x1="14" y1="3" x2="18" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef08a" />
        <stop offset="0.5" stopColor="#facc15" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
  </svg>
)

export const Top1RankBadge: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <div className={`relative flex items-center justify-center rounded-full ring-2 ring-amber-400 bg-amber-500/20 overflow-hidden ${className}`}>
    <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center text-[9px] font-black text-amber-950">
      <svg className="w-4 h-4 text-amber-900" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
    <div className="absolute -bottom-0.5 inset-x-0 bg-gradient-to-r from-amber-500 to-yellow-300 text-[6.5px] font-extrabold text-amber-950 text-center tracking-tighter uppercase px-0.5 shadow-sm">
      TOP 1
    </div>
  </div>
)

/* Bottom Bar Icons */
export const GamepadNavIcon: React.FC<{ active?: boolean; className?: string }> = ({
  active = false,
  className = 'w-6 h-6',
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={active ? 1.5 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 12h4m-2-2v4" />
    <line x1="15" y1="11" x2="15.01" y2="11" />
    <line x1="18" y1="13" x2="18.01" y2="13" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

export const AudioRoomNavIcon: React.FC<{ active?: boolean; className?: string }> = ({
  active = false,
  className = 'w-6 h-6',
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="16" rx="4" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
    <line x1="8" y1="10" x2="8" y2="14" strokeWidth="2.5" />
    <line x1="12" y1="7" x2="12" y2="17" strokeWidth="2.5" />
    <line x1="16" y1="10" x2="16" y2="14" strokeWidth="2.5" />
  </svg>
)

export const DiscoveryNavIcon: React.FC<{ active?: boolean; className?: string }> = ({
  active = false,
  className = 'w-6 h-6',
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
    <polygon
      points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
      fill={active ? 'currentColor' : 'none'}
    />
  </svg>
)

export const MessageNavIcon: React.FC<{ active?: boolean; className?: string }> = ({
  active = false,
  className = 'w-6 h-6',
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M13 8l-3 4h4l-2 4" stroke={active ? '#061914' : 'currentColor'} strokeWidth="1.5" />
  </svg>
)

export const UserNavIcon: React.FC<{ active?: boolean; className?: string }> = ({
  active = false,
  className = 'w-6 h-6',
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} />
  </svg>
)

/* Top Lanterns Decorative Backdrop */
export const LanternsHeaderBg: React.FC<{ className?: string }> = ({ className = 'w-full' }) => (
  <svg className={className} viewBox="0 0 471 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky_grad" x1="235" y1="0" x2="235" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0b3b33" />
        <stop offset="0.6" stopColor="#062520" />
        <stop offset="1" stopColor="#031613" />
      </linearGradient>
      <linearGradient id="gold_lantern" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#fef08a" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
    <rect width="471" height="140" fill="url(#sky_grad)" />
    
    {/* Arabesque Arch Silhouette */}
    <path
      d="M0 0 H471 V80 Q350 110 235 60 Q120 110 0 80 Z"
      fill="#0d463d"
      opacity="0.3"
    />

    {/* Hanging Lantern 1 (Left) */}
    <line x1="80" y1="0" x2="80" y2="35" stroke="#fef08a" strokeWidth="0.8" opacity="0.4" />
    <polygon points="76,35 84,35 86,45 80,52 74,45" fill="url(#gold_lantern)" opacity="0.6" />
    <circle cx="80" cy="43" r="2" fill="#fff" opacity="0.8" />

    {/* Hanging Lantern 2 (Center Left) */}
    <line x1="160" y1="0" x2="160" y2="25" stroke="#fef08a" strokeWidth="0.8" opacity="0.3" />
    <polygon points="157,25 163,25 165,33 160,38 155,33" fill="url(#gold_lantern)" opacity="0.5" />

    {/* Crescent Moon (Center) */}
    <path
      d="M235 15 A 12 12 0 0 0 247 27 A 10 10 0 0 1 239 17 A 12 12 0 0 0 235 15 Z"
      fill="#fef08a"
      opacity="0.5"
    />

    {/* Hanging Lantern 3 (Right) */}
    <line x1="380" y1="0" x2="380" y2="38" stroke="#fef08a" strokeWidth="0.8" opacity="0.4" />
    <polygon points="376,38 384,38 386,48 380,55 374,48" fill="url(#gold_lantern)" opacity="0.6" />
    <circle cx="380" cy="46" r="2" fill="#fff" opacity="0.8" />
  </svg>
)

/* Social & Share Icons */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
)

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

export const CopySquareIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
