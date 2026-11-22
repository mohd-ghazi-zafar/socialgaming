import React from 'react'

/** 1. Jackaroo 3D Board Illustration */
export const JackarooIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wooden Board Surface */}
    <rect x="25" y="15" width="110" height="90" rx="12" fill="url(#wood_grad)" stroke="#d97706" strokeWidth="2.5" />
    <rect x="33" y="23" width="94" height="74" rx="8" fill="#fde68a" stroke="#b45309" strokeWidth="1" strokeDasharray="3 3" opacity="0.9" />

    {/* Center Arabesque Diamond */}
    <polygon points="80,35 105,60 80,85 55,60" fill="#fef3c7" stroke="#92400e" strokeWidth="1" />

    {/* Colored Glass Marbles & Holes */}
    {/* Green Marble */}
    <circle cx="50" cy="40" r="8" fill="url(#green_marble)" stroke="#15803d" strokeWidth="1" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))" />
    <circle cx="48" cy="38" r="2.5" fill="#fff" opacity="0.7" />

    {/* Red Marble */}
    <circle cx="110" cy="40" r="8" fill="url(#red_marble)" stroke="#b91c1c" strokeWidth="1" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))" />
    <circle cx="108" cy="38" r="2.5" fill="#fff" opacity="0.7" />

    {/* Yellow Marble */}
    <circle cx="110" cy="80" r="8" fill="url(#yellow_marble)" stroke="#b45309" strokeWidth="1" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))" />
    <circle cx="108" cy="78" r="2.5" fill="#fff" opacity="0.7" />

    {/* Blue Marble */}
    <circle cx="50" cy="80" r="8" fill="url(#blue_marble)" stroke="#1d4ed8" strokeWidth="1" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))" />
    <circle cx="48" cy="78" r="2.5" fill="#fff" opacity="0.7" />

    {/* Mini Playing Card on the Board */}
    <g transform="translate(100, 20) rotate(18)">
      <rect x="0" y="0" width="22" height="30" rx="3" fill="#1e293b" stroke="#facc15" strokeWidth="1" />
      <text x="11" y="20" fill="#facc15" fontSize="12" fontWeight="bold" textAnchor="middle">♠</text>
    </g>

    <defs>
      <linearGradient id="wood_grad" x1="25" y1="15" x2="135" y2="105" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="0.5" stopColor="#d97706" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
      <radialGradient id="green_marble" cx="35%" cy="35%" r="65%">
        <stop stopColor="#4ade80" />
        <stop offset="0.6" stopColor="#16a34a" />
        <stop offset="1" stopColor="#14532d" />
      </radialGradient>
      <radialGradient id="red_marble" cx="35%" cy="35%" r="65%">
        <stop stopColor="#f87171" />
        <stop offset="0.6" stopColor="#dc2626" />
        <stop offset="1" stopColor="#7f1d1d" />
      </radialGradient>
      <radialGradient id="yellow_marble" cx="35%" cy="35%" r="65%">
        <stop stopColor="#fde047" />
        <stop offset="0.6" stopColor="#eab308" />
        <stop offset="1" stopColor="#854d0e" />
      </radialGradient>
      <radialGradient id="blue_marble" cx="35%" cy="35%" r="65%">
        <stop stopColor="#60a5fa" />
        <stop offset="0.6" stopColor="#2563eb" />
        <stop offset="1" stopColor="#1e3a8a" />
      </radialGradient>
    </defs>
  </svg>
)

/** 2. Carrom 3D Board Illustration */
export const CarromIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wooden Outer Frame */}
    <rect x="25" y="15" width="110" height="90" rx="10" fill="#78350f" stroke="#451a03" strokeWidth="3" />
    {/* Playing Bed Surface */}
    <rect x="33" y="23" width="94" height="74" rx="6" fill="#fef3c7" />

    {/* Corner Pockets */}
    <circle cx="38" cy="28" r="5" fill="#18181b" />
    <circle cx="122" cy="28" r="5" fill="#18181b" />
    <circle cx="38" cy="92" r="5" fill="#18181b" />
    <circle cx="122" cy="92" r="5" fill="#18181b" />

    {/* Center Circles & Red Queen */}
    <circle cx="80" cy="60" r="16" stroke="#b45309" strokeWidth="1" fill="none" />
    <circle cx="80" cy="60" r="6" fill="url(#queen_grad)" stroke="#991b1b" strokeWidth="0.8" />
    <circle cx="78" cy="58" r="1.5" fill="#fff" opacity="0.6" />

    {/* White & Black Carrom Men around Queen */}
    <circle cx="72" cy="53" r="4.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
    <circle cx="88" cy="53" r="4.5" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
    <circle cx="72" cy="67" r="4.5" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
    <circle cx="88" cy="67" r="4.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

    {/* Large Striker Disc */}
    <circle cx="58" cy="82" r="9" fill="url(#striker_grad)" stroke="#0284c7" strokeWidth="1.2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
    <circle cx="58" cy="82" r="4" fill="#0284c7" />
    <circle cx="56" cy="80" r="2.5" fill="#fff" opacity="0.8" />

    <defs>
      <radialGradient id="queen_grad" cx="35%" cy="35%" r="65%">
        <stop stopColor="#f87171" />
        <stop offset="0.7" stopColor="#dc2626" />
        <stop offset="1" stopColor="#7f1d1d" />
      </radialGradient>
      <radialGradient id="striker_grad" cx="35%" cy="35%" r="65%">
        <stop stopColor="#bae6fd" />
        <stop offset="0.6" stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0369a1" />
      </radialGradient>
    </defs>
  </svg>
)

