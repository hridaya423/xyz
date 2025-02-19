export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Player {
  id: string;
  name: string;
  position: Vector3;
  rotation: Vector3;
  health: number;
  kills: number;
  deaths: number;
}

export interface Projectile {
  id: string;
  position: Vector3;
  direction: Vector3;
  playerId: string;
}

export interface GameState {
  players: Map<string, Player>;
  projectiles: Projectile[];
}

type GamePayload = {
  "player-join": Player;
  "player-leave": { playerId: string };
  "player-update": Player;
  "player-shoot": { playerId: string; position: Vector3; direction: Vector3 };
  "game-state": { players: Player[]; projectiles: Projectile[] };
  "player-hit": {
    targetId: string;
    health: number;
    kills: number;
    deaths: number;
  };
};

export interface GameMessage {
  type: keyof GamePayload;
  payload: GamePayload[keyof GamePayload];
}
