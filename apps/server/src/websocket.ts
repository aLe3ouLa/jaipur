import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { isClientMessage, ServerMessage } from "shared";
import { createPlayerView } from "game-engine";
import { getGame, findPlayerByToken, ServerGame, PlayerSlot } from "./gameStore.js";

export function send(socket: WebSocket, message: ServerMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

export function broadcast(serverGame: ServerGame, message: ServerMessage): void {
  for (const player of serverGame.players) {
    if (player.socket) {
      send(player.socket, message);
    }
  }
}

/** Like broadcast, but each player gets a message built relative to their own
 * identity (e.g. "youWon" means something different per recipient). */
function sendToEach(
  serverGame: ServerGame,
  build: (player: PlayerSlot, opponent: PlayerSlot) => ServerMessage,
): void {
  const [player1, player2] = serverGame.players;
  if (!player1 || !player2) {
    return;
  }
  if (player1.socket) {
    send(player1.socket, build(player1, player2));
  }
  if (player2.socket) {
    send(player2.socket, build(player2, player1));
  }
}

function sendStateToEach(serverGame: ServerGame): void {
  const game = serverGame.game;
  if (!game) {
    return;
  }

  const state = game.getState();
  const [player1, player2] = serverGame.players;
  if (!player1 || !player2) {
    return;
  }

  if (player1.socket) {
    const view = createPlayerView(state, player1.playerId, player2.playerId);
    send(player1.socket, { type: "STATE_UPDATE", view });
  }
  if (player2.socket) {
    const view = createPlayerView(state, player2.playerId, player1.playerId);
    send(player2.socket, { type: "STATE_UPDATE", view });
  }
}

function handleConnection(
  socket: WebSocket,
  serverGame: ServerGame,
  player: PlayerSlot,
): void {
  const isFirstConnection = !player.hasConnectedBefore;
  const wasDisconnected = player.socket === undefined && !isFirstConnection;

  player.hasConnectedBefore = true;
  player.socket = socket;
  serverGame.lastActivityAt = Date.now();

  if (serverGame.game) {
    sendStateToEach(serverGame);

    const otherPlayer = serverGame.players.find((p) => p !== player);
    const bothConnected = otherPlayer?.socket !== undefined;

    if (isFirstConnection && bothConnected) {
      broadcast(serverGame, { type: "GAME_STARTED" });
    } else if (wasDisconnected) {
      broadcast(serverGame, { type: "PLAYER_RECONNECTED" });
    }
  }

  socket.on("message", (raw) => {
    const game = serverGame.game;
    if (!game) {
      send(socket, { type: "ERROR", reason: "Game has not started yet" });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.toString());
    } catch {
      send(socket, { type: "ERROR", reason: "Malformed message" });
      return;
    }

    if (!isClientMessage(parsed)) {
      send(socket, { type: "ERROR", reason: "Malformed command" });
      return;
    }

    const result = game.executeCommand(player.playerId, parsed.command);
    serverGame.lastActivityAt = Date.now();

    if (!result.success) {
      send(socket, { type: "ERROR", reason: result.reason });
      return;
    }

    sendStateToEach(serverGame);

    if (result.roundSummary) {
      const summary = result.roundSummary;
      sendToEach(serverGame, (recipient, opponent) => ({
        type: "ROUND_ENDED",
        roundNumber: summary.roundNumber,
        youWon:
          summary.winner === undefined
            ? undefined
            : summary.winner === recipient.playerId,
        yourRoundScore: summary.scores[recipient.playerId] ?? 0,
        opponentRoundScore: summary.scores[opponent.playerId] ?? 0,
      }));
    }

    if (result.state.gameStatus === "game_ended") {
      const seals = result.state.seals;
      sendToEach(serverGame, (recipient, opponent) => ({
        type: "GAME_ENDED",
        youWon: (seals[recipient.playerId] ?? 0) > (seals[opponent.playerId] ?? 0),
        yourSeals: seals[recipient.playerId] ?? 0,
        opponentSeals: seals[opponent.playerId] ?? 0,
      }));
    }
  });

  socket.on("close", () => {
    player.socket = undefined;
    serverGame.lastActivityAt = Date.now();
    if (serverGame.game) {
      broadcast(serverGame, { type: "PLAYER_DISCONNECTED" });
    }
  });
}

export function attachWebSocketServer(httpServer: Server): void {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket, request) => {
    const url = new URL(request.url ?? "", "http://localhost");
    const code = url.searchParams.get("code");
    const token = url.searchParams.get("token");

    if (!code || !token) {
      socket.close(4000, "Missing code or token");
      return;
    }

    const serverGame = getGame(code);
    if (!serverGame) {
      socket.close(4004, "Game not found");
      return;
    }

    const player = findPlayerByToken(serverGame, token);
    if (!player) {
      socket.close(4001, "Invalid token");
      return;
    }

    handleConnection(socket, serverGame, player);
  });
}
