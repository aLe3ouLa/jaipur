import { CardId, PlayerId } from "shared";
import { GameState } from "../state";

export function applyTakeGoods(
  state: GameState,
  playerId: PlayerId,
  cardId: CardId,
): GameState {
  let market = [...state.market];
  const hand = [...(state.hand[playerId] || [])];
  const deck = [...state.deck];
  let gameStatus = state.gameStatus;

  const card = market.find((m) => m.id === cardId);

  if (card) {
    market = market.filter((c) => c.id !== cardId);
    hand.push({ ...card });

    if (deck.length > 0) {
      const topCard = deck[0]!;
      deck.shift();
      market.push(topCard);
    } else {
      gameStatus = "round_ended";
    }
  }

  return {
    ...state,
    hand: { ...state.hand, [playerId]: hand },
    market,
    deck,
    gameStatus,
  };
}
