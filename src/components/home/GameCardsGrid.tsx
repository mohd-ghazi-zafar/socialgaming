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
    {
      id: 'draw_guess',
      name: 'Draw & Guess',
      image: '/games/draw_guess.jpeg',
      fallbackImage: '/games/draw%20guess.jpeg',
    },
    {
      id: 'more',
      name: 'More Games',
      image: '/games/more.jpeg',
      fallbackImage: '/games/more.jpeg',
    },
  ]

  return (
    <div className="w-full px-3 py-1 select-none flex justify-center">
      {/* Authentic 3x2 Grid (6 Games) precisely matching TopTop layout and viewport ratio */}
      <div className="grid grid-cols-3 gap-x-[clamp(6px,2vw,12px)] gap-y-[clamp(6px,1.2vh,12px)] w-full max-w-[420px] justify-items-center">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectGame(card.id)}
            className="relative flex items-center justify-center aspect-[1097/1434] w-full max-w-[125px] max-h-[16vh] min-h-[96px] transition-transform duration-150 active:scale-95 hover:scale-[1.03] cursor-pointer focus:outline-none p-0 bg-transparent border-0"
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

