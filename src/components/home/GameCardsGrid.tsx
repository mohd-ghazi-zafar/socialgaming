import React from 'react'
import {
  JackarooIllustration,
  CarromIllustration,
  OnoIllustration,
  LudoKindIllustration,
  MonopolyIllustration,
  MoreGamesIllustration,
} from '../common/GameCardIllustrations'

interface GameCardsGridProps {
  onSelectGame: (gameId: string) => void
}

interface GameCardConfig {
  id: string
  name: string
  subtitle?: string
  isNew?: boolean
  bgGradient: string
  bottomBg: string
  borderColor: string
  Illustration: React.FC<{ className?: string }>
}

export const GameCardsGrid: React.FC<GameCardsGridProps> = ({ onSelectGame }) => {
  const cards: GameCardConfig[] = [
    {
      id: 'jackaroo',
      name: 'Jackaroo',
      isNew: true,
      bgGradient: 'from-[#f59e0b] via-[#d97706] to-[#78350f]',
      bottomBg: 'bg-[#a15112]/90',
      borderColor: '#fbbf24',
      Illustration: JackarooIllustration,
    },
    {
      id: 'carrom',
      name: 'Carrom',
      isNew: false,
      bgGradient: 'from-[#c084fc] via-[#9333ea] to-[#581c87]',
      bottomBg: 'bg-[#7e22ce]/90',
      borderColor: '#e9d5ff',
      Illustration: CarromIllustration,
    },
    {
      id: 'ono',
      name: 'ONO',
      subtitle: 'No Mercy',
      isNew: false,
      bgGradient: 'from-[#f87171] via-[#dc2626] to-[#7f1d1d]',
      bottomBg: 'bg-[#b91c1c]/90',
      borderColor: '#fca5a5',
      Illustration: OnoIllustration,
    },
    {
      id: 'ludo',
      name: 'LudoKind',
      isNew: true,
      bgGradient: 'from-[#818cf8] via-[#4f46e5] to-[#312e81]',
      bottomBg: 'bg-[#4338ca]/90',
      borderColor: '#c7d2fe',
      Illustration: LudoKindIllustration,
    },
    {
      id: 'monopoly',
      name: 'Monopoly',
      isNew: true,
      bgGradient: 'from-[#38bdf8] via-[#0284c7] to-[#075985]',
      bottomBg: 'bg-[#0369a1]/90',
      borderColor: '#bae6fd',
      Illustration: MonopolyIllustration,
    },
    {
      id: 'more',
      name: 'More Games',
      isNew: false,
      bgGradient: 'from-[#fbbf24] via-[#f59e0b] to-[#b45309]',
      bottomBg: 'bg-[#b45309]/90',
      borderColor: '#fde68a',
      Illustration: MoreGamesIllustration,
    },
  ]

  return (
    <div className="w-full px-3.5 py-1">
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {cards.map((card) => {
          const { Illustration } = card

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectGame(card.id)}
              className="relative w-full aspect-[137/178] rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.02] shadow-lg group focus:outline-none"
              style={{
                boxShadow: `0 4px 14px -2px rgba(0,0,0,0.5), inset 0 0 0 1.5px ${card.borderColor}80`,
              }}
            >
              {/* Outer Arabesque Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${card.bgGradient} opacity-95 group-hover:opacity-100 transition-opacity`} />

              {/* Decorative Arabesque Top Arch Crown (SVG) */}
              <div className="absolute top-0 inset-x-0 h-6 pointer-events-none opacity-80">
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  {/* Scalloped Arch Crest */}
                  <path
                    d="M0 0 H100 V12 Q85 10 75 16 Q50 6 25 16 Q15 10 0 12 Z"
                    fill="#ffffff"
                    fillOpacity="0.15"
                  />
                  <path
                    d="M50 0 L52 4 L50 7 L48 4 Z"
                    fill="#fef08a"
                  />
                </svg>
              </div>

              {/* 3D Game Graphic Illustration */}
              <div className="relative z-10 w-full flex-1 flex items-center justify-center p-1.5 pt-3">
                <Illustration className="w-full h-full object-contain filter drop-shadow(0 4px 6px rgba(0,0,0,0.35))" />
              </div>

              {/* Bottom Label Panel */}
              <div className={`relative z-10 w-full py-1.5 px-1 ${card.bottomBg} backdrop-blur-xs border-t border-white/20 flex flex-col items-center justify-center`}>
                {card.subtitle && (
                  <span className="text-[9px] font-black uppercase text-amber-200 tracking-tight leading-none mb-0.5">
                    {card.subtitle}
                  </span>
                )}
                <span className="text-[12px] font-black text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight text-center">
                  {card.name}
                </span>
              </div>

              {/* "New" Badge Pill */}
              {card.isNew && (
                <div className="absolute top-1 left-1.5 z-20 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-md tracking-tight leading-tight">
                  New
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
