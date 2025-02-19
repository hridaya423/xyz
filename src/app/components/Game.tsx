"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface Player {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

function Bullet({
  start,
  direction,
  onHit,
}: {
  start: THREE.Vector3;
  direction: THREE.Vector3;
  onHit: () => void;
}) {
  const bulletRef = useRef<THREE.Mesh>(null);
  const velocity = direction.clone().multiplyScalar(3);
  const [isDead, setIsDead] = useState(false);

  useFrame(({ scene }) => {
    if (!bulletRef.current || isDead) return;

    bulletRef.current.position.add(velocity);

    const raycaster = new THREE.Raycaster(
      bulletRef.current.position.clone(),
      direction.clone().normalize(),
      0,
      1
    );

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      if (hit.object.userData.isTarget) {
        hit.object.userData.onHit();
        setIsDead(true);
        onHit();
      }
    }
  });

  if (isDead) return null;

  return (
    <mesh ref={bulletRef} position={start}>
      <sphereGeometry args={[0.03, 8, 8]} /> {/* Smaller bullets */}
      <meshStandardMaterial
        color="#ffff00"
        emissive="#ffff00"
        emissiveIntensity={2}
        metalness={0.5}
        roughness={0.2}
      />{" "}
      {/* Brighter bullets */}
    </mesh>
  );
}

