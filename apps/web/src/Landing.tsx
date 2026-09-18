import { useState } from "react";
import { createGame, storeToken } from "./api.js";

export function Landing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { code, token } = await createGame();
      storeToken(code, token);
      window.location.href = `/game/${code}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
      setLoading(false);
    }
  };

  return (
    <div className="centered">
      <h1>Jaipur</h1>
      <p>A two-player trading game.</p>
      <button type="button" onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Game"}
      </button>
      {error && <p className="banner banner--error">{error}</p>}
    </div>
  );
}
