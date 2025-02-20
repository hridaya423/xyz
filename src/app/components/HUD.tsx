import React from 'react';

interface HUDProps {
  ammo: number;
  reloading: boolean;
  health: number;
}

export default function HUD({ ammo, reloading, health }: HUDProps) {
  return (
    <div className="absolute bottom-4 left-4 text-white font-mono">
      <div className="mb-2">
        <strong>Health:</strong> {health}
      </div>
      <div className="mb-2">
        <strong>Ammo:</strong> {ammo} {reloading && <span className="text-yellow-300">(Reloading...)</span>}
      </div>
    </div>
  );
}
