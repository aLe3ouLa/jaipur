// Server entry point.
//
// This stays empty until Step 1 (game engine) is finished. When we reach
// Phase 2 of the plan (WebSocket server), this is where we'll:
//   - start an HTTP server (express) with a "create game" endpoint
//   - attach a WebSocket server (ws) for real-time play
//   - wire in the JaipurGame engine from packages/game-engine
//   - use createPlayerView() before ever sending state to a client
//
// Do not add game logic here directly - this file should stay thin and
// delegate to the engine package.

console.log("server placeholder - not started yet, see plan Step 1");
