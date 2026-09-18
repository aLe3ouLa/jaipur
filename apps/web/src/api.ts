const SERVER_URL = "http://localhost:3001";

export type CreateGameResponse = { code: string; token: string };
export type JoinGameResponse = { code: string; token: string };
export type ApiError = { error: string };

export async function createGame(): Promise<CreateGameResponse> {
  const res = await fetch(`${SERVER_URL}/api/games`, { method: "POST" });
  if (!res.ok) {
    throw new Error("Failed to create game");
  }
  return res.json();
}

export async function joinGame(code: string): Promise<JoinGameResponse> {
  const res = await fetch(`${SERVER_URL}/api/games/${code}/join`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = (await res.json()) as ApiError;
    throw new Error(body.error ?? "Failed to join game");
  }
  return res.json();
}

export function websocketUrl(code: string, token: string): string {
  return `ws://localhost:3001/ws?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`;
}

function tokenStorageKey(code: string): string {
  return `jaipur:token:${code}`;
}

export function getStoredToken(code: string): string | null {
  return localStorage.getItem(tokenStorageKey(code));
}

export function storeToken(code: string, token: string): void {
  localStorage.setItem(tokenStorageKey(code), token);
}
