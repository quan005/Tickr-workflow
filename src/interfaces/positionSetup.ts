export interface PositionSetup {
  demand: {
    entry: number;
    stopLoss: number;
    breakEven: number;
    takeProfit: number;
    cutPosition: number;
    higherProfit: number;
  } | null;
  supply: {
    entry: number;
    stopLoss: number;
    breakEven: number;
    takeProfit: number;
    cutPosition: number;
    higherProfit: number;
  } | null;
}