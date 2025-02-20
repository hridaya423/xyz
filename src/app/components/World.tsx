import React, { useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import FPSCamera from "./FPSCamera";
import PlayerModel from "./PlayerModel";
import Platform from "./Platform";
import Target from "./Target";
import type { Player } from "../../types/game";

interface WorldProps {
  ws: WebSocket | null;
  onAmmoUpdate: (ammo: number, reloading: boolean) => void;
  onHealthUpdate: (health: number) => void;
  onPlayersUpdate?: (
    remotePlayersCount: number,
    localPlayerExists: boolean
  ) => void;
  isPaused: boolean;
  onUnpause: () => void;
}

export default function World({
  ws,
  onAmmoUpdate,
  onHealthUpdate,
  onPlayersUpdate,
  isPaused,
  onUnpause,
}: WorldProps) {
  const [players, setPlayers] = useState<
    Map<string, { position: THREE.Vector3; rotation: THREE.Euler }>
  >(new Map());
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [remoteShooting, setRemoteShooting] = useState<Map<string, number>>(
    new Map()
  );

  // Handle smth
  const handlePositionUpdate = useCallback(
    (position: THREE.Vector3, rotation: THREE.Euler) => {
      if (ws && playerId) {
        ws.send(
          JSON.stringify({
            type: "player-update",
            payload: {
              id: playerId,
              position: { x: position.x, y: position.y, z: position.z },
              rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
            },
          })
        );
      }
    },
    [ws, playerId]
  );

  useEffect(() => {
    if (onPlayersUpdate) {
      onPlayersUpdate(players.size, playerId !== null);
    }
  }, [players, playerId, onPlayersUpdate]);

  useEffect(() => {
    if (!ws) return;

    // Handle messages
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        // Game state
        case "game-state": {
          const newPlayers = new Map();
          message.payload.players.forEach((player: Player) => {
            if (player.id !== playerId) {
              newPlayers.set(player.id, {
                position: new THREE.Vector3(
                  player.position.x,
                  player.position.y,
                  player.position.z
                ),
                rotation: new THREE.Euler(
                  player.rotation.x,
                  player.rotation.y,
                  player.rotation.z
                ),
              });
            } else {
              onHealthUpdate(player.health);
            }
          });
          setPlayers(newPlayers);
          if (!playerId && message.payload.playerId) {
            setPlayerId(message.payload.playerId);
          }
          break;
        }
        // Player join
        case "player-join": {
          if (message.payload.id !== playerId) {
            setPlayers((prev) => {
              const next = new Map(prev);
              next.set(message.payload.id, {
                position: new THREE.Vector3(
                  message.payload.position.x,
                  message.payload.position.y,
                  message.payload.position.z
                ),
                rotation: new THREE.Euler(
                  message.payload.rotation.x,
                  message.payload.rotation.y,
                  message.payload.rotation.z
                ),
              });
              return next;
            });
          }
          break;
        }
        // Player leave
        case "player-leave": {
          setPlayers((prev) => {
            const next = new Map(prev);
            next.delete(message.payload.playerId);
            return next;
          });
          break;
        }
        // Player update
        case "player-update": {
          if (message.payload.id !== playerId) {
            setPlayers((prev) => {
              const next = new Map(prev);
              next.set(message.payload.id, {
                position: new THREE.Vector3(
                  message.payload.position.x,
                  message.payload.position.y,
                  message.payload.position.z
                ),
                rotation: new THREE.Euler(
                  message.payload.rotation.x,
                  message.payload.rotation.y,
                  message.payload.rotation.z
                ),
              });
              return next;
            });
          } else {
            onHealthUpdate(message.payload.health);
          }
          break;
        }
        // Player hit
        case "player-hit": {
          if (message.payload.targetId === playerId) {
            onHealthUpdate(message.payload.health);
          }
          break;
        }
        // Player shoot
        case "player-shoot": {
          const shooterId = message.payload.playerId;
          if (shooterId && shooterId !== playerId) {
            setRemoteShooting((prev) => {
              const newMap = new Map(prev);
              newMap.set(shooterId, Date.now());
              return newMap;
            });
          }
          break;
        }
      }
    };

    // Send ws data (i think - ploszukiwacz)
    ws.addEventListener("message", handleMessage);
    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, playerId, onHealthUpdate]);

  // Reutrn the world (i think - ploszukiwacz)
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <hemisphereLight args={["#7cc4ff", "#90f090", 1]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#90f090" />
      </mesh>

      {/* Platforms */}
      <Platform position={[-5, 2, -10]} size={[4, 0.5, 4]} />
      <Platform position={[5, 3, -15]} size={[4, 0.5, 4]} />
      <Platform position={[-8, 4, -20]} size={[4, 0.5, 4]} />
      <Platform position={[8, 3, -25]} size={[4, 0.5, 4]} />
      <Platform position={[0, 3.5, -30]} size={[4, 0.5, 4]} />

      <Platform position={[-2, 2.5, -12]} size={[2, 0.3, 2]} />
      <Platform position={[2, 2.75, -17]} size={[2, 0.3, 2]} />
      <Platform position={[-4, 3.25, -22]} size={[2, 0.3, 2]} />
      <Platform position={[4, 3.25, -27]} size={[2, 0.3, 2]} />

      {/* Walls */}
      <mesh position={[-50, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 4, 100]} />
        <meshStandardMaterial color="#4488ff" />
      </mesh>
      <mesh position={[50, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 4, 100]} />
        <meshStandardMaterial color="#4488ff" />
      </mesh>
      <mesh position={[0, 2, -50]} receiveShadow castShadow>
        <boxGeometry args={[100, 4, 1]} />
        <meshStandardMaterial color="#4488ff" />
      </mesh>
      <mesh position={[0, 2, 50]} receiveShadow castShadow>
        <boxGeometry args={[100, 4, 1]} />
        <meshStandardMaterial color="#4488ff" />
      </mesh>

      {/* Targets */}
      <Target position={[-10, 1.5, -20]} />
      <Target position={[10, 1.5, -30]} />
      <Target position={[-15, 1.5, -40]} />
      <Target position={[15, 1.5, -25]} />
      <Target position={[0, 1.5, -45]} />

      {/* Other Players */}
      {Array.from(players.entries()).map(([id, data]) => (
        <PlayerModel
          key={id}
          playerId={id}
          position={data.position}
          rotation={data.rotation}
          isShooting={
            remoteShooting.has(id) && Date.now() - remoteShooting.get(id)! < 100
          }
        />
      ))}

      {/* The First Person Shooter Camera */}
      <FPSCamera
        playerId={playerId}
        ws={ws}
        onPositionUpdate={handlePositionUpdate}
        onAmmoChange={onAmmoUpdate}
        isPaused={isPaused}
        onUnpause={onUnpause}
      />
    </>
  );
}
