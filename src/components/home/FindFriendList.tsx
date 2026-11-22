import React from 'react'

interface FindFriendListProps {
  onJoinRoom: (roomId: string) => void
}

export const FindFriendList: React.FC<FindFriendListProps> = ({ onJoinRoom }) => {
  const friendCards = [
    {
      id: 'room-mal-doo',
      name: 'MAL 🇫🇷 DOO.',
      img: '/toptop/home_friend_1.png',
    },
    {
      id: 'room-fahad',
      name: 'فـهـد الـبـحـريـنـي',
      img: '/toptop/home_friend_2.png',
    },
  ]

  return (
    <div className="w-full space-y-2.5">
      {friendCards.map((friend) => (
        <div
          key={friend.id}
          className="relative w-full overflow-hidden rounded-[20px] transition-transform duration-150 active:scale-[0.98] shadow-sm select-none"
        >
          {/* Exact Visual Render from Reference Screenshot */}
          <img
            src={friend.img}
            alt={friend.name}
            className="w-full h-auto object-contain block pointer-events-none"
          />

          {/* Interactive Clickable Hotspot on "Join" Button */}
          <button
            type="button"
            onClick={() => onJoinRoom(friend.id)}
            className="absolute top-1/2 -translate-y-1/2 right-3 h-[42px] w-[95px] rounded-full cursor-pointer opacity-0 hover:opacity-10 bg-white"
            title={`Join ${friend.name}'s Table`}
          />
        </div>
      ))}
    </div>
  )
}
