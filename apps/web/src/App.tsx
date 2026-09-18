import { Landing } from "./Landing.js";
import { GameRoute } from "./GameRoute.js";

export function App() {
  const path = window.location.pathname;
  const match = path.match(/^\/game\/([A-Za-z0-9]+)$/);

  if (match) {
    return <GameRoute code={match[1]!.toUpperCase()} />;
  }

  return <Landing />;
}
