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
    <div className="w-full px-4 py-1 select-none flex justify-center">
      {/* Responsive 2x2 Grid fluidly adapting to viewport width and height */}
      <div className="grid grid-cols-2 gap-x-[clamp(10px,3.5vw,18px)] gap-y-[clamp(8px,1.4vh,12px)] w-full max-w-[340px] justify-items-center">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectGame(card.id)}
            className="relative flex items-center justify-center aspect-[1097/1434] w-full max-w-[150px] max-h-[17.5vh] min-h-[108px] transition-transform duration-150 active:scale-95 hover:scale-[1.03] cursor-pointer focus:outline-none p-0 bg-transparent border-0"
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
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] select-none pointer-events-none"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
