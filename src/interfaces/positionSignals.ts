import { OrderDetails } from "./orders";

export interface OpenPositionSignal {
  position: OrderDetails | null,
  callOrPut: string,
  entry: number;
  breakEven: number;
  stoploss: number;
  cutPosition: number;
  takeProfit: number;
  higherProfit: number;
  MaxProfit: number;
}

export interface CutPositionSignal {
  position?: OrderDetails | null,
  entry: number;
  breakEven: number;
  stoploss: number;
  cutPosition: number;
  takeProfit: number;
  higherProfit: number;
  MaxProfit: number;
  callOrPut: string;
  purchasedQuantity: number,
  cutQuantity?: number,
  isCut: boolean
}