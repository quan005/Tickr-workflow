import { Chart } from "@src/interfaces/websocketEvent";
import { Vwap } from "@src/interfaces/indicators";

export function getVwap(content:Chart, cumulativeVolume:number, cumulativeVolumeWeightedPrice:number): Vwap {
    const high = content["2"];
    const low = content["3"];
    const close = content["4"];
    const volume = content["5"];

    const avgPrice = (high +  low + close) / 3;
    const updatedCumulativeVolume = cumulativeVolume += volume;
    const updatedCumulativeVolumeWeightedPrice = cumulativeVolumeWeightedPrice += avgPrice * volume;
    const vwap = cumulativeVolumeWeightedPrice / cumulativeVolume;
    console.log(`VWAP: ${vwap}`);

    return {
        vwap: vwap,
        cumulativeVolume: updatedCumulativeVolume,
        cumulativeVolumeWeightedPrice: updatedCumulativeVolumeWeightedPrice
    }
}