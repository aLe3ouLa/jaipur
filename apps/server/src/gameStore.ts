import type { WebSocket } from "ws";
import { PlayerId } from "shared";
import { JaipurGame } from "game-engine";
import { generateGameCode, generatePlayerId, generatePlayerToken } from "./ids.js";
import { mathRandomSource } from "./random.js";

export type PlayerSlot = {
  playerId: PlayerId;
  token: string;
  socket: WebSocket | undefined;
  hasConnectedBefore: boolean;
};

export type ServerGame = {
  code: string;
  players: PlayerSlot[]; // 1 entry while waiting for an opponent, 2 once full
  game: JaipurGame | undefined; // only exists once both players have joined
  createdAt: number;
  lastActivityAt: number;
};

const games = new Map<string, ServerGame>();

function uniqueGameCode(): string {
  let code = generateGameCode();
  while (games.has(code)) {
    code = generateGameCode();
  }
  return code;
}

function newPlayerSlot(): PlayerSlot {
  return {
    playerId: generatePlayerId(),
    token: generatePlayerToken(),
    socket: undefined,
    hasConnectedBefore: false,
  };
}

export function createGame(): { serverGame: ServerGame; token: string } {
  const player = newPlayerSlot();

  const serverGame: ServerGame = {
    code: uniqueGameCode(),
    players: [player],
    game: undefined,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  };

  games.set(serverGame.code, serverGame);
  return { serverGame, token: player.token };
}

export function getGame(code: string): ServerGame | undefined {
  return games.get(code);
}

export type JoinGameResult =
  | { success: true; serverGame: ServerGame; token: string }
  | { success: false; reason: string };

export function joinGame(code: string): JoinGameResult {
  const serverGame = games.get(code);
  if (!serverGame) {
    return { success: false, reason: "Game not found" };
  }
  if (serverGame.players.length >= 2) {
    return { success: false, reason: "Game is already full" };
  }

  const player = newPlayerSlot();
  serverGame.players.push(player);
  serverGame.lastActivityAt = Date.now();

  const [player1, player2] = serverGame.players;
  if (!player1 || !player2) {
    throw new Error("Expected exactly 2 players after join");
  }

  serverGame.game = new JaipurGame(
    [player1.playerId, player2.playerId],
    mathRandomSource,
  );

  return { success: true, serverGame, token: player.token };
}

export function findPlayerByToken(
  serverGame: ServerGame,
  token: string,
): PlayerSlot | undefined {
  return serverGame.players.find((p) => p.token === token);
}
