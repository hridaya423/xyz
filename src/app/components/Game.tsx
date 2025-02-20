'use client'
import React, {useState} from 'react';
import { Canvas } from '@react-three/fiber';
import World from './World';
import HUD from './HUD';
import useGameSocket from '../../hooks/useGameSocket';


export default function Game() {
  const { ws, connected } = useGameSocket(
    `ws://127.0.0.1:8787/websocket`
  );
  
  const [ammo, setAmmo] = useState<number>(30);
  const [reloading, setReloading] = useState<boolean>(false);
  const [health, setHealth] = useState<number>(100);
  const [playersCount, setPlayersCount] = useState<number>(0);
  const handleAmmoUpdate = (newAmmo: number, isReloading: boolean) => {
    setAmmo(newAmmo);
    setReloading(isReloading);
  };
  const handleHealthUpdate = (newHealth: number) => {
    setHealth(newHealth);
  };
  const handlePlayersUpdate = (remotePlayersCount: number, localPlayerExists: boolean) => {
    setPlayersCount(remotePlayersCount + (localPlayerExists ? 1 : 0));
  };

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <World 
          ws={ws} 
          onAmmoUpdate={handleAmmoUpdate} 
          onHealthUpdate={handleHealthUpdate}
          onPlayersUpdate={handlePlayersUpdate}
        />
      </Canvas>
      <HUD ammo={ammo} reloading={reloading} health={health} />
      <div className="absolute top-4 left-4 bg-black/50 p-4 rounded text-white">
        <h2 className="text-xl font-bold">Connection Status</h2>
        <p>Connected: {connected ? "Yes" : "No"}</p>
        <p>Players: {playersCount}</p>
      </div>
      <div className="absolute top-4 right-4 bg-black/50 p-4 rounded text-white">
        <h2 className="text-xl font-bold">Controls</h2>
        <ul>
          <li>Click to start</li>
          <li>WASD - Move</li>
          <li>Space - Jump</li>
          <li>Mouse - Look</li>
          <li>Left Click - Shoot</li>
          <li>Right Click - Aim</li>
          <li>R - Reload</li>
          <li>ESC - Release mouse</li>
        </ul>
      </div>
    </div>
  );
}