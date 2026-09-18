import { useMemo, useState } from "react";
import type { Card as CardModel, GoodsType } from "shared";
import { useGameConnection } from "./useGameConnection.js";
import { Card, CardBack } from "./Card.js";

type Mode = "none" | "exchange" | "sell";

export function GamePage({ code, token }: { code: string; token: string }) {
  const { view, status, messages, lastError, sendCommand } = useGameConnection(
    code,
    token,
  );
  const [mode, setMode] = useState<Mode>("none");
  const [giveSelection, setGiveSelection] = useState<CardModel[]>([]);
  const [takeSelection, setTakeSelection] = useState<CardModel[]>([]);

  const resetSelection = () => {
    setMode("none");
    setGiveSelection([]);
    setTakeSelection([]);
  };

  const toggleGive = (card: CardModel) => {
    setGiveSelection((prev) =>
      prev.some((c) => c.id === card.id)
        ? prev.filter((c) => c.id !== card.id)
        : [...prev, card],
    );
  };

  const toggleTake = (card: CardModel) => {
    setTakeSelection((prev) =>
      prev.some((c) => c.id === card.id)
        ? prev.filter((c) => c.id !== card.id)
        : [...prev, card],
    );
  };

  const sellGoodsType = useMemo<GoodsType | null>(() => {
    if (mode !== "sell" || giveSelection.length === 0) return null;
    const type = giveSelection[0]!.type;
    if (type === "camel") return null; // camels can't be sold
    return giveSelection.every((c) => c.type === type)
      ? (type as GoodsType)
      : null;
  }, [mode, giveSelection]);

  if (status === "connecting" && !view) {
    return (
      <div className="centered">
        <p>Connecting...</p>
      </div>
    );
  }

  if (!view) {
    return (
      <div className="centered">
        <p>Waiting for opponent to join game {code}...</p>
        <p className="hint">
          Share this link: <code>{window.location.href}</code>
        </p>
      </div>
    );
  }

  const isMyTurn = view.isYourTurn && view.gameStatus === "in_progress";

  return (
    <div className="game">
      <header className="game__header">
        <div>
          Game <strong>{code}</strong> &middot; Round {view.roundNumber}
        </div>
        <div className={`status status--${status}`}>{status}</div>
      </header>

      <div className="scoreboard">
        <div>
          You: {view.myScore} rupees &middot; {view.mySeals} seals
        </div>
        <div className="turn-indicator">
          {view.gameStatus !== "in_progress"
            ? view.gameStatus.replace(/_/g, " ")
            : isMyTurn
              ? "Your turn"
              : "Opponent's turn"}
        </div>
        <div>
          Opponent: {view.opponentScore} rupees &middot; {view.opponentSeals}{" "}
          seals
        </div>
      </div>

      {lastError && <div className="banner banner--error">{lastError}</div>}
      {messages.length > 0 && (
        <div className="banner banner--info">{messages[messages.length - 1]}</div>
      )}

      <section className="opponent-area">
        <h3>Opponent</h3>
        <div className="row">
          <CardBack count={view.opponentHandCount} />
          <span className="label">hand</span>
          <CardBack count={view.opponentCamelHerdCount} />
          <span className="label">camels</span>
        </div>
      </section>

      <section className="market-area">
        <h3>Market</h3>
        <div className="row">
          {view.market.map((card) => (
            <Card
              key={card.id}
              card={card}
              selected={
                mode === "exchange" &&
                takeSelection.some((c) => c.id === card.id)
              }
              disabled={
                mode === "none"
                  ? !isMyTurn || card.type === "camel"
                  : mode === "sell"
              }
              onClick={
                mode === "exchange"
                  ? () => toggleTake(card)
                  : mode === "none" && isMyTurn && card.type !== "camel"
                    ? () => sendCommand({ type: "TAKE_GOODS", cardId: card.id })
                    : undefined
              }
            />
          ))}
        </div>
        {mode === "none" && (
          <button
            type="button"
            disabled={
              !isMyTurn || !view.market.some((c) => c.type === "camel")
            }
            onClick={() => sendCommand({ type: "TAKE_CAMELS" })}
          >
            Take Camels
          </button>
        )}
      </section>

      <section className="hand-area">
        <h3>Your Hand</h3>
        <div className="row">
          {view.myHand.map((card) => (
            <Card
              key={card.id}
              card={card}
              selected={giveSelection.some((c) => c.id === card.id)}
              disabled={mode === "none"}
              onClick={
                mode !== "none" ? () => toggleGive(card) : undefined
              }
            />
          ))}
        </div>

        <h4>Your Camels ({view.myCamelHerd.length})</h4>
        <div className="row">
          {view.myCamelHerd.map((card) => (
            <Card
              key={card.id}
              card={card}
              selected={giveSelection.some((c) => c.id === card.id)}
              disabled={mode !== "exchange"}
              onClick={
                mode === "exchange" ? () => toggleGive(card) : undefined
              }
            />
          ))}
        </div>
      </section>

      <section className="actions">
        {mode === "none" && isMyTurn && (
          <>
            <button type="button" onClick={() => setMode("exchange")}>
              Exchange
            </button>
            <button type="button" onClick={() => setMode("sell")}>
              Sell
            </button>
          </>
        )}

        {mode === "exchange" && (
          <>
            <button
              type="button"
              disabled={
                giveSelection.length < 2 ||
                giveSelection.length !== takeSelection.length
              }
              onClick={() => {
                sendCommand({
                  type: "EXCHANGE",
                  handCardIds: giveSelection.map((c) => c.id),
                  marketCardIds: takeSelection.map((c) => c.id),
                });
                resetSelection();
              }}
            >
              Confirm Exchange ({giveSelection.length} for{" "}
              {takeSelection.length})
            </button>
            <button type="button" onClick={resetSelection}>
              Cancel
            </button>
          </>
        )}

        {mode === "sell" && (
          <>
            <button
              type="button"
              disabled={!sellGoodsType || giveSelection.length === 0}
              onClick={() => {
                if (!sellGoodsType) return;
                sendCommand({
                  type: "SELL_GOODS",
                  goodsType: sellGoodsType,
                  quantity: giveSelection.length,
                });
                resetSelection();
              }}
            >
              {sellGoodsType
                ? `Sell ${giveSelection.length} ${sellGoodsType}`
                : "Select cards of one goods type"}
            </button>
            <button type="button" onClick={resetSelection}>
              Cancel
            </button>
          </>
        )}
      </section>

      <section className="discard-area">
        <h3>Discard ({view.discardPile.length})</h3>
        <div className="row">
          {view.discardPile.map((card) => (
            <Card key={card.id} card={card} disabled />
          ))}
        </div>
      </section>
    </div>
  );
}
