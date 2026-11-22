import React from 'react'

interface RoomPageProps {
  onJoinRoom?: (roomId: string) => void
}

export const RoomPage: React.FC<RoomPageProps> = ({ onJoinRoom }) => {
  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none pb-4">
      {/* Exact Pixel-Perfect Room / Explore Screen from Screenshot */}
      <img
        src="/toptop/screen_room_body.png"
        alt="TopTop Rooms Explore"
        className="w-full h-auto block select-none pointer-events-none"
      />

      {/* Interactive Clickable Hotspots over Rooms */}
      <button
        type="button"
        onClick={() => onJoinRoom?.('room-moroccan')}
        className="absolute top-[35%] left-0 w-full h-[10%] opacity-0 hover:opacity-10 bg-white cursor-pointer"
        title="Join Moroccan Room"
      />
      <button
        type="button"
        onClick={() => onJoinRoom?.('room-vip-legend')}
        className="absolute top-[52%] left-0 w-full h-[12%] opacity-0 hover:opacity-10 bg-white cursor-pointer"
        title="Join Hourly Top 1 Room"
      />
      <button
        type="button"
        onClick={() => onJoinRoom?.('room-syrian')}
        className="absolute top-[65%] left-0 w-full h-[10%] opacity-0 hover:opacity-10 bg-white cursor-pointer"
        title="Join Voice Room"
      />
    </div>
  )
}
