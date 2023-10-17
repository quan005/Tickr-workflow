import { SignalOpenPositionState } from "@src/interfaces/state";
import { TimeSales, SocketResponse } from "@src/interfaces/websocketEvent";
import { DeltaMetrics } from "@src/interfaces/delta";
import { getDeltaFootprint, getTrend, getVwap } from "../utilities";

export function processTimeSalesData(content: SocketResponse["content"], newState: SignalOpenPositionState, utcTime: string): SignalOpenPositionState {
    const lastPrice = content[content.length - 1]["2"];
    let state = newState;

    state.orderArray.push({
        quantity: content.length
    });

    if (!state.deltaFootprint[utcTime]) {
        state.deltaFootprint[utcTime] = {
            footprint: {},
            deltas: [],
            delta: 0,
            minDelta: Infinity,
            maxDelta: -Infinity,
            cumulativeDelta: 0,
            poc: 0
        };
    }

    for (let i = 0; i < content.length; i++) {
        const order: TimeSales = content[i];
        const price = order["2"];
        const volume = order["3"];
        const vwap = getVwap(state.cumulativeVolume, state.cumulativeVolumeWeightedPrice, null, order);
        const deltaFootprint = getDeltaFootprint(state, order, state.lastPrice, utcTime);

        // console.log(`order${i}`, order);
        // console.dir(state.deltaFootprint, { depth: null});
        state = deltaFootprint;
        state.vwap = vwap.vwap;
        state.lastPrice = price;
        state.totalOrderVolume += volume // use this to see if total volume surpasses average volume
        
        if(state.newPositionSetup.demand.primary && 
            price >= state.newPositionSetup.demand.primary.targetedEntry &&
            price > state.newPositionSetup.demand.primary.reversalEntry
        ){
            console.log('metDemandEntryPrice');
            state.metDemandEntryPrice += 1;
            state.demandSize += volume;
        }

        if(state.newPositionSetup.demand.primary && 
            price <= state.newPositionSetup.demand.primary.reversalEntry &&
            price < state.newPositionSetup.demand.primary.targetedEntry
        ){
            console.log('metDemandreversalEntryPrice');
            state.metDemandreversalEntryPrice += 1;
            state.demandReversalSize += volume;
        }

        if (state.newPositionSetup.supply.primary && 
            price <= state.newPositionSetup.supply.primary.targetedEntry &&
            price < state.newPositionSetup.supply.primary.reversalEntry
        ) {
            console.log('metSupplyEntryPrice');
            state.metSupplyEntryPrice += 1;
            state.supplySize += volume;
        }

        if (state.newPositionSetup.supply.primary && 
            price >= state.newPositionSetup.supply.primary.reversalEntry &&
            price > state.newPositionSetup.supply.primary.targetedEntry
        ) {
            console.log('metSupplyReversalEntryPrice');
            state.metSupplyReversalEntryPrice += 1;
            state.supplyReversalSize += volume;
        }
    }

    state.delta.push(state.deltaFootprint[utcTime].delta);
    const deltaArray = state.delta.getItems();
    const maxDelta = Math.max(...deltaArray);
    const minDelta = Math.min(...deltaArray);
    const cumulativeDelta = deltaArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const deltaMetric: DeltaMetrics = {
        deltas: deltaArray,
        minDelta: minDelta,
        maxDelta: maxDelta,
        cumulativeDelta: cumulativeDelta
    }

    state.tenPreviousDelta.push(deltaMetric);
    state.marketTrend = getTrend(state.tenPreviousDelta);
    console.log(`Trend for ${utcTime}: ${state.marketTrend}`);

    state.totalOrderAvgVolumeList.push(state.totalOrderVolume);
    const totalOrderAvgVolumeSum = state.totalOrderAvgVolumeList.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    state.totalOrderAvgVolume = totalOrderAvgVolumeSum / state.totalOrderAvgVolumeList.length;
    
    state.demandTimeSalesEntryPercentage = state.metDemandEntryPrice / content.length;
    state.demandTimeSalesReversalEntryPercentage = state.metDemandreversalEntryPrice / content.length;
    state.supplyTimeSalesEntryPercentage = state.metSupplyEntryPrice / content.length;
    state.supplyTimeSalesReversalEntryPercentage = state.metSupplyReversalEntryPrice / content.length;
    console.log('demandTimeSalesEntryPercentage', state.demandTimeSalesEntryPercentage);
    console.log('demandTimeSalesReversalEntryPercentage', state.demandTimeSalesReversalEntryPercentage);
    console.log('supplyTimeSalesEntryPercentage', state.supplyTimeSalesEntryPercentage);
    console.log('supplyTimeSalesReversalEntryPercentage', state.supplyTimeSalesReversalEntryPercentage);

    state.metDemandEntryPrice = 0;
    state.metDemandreversalEntryPrice = 0;
    state.metSupplyEntryPrice = 0;
    state.metSupplyReversalEntryPrice = 0;

    if (state.demandTimeSalesEntryPercentage >= 0.7) {
        state.demandForming += 1;
    }
    
    if (state.demandTimeSalesReversalEntryPercentage >= 0.7) {
        state.demandReversalForming += 1;
    } 
    
    if (state.supplyTimeSalesEntryPercentage >= 0.7) {
        state.supplyForming += 1;
    } 
    
    if (state.supplyTimeSalesReversalEntryPercentage >= 0.7) {
        state.supplyReversalForming += 1;
    }

    state.updatedPrice = lastPrice;

    return state;
}