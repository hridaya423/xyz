import { DurableObject } from 'cloudflare:workers';
import { nanoid } from 'nanoid';
import type { Player, GameState, GameMessage } from '../../src/types/game';

interface Env {
	XYZ_GAME: DurableObjectNamespace;
}

export class XYZGame extends DurableObject<Env> {
	private sessions: Map<WebSocket, { playerId: string }>;
	private state: GameState;
	protected env: Env;
	protected ctx: DurableObjectState;

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.ctx = state;
		this.env = env;
		this.sessions = new Map();
		this.state = {
			players: new Map(),
			projectiles: [],
		};
	}

	broadcast(message: GameMessage, excludePlayerId?: string) {
		this.sessions.forEach((session, ws) => {
			if (!excludePlayerId || session.playerId !== excludePlayerId) {
				ws.send(JSON.stringify(message));
			}
		});
	}

	async fetch(request: Request) {
		const url = new URL(request.url);

		if (url.pathname === '/websocket') {
			if (request.headers.get('Upgrade') !== 'websocket') {
				return new Response('Expected websocket', { status: 400 });
			}

			const [client, server] = Object.values(new WebSocketPair());
			await this.handleSession(server);

			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}

		return new Response('Not found', { status: 404 });
	}

	async handleSession(ws: WebSocket) {
		ws.accept();

		const playerId = nanoid();
		this.sessions.set(ws, { playerId });

		const newPlayer: Player = {
			id: playerId,
			name: `Player ${this.state.players.size + 1}`,
			position: { x: Math.random() * 20 - 10, y: 1, z: Math.random() * 20 - 10 },
			rotation: { x: 0, y: 0, z: 0 },
			health: 100,
			kills: 0,
			deaths: 0,
		};

		this.state.players.set(playerId, newPlayer);

		this.broadcast(
			{
				type: 'player-join',
				payload: newPlayer,
			},
			playerId
		);

		ws.send(
			JSON.stringify({
				type: 'game-state',
				payload: {
					players: Array.from(this.state.players.values()),
					projectiles: this.state.projectiles,
				},
			})
		);

		ws.addEventListener('message', async (msg) => {
			try {
				const data: GameMessage = JSON.parse(msg.data as string);
				const player = this.state.players.get(playerId);

				if (!player) return;

				switch (data.type) {
					case 'player-update':
						Object.assign(player, data.payload);
						this.broadcast(
							{
								type: 'player-update',
								payload: player,
							},
							playerId
						);
						break;

					case 'player-shoot':
						this.broadcast(
							{
								type: 'player-shoot',
								payload: {
									playerId,
									...data.payload,
								},
							},
							playerId
						);
						break;

					case 'player-hit': {
						const hitPayload = data.payload as { targetId: string };
						const targetPlayer = this.state.players.get(hitPayload.targetId);
						if (targetPlayer) {
							targetPlayer.health -= 20;
							if (targetPlayer.health <= 0) {
								player.kills++;
								targetPlayer.deaths++;
								targetPlayer.health = 100;
								targetPlayer.position = {
									x: Math.random() * 20 - 10,
									y: 1,
									z: Math.random() * 20 - 10,
								};
							}
							this.broadcast({
								type: 'player-hit',
								payload: {
									targetId: targetPlayer.id,
									health: targetPlayer.health,
									kills: player.kills,
									deaths: targetPlayer.deaths,
								},
							});
						}
						break;
					}
				}
			} catch (err) {
				console.error('Error processing message:', err);
			}
		});

		ws.addEventListener('close', () => {
			this.sessions.delete(ws);
			this.state.players.delete(playerId);
			this.broadcast({
				type: 'player-leave',
				payload: { playerId },
			});
		});
	}
}

export default {
	async fetch(request: Request, env: Env) {
		const id = env.XYZ_GAME.idFromName('game');
		const obj = env.XYZ_GAME.get(id);
		return obj.fetch(request);
	},
};
