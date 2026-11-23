import React from 'react'

interface GameCardsGridProps {
  onSelectGame: (gameId: string) => void
}

interface GameCardConfig {
  id: string
  name: string
  image: string
  borderColor: string
  glowColor: string
  titleGradient: string
  tag?: string
}

export const GameCardsGrid: React.FC<GameCardsGridProps> = ({ onSelectGame }) => {
  const cards: GameCardConfig[] = [
    {
      id: 'ludo',
      name: 'Ludo',
      image: '/games/ludo.jpg',
      borderColor: 'border-cyan-500/60 hover:border-cyan-400',
      glowColor: 'shadow-cyan-500/20',
      titleGradient: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]',
      tag: 'Classic',
    },
    {
      id: 'chess',
      name: 'Chess',
      image: '/games/chess.jpg',
      borderColor: 'border-emerald-500/60 hover:border-emerald-400',
      glowColor: 'shadow-emerald-500/20',
      titleGradient: 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]',
      tag: 'Strategy',
    },
    {
      id: 'domino',
      name: 'Domino',
      image: '/games/domino.jpg',
      borderColor: 'border-amber-500/60 hover:border-amber-400',
      glowColor: 'shadow-amber-500/20',
      titleGradient: 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]',
      tag: 'Popular',
    },
    {
      id: 'jackaroo',
      name: 'Jackaroo',
      image: '/games/jackaroo.jpg',
      borderColor: 'border-pink-500/60 hover:border-pink-400',
      glowColor: 'shadow-pink-500/20',
      titleGradient: 'text-pink-300 drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]',
      tag: 'Trending',
    },
  ]

  return (
    <div className="w-full px-3.5 py-1 select-none">
      {/* 2x2 Grid Layout for the 4 Dedicated Games */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectGame(card.id)}
            className={`group relative w-full aspect-[1/1.08] rounded-2xl overflow-hidden bg-[#071d18] border-2 ${card.borderColor} ${card.glowColor} shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between focus:outline-none`}
          >
            {/* Crisp 3D Game Card Image */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Subtle Bottom Vignette for Crisp Contrast */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Top Tag Pill */}
            <div className="relative z-10 p-2 flex justify-end">
              <span className="bg-black/60 backdrop-blur-xs text-[9.5px] font-black uppercase tracking-wider text-white/90 px-2 py-0.5 rounded-full border border-white/20 shadow-xs">
                {card.tag}
              </span>
            </div>

            {/* Bottom Stylized Neon Game Title */}
            <div className="relative z-10 w-full pb-2.5 pt-1 px-2 text-center">
              <span className={`text-[17px] font-black tracking-tight ${card.titleGradient} block font-sans`}>
                {card.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
