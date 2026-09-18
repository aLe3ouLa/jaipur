import { CardId, GoodsType } from "./types";

export type GameCommand =
  | { type: "TAKE_GOODS"; cardId: CardId }
  | { type: "TAKE_CAMELS" }
  | { type: "EXCHANGE"; handCardIds: CardId[]; marketCardIds: CardId[] }
  | { type: "SELL_GOODS"; goodsType: GoodsType; quantity: number };
