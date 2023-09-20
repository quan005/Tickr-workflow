export interface Vwap {
    vwap: number,
    cumulativeVolume: number,
    cumulativeVolumeWeightedPrice: number
}

export interface Rsi {
    rsi: number,
    rsiPeriod: number,
    gains: number [],
    losses: number [],
    previousClose: number
}

export interface FootprintDetails {
    price: number, 
    buyVolume: number, 
    sellVolume: number, 
    delta: number, 
}

export interface Footprint {
    footprint: {
        [key: string]: FootprintDetails
    },
    deltas: number[],
    delta: number,
    minDelta: number,
    maxDelta: number,
    cumulativeDelta: number,
    poc: number,
}

export interface DeltaFootprint {
    [key: string]: Footprint 
}
