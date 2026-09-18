import { GameCommand, PlayerId } from "shared";
import { GameState } from "./state";
import { RandomSource } from "./deck";
import { createInitialState } from "./setup";
import { validateCommand } from "./validate";
import { applyTakeGoods } from "./reducers/takeGoods";
import { applyTakeCamels } from "./reducers/takeCamels";
import { applyExchange } from "./reducers/exchange";
import { applySellGoods } from "./reducers/sellsGood";
import { finishRound, otherPlayer } from "./rounds";

export type GameResult =
  | { success: true; state: GameState }
  | { success: false; reason: string };

export class JaipurGame {
  private state: GameState;
  private readonly players: [PlayerId, PlayerId];
  private readonly random: RandomSource;

  constructor(players: [PlayerId, PlayerId], random: RandomSource) {
    this.players = players;
    this.random = random;
    // Both PlayerIds are already known by the time a JaipurGame can be
    // constructed, so "waiting_for_players" (createInitialState's default,
    // correct for a server that hasn't matched a second player yet) never
    // actually applies here - the game is ready to play immediately.
    this.state = { ...createInitialState(players, random), gameStatus: "in_progress" };
  }

  getState(): GameState {
    return this.state;
  }

  executeCommand(playerId: PlayerId, command: GameCommand): GameResult {
    const validation = validateCommand(this.state, playerId, command);
    if (!validation.legal) {
      return { success: false, reason: validation.reason };
    }

    let newState: GameState;
    switch (command.type) {
      case "TAKE_GOODS":
        newState = applyTakeGoods(this.state, playerId, command.cardId);
        break;
      case "TAKE_CAMELS":
        newState = applyTakeCamels(this.state, playerId);
        break;
      case "EXCHANGE":
        newState = applyExchange(
          this.state,
          playerId,
          command.handCardIds,
          command.marketCardIds,
        );
        break;
      case "SELL_GOODS":
        newState = applySellGoods(
          this.state,
          playerId,
          command.goodsType,
          command.quantity,
        );
        break;
    }

    if (newState.gameStatus === "round_ended") {
      // finishRound deals the next round (or ends the game) and decides
      // whose turn it is next - a reducer never advances turn itself, so
      // this is the one place that responsibility belongs when a round ends.
      newState = finishRound(newState, this.players, this.random);
    } else {
      // A successful command always ends the acting player's turn, unless
      // the round just ended above (handled separately by finishRound).
      newState = { ...newState, turn: otherPlayer(this.players, playerId) };
    }

    this.state = newState;
    return { success: true, state: newState };
  }
}
