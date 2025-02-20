/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Player {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  health: number;
  kills: number;
  deaths: number;
}

export interface GameState {
  players: Map<string, Player>;
  projectiles: any[];
}

export type GameMessage =
  | {
      type: 'game-state';
      payload: { players: Player[]; projectiles: any[]; playerId?: string };
    }
  | { type: 'player-join'; payload: Player }
  | { type: 'player-leave'; payload: { playerId: string } }
  | { type: 'player-update'; payload: Player }
  | { type: 'player-shoot'; payload: any }
  | {
      type: 'player-hit';
      payload: { targetId: string; health: number; kills?: number; deaths?: number };
    };
