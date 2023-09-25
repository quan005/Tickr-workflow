import { Chart, TimeSales } from "@src/interfaces/websocketEvent";
import { Vwap } from "@src/interfaces/indicators";

export function getVwap(cumulativeVolume:number, cumulativeVolumeWeightedPrice:number, chartContent:Chart = null, timeSalesContent:TimeSales = null ): Vwap {
    let avgPrice: number;
    let updatedCumulativeVolume: number;
    let updatedCumulativeVolumeWeightedPrice: number;
    let vwap: number;

    if (chartContent) {
        const high = chartContent["2"];
        const low = chartContent["3"];
        const close = chartContent["4"];
        const volume = chartContent["5"];

        avgPrice = (high +  low + close) / 3;
        updatedCumulativeVolume = cumulativeVolume += volume;
        updatedCumulativeVolumeWeightedPrice = cumulativeVolumeWeightedPrice += (avgPrice * volume);
        vwap = updatedCumulativeVolumeWeightedPrice / updatedCumulativeVolume;
        console.log(`VWAP: ${vwap}`);
    }

    if (timeSalesContent) {
        const price = timeSalesContent["2"];
        const volume = timeSalesContent["3"];

        updatedCumulativeVolume = cumulativeVolume += volume;
        updatedCumulativeVolumeWeightedPrice = cumulativeVolumeWeightedPrice += (price * volume)
        vwap = updatedCumulativeVolumeWeightedPrice / updatedCumulativeVolume;
        console.log(`VWAP: ${vwap}`);
    }

    return {
        vwap: vwap,
        cumulativeVolume: updatedCumulativeVolume,
        cumulativeVolumeWeightedPrice: updatedCumulativeVolumeWeightedPrice
    }
}