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

type PositionState = 'Checking If It Is A Holiday' | 'Getting Time Remaining' | 'Getting Auth Token 1' | 'Getting User Principles 1' | 'Getting Current Price' | 'Getting Surrounding Key Levels' | 'Finding Setup' | 'Selecting Option' | 'Getting Auth Token 2' | 'Getting User Principles 2' | 'Opening A Position' | 'Getting Auth Token 3' | 'Getting User Principles 3' | 'Checking If Position Filled' | 'Getting Option Symbol' | 'Cut Position' | 'No position Available' | 'Closed Position';

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
  timeUntilMarketOpen,
  isHoliday,
  getCurrentPrice,
  getSurroundingKeyLevels,
  getPositionSetup,
  waitToSignalOpenPosition,
  checkIfPositionFilled,
  getOptionSymbol,
  waitToSignalCutPosition,
  waitToSignalClosePosition,
  getLoginCredentials,
  getUserPrinciples } = proxyActivities<typeof activities>({
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

  const additionalSleepTime = premarketData.messageNumber ? premarketData.messageNumber * 240000 : 0;
  let state: PositionState = 'Checking If It Is A Holiday';
  const holiday = await isHoliday();
  state = 'Getting Time Remaining';
  let option: string;
  let optionQuantity: number | string;

  setHandler(getStatusQuery, () => {
    return {
      state,
      option,
      optionQuantity
    }
  });

  const budget = premarketData.budget;
  const accountId = premarketData.account_id;
  const keyLevels = premarketData.keyLevels;
  const demandZones = premarketData.demandZones;
  const supplyZones = premarketData.supplyZones;
  const symbol = premarketData.symbol;

  let token = '';

  let gettingUserPrinciples = {
    userPrinciples: null,
    params: null,
    loginRequest: null,
    marketRequest: null,
    bookRequest: null,
    timeSalesRequest: null
  };

  const marketOpen = await timeUntilMarketOpen(holiday)

  if (typeof marketOpen === "string") {
    return marketOpen;
  }

  const timeRemaining = marketOpen + additionalSleepTime;
  await sleep(timeRemaining);

  state = 'Getting Auth Token 1';
  token = await getLoginCredentials();
  state = 'Getting User Principles 1';
  gettingUserPrinciples = await getUserPrinciples(token, premarketData.symbol);
  let wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

  state = 'Getting Current Price';
  const currentPrice = await getCurrentPrice(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, demandZones, supplyZones, holiday);

  if (currentPrice === "There are no demand or supply zones!" || currentPrice === "Market is currently closed!") {
    return currentPrice;
  }

  state = 'Getting Surrounding Key Levels';
  const surroundingKeyLevels = await getSurroundingKeyLevels(currentPrice, keyLevels);

  if (surroundingKeyLevels === "There are no surrounding key levels!") {
    return surroundingKeyLevels;
  }

  state = 'Finding Setup';
  const positionSetup = await getPositionSetup(surroundingKeyLevels, currentPrice);

  if (positionSetup === "There are no good position setups!") {
    return positionSetup;
  }

  state = 'Opening A Position';
  const signalOpenPosition = await waitToSignalOpenPosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.timeSalesRequest, positionSetup, symbol, budget, accountId, holiday);

  if (signalOpenPosition === "Could not find any good buying opportunities!" || signalOpenPosition === "Account balance is too low!" || signalOpenPosition === "There are no call or put options selected for purchase" || signalOpenPosition === "There are no call or put options that meets the requirements!" || signalOpenPosition === 'There are no call options that meets the requirements!' || signalOpenPosition === 'There are no put options that meets the requirements!' || signalOpenPosition === "Both call and put responses were null!") {
    state = 'No position Available'
    return signalOpenPosition
  }

  state = 'Getting Auth Token 2';
  token = await getLoginCredentials();
  state = 'Getting User Principles 2';
  gettingUserPrinciples = await getUserPrinciples(token, premarketData.symbol);
  wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;


  state = 'Getting Option Symbol'
  const optionSymbol = await getOptionSymbol(signalOpenPosition);
  state = 'Checking If Position Filled';
  const quantity = await checkIfPositionFilled(optionSymbol, accountId, token);

  state = 'Cut Position';
  const cutFilled = await waitToSignalCutPosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, optionSymbol, quantity, signalOpenPosition, accountId, holiday);

  if (cutFilled === "Stopped out") {
    return cutFilled;
  }

  state = 'Getting Auth Token 3';
  token = await getLoginCredentials();
  state = 'Getting User Principles 3';
  gettingUserPrinciples = await getUserPrinciples(token, premarketData.symbol);
  wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

  state = 'Checking If Position Filled';
  const CutQuantity = await checkIfPositionFilled(optionSymbol, accountId, token);

  state = 'Closed Position';
  const signalClosePosition = await waitToSignalClosePosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, optionSymbol, quantity, CutQuantity, cutFilled, signalOpenPosition, accountId, holiday);
  await condition(() => signalClosePosition === 'position fully closed!');

  return signalClosePosition;
}