/** 3. ONO (No Mercy) Cards Fan Illustration */
export const OnoIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Card 1: Green +2 (Left Tilted) */}
    <g transform="translate(42, 22) rotate(-22)">
      <rect width="38" height="56" rx="6" fill="#16a34a" stroke="#fff" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
      <ellipse cx="19" cy="28" rx="14" ry="20" fill="#fff" transform="rotate(-15 19 28)" />
      <text x="19" y="34" fill="#16a34a" fontSize="16" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">+2</text>
    </g>

    {/* Card 2: Blue Reverse (Center) */}
    <g transform="translate(62, 14) rotate(0)">
      <rect width="38" height="56" rx="6" fill="#2563eb" stroke="#fff" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))" />
      <ellipse cx="19" cy="28" rx="14" ry="20" fill="#fff" transform="rotate(-15 19 28)" />
      <text x="19" y="34" fill="#2563eb" fontSize="18" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">7</text>
    </g>

    {/* Card 3: Red Wild / Draw (Right Tilted) */}
    <g transform="translate(86, 20) rotate(20)">
      <rect width="38" height="56" rx="6" fill="#dc2626" stroke="#fff" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
      <ellipse cx="19" cy="28" rx="14" ry="20" fill="#fff" transform="rotate(-15 19 28)" />
      <text x="19" y="34" fill="#dc2626" fontSize="18" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">0</text>
    </g>

    {/* Glowing energetic sparkles */}
    <circle cx="35" cy="50" r="2.5" fill="#fef08a" />
    <circle cx="125" cy="40" r="3" fill="#fef08a" />
    <polygon points="135,55 138,62 145,64 139,69 141,76 135,71 129,76 131,69 125,64 132,62" fill="#fde047" />
  </svg>
)

/** 4. LudoKind Dice & Pawns Illustration */
export const LudoKindIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Yellow Pawn (Left) */}
    <g transform="translate(36, 40)">
      <circle cx="14" cy="12" r="8" fill="url(#yellow_pawn)" />
      <path d="M7 20 Q14 28 21 20 L23 45 Q14 48 5 45 Z" fill="url(#yellow_pawn)" />
      <circle cx="11" cy="9" r="2" fill="#fff" opacity="0.8" />
    </g>

    {/* Red Pawn (Center Behind Dice) */}
    <g transform="translate(90, 42)">
      <circle cx="14" cy="12" r="8" fill="url(#red_pawn)" />
      <path d="M7 20 Q14 28 21 20 L23 45 Q14 48 5 45 Z" fill="url(#red_pawn)" />
      <circle cx="11" cy="9" r="2" fill="#fff" opacity="0.8" />
    </g>

    {/* 3D Isometric White Die */}
    <g transform="translate(56, 26)">
      {/* Top Face */}
      <polygon points="26,0 52,14 26,28 0,14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      {/* Top Pip (Center 1) */}
      <circle cx="26" cy="14" r="3.5" fill="#ef4444" />

      {/* Left Face (Pips 3) */}
      <polygon points="0,14 26,28 26,60 0,46" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="8" cy="24" r="2.5" fill="#1e293b" />
      <circle cx="13" cy="37" r="2.5" fill="#1e293b" />
      <circle cx="18" cy="50" r="2.5" fill="#1e293b" />

      {/* Right Face (Pips 5) */}
      <polygon points="26,28 52,14 52,46 26,60" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="34" cy="35" r="2.5" fill="#1e293b" />
      <circle cx="44" cy="23" r="2.5" fill="#1e293b" />
      <circle cx="39" cy="44" r="2.5" fill="#1e293b" />
      <circle cx="34" cy="53" r="2.5" fill="#1e293b" />
      <circle cx="44" cy="41" r="2.5" fill="#1e293b" />
    </g>

    {/* Blue Pawn (Front Right) */}
    <g transform="translate(104, 52)">
      <circle cx="12" cy="10" r="7" fill="url(#blue_pawn)" />
      <path d="M6 17 Q12 24 18 17 L20 38 Q12 41 4 38 Z" fill="url(#blue_pawn)" />
      <circle cx="10" cy="8" r="2" fill="#fff" opacity="0.8" />
    </g>

    <defs>
      <linearGradient id="yellow_pawn" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#fde047" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="red_pawn" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#f87171" />
        <stop offset="1" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="blue_pawn" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#60a5fa" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
)

