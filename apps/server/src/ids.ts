import { randomUUID } from "node:crypto";
import { PlayerId } from "shared";

const GAME_CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O, avoids look-alikes
const GAME_CODE_DIGITS = "23456789"; // no 0/1, same reason

function randomFrom(alphabet: string): string {
  const index = Math.floor(Math.random() * alphabet.length);
  return alphabet[index]!;
}

/** A short, shareable, human-typeable code for a game's URL, e.g. "ABCD12". */
export function generateGameCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += randomFrom(GAME_CODE_LETTERS);
  }
  for (let i = 0; i < 2; i++) {
    code += randomFrom(GAME_CODE_DIGITS);
  }
  return code;
}

/**
 * A secret, unguessable token handed to one specific browser so it can prove
 * "I am this player" on reconnect. Deliberately not the same thing as a
 * PlayerId: PlayerId is the engine's internal key for state (hand/score/etc),
 * this is a credential - reusing PlayerId as the credential would mean
 * leaking it anywhere (e.g. to the opponent, who does learn the existence of
 * player IDs in principle) would let someone impersonate that player.
 */
export function generatePlayerToken(): string {
  return randomUUID();
}

/** Mint a new branded PlayerId - the one place this cast is allowed. */
export function generatePlayerId(): PlayerId {
  return randomUUID() as PlayerId;
}
