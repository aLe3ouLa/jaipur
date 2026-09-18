import { GoodsType, SaleSize } from "shared";

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

export const GOODS_TOKEN_VALUES: Record<GoodsType, number[]> = {
  diamonds: [7, 7, 5, 5, 5],
  gold: [6, 6, 5, 5, 5],
  silver: [5, 5, 5, 5, 5],
  spices: [5, 3, 3, 2, 2, 1, 1],
  cloth: [5, 3, 3, 2, 2, 1, 1],
  leather: [4, 3, 2, 1, 1, 1, 1, 1, 1],
};

export const BONUS_TOKEN_VALUES: Record<SaleSize, number[]> = {
  3: [3, 3, 2, 2, 2, 1, 1],
  4: [6, 6, 5, 5, 4, 4],
  5: [10, 10, 9, 8, 8],
};
