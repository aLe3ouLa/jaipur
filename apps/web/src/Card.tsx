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
      style={{ backgroundColor: asset.color }}
      disabled={disabled || !onClick}
      onClick={onClick}
      aria-pressed={selected}
    >
      {asset.label}
    </button>
  );
}

export function CardBack({ count }: { count: number }) {
  return (
    <div className="card card--back" aria-label={`${count} hidden cards`}>
      {count}
    </div>
  );
}
