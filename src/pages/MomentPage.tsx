import React from 'react'

export const MomentPage: React.FC = () => {
  return (
    <div className="relative w-full max-w-[471px] mx-auto select-none pb-4">
      {/* Exact Pixel-Perfect Moments Screen from Screenshot */}
      <img
        src="/toptop/screen_moment_body.png"
        alt="TopTop Moments Feed"
        className="w-full h-auto block select-none pointer-events-none"
      />

      {/* Floating Action Button Hotspot */}
      <button
        type="button"
        onClick={() => alert('Compose new Moment post')}
        className="absolute bottom-[6%] right-[5%] w-[12%] h-[6%] rounded-full opacity-0 hover:opacity-10 bg-white cursor-pointer"
        title="Compose Moment"
      />
    </div>
  )
}
