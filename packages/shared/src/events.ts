// TODO (later step, part of the engine's reducers task): define the GameEvent union here.
//
// Events are what the server broadcasts to clients after applying a command -
// they describe what happened, and the 3D client's animations react to them.
// Do not design this in detail yet - we'll come back to it once command
// reducers exist and we know exactly what data each event needs to carry.
//
// Reference shape from the project spec:
//
//   type GameEvent =
//     | { type: "PLAYER_JOINED"; playerId: PlayerId }
//     | { type: "CARD_TAKEN"; ... }
//     | { type: "CAMELS_TAKEN"; ... }
//     | { type: "EXCHANGE_COMPLETED"; ... }
//     | { type: "GOODS_SOLD"; ... }
//     | { type: "ROUND_ENDED"; ... }
//     | { type: "GAME_ENDED"; ... };

export {};
