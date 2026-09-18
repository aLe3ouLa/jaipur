import { GoodsType, PlayerId, SaleSize } from "shared";
import { GameState } from "../state";

export function applySellGoods(
  state: GameState,
  playerId: PlayerId,
  goodsType: GoodsType,
  quantity: number,
): GameState {
  const hand = [...(state.hand[playerId] || [])];
  const discardPile = [...(state.discardPile || [])];
  let score = state.score[playerId] || 0;

  let q = quantity;

  const newHand = hand.filter((c) => {
    if (c.type === goodsType && q > 0) {
      discardPile.push(c);
      q--;
      return false;
    }

    return true;
  });

  const remainingStack = state.goodsTokens[goodsType];
  const tokensAwarded = remainingStack.slice(0, quantity);
  const newStack = remainingStack.slice(quantity);

  score += tokensAwarded.reduce((acc, curr) => acc + curr, 0);

  let tier: SaleSize | undefined = undefined;
  if (quantity === 3) {
    tier = 3;
  } else if (quantity === 4) {
    tier = 4;
  } else if (quantity >= 5) {
    tier = 5;
  }

  let bonusTokens = state.bonusTokens;
  if (tier !== undefined) {
    const bonusStack = state.bonusTokens[tier];
    const bonusAwarded = bonusStack.slice(0, 1);
    const newBonusStack = bonusStack.slice(1);

    score += bonusAwarded.reduce((acc, curr) => acc + curr, 0);
    bonusTokens = { ...state.bonusTokens, [tier]: newBonusStack };
  }

  const goodsTokens = { ...state.goodsTokens, [goodsType]: newStack };

  const depletedStacks = Object.values(goodsTokens).filter(
    (stack) => stack.length === 0,
  ).length;

  const gameStatus =
    depletedStacks >= 3 ? "round_ended" : state.gameStatus;

  return {
    ...state,
    hand: { ...state.hand, [playerId]: newHand },
    discardPile,
    score: { ...state.score, [playerId]: score },
    goodsTokens,
    bonusTokens,
    gameStatus,
  };
}
