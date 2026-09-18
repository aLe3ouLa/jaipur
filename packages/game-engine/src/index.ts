// Public entry point for the game-engine package.
//
// This file must never import from React, Three.js, or any browser API -
// this package has to run standalone under Node/Vitest.

export { JaipurGame } from "./JaipurGame.js";
export type { GameResult } from "./JaipurGame.js";
export { createPlayerView } from "./playerView.js";
export type { PlayerView } from "./playerView.js";
export type { GameState } from "./state.js";
export type { RandomSource } from "./deck.js";
export type { RoundSummary } from "./rounds.js";
