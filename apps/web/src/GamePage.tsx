import { useMemo, useState } from "react";
import type { Card as CardModel, GoodsType } from "shared";
import { useGameConnection } from "./useGameConnection.js";
import { Scene } from "./Scene.js";

type Mode = "none" | "exchange" | "sell";

export function GamePage({ code, token }: { code: string; token: string }) {
  const {
    view,
    status,
    messages,
    lastError,
    roundEndInfo,
    gameEndInfo,
    dismissRoundEnd,
    sendCommand,
  } = useGameConnection(code, token);
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
      {roundEndInfo && !gameEndInfo && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>
              Round {roundEndInfo.roundNumber} ended
              {roundEndInfo.youWon === undefined
                ? " in a tie"
                : roundEndInfo.youWon
                  ? " — you won!"
                  : " — opponent won"}
            </h2>
            <p>
              You: {roundEndInfo.yourRoundScore} rupees &middot; Opponent:{" "}
              {roundEndInfo.opponentRoundScore} rupees
            </p>
            <button type="button" onClick={dismissRoundEnd}>
              Continue to next round
            </button>
          </div>
        </div>
      )}

      {gameEndInfo && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{gameEndInfo.youWon ? "You won the game!" : "Game over"}</h2>
            <p>
              Final seals — You: {gameEndInfo.yourSeals} &middot; Opponent:{" "}
              {gameEndInfo.opponentSeals}
            </p>
            <a href="/">Back to home</a>
          </div>
        </div>
      )}

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

      <div className="scene-container">
        <Scene
          view={view}
          mode={mode}
          giveSelection={giveSelection}
          takeSelection={takeSelection}
          onMarketClick={(card) => {
            if (mode === "exchange") {
              toggleTake(card);
            } else if (mode === "none" && isMyTurn) {
              if (card.type === "camel") {
                sendCommand({ type: "TAKE_CAMELS" });
              } else {
                sendCommand({ type: "TAKE_GOODS", cardId: card.id });
              }
            }
          }}
          onHandClick={(card) => {
            if (mode !== "none") {
              toggleGive(card);
            }
          }}
          onCamelClick={(card) => {
            if (mode === "exchange") {
              toggleGive(card);
            }
          }}
        />
      </div>

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
        <h3>Discarded ({view.discardPile.length})</h3>
      </section>
    </div>
  );
}
