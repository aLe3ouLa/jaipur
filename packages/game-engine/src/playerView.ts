import { Card, GoodsType, PlayerId, SaleSize } from "shared";
import { GameState } from "./state";

export type PlayerView = {
  myHand: Card[];
  opponentHandCount: number;
  myCamelHerd: Card[];
  opponentCamelHerdCount: number;
  market: Card[];
  deckCount: number;
  discardPile: Card[];
  goodsTokens: Record<GoodsType, number[]>;
  bonusTokens: Record<SaleSize, number[]>;
  myScore: number;
  opponentScore: number;
  turn: PlayerId;
  roundNumber: number;
  gameStatus:
    | "waiting_for_players"
    | "in_progress"
    | "round_ended"
    | "game_ended";

  mySeals: number;
  opponentSeals: number;
  myGoodsTokensWon: number;
  opponentsGoodsTokensWon: number;
  myBonusTokensWon: number;
  opponentsBonusTokensWon: number;
};

export function createPlayerView(
  state: GameState,
  playerId: PlayerId,
  opponentId: PlayerId,
): PlayerView {
  const myHand = state.hand[playerId] ?? [];
  const opponentHand = state.hand[opponentId] ?? [];

  const myCamelHerd = state.camelHerd[playerId] ?? [];
  const opponentCamelHerd = state.camelHerd[opponentId] ?? [];

  const myScore = state.score[playerId] ?? 0;
  const opponentScore = state.score[opponentId] ?? 0;

  const mySeals = state.seals[playerId] ?? 0;
  const opponentSeals = state.seals[opponentId] ?? 0;

  const myGoodsTokensWon = state.goodsTokensWon[playerId] ?? 0;
  const opponentsGoodsTokensWon = state.goodsTokensWon[opponentId] ?? 0;

  const myBonusTokensWon = state.bonusTokensWon[playerId] ?? 0;
  const opponentsBonusTokensWon = state.bonusTokensWon[opponentId] ?? 0;

  return {
    myHand,
    opponentHandCount: opponentHand.length,
    myCamelHerd,
    opponentCamelHerdCount: opponentCamelHerd.length,
    market: state.market,
    deckCount: state.deck.length,
    discardPile: state.discardPile,
    goodsTokens: state.goodsTokens,
    bonusTokens: state.bonusTokens,
    myScore,
    opponentScore,
    turn: state.turn,
    roundNumber: state.roundNumber,
    gameStatus: state.gameStatus,
    mySeals,
    opponentSeals,
    myGoodsTokensWon,
    opponentsGoodsTokensWon,
    myBonusTokensWon,
    opponentsBonusTokensWon,
  };
}
