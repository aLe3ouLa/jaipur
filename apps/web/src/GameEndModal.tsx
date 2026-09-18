import type { GameEndInfo } from "./useGameConnection.js";

export function GameEndModal({ info }: { info: GameEndInfo }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{info.youWon ? "You won the game!" : "Game over"}</h2>
        <p>
          Final seals — You: {info.yourSeals} &middot; Opponent:{" "}
          {info.opponentSeals}
        </p>
        <a href="/">Back to home</a>
      </div>
    </div>
  );
}
