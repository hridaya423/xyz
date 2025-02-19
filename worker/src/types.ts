interface Env {
	DB: D1Database;
	VOTING_SYSTEM: DurableObjectNamespace;
	SLACK_CLIENT_ID: string;
	SLACK_CLIENT_SECRET: string;
	SLACK_REDIRECT_URI: string;
}

export type { Env };

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

export interface GameState {
	players: Map<string, Player>;
	projectiles: any[];
}

export interface GameMessage {
	type: 'player-join' | 'player-leave' | 'player-update' | 'player-shoot' | 'game-state' | 'player-hit';
	payload: any;
}
