export interface OptionsSelection {
  CALL: {
    symbol: string,
    description: string,
    multiplier: number,
    bid: number,
    ask: number,
    mark: number,
    totalVolume: number,
    delta: number,
    gamma: number,
    theta: number,
    vega: number,
    rho: number
  } | null,
  PUT: {
    symbol: string,
    description: string,
    multiplier: number,
    bid: number,
    ask: number,
    mark: number,
    totalVolume: number,
    delta: number,
    gamma: number,
    theta: number,
    vega: number,
    rho: number
  } | null,
}