import { RandomSource } from "game-engine";

/** The production RandomSource - real randomness, for real games. Tests use
 * a seeded/fake RandomSource instead; never this one. */
export const mathRandomSource: RandomSource = {
  next: () => Math.random(),
};