/** 5. Monopoly Mascot & Houses Illustration */
export const MonopolyIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Green Monopoly Houses */}
    <polygon points="40,65 52,55 64,65 64,85 40,85" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
    <polygon points="34,70 42,63 50,70 50,85 34,85" fill="#22c55e" stroke="#14532d" strokeWidth="1.2" />

    {/* Mascot Body & Black Suit */}
    <ellipse cx="82" cy="78" rx="24" ry="18" fill="#1e293b" />
    <polygon points="76,68 88,68 84,78 80,78" fill="#ef4444" /> {/* Red Bowtie */}

    {/* Mascot Face & White Moustache */}
    <circle cx="82" cy="54" r="16" fill="#fed7aa" stroke="#fb923c" strokeWidth="1" />
    <ellipse cx="78" cy="52" rx="2" ry="3" fill="#1e293b" />
    <ellipse cx="86" cy="52" rx="2" ry="3" fill="#1e293b" />
    {/* Mustache */}
    <path d="M72 60 Q82 56 82 62 Q82 56 92 60 Q86 66 82 63 Q78 66 72 60 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />

    {/* Top Hat */}
    <ellipse cx="82" cy="40" rx="20" ry="4" fill="#0f172a" />
    <rect x="68" y="16" width="28" height="24" rx="3" fill="#0f172a" />
    <rect x="68" y="34" width="28" height="4" fill="#dc2626" /> {/* Red Hat Band */}

    {/* White 3D Die held in hand */}
    <g transform="translate(100, 48)">
      <rect width="22" height="22" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
      <circle cx="6" cy="6" r="2" fill="#1e293b" />
      <circle cx="11" cy="11" r="2" fill="#ef4444" />
      <circle cx="16" cy="16" r="2" fill="#1e293b" />
    </g>

    {/* Cash bill / money glow */}
    <rect x="94" y="74" width="22" height="12" rx="2" fill="#86efac" stroke="#16a34a" strokeWidth="1" transform="rotate(-15 94 74)" />
  </svg>
)

/** 6. More Games Toy Box Illustration */
export const MoreGamesIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Toy Treasure Box Body */}
    <polygon points="45,55 115,55 125,95 35,95" fill="url(#box_grad)" stroke="#f59e0b" strokeWidth="2" />
    <rect x="30" y="48" width="100" height="10" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />

    {/* Pink Star on Box */}
    <polygon points="80,68 83,75 90,76 85,81 86,88 80,84 74,88 75,81 70,76 77,75" fill="#f43f5e" />

    {/* 8-Ball Billiards */}
    <circle cx="88" cy="40" r="14" fill="#18181b" stroke="#3f3f46" strokeWidth="1" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.4))" />
    <circle cx="88" cy="40" r="6" fill="#ffffff" />
    <text x="88" y="44" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">8</text>
    <circle cx="84" cy="34" r="3" fill="#ffffff" opacity="0.6" />

    {/* Green Bowling Pin / Orb (Top Right) */}
    <circle cx="106" cy="28" r="9" fill="url(#green_ball)" />
    <circle cx="104" cy="25" r="2.5" fill="#fff" opacity="0.8" />

    {/* Golden Magnifying Glass */}
    <circle cx="48" cy="72" r="10" stroke="#f59e0b" strokeWidth="3" fill="#e0f2fe" fillOpacity="0.4" />
    <line x1="41" y1="79" x2="33" y2="87" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />

    {/* Deck of Playing Cards */}
    <g transform="translate(56, 26) rotate(-18)">
      <rect width="20" height="28" rx="3" fill="#dc2626" stroke="#fff" strokeWidth="1" />
      <text x="10" y="18" fill="#fff" fontSize="11" textAnchor="middle" fontWeight="bold">♥</text>
    </g>

    <defs>
      <linearGradient id="box_grad" x1="45" y1="55" x2="115" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbbf24" />
        <stop offset="0.5" stopColor="#f59e0b" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>
      <radialGradient id="green_ball" cx="35%" cy="35%" r="65%">
        <stop stopColor="#86efac" />
        <stop offset="0.6" stopColor="#22c55e" />
        <stop offset="1" stopColor="#14532d" />
      </radialGradient>
    </defs>
  </svg>
)
