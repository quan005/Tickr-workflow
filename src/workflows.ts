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

type PositionState = 'Authenticating' | 'Getting Current Price' | 'Getting Surrounding Key Levels' | 'Finding Setup' | 'Selecting Option' | 'Authenticating To Open A Position' | 'Opened Position' | 'Authenticating To Confirm Position' | 'Authenticating To Cut A Position' | 'Cut Position' | 'No position Available' | 'Authenticating To Close A Position' | 'Closed Position'

export interface PositionStatus {
  state: PositionState
  option: string
  openedAt?: Date
  openedPrice?: number | string
  optionQuantity?: number | string
  cutAt?: Date
  closedAt?: Date
}

export const currentPriceSignal = defineSignal('gettingCurrentPrice');
export const surroundingKeyLevelsSignal = defineSignal('gettingSurroundingKeyLevels');
export const findingSetup = defineSignal('findingSetup');
export const optionSignal = defineSignal('selectingOption');
export const openedSignal = defineSignal('openedPosition');
export const cutSignal = defineSignal('cutPosition');
export const closedSignal = defineSignal('closedPosition');
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
      maximumAttempts: 4,
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

  setHandler(currentPriceSignal, () => {
    if (state === 'Authenticating') {
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

  setHandler(openedSignal, () => {
    if (state === 'Authenticating To Open A Position') {
      state = 'Opened Position';
    }
  });

  setHandler(cutSignal, () => {
    if (state === 'Authenticating To Cut A Position') {
      state = 'Cut Position';
    }
  });

  setHandler(closedSignal, () => {
    if (state === 'Authenticating To Close A Position') {
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

  const timeRemaining = await time_until_market_open();

  await sleep(timeRemaining);

  token = await getLoginCredentials(clientId);
  gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);

  let wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

  state = 'Authenticating';

  const currentPrice = await get_current_price(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, demandZones, supplyZones);
  const surroundingKeyLevels = await get_surrounding_key_levels(currentPrice.closePrice, keyLevels);
  const positionSetup = await get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone);
  const optionSelection = await getOptionsSelection(positionSetup, symbol, token.access_token);

  token = await getLoginCredentials(clientId);
  gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
  wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

  state = 'Authenticating To Open A Position';
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

    state = 'Authenticating To Confirm Position';
    const quantity = await checkIfPositionFilled(signalOpenPosition.position.orderResponse, accountId, token.access_token);
    const optionSymbol = await getOptionSymbol(signalOpenPosition.position.orderResponse, accountId, token.access_token);

    token = await getLoginCredentials(clientId);
    gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
    wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

    state = 'Authenticating To Cut A Position';
    const cutFilled = await waitToSignalCutPosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.bookRequest, gettingUserPrinciples.timeSalesRequest, optionSymbol, quantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token);
    cutAt = new Date();
    const remainingQuantity = quantity - cutFilled

    token = await getLoginCredentials(clientId);
    gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
    wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

    state = 'Authenticating To Close A Position';
    const signalClosePosition = await waitToSignalClosePosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.bookRequest, gettingUserPrinciples.timeSalesRequest, optionSymbol, remainingQuantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token);
    await condition(() => closed === true);
    closedAt = new Date();

    return signalClosePosition.orderResponse.orderId;
  } else {
    throw ApplicationFailure.create({ nonRetryable: true, message: 'There are no good positions!' });
  }
}