import React from 'react'

interface TopTopGameCardsProps {
  onSelectGame: (gameId: string) => void
}

export const TopTopGameCards: React.FC<TopTopGameCardsProps> = ({ onSelectGame }) => {
  const cards = [
    { id: 'ludo', name: 'LudoKind', img: '/toptop/home_card_ludokind.png' },
    { id: 'monopoly', name: 'Monopoly', img: '/toptop/home_card_monopoly.png' },
    { id: 'domino', name: 'Domino', img: '/toptop/home_card_domino.png' },
    { id: 'jackaroo', name: 'Jackaroo', img: '/toptop/home_card_jackaroo.png' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onSelectGame(card.id)}
          className="relative w-full aspect-[256/218] overflow-hidden rounded-[18px] cursor-pointer transition-transform duration-200 active:scale-95 hover:brightness-105 focus:outline-none shadow-md"
          title={`Play ${card.name}`}
        >
          <img
            src={card.img}
            alt={card.name}
            className="w-full h-full object-contain select-none pointer-events-none"
          />
        </button>
      ))}
    </div>
  )
}
