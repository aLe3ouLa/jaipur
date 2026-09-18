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
      <span className="card--pile__count">{count}</span>
    </div>
  );
}

/** A face-up pile of identical cards (e.g. a camel herd), shown as a single
 * clickable unit with a count badge rather than one element per card. */
export function CardPile({
  count,
  selected,
  disabled,
  onClick,
}: {
  count: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const asset = assets.cards.camel;

  return (
    <button
      type="button"
      className={`card${selected ? " card--selected" : ""}`}
      disabled={disabled || !onClick || count === 0}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${asset.label} pile, ${count}`}
    >
      <img src={asset.image} alt={asset.label} draggable={false} />
      <span className="card--pile__count">{count}</span>
    </button>
  );
}
