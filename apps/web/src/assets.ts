import type { CardType } from "shared";

import camel from "./assets/cards/camel.png";
import leather from "./assets/cards/leather.png";
import spices from "./assets/cards/spice.png";
import cloth from "./assets/cards/cloth.png";
import silver from "./assets/cards/silver.png";
import gold from "./assets/cards/gold.png";
import diamonds from "./assets/cards/diamonds.png";
import cardBack from "./assets/cards/back.png";

export const assets = {
  cards: {
    camel: { label: "Camel", image: camel },
    leather: { label: "Leather", image: leather },
    spices: { label: "Spices", image: spices },
    cloth: { label: "Cloth", image: cloth },
    silver: { label: "Silver", image: silver },
    gold: { label: "Gold", image: gold },
    diamonds: { label: "Diamonds", image: diamonds },
  } satisfies Record<CardType, { label: string; image: string }>,
  cardBack,
};
