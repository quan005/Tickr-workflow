import { SignalOpenPositionState } from "@src/interfaces/state";
import { Chart } from "@src/interfaces/websocketEvent";
import { getRsi, getVwap } from "@src/activities/utilities";

export function processChartData(content:Chart, state:SignalOpenPositionState): SignalOpenPositionState {
    const vwap = getVwap(state.cumulativeVolume, state.cumulativeVolumeWeightedPrice, content, null);
    const rsi = getRsi(state.rsi, state.rsiPeriod, state.gains, state.losses, content["4"], state.previousClose);
    return {
        ...state,
        vwap: vwap.vwap,
        cumulativeVolume: vwap.cumulativeVolume,
        cumulativeVolumeWeightedPrice: vwap.cumulativeVolumeWeightedPrice,
        rsi: rsi.rsi,
        rsiPeriod: rsi.rsiPeriod,
        gains: rsi.gains,
        losses: rsi.losses,
        previousClose: rsi.previousClose,
    };
}