import React from "react";

interface HUDProps {
  ammo: number;
  reloading: boolean;
  health: number;
}

export default function HUD({ ammo, reloading, health }: HUDProps) {
  return (
    <>
      {/* Crosshair */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute h-4 w-[2px] bg-white -translate-y-1/2 left-1/2 -translate-x-1/2 -top-[2px]"></div>
          {/* Horizontal line */}
          <div className="absolute w-4 h-[2px] bg-white -translate-x-1/2 top-1/2 -translate-y-1/2 -left-[2px]"></div>
          {/* Center dot */}
          <div className="absolute w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* HUD Info */}
      <div className="absolute bottom-4 left-4 text-white font-mono">
        <div className="mb-2">
          <strong>Health:</strong> {health}
        </div>
        <div className="mb-2">
          <strong>Ammo:</strong> {ammo}{" "}
          {reloading && <span className="text-yellow-300">(Reloading...)</span>}
        </div>
      </div>
    </>
  );
}
