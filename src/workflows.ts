import {
  ApplicationFailure,
  condition,
  defineSignal,
  defineQuery,
  setHandler,
  sleep,
  proxyActivities,
} from '@temporalio/workflow';
import * as activities from "./activities/priceActionPosition";
import { PremarketData } from "./interfaces/premarketData";
import { TokenJSON } from './interfaces/token';

type PositionState = 'Getting Time Remaining' | 'Getting Auth Token 1' | 'Getting User Principles 1' | 'Getting Current Price' | 'Getting Surrounding Key Levels' | 'Finding Setup' | 'Selecting Option' | 'Getting Auth Token 2' | 'Getting User Principles 2' | 'Opened Position' | 'Getting Auth Token 3' | 'Getting User Principles 3' | 'Checking If Position Filled' | 'Getting Option Symbol' | 'Getting Auth Token 4' | 'Getting User Principles 4' | 'Cut Position' | 'No position Available' | 'Getting Auth Token 5' | 'Getting User Principles 5' | 'Closed Position'

export interface PositionStatus {
  state: PositionState
  option: string
  openedAt?: Date
  openedPrice?: number | string
  optionQuantity?: number | string
  cutAt?: Date
  closedAt?: Date
}

export const authToken1 = defineSignal('gettingAuthToken1');
export const authUserPrinciples1 = defineSignal('gettingUserPrinciples1');
export const currentPriceSignal = defineSignal('gettingCurrentPrice');
export const surroundingKeyLevelsSignal = defineSignal('gettingSurroundingKeyLevels');
export const findingSetup = defineSignal('findingSetup');
export const optionSignal = defineSignal('selectingOption');
export const authToken2 = defineSignal('gettingAuthToken2');
export const authUserPrinciples2 = defineSignal('gettingUserPrinciples2');
export const openedSignal = defineSignal('openedPosition');
export const authToken3 = defineSignal('gettingAuthToken3');
export const authUserPrinciples3 = defineSignal('gettingUserPrinciples3');
export const checkingIfOptionFilled = defineSignal('checkingIfOptionFilled');
export const gettingOptionSymbol = defineSignal('gettingOptionSymbol');
export const cutSignal = defineSignal('cutPosition');
export const authToken4 = defineSignal('gettingAuthToken4');
export const authUserPrinciples4 = defineSignal('gettingUserPrinciples4');
export const closedSignal = defineSignal('closedPosition');
export const authToken5 = defineSignal('gettingAuthToken5');
export const authUserPrinciples5 = defineSignal('gettingUserPrinciples5');
export const getStatusQuery = defineQuery<PositionStatus>('getStatus');

const {
  time_until_market_open,
  get_current_price,
  get_surrounding_key_levels,
  get_position_setup,
  getOptionsSelection,
  waitToSignalOpenPosition,
  checkIfPositionFilled,
  getOptionSymbol,
  waitToSignalCutPosition,
  waitToSignalClosePosition,
  getLoginCredentials,
  getUserPrinciples } = proxyActivities<typeof activities>({
    startToCloseTimeout: 300000,
    retry: {
      maximumAttempts: 6,
      maximumInterval: 5000,
    }
  });

