import { GoodsType, PlayerId } from "shared";
import { GameState } from "../state";

export function applySellGoods(
  state: GameState,
  playerId: PlayerId,
  goodsType: GoodsType,
  quantity: number,
): GameState {
  const hand = [...(state.hand[playerId] || [])];
  const discardPile = [...(state.discardPile || [])];

  let q = quantity;

  const newHand = hand.filter((c) => {
    if (c.type === goodsType && q > 0) {
      discardPile.push(c);
      q--;
      return false;
    }

    return true;
  });

  return {
    ...state,
    hand: { ...state.hand, [playerId]: newHand },
    discardPile,
  };
}
