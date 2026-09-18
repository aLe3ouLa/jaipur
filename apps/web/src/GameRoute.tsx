import { useEffect, useState } from "react";
import { getStoredToken, storeToken, joinGame } from "./api.js";
import { GamePage } from "./GamePage.js";

/**
 * Resolves which token this browser should use for `code` before rendering
 * the actual game: reuse a stored token if we've been here before (covers
 * both the creator's own first visit and any later refresh/reconnect), or
 * call the join endpoint for the first time otherwise.
 */
export function GameRoute({ code }: { code: string }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken(code));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(token === null);

  useEffect(() => {
    if (token) {
      return;
    }
    let cancelled = false;

    joinGame(code)
      .then((res) => {
        if (cancelled) return;
        storeToken(code, res.token);
        setToken(res.token);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to join game");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code, token]);

  if (error) {
    return (
      <div className="centered">
        <p>Could not join game {code}: {error}</p>
      </div>
    );
  }

  if (loading || !token) {
    return (
      <div className="centered">
        <p>Joining game {code}...</p>
      </div>
    );
  }

  return <GamePage code={code} token={token} />;
}
