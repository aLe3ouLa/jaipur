import { useEffect, useRef, useState, useCallback } from "react";
import type { GameCommand, ServerMessage } from "shared";
import type { PlayerView } from "game-engine";
import { websocketUrl } from "./api.js";

export type ConnectionStatus = "connecting" | "open" | "closed";

export type RoundEndInfo = {
  roundNumber: number;
  youWon: boolean | undefined;
  yourRoundScore: number;
  opponentRoundScore: number;
};

export type GameEndInfo = {
  youWon: boolean;
  yourSeals: number;
  opponentSeals: number;
};

const RECONNECT_DELAY_MS = 1500;

export function useGameConnection(code: string, token: string) {
  const [view, setView] = useState<PlayerView | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [messages, setMessages] = useState<string[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [roundEndInfo, setRoundEndInfo] = useState<RoundEndInfo | null>(null);
  const [gameEndInfo, setGameEndInfo] = useState<GameEndInfo | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const unmountedRef = useRef(false);

  const logMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev.slice(-9), text]);
  }, []);

  useEffect(() => {
    unmountedRef.current = false;

    function connect() {
      setStatus("connecting");
      const socket = new WebSocket(websocketUrl(code, token));
      socketRef.current = socket;

      socket.onopen = () => setStatus("open");

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data) as ServerMessage;
        switch (message.type) {
          case "STATE_UPDATE":
            setView(message.view as PlayerView);
            break;
          case "ERROR":
            setLastError(message.reason);
            break;
          case "PLAYER_JOINED":
            logMessage("Opponent joined.");
            break;
          case "GAME_STARTED":
            logMessage("Game started!");
            break;
          case "PLAYER_DISCONNECTED":
            logMessage("Opponent disconnected. Waiting for them to reconnect...");
            break;
          case "PLAYER_RECONNECTED":
            logMessage("Opponent reconnected.");
            break;
          case "ROUND_ENDED":
            setRoundEndInfo({
              roundNumber: message.roundNumber,
              youWon: message.youWon,
              yourRoundScore: message.yourRoundScore,
              opponentRoundScore: message.opponentRoundScore,
            });
            break;
          case "GAME_ENDED":
            setGameEndInfo({
              youWon: message.youWon,
              yourSeals: message.yourSeals,
              opponentSeals: message.opponentSeals,
            });
            break;
        }
      };

      socket.onclose = () => {
        setStatus("closed");
        if (!unmountedRef.current) {
          setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      socketRef.current?.close();
    };
  }, [code, token, logMessage]);

  const sendCommand = useCallback((command: GameCommand) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    setLastError(null);
    socket.send(JSON.stringify({ type: "COMMAND", command }));
  }, []);

  const dismissRoundEnd = useCallback(() => setRoundEndInfo(null), []);

  return {
    view,
    status,
    messages,
    lastError,
    roundEndInfo,
    gameEndInfo,
    dismissRoundEnd,
    sendCommand,
  };
}
