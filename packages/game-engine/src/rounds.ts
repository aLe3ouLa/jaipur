import { PlayerId } from "shared";
import { GameState } from "./state";
import { RandomSource } from "./deck";
import { createInitialState } from "./setup";

const CAMEL_MAJORITY_BONUS = 5;
const SEALS_TO_WIN_GAME = 2;

function otherPlayer(players: [PlayerId, PlayerId], player: PlayerId): PlayerId {
  return players[0] === player ? players[1] : players[0];
}

function camelBonus(
  state: GameState,
  players: [PlayerId, PlayerId],
  player: PlayerId,
): number {
  const mine = state.camelHerd[player]?.length || 0;
  const theirs = state.camelHerd[otherPlayer(players, player)]?.length || 0;
  return mine > theirs ? CAMEL_MAJORITY_BONUS : 0;
}

function roundScore(
  state: GameState,
  players: [PlayerId, PlayerId],
  player: PlayerId,
): number {
  return (state.score[player] || 0) + camelBonus(state, players, player);
}

/**
 * Determines the winner of a finished round using Jaipur's tie-break order:
 * rupees, then bonus tokens collected, then goods tokens collected.
 * Returns undefined in the (practically impossible) case of a full tie.
 */
export function getRoundWinner(
  state: GameState,
  players: [PlayerId, PlayerId],
): PlayerId | undefined {
  const [p1, p2] = players;

  const p1Score = roundScore(state, players, p1);
  const p2Score = roundScore(state, players, p2);
  if (p1Score !== p2Score) {
    return p1Score > p2Score ? p1 : p2;
  }

  const p1Bonus = state.bonusTokensWon[p1] || 0;
  const p2Bonus = state.bonusTokensWon[p2] || 0;
  if (p1Bonus !== p2Bonus) {
    return p1Bonus > p2Bonus ? p1 : p2;
  }

  const p1Goods = state.goodsTokensWon[p1] || 0;
  const p2Goods = state.goodsTokensWon[p2] || 0;
  if (p1Goods !== p2Goods) {
    return p1Goods > p2Goods ? p1 : p2;
  }

  return undefined;
}

/**
 * Applies round-end scoring to a state whose gameStatus is "round_ended":
 * awards a seal to the round winner, and either ends the game (someone has
 * 2 seals) or deals a fresh round, with the previous round's loser going
 * first, per the official rule.
 */
export function finishRound(
  state: GameState,
  players: [PlayerId, PlayerId],
  random: RandomSource,
): GameState {
  const winner = getRoundWinner(state, players);

  const seals = { ...state.seals };
  if (winner) {
    seals[winner] = (seals[winner] || 0) + 1;
  }

  const gameWinner = players.find((player) => (seals[player] || 0) >= SEALS_TO_WIN_GAME);

  if (gameWinner) {
    return {
      ...state,
      seals,
      gameStatus: "game_ended",
    };
  }

  const nextStarter = winner ? otherPlayer(players, winner) : players[0];
  const nextRound = createInitialState(players, random);

  return {
    ...nextRound,
    seals,
    roundNumber: state.roundNumber + 1,
    turn: nextStarter,
    gameStatus: "in_progress",
  };
}
