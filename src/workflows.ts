import {
  ApplicationFailure,
  condition,
  defineQuery,
  setHandler,
  sleep,
  proxyActivities,
} from '@temporalio/workflow';
import * as activities from "./activities/priceActionPosition";
import { PremarketData } from "./interfaces/premarketData";

type PositionState = 'Getting Time Remaining' |
  'Getting Premarket Data' |
  'Getting Current Price' |
  'Getting Surrounding Key Levels' |
  'Finding Setup' |
  'Selecting Option' |
  'Opening A Position' |
  'Cut Position' |
  'No position Available' |
  'Closed Position';

export interface PositionStatus {
  state: PositionState
  option: string
  openedAt?: Date
  openedPrice?: number | string
  optionQuantity?: number | string
  cutAt?: Date
  closedAt?: Date
}

export const getStatusQuery = defineQuery<PositionStatus>('getStatus');

const {
  // getPremarketData,
  getCurrentPrice,
  // getSurroundingKeyLevels,
  timeUntilMarketOpen,
  getPositionSetup,
  waitToSignalOpenPosition,
  waitToSignalCutPosition,
  waitToSignalClosePosition
} = proxyActivities<typeof activities>({
    startToCloseTimeout: 21600000,
    heartbeatTimeout: 10800000,
    retry: {
      maximumAttempts: 6,
      maximumInterval: 3000,
    }
  });

export async function priceAction(premarketData: PremarketData): Promise<string> {
  if (premarketData === undefined || premarketData === null) {
    throw ApplicationFailure.create({ nonRetryable: true, message: 'Premarket analysis error' });
  }

  const additionalSleepTime = 0;
  let state: PositionState = 'Getting Time Remaining';
  let marketOpen = await timeUntilMarketOpen();
  
  if (marketOpen < 0) {
    marketOpen = 0;
  }

  let option: string;
  let optionQuantity: number | string;
  const optionFee = 0.65;

  setHandler(getStatusQuery, () => {
    return {
      state,
      option,
      optionQuantity
    }
  });

  const budget = premarketData.budget;
  const accountId = premarketData.account_id;
  // const keyLevels = premarketData.keyLevels;
  const demandZones = premarketData.demandZones;
  const supplyZones = premarketData.supplyZones;
  const symbol = premarketData.symbol;

  const timeRemaining = additionalSleepTime + marketOpen;
  await sleep(timeRemaining);

  // state = 'Getting Premarket Data';
  // const premarketPrices = await getPremarketData(premarketData.symbol);

  // if (premarketPrices === "Market is Currently closed!") {
  //   return premarketPrices
  // }

  state = 'Getting Current Price';
  const currentPrice = await getCurrentPrice(premarketData.symbol, demandZones, supplyZones);

  if (currentPrice === "There are no demand or supply zones!" || currentPrice === "Market is currently closed!") {
    return currentPrice;
  }

  // state = 'Getting Surrounding Key Levels';
  // const surroundingKeyLevels = await getSurroundingKeyLevels(currentPrice, keyLevels);

  // if (surroundingKeyLevels === "There are no surrounding key levels!") {
  //   return surroundingKeyLevels;
  // }

  state = 'Finding Setup';
  const positionSetup = await getPositionSetup(currentPrice);

  if (positionSetup === "There are no good position setups!") {
    return positionSetup;
  }

  state = 'Opening A Position';
  const signalOpenPosition = await waitToSignalOpenPosition(currentPrice, positionSetup, symbol, budget, accountId, 300, 500, 60000, 30000, optionFee);
  if (
    signalOpenPosition === "Could not find any good buying opportunities!" || 
    signalOpenPosition === "Account balance is too low!" || 
    signalOpenPosition === "There are no call or put options selected for purchase!" || 
    signalOpenPosition === "There are no call or put options that meet the requirements!" || 
    signalOpenPosition === 'There are no call options that meet the requirements!' || 
    signalOpenPosition === 'There are no put options that meet the requirements!' ||
    signalOpenPosition === "Both call and put responses were null!") {
    state = 'No position Available'
    return signalOpenPosition
  }

  state = 'Cut Position';
  const cutFilled = await waitToSignalCutPosition(signalOpenPosition, accountId);

  if (cutFilled === "Stopped out") {
    return cutFilled;
  }

  state = 'Closed Position';
  const signalClosePosition = await waitToSignalClosePosition(cutFilled, signalOpenPosition, accountId);
  await condition(() => signalClosePosition === 'position fully closed!');

  return signalClosePosition;
}