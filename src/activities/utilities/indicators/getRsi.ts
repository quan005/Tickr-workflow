import { Rsi } from "@src/interfaces/indicators";

export function getRsi(rsi:number, rsiPeriod: number, gains:number[], losses:number[], close:number, previousClose: number): Rsi {

    const change = close - previousClose;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
    const avgGain = gains.slice(-rsiPeriod).reduce((a, b) => a + b) / rsiPeriod;
    const avgLoss = losses.slice(-rsiPeriod).reduce((a, b) => a + b) / rsiPeriod;
    const rs = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));

    return {
        rsi: rsiPeriod < 9 ? rsi : 100 - (100 / (1 + rs)),
        rsiPeriod: rsiPeriod < 9 ? rsiPeriod += 1 : 0,
        gains: gains,
        losses: losses,
        previousClose: close
    }
}