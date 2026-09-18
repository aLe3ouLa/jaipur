<div align="center">

# 🐫 Jaipur

---

**A polished, real-time two-player web version of the Jaipur trading card game.**

[![Status](https://img.shields.io/badge/STATUS-scaffolding-6b7280?style=flat-square&labelColor=333)]()
[![Engine](https://img.shields.io/badge/ENGINE-server--authoritative-2ea44f?style=flat-square&labelColor=333)]()
[![Players](https://img.shields.io/badge/PLAYERS-2_remote_humans-4c8bf5?style=flat-square&labelColor=333)]()

[![React](https://img.shields.io/badge/React_Three_Fiber-000000?style=flat-square&logo=react&logoColor=61DAFB&labelColor=1a1a1a)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-000000?style=flat-square&logo=typescript&logoColor=3178C6&labelColor=1a1a1a)]()

</div>

Two remote players join the same game from separate browsers and play a complete round of Jaipur in real time. No local multiplayer, no single-player mode, no AI opponent — the server is the sole source of truth, and the client never decides whether a move is legal.

---

## How it works

```text
Player 1 browser                                    Player 2 browser
       │                                                    │
       │ WebSocket (commands)                               │ WebSocket (commands)
       ▼                                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Authoritative Game Server                   │
│                                                                  │
│   receive command → identify player → validate → apply →        │
│   produce event → broadcast player-specific views                │
│                                                                  │
│                        packages/game-engine                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                          Persistence
                               │
                        PostgreSQL
```

1. **Create** — a player opens the app, creates a game, and gets a shareable link (`/game/ABCD12`).
2. **Join** — the second player opens the link and joins; both browsers connect over WebSockets.
3. **Command** — every action (take goods, take camels, exchange, sell) is sent as a typed `GameCommand`, never a direct state mutation.
4. **Validate** — the `game-engine` package checks turn order, hand limits, exchange legality, and sell rules before anything changes.
5. **Broadcast** — the server emits a `GameEvent` and sends each player a redacted `createPlayerView()` of the resulting state — hidden cards never leave the server.
6. **Render** — the React Three Fiber tabletop animates in response to events; it never determines game legality itself.

## What it does

- Implements the complete Jaipur rules as a deterministic, framework-free TypeScript engine (`packages/game-engine`), with randomness injected via a `RandomSource` so games are reproducible in tests
- Runs an authoritative WebSocket server that validates every command server-side and rejects anything a malicious client could fake — arbitrary cards, hidden information, out-of-turn moves, forged scores
- Generates a player-specific view of game state per connection, so a browser only ever receives its own hand plus public information about the opponent
- Persists active games to PostgreSQL so a server restart or a browser refresh never loses a game in progress
- Handles reconnection: a dropped or refreshed player rejoins their existing seat and resumes exactly where the game left off
- Renders a restrained, physical-feeling 3D tabletop (cards with thickness, shadows, hover/select/flip animations) layered with an accessible HTML overlay for scores, turn state, and all game actions

## Boundaries

- The client never determines legality — every command round-trips through server-side validation in `packages/game-engine`
- Hidden information (the opponent's hand, deck contents) is never sent to a browser, redacted or otherwise — it is simply never included in that player's view
- Animations react to server-emitted `GameEvent`s; they never mutate authoritative state themselves
- Critical text and actions (scores, turn indicator, sell/exchange controls) are always real HTML, never WebGL-only, so the game stays screen-reader and keyboard accessible

## Status

Currently scaffolding the monorepo and building out **Phase 1 — the game engine** (`packages/game-engine`), test-first, module by module. See later sections of this README as each phase (WebSocket server, 2D client, 3D tabletop, interaction polish, accessibility) lands.

## Tech stack

| Layer | Tech |
|---|---|
| 3D client | React, TypeScript, React Three Fiber, Three.js, Drei, Zustand |
| Game engine | Pure TypeScript, no framework/browser dependencies |
| Server | Node.js, TypeScript, `ws`, Express |
| Realtime transport | WebSockets |
| Persistence | PostgreSQL |
| Testing | Vitest (engine/server), Playwright (end-to-end) |

## Layout

```
jaipur/
├── README.md
├── apps/
│   ├── web/                 # React + R3F client (Vite)
│   └── server/               # Authoritative WebSocket + HTTP server
└── packages/
    ├── game-engine/          # Pure TS Jaipur rules engine (Vitest)
    │   └── src/
    └── shared/                # GameCommand / GameEvent / view types shared by server + client
        └── src/
```

## Development

```sh
pnpm install                    # install all workspace packages
pnpm --filter game-engine test  # run the engine test suite
pnpm dev:server                 # start the WebSocket/HTTP server
pnpm dev:web                    # start the Vite dev client
```

## License

Created by [Alexandra Barka](mailto:barka.alexandra2@gmail.com).
