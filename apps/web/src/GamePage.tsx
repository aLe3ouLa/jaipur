import { useMemo, useState } from "react";
import type { Card as CardModel, GoodsType } from "shared";
import { useGameConnection } from "./useGameConnection.js";
import { Scene } from "./Scene.js";
import { RoundEndModal } from "./RoundEndModal.js";
import { GameEndModal } from "./GameEndModal.js";
import { GameHeader } from "./GameHeader.js";
import { ActionsPanel } from "./ActionsPanel.js";

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
        <RoundEndModal info={roundEndInfo} onContinue={dismissRoundEnd} />
      )}

      {gameEndInfo && <GameEndModal info={gameEndInfo} />}

      <GameHeader
        code={code}
        view={view}
        status={status}
        isMyTurn={isMyTurn}
        lastError={lastError}
        lastMessage={messages.length > 0 ? messages[messages.length - 1]! : null}
      />

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

      <ActionsPanel
        mode={mode}
        isMyTurn={isMyTurn}
        giveCount={giveSelection.length}
        takeCount={takeSelection.length}
        sellGoodsType={sellGoodsType}
        onStartExchange={() => setMode("exchange")}
        onStartSell={() => setMode("sell")}
        onConfirmExchange={() => {
          sendCommand({
            type: "EXCHANGE",
            handCardIds: giveSelection.map((c) => c.id),
            marketCardIds: takeSelection.map((c) => c.id),
          });
          resetSelection();
        }}
        onConfirmSell={() => {
          if (!sellGoodsType) return;
          sendCommand({
            type: "SELL_GOODS",
            goodsType: sellGoodsType,
            quantity: giveSelection.length,
          });
          resetSelection();
        }}
        onCancel={resetSelection}
      />

      <section className="discard-area">
        <h3>Discarded ({view.discardPile.length})</h3>
      </section>
    </div>
  );
}
