// Placeholder visual registry. Nothing in the components below references a
// color/label literal directly - swap the values here once real artwork
// exists, without touching any component.
import type { CardType } from "shared";

export const assets = {
  cards: {
    camel: { label: "Camel", color: "#d8c39a" },
    leather: { label: "Leather", color: "#8b5e3c" },
    spices: { label: "Spices", color: "#c1440e" },
    cloth: { label: "Cloth", color: "#7b68ee" },
    silver: { label: "Silver", color: "#b7bcc0" },
    gold: { label: "Gold", color: "#d4af37" },
    diamonds: { label: "Diamonds", color: "#6fd9e8" },
  } satisfies Record<CardType, { label: string; color: string }>,
};
