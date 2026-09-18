import { CardId, PlayerId } from "shared";
import { GameState } from "../state";

export function applyExchange(
  state: GameState,
  playerId: PlayerId,
  handCardIds: CardId[],
  marketCardIds: CardId[],
): GameState {
  let hand = [...(state.hand[playerId] || [])];
  let camelHerd = [...(state.camelHerd[playerId] || [])];
  let market = [...state.market];

  for (let card of handCardIds) {
    const cardInHand = hand.find((c) => c.id === card);
    const cardInCamel = camelHerd.find((c) => c.id === card);

    const actualCard = cardInHand ?? cardInCamel;

    if (actualCard) {
      if (cardInHand) {
        hand = hand.filter((c) => c.id !== actualCard.id);
      } else {
        camelHerd = camelHerd.filter((c) => c.id !== actualCard.id);
      }
      market.push(actualCard);
    }
  }

  for (let card of marketCardIds) {
    const cardInMarket = market.find((c) => c.id === card);
    if (!cardInMarket) {
      break;
    }
    market = market.filter((c) => c.id !== cardInMarket?.id);
    if (cardInMarket?.type === "camel") {
      camelHerd.push(cardInMarket);
    } else {
      hand.push(cardInMarket);
    }
  }

  return {
    ...state,
    hand: { ...state.hand, [playerId]: hand },
    camelHerd: { ...state.camelHerd, [playerId]: camelHerd },
    market,
  };
}
