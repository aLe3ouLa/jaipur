import type { GoodsType } from "shared";

type Mode = "none" | "exchange" | "sell";

export function ActionsPanel({
  mode,
  isMyTurn,
  giveCount,
  takeCount,
  sellGoodsType,
  onStartExchange,
  onStartSell,
  onConfirmExchange,
  onConfirmSell,
  onCancel,
}: {
  mode: Mode;
  isMyTurn: boolean;
  giveCount: number;
  takeCount: number;
  sellGoodsType: GoodsType | null;
  onStartExchange: () => void;
  onStartSell: () => void;
  onConfirmExchange: () => void;
  onConfirmSell: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="actions">
      {mode === "none" && isMyTurn && (
        <>
          <button type="button" onClick={onStartExchange}>
            Exchange
          </button>
          <button type="button" onClick={onStartSell}>
            Sell
          </button>
        </>
      )}

      {mode === "exchange" && (
        <>
          <button
            type="button"
            disabled={giveCount < 2 || giveCount !== takeCount}
            onClick={onConfirmExchange}
          >
            Confirm Exchange ({giveCount} for {takeCount})
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </>
      )}

      {mode === "sell" && (
        <>
          <button
            type="button"
            disabled={!sellGoodsType || giveCount === 0}
            onClick={onConfirmSell}
          >
            {sellGoodsType
              ? `Sell ${giveCount} ${sellGoodsType}`
              : "Select cards of one goods type"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </>
      )}
    </section>
  );
}
