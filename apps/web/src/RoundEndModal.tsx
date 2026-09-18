import type { RoundEndInfo } from "./useGameConnection.js";

export function RoundEndModal({
  info,
  onContinue,
}: {
  info: RoundEndInfo;
  onContinue: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>
          Round {info.roundNumber} ended
          {info.youWon === undefined
            ? " in a tie"
            : info.youWon
              ? " — you won!"
              : " — opponent won"}
        </h2>
        <p>
          You: {info.yourRoundScore} rupees &middot; Opponent:{" "}
          {info.opponentRoundScore} rupees
        </p>
        <button type="button" onClick={onContinue}>
          Continue to next round
        </button>
      </div>
    </div>
  );
}
