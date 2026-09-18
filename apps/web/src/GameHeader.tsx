import type { PlayerView } from "game-engine";
import type { ConnectionStatus } from "./useGameConnection.js";

export function GameHeader({
  code,
  view,
  status,
  isMyTurn,
  lastError,
  lastMessage,
}: {
  code: string;
  view: PlayerView;
  status: ConnectionStatus;
  isMyTurn: boolean;
  lastError: string | null;
  lastMessage: string | null;
}) {
  return (
    <>
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
      {lastMessage && <div className="banner banner--info">{lastMessage}</div>}
    </>
  );
}
