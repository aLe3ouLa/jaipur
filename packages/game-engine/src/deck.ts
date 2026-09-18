import { GoodsType } from "shared";

export interface RandomSource {
  next(): number;
}

export const GOODS_CARD_COUNTS: Record<GoodsType, number> = {
  diamonds: 6,
  gold: 6,
  silver: 6,
  cloth: 8,
  spices: 8,
  leather: 10,
};

export const CAMEL_COUNT: number = 11;
