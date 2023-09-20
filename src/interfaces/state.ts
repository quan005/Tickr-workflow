import { PrinciplesAndParams } from "./UserPrinciples";
import { OrderDetails } from "./orders";
import { CutPositionSignal, OpenPositionSignal } from "./positionSignals";
import { PositionSetup } from "./positionSetup";
import { DeltaFootprint } from "./indicators";
import { DeltaMetrics } from "./delta";
import { CurrentPriceData } from "./currentPriceData";
import { FixedSizeQueue } from "@src/activities/utilities/classes";
import type { Trend } from "@src/activities/utilities";

export interface SignalOpenPositionState {
    principles: PrinciplesAndParams | null,
    demandTimeSalesEntryPercentage: number,
    demandTimeSalesReversalEntryPercentage: number,
    metDemandEntryPrice: number,
    metDemandreversalEntryPrice: number,
    demandForming: number,
    demandReversalForming: number,
    demandSize: number,
    demandReversalSize: number,
    demandConfirmation: boolean,
    demandReversalConfirmation: boolean,
    supplyTimeSalesEntryPercentage: number,
    supplyTimeSalesReversalEntryPercentage: number,
    metSupplyEntryPrice: number,
    metSupplyReversalEntryPrice: number,
    supplyForming: number,
    supplyReversalForming: number,
    supplySize: number,
    supplyReversalSize: number,
    supplyConfirmation: boolean,
    supplyReversalConfirmation: boolean,
    reversal: boolean,
    position: OrderDetails | string,
    noGoodBuys: boolean,
    loggedIn: boolean,
    demandOrSupply: string,
    callOrPut: string,
    vwap: number,
    cumulativeVolume: number,
    cumulativeVolumeWeightedPrice: number,
    rsi: number,
    previousClose: number,
    gains: number[],
    losses: number[],
    rsiPeriod: number,
    highOfDay: number,
    lowOfDay: number,
    orderArray: { quantity: number }[],
    deltaFootprint: DeltaFootprint,
    delta: FixedSizeQueue<number>,
    totalOrderAvgVolumeList: number[],
    totalOrderVolume: number,
    totalOrderAvgVolume: number,
    lastTradeTime: Date | null,
    lastPrice: number,
    newPositionSetup: PositionSetup,
    currentPrice: CurrentPriceData,
    updatedPrice: number,
    tenPreviousDelta: FixedSizeQueue<DeltaMetrics>,
    nextTime: string,
    marketTrend: Trend,
    orderVelocity: number,
    orderVelocityArray: FixedSizeQueue<number>,
    orderVelocityAvg: number,
    lastOrderVelocity: number,
    nextOrderVelocityTime: string,
    ordervelocityIncreasing: boolean,
}

export interface SignalCutPositionState {
    openPositonSignal: OpenPositionSignal,
    principles: PrinciplesAndParams | null,
    callOrPut: string,
    position: string,
    newPosition: OrderDetails | string,
    skipCut: boolean,
    stoppedOut: boolean,
    loggedIn: boolean,
    cutFilled: number,
}

export interface SignalClosePositionState {
    cutPositionResult: CutPositionSignal,
    openPositonSignal: OpenPositionSignal,
    principles: PrinciplesAndParams | null,
    callOrPut: string,
    position: string,
    newPosition: OrderDetails | string,
    closeFilled: number,
    remainingQuantity: number,
    loggedIn: boolean,
    passedOriginalTakeProfit: boolean,
    passedSecondTakeProfit: boolean
}