function GunViewModel({ isAiming }: { isAiming: boolean }) {
  const gunMesh = useRef<THREE.Group>(null);
  const targetPosition = new THREE.Vector3(0, -0.3, -0.5);
  const aimPosition = new THREE.Vector3(0, -0.2, -0.4);

  useFrame(() => {
    if (!gunMesh.current) return;
    const target = isAiming ? aimPosition : targetPosition;
    gunMesh.current.position.lerp(target, 0.3);
  });

  return (
    <group ref={gunMesh} position={[0, -0.3, -0.5]} rotation={[0, 0, 0]}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.12, 0.4]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Upper rail */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.08, 0.02, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Grip */}
      <mesh position={[0, -0.15, 0.1]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.08, 0.2, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Magazine */}
      <mesh position={[0, -0.12, 0.1]}>
        <boxGeometry args={[0.07, 0.15, 0.08]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0.02, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.3, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Front sight */}
      <mesh position={[0, 0.08, -0.15]}>
        <boxGeometry args={[0.02, 0.04, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rear sight */}
      <mesh position={[0, 0.08, 0.1]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Ejection port */}
      <mesh position={[0.05, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.02, 0.05, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Front grip */}
      <mesh position={[0, -0.02, -0.15]}>
        <boxGeometry args={[0.085, 0.06, 0.15]} />
        <meshStandardMaterial color="#252525" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Muzzle */}
      <mesh position={[0, 0.02, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.05, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Target({ position }: { position: [number, number, number] }) {
  const [hit, setHit] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (hit) {
      const timer = setTimeout(() => setHit(false), 200);
      return () => clearTimeout(timer);
    }
  }, [hit]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      userData={{ isTarget: true, onHit: () => setHit(true) }}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial
        color={hit ? "#ff0000" : "#00ff00"}
        emissive={hit ? "#ff0000" : "#00ff00"}
        emissiveIntensity={hit ? 1 : 0.2}
      />
    </mesh>
  );
}

function Crosshair() {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative w-4 h-4">
        {/* Center dot */}
        <div className="absolute w-1 h-1 bg-white/80 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        {/* Lines */}
        <div className="absolute w-4 h-0.5 bg-white/60 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-0.5 h-4 bg-white/60 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}

function FPSCamera({
  playerId,
  onPositionUpdate,
}: {
  playerId: string | null;
  onPositionUpdate?: (position: THREE.Vector3, rotation: THREE.Euler) => void;
}) {
  const { camera, raycaster, scene } = useThree();
  const controls = useRef({
    rotation: { x: 0, y: 0 },
    position: { x: 0, y: 1.7, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    moveSpeed: 0.3,
    lookSpeed: 0.003,
    jumpForce: 0.3,
    isGrounded: true,
  });

  const playerModelRef = useRef<THREE.Group>(null);
  const playerBodyRef = useRef<THREE.Mesh>(null);
  const playerGunRef = useRef<THREE.Group>(null);

  const [isAiming, setIsAiming] = useState(false);
  const lastShotRef = useRef(0);
  const [bullets, setBullets] = useState<
    { id: number; start: THREE.Vector3; direction: THREE.Vector3 }[]
  >([]);
  const bulletIdRef = useRef(0);
  const FIRE_RATE = 100;
  const isShootingRef = useRef(false);

  const keyState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  function shoot() {
    const now = Date.now();
    if (now - lastShotRef.current < FIRE_RATE) return;

    lastShotRef.current = now;

    const bulletStart = camera.position.clone();
    bulletStart.y -= 0.1;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    bulletStart.add(forward.multiplyScalar(0.5));

    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0 && intersects[0].object.userData.isTarget) {
      intersects[0].object.userData.onHit();
    }

    const bulletId = bulletIdRef.current++;
    setBullets((prev) => [
      ...prev,
      {
        id: bulletId,
        start: bulletStart,
        direction: direction,
      },
    ]);

    setTimeout(() => {
      setBullets((prev) => prev.filter((b) => b.id !== bulletId));
    }, 500);
  }

  useEffect(() => {
    let isLocked = false;

    function handleKeyDown(e: KeyboardEvent) {
      if (!isLocked) return;
      switch (e.code) {
        case "KeyW":
          keyState.current.forward = true;
          break;
        case "KeyS":
          keyState.current.backward = true;
          break;
        case "KeyA":
          keyState.current.left = true;
          break;
        case "KeyD":
          keyState.current.right = true;
          break;
        case "Space":
          if (controls.current.isGrounded) {
            controls.current.velocity.y = controls.current.jumpForce;
            controls.current.isGrounded = false;
          }
          break;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      switch (e.code) {
        case "KeyW":
          keyState.current.forward = false;
          break;
        case "KeyS":
          keyState.current.backward = false;
          break;
        case "KeyA":
          keyState.current.left = false;
          break;
        case "KeyD":
          keyState.current.right = false;
          break;
      }
    }

    function handleMouseDown(e: MouseEvent) {
      if (!isLocked) return;

      if (e.button === 0) {
        isShootingRef.current = true;
      } else if (e.button === 2) {
        setIsAiming(true);
      }
    }

    function handleMouseUp(e: MouseEvent) {
      if (e.button === 0) {
        isShootingRef.current = false;
      } else if (e.button === 2) {
        setIsAiming(false);
      }
    }

    function updateRotation(e: MouseEvent) {
      if (!isLocked) return;

      controls.current.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(
          Math.PI / 2,
          controls.current.rotation.x - e.movementY * controls.current.lookSpeed
        )
      );
      controls.current.rotation.y -= e.movementX * controls.current.lookSpeed;
    }

    function lockControls() {
      document.body.requestPointerLock();
    }

    function handleLockChange() {
      isLocked = document.pointerLockElement === document.body;
    }

    function handleContextMenu(e: Event) {
      e.preventDefault();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", updateRotation);
    document.addEventListener("click", lockControls);
    document.addEventListener("pointerlockchange", handleLockChange);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", updateRotation);
      document.removeEventListener("click", lockControls);
      document.removeEventListener("pointerlockchange", handleLockChange);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [camera, raycaster, scene]);

  useFrame(() => {
    if (isShootingRef.current) {
      shoot();
    }

    const speed = controls.current.moveSpeed;
    const angle = controls.current.rotation.y;

    const newPosition = { ...controls.current.position };

    if (!controls.current.isGrounded) {
      controls.current.velocity.y -= 0.015;
    }

    newPosition.y += controls.current.velocity.y;

    let isOnPlatform = false;
    const playerY = newPosition.y - 1.7;
    const platformBoxes = [
      { min: [-7, 1.5, -12], max: [-3, 2, -8] },
      { min: [3, 2, -17], max: [7, 2.5, -13] },
      { min: [-10, 3, -22], max: [-6, 3.5, -18] },
      { min: [6, 2, -27], max: [10, 2.5, -23] },
      { min: [-2, 2.5, -32], max: [2, 3, -28] },
      { min: [-3, 1.75, -14], max: [-1, 2.05, -10] },
      { min: [1, 2, -19], max: [3, 2.3, -15] },
      { min: [-5, 2.25, -24], max: [-3, 2.55, -20] },
      { min: [3, 2.25, -29], max: [5, 2.55, -25] },
    ];

    for (const box of platformBoxes) {
      if (
        newPosition.x >= box.min[0] &&
        newPosition.x <= box.max[0] &&
        newPosition.z >= box.min[2] &&
        newPosition.z <= box.max[2]
      ) {
        if (playerY >= box.min[1] && playerY <= box.max[1] + 0.1) {
          isOnPlatform = true;
          newPosition.y = box.max[1] + 1.7;
          controls.current.velocity.y = 0;
          controls.current.isGrounded = true;
          break;
        }
      }
    }

    if (!isOnPlatform && newPosition.y > 1.7) {
      controls.current.isGrounded = false;
    }

    if (!isOnPlatform && newPosition.y <= 1.7) {
      newPosition.y = 1.7;
      controls.current.velocity.y = 0;
      controls.current.isGrounded = true;
    }

    if (keyState.current.forward) {
      newPosition.x -= Math.sin(angle) * speed;
      newPosition.z -= Math.cos(angle) * speed;
    }
    if (keyState.current.backward) {
      newPosition.x += Math.sin(angle) * speed;
      newPosition.z += Math.cos(angle) * speed;
    }
    if (keyState.current.left) {
      newPosition.x -= Math.cos(angle) * speed;
      newPosition.z += Math.sin(angle) * speed;
    }
    if (keyState.current.right) {
      newPosition.x += Math.cos(angle) * speed;
      newPosition.z -= Math.sin(angle) * speed;
    }

    const radius = 0.5;
    if (
      Math.abs(newPosition.x) < 49 - radius &&
      Math.abs(newPosition.z) < 49 - radius
    ) {
      controls.current.position = newPosition;
    }

    camera.position.set(
      controls.current.position.x,
      controls.current.position.y,
      controls.current.position.z
    );
    camera.rotation.order = "YXZ";
    camera.rotation.x = controls.current.rotation.x;
    camera.rotation.y = controls.current.rotation.y;

    if (playerModelRef.current) {
      playerModelRef.current.position.set(
        controls.current.position.x,
        controls.current.position.y - 0.7,
        controls.current.position.z
      );
      playerModelRef.current.rotation.set(0, controls.current.rotation.y, 0);
    }

    if (playerBodyRef.current) {
      playerBodyRef.current.position.set(0, 0, 0);
    }

    if (playerGunRef.current) {
      playerGunRef.current.position.set(0.3, 0.5, 0);
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, isAiming ? 45 : 75, 0.3);
      camera.updateProjectionMatrix();
    }

    if (playerId && onPositionUpdate) {
      onPositionUpdate(
        camera.position.clone(),
        new THREE.Euler(
          controls.current.rotation.x,
          controls.current.rotation.y,
          0
        )
      );
    }
  });

  return (
    <>
      <GunViewModel isAiming={isAiming} />
      {/* Local player model */}
      <group ref={playerModelRef}>
        <mesh ref={playerBodyRef}>
          <capsuleGeometry args={[0.3, 1, 4, 8]} />
          <meshStandardMaterial
            color="#44ff44"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
        {/* Local player's gun */}
        <group ref={playerGunRef}>
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.4]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>
      {bullets.map((bullet) => (
        <Bullet
          key={bullet.id}
          start={bullet.start}
          direction={bullet.direction}
          onHit={() => {
            setBullets((prev) => prev.filter((b) => b.id !== bullet.id));
          }}
        />
      ))}
    </>
  );
}

function PlayerModel({
  position,
  rotation,
}: {
  position: THREE.Vector3;
  rotation: THREE.Euler;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Player body */}
      <mesh position={[0, 0.75, 0]}>
        <capsuleGeometry args={[0.3, 1, 4, 8]} />
        <meshStandardMaterial color="#ff4444" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Gun */}
      <group position={[0.3, 1.2, -0.3]} rotation={[0, rotation.y, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.4]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

function Platform({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#666666" metalness={0.2} roughness={0.7} />
    </mesh>
  );
}

function World() {
  const [players, setPlayers] = useState<
    Map<string, { position: THREE.Vector3; rotation: THREE.Euler }>
  >(new Map());
  const [playerId, setPlayerId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://xyz-worker.stupidthings.workers.dev/websocket`
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "game-state":
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
            }
          });
          setPlayers(newPlayers);
          if (!playerId && message.payload.playerId) {
            setPlayerId(message.payload.playerId);
          }
          break;

        case "player-join":
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

        case "player-leave":
          setPlayers((prev) => {
            const next = new Map(prev);
            next.delete(message.payload.playerId);
            return next;
          });
          break;

        case "player-update":
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
    };

    return () => {
      setPlayers(new Map());
      ws.close();
    };
  }, [playerId]);

  const handlePositionUpdate = useCallback(
    (position: THREE.Vector3, rotation: THREE.Euler) => {
      if (wsRef.current && playerId) {
        wsRef.current.send(
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
    [playerId]
  );

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

      {/* Smaller connecting platforms */}
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

      {/* Practice Targets */}
      <Target position={[-10, 1.5, -20]} />
      <Target position={[10, 1.5, -30]} />
      <Target position={[-15, 1.5, -40]} />
      <Target position={[15, 1.5, -25]} />
      <Target position={[0, 1.5, -45]} />

      {/* Other Players */}
      {Array.from(players.entries()).map(([id, data]) => (
        <PlayerModel
          key={id}
          position={data.position}
          rotation={data.rotation}
        />
      ))}

      {/* Camera */}
      <FPSCamera playerId={playerId} onPositionUpdate={handlePositionUpdate} />
    </>
  );
}

export default function Game() {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://xyz-worker.stupidthings.workers.dev/websocket`
    );

    ws.onopen = () => {
      console.log("Connected to game server");
      setConnected(true);
    };

    ws.onclose = () => {
      console.log("Disconnected from game server");
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;

    return () => ws.close();
  }, []);

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <World />
      </Canvas>
      <Crosshair />

      <div className="absolute top-4 left-4 bg-black/50 p-4 rounded text-white">
        <h2 className="text-xl font-bold">Status</h2>
        <p>Connected: {connected ? "Yes" : "No"}</p>
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
          <li>ESC - Release mouse</li>
        </ul>
      </div>
    </div>
  );
}