export async function priceAction(premarketData: PremarketData): Promise<string> {
  if (premarketData === undefined || premarketData === null) {
    throw ApplicationFailure.create({ nonRetryable: true, message: 'There are no opportunities' });
  }

  let state: PositionState;
  let option: string;
  let openedAt: Date = new Date();
  let openedPrice: number | string;
  let optionQuantity: number | string;
  let cutAt: Date = new Date();
  let closed = false;
  let closedAt: Date = new Date();

  setHandler(authToken1, () => {
    if (state === 'Getting Time Remaining') {
      state = 'Getting Auth Token 1';
    }
  });

  setHandler(authUserPrinciples1, () => {
    if (state === 'Getting Auth Token 1') {
      state = 'Getting User Principles 1';
    }
  });

  setHandler(currentPriceSignal, () => {
    if (state === 'Getting User Principles 1') {
      state = 'Getting Current Price';
    }
  });

  setHandler(surroundingKeyLevelsSignal, () => {
    if (state === 'Getting Current Price') {
      state = 'Getting Surrounding Key Levels';
    }
  });

  setHandler(findingSetup, () => {
    if (state === 'Getting Surrounding Key Levels') {
      state = 'Finding Setup';
    }
  });

  setHandler(optionSignal, () => {
    if (state === 'Finding Setup') {
      state = 'Selecting Option';
    }
  });

  setHandler(authToken2, () => {
    if (state === 'Selecting Option') {
      state = 'Getting Auth Token 2';
    }
  });

  setHandler(authUserPrinciples2, () => {
    if (state === 'Getting Auth Token 2') {
      state = 'Getting User Principles 2';
    }
  });

  setHandler(openedSignal, () => {
    if (state === 'Getting User Principles 2') {
      state = 'Opened Position';
    }
  });

  setHandler(authToken3, () => {
    if (state === 'Opened Position') {
      state = 'Getting Auth Token 3';
    }
  });

  setHandler(authUserPrinciples3, () => {
    if (state === 'Getting Auth Token 3') {
      state = 'Getting User Principles 3';
    }
  });

  setHandler(checkingIfOptionFilled, () => {
    if (state === 'Getting User Principles 3') {
      state = 'Checking If Position Filled';
    }
  });

  setHandler(gettingOptionSymbol, () => {
    if (state === 'Checking If Position Filled') {
      state = 'Getting Option Symbol';
    }
  });

  setHandler(authToken4, () => {
    if (state === 'Getting Option Symbol') {
      state = 'Getting Auth Token 4';
    }
  });

  setHandler(authUserPrinciples4, () => {
    if (state === 'Getting Auth Token 4') {
      state = 'Getting User Principles 4';
    }
  });

  setHandler(cutSignal, () => {
    if (state === 'Getting User Principles 4') {
      state = 'Cut Position';
    }
  });

  setHandler(authToken5, () => {
    if (state === 'Cut Position') {
      state = 'Getting Auth Token 5';
    }
  });

  setHandler(authUserPrinciples5, () => {
    if (state === 'Getting Auth Token 5') {
      state = 'Getting User Principles 5';
    }
  });

  setHandler(closedSignal, () => {
    if (state === 'Getting User Principles 5') {
      state = 'Closed Position';
      closed = true;
    }
  });

  setHandler(getStatusQuery, () => {
    return {
      state,
      option,
      openedAt,
      openedPrice,
      optionQuantity,
      cutAt,
      closedAt,
    }
  });

  const budget = premarketData.budget;
  const clientId = premarketData.client_id;
  const accountId = premarketData.account_id;
  const keyLevels = premarketData.keyLevels;
  const demandZones = premarketData.demandZones;
  const supplyZones = premarketData.supplyZones;
  const symbol = premarketData.symbol;

  let token: TokenJSON = {
    access_token: null,
    refresh_token: null,
    access_token_expires_at: null,
    refresh_token_expires_at: null,
    logged_in: null,
    access_token_expires_at_date: null,
    refresh_token_expires_at_date: null
  };

  let gettingUserPrinciples = {
    userPrinciples: null,
    params: null,
    loginRequest: null,
    marketRequest: null,
    bookRequest: null,
    timeSalesRequest: null
  };

  state = 'Getting Time Remaining';

  const timeRemaining = await time_until_market_open();

  await sleep(timeRemaining);

  token = await getLoginCredentials(clientId);
  gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);

  let wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

  const currentPrice = await get_current_price(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, demandZones, supplyZones);
  const surroundingKeyLevels = await get_surrounding_key_levels(currentPrice.closePrice, keyLevels);
  const positionSetup = await get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone);
  const optionSelection = await getOptionsSelection(positionSetup, symbol, token.access_token);

  token = await getLoginCredentials(clientId);
  gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
  wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

  const signalOpenPosition = await waitToSignalOpenPosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.bookRequest, gettingUserPrinciples.timeSalesRequest, positionSetup, optionSelection, budget, accountId, token.access_token);
  openedAt = new Date();


  if (signalOpenPosition.position) {
    if (signalOpenPosition.position.price && signalOpenPosition.position.quantity && signalOpenPosition.position.optionSymbol) {
      option = signalOpenPosition.position.optionSymbol;
      openedPrice = signalOpenPosition.position.price;
      optionQuantity = signalOpenPosition.position.quantity;
    }

    token = await getLoginCredentials(clientId);
    gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);

    const quantity = await checkIfPositionFilled(signalOpenPosition.position.orderResponse, accountId, token.access_token);
    const optionSymbol = await getOptionSymbol(signalOpenPosition.position.orderResponse, accountId, token.access_token);

    token = await getLoginCredentials(clientId);
    gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
    wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

    const cutFilled = await waitToSignalCutPosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.bookRequest, gettingUserPrinciples.timeSalesRequest, optionSymbol, quantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token);
    cutAt = new Date();
    const remainingQuantity = quantity - cutFilled

    token = await getLoginCredentials(clientId);
    gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
    wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

    const signalClosePosition = await waitToSignalClosePosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.bookRequest, gettingUserPrinciples.timeSalesRequest, optionSymbol, remainingQuantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token);
    await condition(() => closed === true);
    closedAt = new Date();

    return signalClosePosition.orderResponse.orderId;
  } else {
    state = 'No position Available'
    throw ApplicationFailure.create({ nonRetryable: true, message: 'There are no good positions!' });
  }
}