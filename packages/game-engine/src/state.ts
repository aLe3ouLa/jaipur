import { Card, GoodsType, PlayerId, SaleSize } from "shared";

export type GameState = {
  hand: Record<PlayerId, Card[]>;
  camelHerd: Record<PlayerId, Card[]>;
  market: Card[];
  deck: Card[];
  discardPile: Card[];
  goodsTokens: Record<GoodsType, number[]>;
  bonusTokens: Record<SaleSize, number[]>;
  score: Record<PlayerId, number>;
  turn: PlayerId;
  roundNumber: number;
  gameStatus:
    | "waiting_for_players"
    | "in_progress"
    | "round_ended"
    | "game_ended";
};
