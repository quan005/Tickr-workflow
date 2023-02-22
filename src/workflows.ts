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
import { TokenJSON } from './interfaces/token';

type PositionState = 'Checking If It Is A Holiday' | 'Getting Time Remaining' | 'Getting Auth Token 1' | 'Getting User Principles 1' | 'Getting Current Price' | 'Getting Surrounding Key Levels' | 'Finding Setup' | 'Selecting Option' | 'Getting Auth Token 2' | 'Getting User Principles 2' | 'Opened Position' | 'Getting Auth Token 3' | 'Getting User Principles 3' | 'Checking If Position Filled' | 'Getting Option Symbol' | 'Getting Auth Token 4' | 'Getting User Principles 4' | 'Cut Position' | 'No position Available' | 'Getting Auth Token 5' | 'Getting User Principles 5' | 'Closed Position'

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
  time_until_market_open,
  is_holiday,
  get_current_price,
  get_surrounding_key_levels,
  get_position_setup,
  getOptionsSelection,
  waitToSignalOpenPosition,
  checkIfPositionFilled,
  getOptionSymbol,
  waitToSignalCutPosition,
  waitToSignalClosePosition,
  getUrlCode,
  getLoginCredentials,
  getRefreshToken,
  getUserPrinciples } = proxyActivities<typeof activities>({
    startToCloseTimeout: 1000000,
    heartbeatTimeout: 20000,
    retry: {
      maximumAttempts: 6,
      maximumInterval: 3000,
    }
  });

export async function priceAction(premarketData: PremarketData): Promise<string> {
  if (premarketData === undefined || premarketData === null) {
    throw ApplicationFailure.create({ nonRetryable: true, message: 'There are no opportunities' });
  }

  let state: PositionState = 'Checking If It Is A Holiday';
  const isHoliday = await is_holiday();
  state = 'Getting Time Remaining';
  let option: string;
  let openedAt: Date = new Date();
  let openedPrice: number | string;
  let optionQuantity: number | string;
  let cutAt: Date = new Date();
  let closedAt: Date = new Date();

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

  let urlCode = '';

  let gettingUserPrinciples = {
    userPrinciples: null,
    params: null,
    loginRequest: null,
    marketRequest: null,
    bookRequest: null,
    timeSalesRequest: null
  };

  const timeRemaining = await time_until_market_open(isHoliday);

  await sleep(timeRemaining);

  state = 'Getting Auth Token 1';
  urlCode = await getUrlCode();
  token = await getLoginCredentials(urlCode);
  state = 'Getting User Principles 1';
  gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
  let wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

  state = 'Getting Current Price';
  const currentPrice = await get_current_price(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, demandZones, supplyZones, isHoliday);
  state = 'Getting Surrounding Key Levels';
  const surroundingKeyLevels = await get_surrounding_key_levels(currentPrice.closePrice, keyLevels);
  state = 'Finding Setup';
  const positionSetup = await get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone);
  state = 'Selecting Option';
  const optionSelection = await getOptionsSelection(positionSetup, symbol, token.access_token);

  if (new Date().valueOf() >= token.access_token_expires_at && token.refresh_token !== null && new Date().valueOf() < token.refresh_token_expires_at) {
    state = 'Getting Auth Token 2';
    token = await getRefreshToken(token.refresh_token);
    state = 'Getting User Principles 2';
    gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
    wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  } else {
    state = 'Getting Auth Token 2';
    urlCode = await getUrlCode();
    token = await getLoginCredentials(urlCode);
    state = 'Getting User Principles 2';
    gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
    wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  }

  state = 'Opened Position';
  const signalOpenPosition = await waitToSignalOpenPosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.bookRequest, gettingUserPrinciples.timeSalesRequest, positionSetup, optionSelection, budget, accountId, token.access_token, isHoliday);
  openedAt = new Date();


  if (signalOpenPosition.position) {
    if (signalOpenPosition.position.price && signalOpenPosition.position.quantity && signalOpenPosition.position.optionSymbol) {
      option = signalOpenPosition.position.optionSymbol;
      openedPrice = signalOpenPosition.position.price;
      optionQuantity = signalOpenPosition.position.quantity;
    }

    if (new Date().valueOf() >= token.access_token_expires_at && token.refresh_token !== null && new Date().valueOf() < token.refresh_token_expires_at) {
      state = 'Getting Auth Token 3';
      token = await getRefreshToken(token.refresh_token);
      state = 'Getting User Principles 3';
      gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
    } else {
      state = 'Getting Auth Token 3';
      urlCode = await getUrlCode();
      token = await getLoginCredentials(urlCode);
      state = 'Getting User Principles 3';
      gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
    }

    state = 'Checking If Position Filled';
    const quantity = await checkIfPositionFilled(signalOpenPosition.position.orderResponse, accountId, token.access_token);
    state = 'Getting Option Symbol'
    const optionSymbol = await getOptionSymbol(signalOpenPosition.position.orderResponse, accountId, token.access_token);

    if (new Date().valueOf() >= token.access_token_expires_at && token.refresh_token !== null && new Date().valueOf() < token.refresh_token_expires_at) {
      state = 'Getting Auth Token 4';
      token = await getRefreshToken(token.refresh_token);
      state = 'Getting User Principles 4';
      gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
      wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
    } else {
      state = 'Getting Auth Token 4';
      urlCode = await getUrlCode();
      token = await getLoginCredentials(urlCode);
      state = 'Getting User Principles 4';
      gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
      wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`
    }

    state = 'Cut Position';
    const cutFilled = await waitToSignalCutPosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.bookRequest, gettingUserPrinciples.timeSalesRequest, optionSymbol, quantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token, isHoliday);
    cutAt = new Date();
    const remainingQuantity = quantity - cutFilled

    if (new Date().valueOf() >= token.access_token_expires_at && token.refresh_token !== null && new Date().valueOf() < token.refresh_token_expires_at) {
      state = 'Getting Auth Token 5';
      token = await getRefreshToken(token.refresh_token);
      state = 'Getting User Principles 5';
      gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
      wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
    } else {
      state = 'Getting Auth Token 5';
      urlCode = await getUrlCode();
      token = await getLoginCredentials(urlCode);
      state = 'Getting User Principles 5';
      gettingUserPrinciples = await getUserPrinciples(token.access_token, premarketData.symbol);
      wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
    }

    state = 'Closed Position';
    const signalClosePosition = await waitToSignalClosePosition(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.bookRequest, gettingUserPrinciples.timeSalesRequest, optionSymbol, remainingQuantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token, isHoliday);
    await condition(() => !!signalClosePosition.orderResponse.orderId);
    closedAt = new Date();

    return signalClosePosition.orderResponse.orderId;
  } else {
    state = 'No position Available'
    return state
  }
}