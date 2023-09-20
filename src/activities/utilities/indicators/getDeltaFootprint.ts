import { SignalOpenPositionState } from "@src/interfaces/state";
import { TimeSales } from "@src/interfaces/websocketEvent";

export function getDeltaFootprint(state: SignalOpenPositionState, order: TimeSales, lastPrice: number, utcTime: string ): SignalOpenPositionState {
    const newState = state;
    const orderPrice = order["2"];
    const orderVolume = order["3"];
    const orderPriceString = `${orderPrice}`;
    const priceVolumeMap: { [price: string]: number } = {};

    if(!newState.deltaFootprint[utcTime].footprint[orderPriceString]) {
        newState.deltaFootprint[utcTime].footprint[orderPriceString] = {
          price: orderPrice,
          buyVolume: 0,
          sellVolume: 0,
          delta: 0 
        }
    }

    if (priceVolumeMap[orderPrice]) {
        priceVolumeMap[orderPrice] += orderVolume;
    } else {
        priceVolumeMap[orderPrice] = orderVolume;
    }

    if (orderPrice >= lastPrice) {
        newState.deltaFootprint[utcTime].footprint[orderPriceString].buyVolume += orderVolume;
        newState.deltaFootprint[utcTime].cumulativeDelta += orderVolume;
    } else {
        newState.deltaFootprint[utcTime].footprint[orderPriceString].sellVolume += orderVolume;
        newState.deltaFootprint[utcTime].cumulativeDelta -= orderVolume;
    }

    newState.deltaFootprint[utcTime].footprint[orderPriceString].delta = newState.deltaFootprint[utcTime].footprint[orderPriceString].buyVolume - newState.deltaFootprint[utcTime].footprint[orderPriceString].sellVolume;
    newState.deltaFootprint[utcTime].delta = newState.deltaFootprint[utcTime].delta += newState.deltaFootprint[utcTime].footprint[orderPriceString].delta;
    newState.deltaFootprint[utcTime].deltas.push(newState.deltaFootprint[utcTime].delta);
    newState.deltaFootprint[utcTime].maxDelta = Math.max(...newState.deltaFootprint[utcTime].deltas);
    newState.deltaFootprint[utcTime].minDelta = Math.min(...newState.deltaFootprint[utcTime].deltas);

    const entries = Object.entries(newState.deltaFootprint[utcTime].footprint);
    const sortedEntries = entries.sort((a,b) => a[0].localeCompare(b[0]));
    const sortedDeltaFootprint = Object.fromEntries(sortedEntries);

    console.log(`footprint: ${utcTime}:`, newState.deltaFootprint[utcTime].footprint[orderPriceString]);

    newState.deltaFootprint[utcTime].footprint = sortedDeltaFootprint;

    return newState
}

// Todo: determine how to calculate POC (Point of Control)

// Todo: figure out a way to see if the delta's for each price 
// above a specific price (a price that is a POC) is going up or down