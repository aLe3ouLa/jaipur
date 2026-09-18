import { PlayerId } from "shared";
import { GameState } from "../state";

export function applyTakeCamels(
  state: GameState,
  playerId: PlayerId,
): GameState {
  const market = [...state.market];
  const camelHerd = [...(state.camelHerd[playerId] || [])];
  const deck = [...state.deck];
  let gameStatus = state.gameStatus;

  const camelsInMarket = market.filter((card) => card.type === "camel");
  let marketWithoutCamels = market.filter((c) => c.type !== "camel");
  camelHerd.push(...camelsInMarket);

  for (let i = 0; i < camelsInMarket.length; i++) {
    if (deck.length > 0) {
      const topCard = deck.shift()!;
      marketWithoutCamels.push(topCard);
    } else {
      gameStatus = "round_ended";
      break;
    }
  }

  return {
    ...state,
    gameStatus,
    market: marketWithoutCamels,
    deck,
    camelHerd: { ...state.camelHerd, [playerId]: camelHerd },
  };
}
