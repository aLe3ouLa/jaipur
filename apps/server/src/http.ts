import express, { Express } from "express";
import { createGame, joinGame } from "./gameStore.js";

export function createHttpApp(): Express {
  const app = express();
  app.use(express.json());

  // Dev-friendly CORS: the web client runs on a different origin/port
  // (Vite's dev server) than this API. Fine for local development; revisit
  // with an allowlist before any real deployment.
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (_req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.post("/api/games", (_req, res) => {
    const { serverGame, token } = createGame();
    res.status(201).json({ code: serverGame.code, token });
  });

  app.post("/api/games/:code/join", (req, res) => {
    const code = req.params.code.toUpperCase();
    const result = joinGame(code);

    if (!result.success) {
      const status = result.reason === "Game not found" ? 404 : 409;
      res.status(status).json({ error: result.reason });
      return;
    }

    res.status(200).json({ code: result.serverGame.code, token: result.token });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return app;
}
