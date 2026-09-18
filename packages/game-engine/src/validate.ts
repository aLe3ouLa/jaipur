import { PlayerId, GameCommand } from "shared";
import { GameState } from "./state";

export function validateCommand(
  state: GameState,
  playerId: PlayerId,
  command: GameCommand,
): { legal: true } | { legal: false; reason: string } {
  if (state.turn !== playerId) {
    return { legal: false, reason: "It's not players turn" };
  }

  if (state.gameStatus !== "in_progress") {
    return { legal: false, reason: "The game is not in progress" };
  }

  switch (command.type) {
    case "TAKE_GOODS": {
      const findCard = state.market.find((card) => card.id === command.cardId);
      if (!findCard) {
        return { legal: false, reason: "This card is not in the market" };
      }

      if (findCard.type === "camel") {
        return {
          legal: false,
          reason:
            "Camels is a group action; you take all the camels as a group",
        };
      }

      if (state.hand[playerId] && state.hand[playerId]?.length > 6) {
        return {
          legal: false,
          reason: "You can't have more that 7 cards in your hand",
        };
      }

      return { legal: true };
    }
    case "TAKE_CAMELS": {
      const camels = state.market.filter((cards) => cards.type === "camel");

      if (camels.length === 0) {
        return {
          legal: false,
          reason: "There are no camels in the market",
        };
      }

      return { legal: true };
    }
    case "EXCHANGE": {
      //{ type: "EXCHANGE"; handCardIds: CardId[]; marketCardIds: CardId[] }
      const hand = state.hand[playerId];
      const camelHerd = state.camelHerd[playerId];
      const market = state.market;

      if (!hand || !camelHerd) {
        return {
          legal: false,
          reason: "You have no cards to exchange",
        };
      }

      for (let cardId of command.handCardIds) {
        const ownsCard =
          hand.some((c) => c.id === cardId) ||
          camelHerd.some((c) => c.id === cardId);

        if (!ownsCard) {
          return {
            legal: false,
            reason: "This is not your card",
          };
        }
      }

      for (let cardId of command.marketCardIds) {
        if (!market.some((c) => c.id === cardId)) {
          return {
            legal: false,
            reason: "This card is not in the market",
          };
        }
      }

      if (command.handCardIds.length < 2) {
        return {
          legal: false,
          reason: "an exchange must involve 2 or more cards",
        };
      }

      if (command.handCardIds.length !== command.marketCardIds.length) {
        return {
          legal: false,
          reason: "You have to exchange equal amount of cards",
        };
      }

      const goodsGivenFromHand = command.handCardIds.filter((cardId) =>
        hand.some((c) => c.id === cardId),
      ).length;

      const goodsReceivedFromMarket = command.marketCardIds.filter(
        (cardId) => market.find((c) => c.id === cardId)?.type !== "camel",
      ).length;

      const resultingHandSize =
        hand.length - goodsGivenFromHand + goodsReceivedFromMarket;

      if (resultingHandSize > 7) {
        return {
          legal: false,
          reason: "This exchange would leave you with more than 7 cards",
        };
      }

      return { legal: true };
    }
    case "SELL_GOODS": {
      const hand = state.hand[playerId];
      const goodsTypeInHand = (hand || []).filter(
        (card) => card.type === command.goodsType,
      );

      if (goodsTypeInHand.length < command.quantity) {
        return {
          legal: false,
          reason: "You try to sell more goods that you have",
        };
      }

      if (
        (command.goodsType === "diamonds" ||
          command.goodsType === "silver" ||
          command.goodsType === "gold") &&
        command.quantity < 2
      ) {
        return {
          legal: false,
          reason: "You can't sell a single high-value card alone",
        };
      }

      if (state.goodsTokens[command.goodsType] <= 0) {
        return {
          legal: false,
          reason: "There are not enough tokens",
        };
      }

      return { legal: true };
    }
  }
}
