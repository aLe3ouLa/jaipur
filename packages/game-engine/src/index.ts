// Public entry point for the game-engine package.
// As you build each module (deck, state, setup, validate, reducers, tokens,
// rounds, JaipurGame, playerView), re-export the pieces the server needs here.
//
// This file must never import from React, Three.js, or any browser API -
// this package has to run standalone under Node/Vitest.

export {};
