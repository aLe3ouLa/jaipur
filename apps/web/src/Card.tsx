import type { Card as CardModel } from "shared";
import { assets } from "./assets.js";

export function Card({
  card,
  selected,
  disabled,
  onClick,
}: {
  card: CardModel;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const asset = assets.cards[card.type];

  return (
    <button
      type="button"
      className={`card${selected ? " card--selected" : ""}`}
      disabled={disabled || !onClick}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={asset.label}
    >
      <img src={asset.image} alt={asset.label} draggable={false} />
    </button>
  );
}

export function CardBack({ count }: { count: number }) {
  return (
    <div className="card card--back" aria-label={`${count} hidden cards`}>
      <img src={assets.cardBack} alt="" draggable={false} />
      <span className="card--back__count">{count}</span>
    </div>
  );
}
