// TODO (Step 1, task 5): define the GameCommand union here.
//
// This is the ONLY vocabulary a client is allowed to send to the server.
// Reference shape from the project spec:
//
//   type GameCommand =
//     | { type: "TAKE_GOODS"; cardId: string }
//     | { type: "TAKE_CAMELS" }
//     | { type: "EXCHANGE"; handCardIds: string[]; marketCardIds: string[] }
//     | { type: "SELL_GOODS"; goodsType: GoodsType; quantity: number };
//
// Use the CardId/GoodsType types from ./types.ts instead of raw strings.

export {};
