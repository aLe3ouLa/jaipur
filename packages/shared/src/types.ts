type Guid<DataType> = string & { __guid: DataType };

export type GoodsType =
  | "leather"
  | "spices"
  | "cloth"
  | "silver"
  | "gold"
  | "diamonds";
export type CardType = GoodsType | "camel";

export type PlayerId = Guid<"player">;
export type CardId = Guid<"card">;
