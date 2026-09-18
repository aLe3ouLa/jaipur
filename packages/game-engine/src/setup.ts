import { CardId, CardType, Card, PlayerId } from "shared";
import { BONUS_TOKEN_VALUES, GOODS_TOKEN_VALUES, RandomSource } from "./deck";
import { GameState } from "./state";

export function buildDeck(): Card[] {
  const cards: Card[] = [];
  let id = 0;

  const addCards = (type: CardType, count: number) => {
    for (let i = 0; i < count; i++) {
      cards.push({
        id: `card-${id++}` as CardId,
        type,
      });
    }
  };

  addCards("diamonds", 6);
  addCards("gold", 6);
  addCards("silver", 6);
  addCards("cloth", 8);
  addCards("spices", 8);
  addCards("leather", 10);
  addCards("camel", 11);

  return cards;
}

export function shuffle<T>(items: T[], random: RandomSource): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random.next() * (i + 1));

    [shuffled[i], shuffled[j]!] = [shuffled[j]!, shuffled[i]!];
  }

  return shuffled;
}

function takeCamels(
  cards: Card[],
  count: number,
): {
  camels: Card[];
  remainingDeck: Card[];
} {
  const camels: Card[] = [];
  const remainingDeck: Card[] = [];

  for (const card of cards) {
    if (card.type === "camel" && camels.length < count) {
      camels.push(card);
    } else {
      remainingDeck.push(card);
    }
  }

  if (camels.length !== count) {
    throw new Error(`Expected to find ${count} camels, found ${camels.length}`);
  }

  return { camels, remainingDeck };
}

export function createInitialState(
  players: [PlayerId, PlayerId],
  random: RandomSource,
): GameState {
  const deck = buildDeck();
  const shuffledDeck = shuffle(deck, random);

  const { camels, remainingDeck } = takeCamels(shuffledDeck, 3);

  const player1 = players[0];
  const player2 = players[1];

  // // Deal hands from the remaining shuffled deck.
  const player1Hand = remainingDeck.slice(0, 5);
  const player2Hand = remainingDeck.slice(5, 10);

  const market = [...camels, ...remainingDeck.slice(10, 12)];

  const remaining = remainingDeck.slice(12);

  return {
    hand: { [player1]: player1Hand, [player2]: player2Hand },
    camelHerd: { [player1]: [], [player2]: [] },
    market,
    deck: remaining,
    discardPile: [],
    goodsTokens: structuredClone(GOODS_TOKEN_VALUES),
    bonusTokens: {
      3: shuffle(BONUS_TOKEN_VALUES[3], random),
      4: shuffle(BONUS_TOKEN_VALUES[4], random),
      5: shuffle(BONUS_TOKEN_VALUES[5], random),
    },
    score: { [player1]: 0, [player2]: 0 },
    turn: player1,
    roundNumber: 1,
    gameStatus: "waiting_for_players",
  };
}
