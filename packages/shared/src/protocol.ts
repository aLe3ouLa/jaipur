import { GameCommand } from "./commands.js";

/**
 * What a client sends over the WebSocket connection. The command itself is
 * the only thing the client gets to assert - identity comes from the
 * authenticated connection, never from the message body.
 */
export type ClientMessage = {
  type: "COMMAND";
  command: GameCommand;
};

/**
 * What the server sends over the WebSocket connection. Deliberately coarse
 * for now (a full re-sync of the recipient's view after every change) rather
 * than the fully granular per-action GameEvent union from the original spec -
 * that level of detail only matters once there's a 3D client to animate
 * against it (Phase 5). Lifecycle events are still granular since the client
 * needs to react to them structurally (e.g. show a lobby vs. a board).
 */
export type ServerMessage =
  | { type: "STATE_UPDATE"; view: unknown }
  | { type: "PLAYER_JOINED" }
  | { type: "GAME_STARTED" }
  | { type: "PLAYER_DISCONNECTED" }
  | { type: "PLAYER_RECONNECTED" }
  | { type: "ROUND_ENDED" }
  | { type: "GAME_ENDED" }
  | { type: "ERROR"; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Runtime validation for a message arriving over the wire - the client is
 * untrusted, so this must not assume the JSON it sent matches ClientMessage
 * just because TypeScript would allow it to on the sending side.
 */
export function isClientMessage(value: unknown): value is ClientMessage {
  if (!isRecord(value) || value.type !== "COMMAND") {
    return false;
  }

  const command = value.command;
  if (!isRecord(command) || typeof command.type !== "string") {
    return false;
  }

  switch (command.type) {
    case "TAKE_GOODS":
      return typeof command.cardId === "string";
    case "TAKE_CAMELS":
      return true;
    case "EXCHANGE":
      return (
        Array.isArray(command.handCardIds) &&
        command.handCardIds.every((id) => typeof id === "string") &&
        Array.isArray(command.marketCardIds) &&
        command.marketCardIds.every((id) => typeof id === "string")
      );
    case "SELL_GOODS":
      return (
        typeof command.goodsType === "string" &&
        typeof command.quantity === "number"
      );
    default:
      return false;
  }
}
