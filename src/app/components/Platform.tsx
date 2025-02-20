import React from 'react';

interface PlatformProps {
  position: [number, number, number];
  size: [number, number, number];
}

export default function Platform({ position, size }: PlatformProps) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#666666" metalness={0.2} roughness={0.7} />
    </mesh>
  );
}
