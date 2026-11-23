import React from 'react'

interface GameCardsGridProps {
  onSelectGame: (gameId: string) => void
}

interface GameCardConfig {
  id: string
  name: string
  image: string
  fallbackImage: string
}

export const GameCardsGrid: React.FC<GameCardsGridProps> = ({ onSelectGame }) => {
  const cards: GameCardConfig[] = [
    {
      id: 'ludo',
      name: 'Ludo',
      image: '/games/Ludo.jpeg',
      fallbackImage: '/games/ludo.jpg',
    },
    {
      id: 'chess',
      name: 'Chess',
      image: '/games/chess.jpeg',
      fallbackImage: '/games/chess.jpg',
    },
    {
      id: 'domino',
      name: 'Domino',
      image: '/games/domino.jpeg',
      fallbackImage: '/games/domino.jpg',
    },
    {
      id: 'jackaroo',
      name: 'Jackaroo',
      image: '/games/Jackaroo.jpeg',
      fallbackImage: '/games/jackaroo.jpg',
    },
  ]

  return (
    <div className="w-full px-3.5 py-1 select-none">
      {/* 2x2 Grid displaying the cutout game cards directly */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectGame(card.id)}
            className="w-full cursor-pointer transition-transform duration-150 active:scale-95 hover:scale-[1.02] focus:outline-none flex items-center justify-center p-0 bg-transparent border-0 rounded-2xl overflow-hidden"
            title={`Play ${card.name}`}
          >
            <img
              src={card.image}
              alt={card.name}
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget
                if (card.fallbackImage && target.src !== card.fallbackImage) {
                  target.src = card.fallbackImage
                }
              }}
              className="w-full h-auto object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] block select-none pointer-events-none"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
