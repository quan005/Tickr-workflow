export interface PositionSetup {
  demand: {
    entry: number,
    stopLoss: number,
    takeProfit: number,
    cutPosition: number
  } | null,
  supply: {
    entry: number,
    stopLoss: number,
    takeProfit: number,
    cutPosition: number
  } | null
}