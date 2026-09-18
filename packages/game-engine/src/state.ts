import { CardId, GoodsType, PlayerId, SaleSize } from "shared";

export type GameState = {
  hand: Record<PlayerId, CardId[]>;
  camelHerd: Record<PlayerId, number>;
  market: CardId[];
  deck: CardId[];
  discardPile: CardId[];
  goodsTokens: Record<GoodsType, number>;
  bonusTokens: Record<SaleSize, number>;
  score: Record<PlayerId, number>;
  turn: PlayerId;
  roundNumber: number;
  gameStatus:
    | "waiting_for_players"
    | "in_progress"
    | "round_ended"
    | "game_ended";
};
