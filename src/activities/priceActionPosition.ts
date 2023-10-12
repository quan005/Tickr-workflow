require('module-alias/register');
import { WebSocket } from "ws";
import { Context } from "@temporalio/activity";
import * as dotenv from "dotenv";
import * as moment from "moment-timezone";
import { CurrentPriceData } from "@src/interfaces/currentPriceData";
import { Zone } from "@src/interfaces/supplyDemandZones";
import { SignalClosePositionState, SignalCutPositionState, SignalOpenPositionState } from "@src/interfaces/state";
import { OpenPositionSignal, CutPositionSignal } from "@src/interfaces/positionSignals";
import { PrinciplesAndParams } from "@src/interfaces/UserPrinciples";
import { SocketResponse, Chart } from "@src/interfaces/websocketEvent";

import {
  findZones,
  getAverage,
  getMarketClose,
  getOptionsSelection,
  getOptionSymbol,
  holiday,
  isOrderVelocityIncreasing,
  isPositionFilled,
} from "./utilities";
import { closePosition, cutPosition, openPosition, processTimeSalesData } from "./helpers";
import { getUserPrinciples } from "./api_request";
import { OptionsSelection } from "@src/interfaces/optionsSelection";
import { OrderDetails } from "@src/interfaces/orders";
import { PositionSetup } from "@src/interfaces/positionSetup";
import { FixedSizeQueue } from "./utilities/classes";
import { DeltaMetrics } from "@src/interfaces/delta";
import { TimeSales } from "@src/interfaces/websocketEvent";

dotenv.config();

export interface MessageResponse {
  service: string
  requestid: string
  command: string
  timestamp: number | string
  content: object
}

export interface Message {
  response: MessageResponse[] | null
}

export function timeUntilMarketOpen(): Promise<number> {
  if (holiday() || getMarketClose()) {
      return Promise.resolve(-1);
  }

  const marketOpen = moment().tz('America/New_York').set('hour', 9).set('minute', 30);
  const now = moment().tz('America/New_York');
  const diff = moment.duration(marketOpen.diff(now));

  const hoursRemaining = diff.hours();
  const hoursToMilliSeconds = ((hoursRemaining * 60) * 60) * 1000;

  const minutesRemaining = diff.minutes();
  const minutesToMilliSeconds = (minutesRemaining * 60) * 1000;

  let total = hoursToMilliSeconds + minutesToMilliSeconds;

  if (total < 0) {
      total = 0;
  }

  return Promise.resolve(total);
}

export async function getPremarketData(symbol: string): Promise<string> {
  let principles: PrinciplesAndParams;
  let loggedIn = false;
  let timeLeft: number;
  const prices = [];
  let client: WebSocket | null = null;

  try {
    principles = await getUserPrinciples(symbol);
  } catch (error) {
    throw new Error(error.message);
  }

  const wsUrl = `wss://${principles.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  const loginRequest = principles.loginRequest;
  const timeSalesRequest = principles.timeSalesRequest;

  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    };

    client.onopen = async function () {
      timeLeft = await timeUntilMarketOpen(); 
      if (timeLeft === -1) {
          client?.close();
      } else {
          client?.send(JSON.stringify(loginRequest));
      }
    };

    client.onmessage = async function (event) {
      timeLeft = await timeUntilMarketOpen();
      if (timeLeft <= 0) {
          client?.close();
      } else if (loggedIn) {
          client?.send(JSON.stringify(timeSalesRequest));
          loggedIn = false;
      } else {
          const data = JSON.parse(event.data as string);

          if (data.response && data.response[0].command === 'LOGIN') {
              loggedIn = true;
          } else if (data.data !== undefined) {
              const content = data.data[0].content;

              for (let i = 0; i < content.length; i++) {
                const order: TimeSales = content[i];
                const price = order["2"];
                prices.push(price);
              };
          }
      }
    };
  }

  openClient();

  return await new Promise((resolve) => {
    if (client) {
      client.onclose = function () {
        client.terminate();
        client = null;
        if (timeLeft === -1) {
          return resolve('Market is Currently closed!')
        }

        return resolve(JSON.stringify(prices));
      };
    }
  });
}

export async function getSurroundingKeyLevels(
  currentPrice: string, 
  keyLevels: number[]
): Promise<string> {
  const newCurrentPrice: CurrentPriceData = JSON.parse(currentPrice);

  Context.current().heartbeat(JSON.stringify('looping'));

  for (const [i, level] of keyLevels.entries()) {
    if (i === 0) {
      if (newCurrentPrice.closePrice < level && newCurrentPrice.closePrice > keyLevels[i + 1]) {
        return JSON.stringify({
          aboveResistance: null,
          resistance: level,
          support: keyLevels[i + 1],
          belowSupport: keyLevels[i + 2],
        });
      } else if (newCurrentPrice.closePrice >= level) {
        return JSON.stringify({
          aboveResistance: null,
          resistance: null,
          support: level,
          belowSupport: keyLevels[i + 1],
        });
      }
    } else if (i === 1) {
      if (newCurrentPrice.closePrice < level && newCurrentPrice.closePrice > keyLevels[i + 1]) {
        return JSON.stringify({
          aboveResistance: keyLevels[i - 1],
          resistance: level,
          support: keyLevels[i + 1],
          belowSupport: keyLevels[i + 2],
        });
      } else if (newCurrentPrice.closePrice > level) {
        return JSON.stringify({
          aboveResistance: null,
          resistance: keyLevels[i - 1],
          support: level,
          belowSupport: keyLevels[i + 1],
        });
      }
    } else if (i >= 2 && i <= keyLevels.length - 3) {
      if (newCurrentPrice.closePrice < level && newCurrentPrice.closePrice > keyLevels[i + 1]) {
        return JSON.stringify({
          aboveResistance: keyLevels[i - 1],
          resistance: level,
          support: keyLevels[i + 1],
          belowSupport: keyLevels[i + 2],
        });
      } else if (newCurrentPrice.closePrice > level) {
        return JSON.stringify({
          aboveResistance: keyLevels[i - 2],
          resistance: keyLevels[i - 1],
          support: level,
          belowSupport: keyLevels[i + 1],
        });
      }
    } else if (i === keyLevels.length - 2) {
      if (newCurrentPrice.closePrice < level && newCurrentPrice.closePrice > keyLevels[i + 1]) {
        return JSON.stringify({
          aboveResistance: keyLevels[i - 1],
          resistance: level,
          support: keyLevels[i + 1],
          belowSupport: null,
        });
      } else if (newCurrentPrice.closePrice > level) {
        return JSON.stringify({
          aboveResistance: keyLevels[i + 2],
          resistance: keyLevels[i + 1],
          support: level,
          belowSupport: keyLevels[i - 1],
        });
      }
    } else if (i === keyLevels.length - 1) {
      if (newCurrentPrice.closePrice < level) {
        return JSON.stringify({
          aboveResistance: keyLevels[i - 1],
          resistance: level,
          support: null,
          belowSupport: null,
        });
      }
    }
  }

  return 'There are no surrounding key levels!';
}

export async function getCurrentPrice(
  symbol: string,
  demandZones: Zone[],
  supplyZones: Zone[],
): Promise<string> {
  let principles: PrinciplesAndParams;
  let closePrice = 0;
  let client: WebSocket | null = null;

  try {
    principles = await getUserPrinciples(symbol);
  } catch (error) {
    throw new Error(error.message);
  }

  const wsUrl = `wss://${principles.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  const loginRequest = principles.loginRequest;
  const timeSalesRequest = principles.timeSalesRequest;

  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    };

    client.onopen = function () {
      if (getMarketClose()) {
        client?.close();
      } else {
        client?.send(JSON.stringify(loginRequest));
      }
    };

    client.onmessage = function (event) {
      if (getMarketClose()) {
        client?.close();

      } else {
        const data = JSON.parse(event.data as string);
  
        if (data.response && data.response[0].command === 'LOGIN') {
          client?.send(JSON.stringify(timeSalesRequest));

        } else if (data.data && data.data[0].service === "TIMESALE_EQUITY") {
          const content:SocketResponse["content"] = data.data[0].content;
          closePrice = content[content.length - 1]["2"];
          client?.close();

        }
      }
    };
  }

  openClient();

  return new Promise((resolve) => {
    client.onclose = async function () {
      if (closePrice === 0) {
        return resolve('could not get close price!');
      }

      if (getMarketClose()) {
        return resolve('Market is currently closed!');
      }

      const zones = await findZones(closePrice, supplyZones, demandZones);

      if (!zones.demandZones?.length && !zones.supplyZones?.length) {
        return resolve('There are no demand or supply zones!');
      }

      const currentPriceData = {
        closePrice,
        demandZone: zones.demandZones || [],
        supplyZone: zones.supplyZones|| [],
      };

      return resolve(JSON.stringify(currentPriceData));
    };
  });
}

export async function getPositionSetup(
  currentPrice: string
): Promise<string> {
  // const newSurroundingKeyLevels: SurroundingKeyLevels = JSON.parse(surroundingKeyLevels);
  const newCurrentPrice: CurrentPriceData = JSON.parse(currentPrice);
  const demandZone = newCurrentPrice.demandZone || [];
  const supplyZone = newCurrentPrice.supplyZone || [];
  const position: PositionSetup = {
    demand: {
      primary: {
        targetedEntry: 0,
        reversalEntry: 0
      },
      secondary: {
        targetedEntry: 0,
        reversalEntry: 0
      },
    },
    supply: {
      primary: {
        targetedEntry: 0,
        reversalEntry: 0
      },
      secondary: {
        targetedEntry: 0,
        reversalEntry: 0
      },
    }
  }

  if (demandZone.length === 0 && supplyZone.length === 0) {
    return 'There are no good position setups!';
  }

  if (demandZone.length > 0) {
    position.demand.primary.targetedEntry = demandZone[0].top;
    position.demand.primary.reversalEntry = demandZone[0].bottom;
  }

  if (demandZone.length > 1) {
    position.demand.secondary.targetedEntry = demandZone[1].top;
    position.demand.secondary.reversalEntry = demandZone[1].bottom;
  }

  if (supplyZone.length > 0) {
    position.supply.primary.targetedEntry = supplyZone[0].bottom;
    position.supply.primary.reversalEntry = supplyZone[0].top;
  }

  if (supplyZone.length > 1) {
    position.supply.secondary.targetedEntry = supplyZone[1].bottom;
    position.supply.secondary.reversalEntry = supplyZone[1].top;
  }

  return JSON.stringify(position);
}

export async function waitToSignalOpenPosition(
  currentPrice: string,
  position_setup: string, 
  symbol: string, 
  budget: number, 
  account_id: string,
  tradeSpeedThreshold: number,
  tradeSize: number,
  timerDuration: number,
  orderVelocityTimerDuration: number,
  fee: number
): Promise<string> {
  let now = new Date();
  let orderVelocityNow = now;

  now.setSeconds(now.getSeconds() + timerDuration);
  let utcTime = now.toUTCString().slice(17, 22);

  orderVelocityNow.setSeconds(orderVelocityNow.getSeconds() + orderVelocityTimerDuration);
  let orderVelocityTime = orderVelocityNow.toUTCString().slice(17,25);

  const initialState: SignalOpenPositionState = {
    principles: null,
    demandTimeSalesEntryPercentage: 0,
    demandTimeSalesReversalEntryPercentage: 0,
    metDemandEntryPrice: 0,
    metDemandreversalEntryPrice: 0,
    demandForming: 0,
    demandReversalForming: 0,
    demandSize: 0,
    demandReversalSize: 0,
    demandConfirmation: false,
    demandReversalConfirmation: false,
    supplyTimeSalesEntryPercentage: 0,
    supplyTimeSalesReversalEntryPercentage: 0,
    metSupplyEntryPrice: 0,
    metSupplyReversalEntryPrice: 0,
    supplyForming: 0,
    supplyReversalForming: 0,
    supplySize: 0,
    supplyReversalSize: 0,
    supplyConfirmation: false,
    supplyReversalConfirmation: false,
    reversal: false,
    position: '',
    noGoodBuys: false,
    demandOrSupply: '',
    callOrPut: '',
    vwap: 0,
    cumulativeVolume: 0,
    cumulativeVolumeWeightedPrice: 0,
    rsi: 0,
    previousClose: 0,
    gains: [],
    losses: [],
    rsiPeriod: 0,
    highOfDay: 0,
    lowOfDay: 0,
    orderArray: [],
    deltaFootprint: {},
    delta: new FixedSizeQueue<number>(10),
    totalOrderAvgVolumeList: [],
    totalOrderVolume: 0,
    totalOrderAvgVolume: 0,
    lastTradeTime: null,
    lastPrice: 0,
    newPositionSetup: JSON.parse(position_setup),
    currentPrice: JSON.parse(currentPrice),
    updatedPrice: 0,
    tenPreviousDelta: new FixedSizeQueue<DeltaMetrics>(10),
    nextTime: utcTime,
    marketTrend: 'data insufficient',
    orderVelocity: 0,
    orderVelocityArray: new FixedSizeQueue<number>(30),
    orderVelocityAvg: 0,
    lastOrderVelocity: 0,
    nextOrderVelocityTime: orderVelocityTime,
    ordervelocityIncreasing: false
  }

  let state: SignalOpenPositionState = {...initialState}
  let client: WebSocket | null = null;

  try {
    state.principles = await getUserPrinciples(symbol);
  } catch (error) {
    throw new Error(error.message);
  }

  const wsUrl = `wss://${state.principles.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  const loginRequest = state.principles.loginRequest;
  const timeSalesRequest = state.principles.timeSalesRequest; 
  const chartRequest = state.principles.chartRequest;
  const marketRequest = state.principles.marketRequest;

  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    };

    client.onopen = function () {
      if (getMarketClose()) {
        state.noGoodBuys = true;
        client?.close();
      } else {
        client?.send(JSON.stringify(loginRequest));
      }
    };

    client.onmessage = function (event) {
      console.log('message event:', event);
      now = new Date();
      orderVelocityNow = now;

      utcTime = now.toUTCString().slice(17,22);

      orderVelocityNow.setSeconds(orderVelocityNow.getSeconds() + orderVelocityTimerDuration);
      orderVelocityTime = orderVelocityNow.toUTCString().slice(17,25);

      if (getMarketClose()) {
        state.noGoodBuys = true;
        client?.close();
      } else {
        const data = JSON.parse(event.data as string);

        if (data.response && data.response[0].command === "LOGIN") {
          client?.send(JSON.stringify(timeSalesRequest));
          client?.send(JSON.stringify(chartRequest));
          client?.send(JSON.stringify(marketRequest));
        } else if (data.data) {
          const service = data.data[0].service;

          if (orderVelocityTime === state.nextOrderVelocityTime){
            const prevOrderVelocityNow = now;
            prevOrderVelocityNow.setSeconds(prevOrderVelocityNow.getSeconds() - orderVelocityTimerDuration);
            const prevOrderVelocity = prevOrderVelocityNow.toUTCString().slice(17,25);
            console.log(`Order Velocity for ${prevOrderVelocity}: ${state.orderVelocity}`);
            state.orderVelocityArray.push(state.orderVelocity);
            state.orderVelocityAvg = getAverage(state.orderVelocityArray.getItems());
            state.lastOrderVelocity = state.orderVelocity;
            state.orderVelocity = 0;
          }

          if (utcTime === state.nextTime) {
            state.orderArray = [];
            state.totalOrderVolume = 0;

            now.setSeconds(now.getSeconds() + timerDuration);

            state.nextTime = now.toUTCString().slice(17,22);
          }

          if (service === "CHART_EQUITY") {
            console.log("chart request", data.data[0].content[0]);
          }

          if (service === "TIMESALE_EQUITY") {
            state.orderVelocity ++
            const content:SocketResponse["content"] = data.data[0].content;

            state = processTimeSalesData(content, state, utcTime);
  
            if (state.demandForming >= 30) { // in a demand zone
              if (state.marketTrend === 'uptrend' && isOrderVelocityIncreasing(state.orderVelocityArray)) {
                console.log('Open Demand confirmed due to uptrend and increasing order velocity.');
                state.demandConfirmation = true;
              }
            } else if (state.demandReversalForming >= 30) { // in a demand zone reversal
              if (state.marketTrend === 'downtrend' && isOrderVelocityIncreasing(state.orderVelocityArray) || state.marketTrend === 'potential pullback in downtrend' && isOrderVelocityIncreasing(state.orderVelocityArray)) {
                console.log('Potential reversal to the downside detected.');
                state.demandReversalConfirmation = true;
              }
            } else if (state.supplyForming >= 30) { // in a supply zone
              if (state.marketTrend === 'downtrend' && isOrderVelocityIncreasing(state.orderVelocityArray)) {
                console.log('Open Supply confirmed due to downtrend and increasing order velocity.');
                state.supplyConfirmation = true;
              }
            } else if (state.supplyReversalForming >= 30) { // in a supply zone reversal
              if (state.marketTrend === 'uptrend' && isOrderVelocityIncreasing(state.orderVelocityArray) || state.marketTrend === 'potential pullback in uptrend' && isOrderVelocityIncreasing(state.orderVelocityArray)) {
                console.log('Potential reversal to the upside detected.');
                state.supplyReversalConfirmation = true;
              }
            }

            if (state.demandConfirmation || state.supplyReversalConfirmation) {
              console.log('Opening a Call');
              state.callOrPut = 'CALL';
              client?.close();
            }

            if (state.supplyConfirmation || state.demandReversalConfirmation) {
              console.log('Opening a Put');
              state.callOrPut = 'PUT';
              client?.close();
            }
          }

          if (service === "QUOTE") {
            const content = data.data[0].content[0];
            state.highOfDay = content["12"];
            state.lowOfDay = content["13"];
          }
        }
      }
    };
  }

  openClient();

  return new Promise((resolve) => {
    client.onclose = async function () {
      if (state.noGoodBuys) {
        return resolve('Could not find any good buying opportunities!');
      }

      const optionSelection = await getOptionsSelection(position_setup, state.reversal, symbol, budget);

      if (
        optionSelection === "There are no call or put options that meet the requirements!" || 
        optionSelection === 'There are no call options that meet the requirements!' || 
        optionSelection === 'There are no put options that meet the requirements!' || 
        optionSelection === "Both call and put responses were null!"
      ) {
        return resolve(optionSelection);
      }

      const newOptions: OptionsSelection = JSON.parse(optionSelection);
      state.position = await openPosition(newOptions, state.callOrPut, budget, account_id);

      if (
        state.position === "Account balance is too low!" || 
        state.position === "There are no call or put options selected for purchase!"
      ) {
        return resolve(state.position);
      } else {
        const newPosition: OrderDetails = JSON.parse(state.position);
        const entry: number = state.updatedPrice;
        let stoploss: number;
        let breakEven: number;
        let cutPosition: number;
        let takeProfit: number;
        let higherProfit: number;
        let MaxProfit: number;
        const commission = fee / 100;
        const commissionIncludedPrice = newPosition.price + commission;

        if (state.callOrPut === 'PUT') {
          breakEven = Math.round(entry - commissionIncludedPrice * 100) / 100;
          stoploss = Math.round((entry + (0.10 * commissionIncludedPrice)) * 100) / 100;
          cutPosition = Math.round((breakEven - (0.5 * commissionIncludedPrice)) * 100) / 100;
          takeProfit = Math.round((breakEven  - (0.10 * commissionIncludedPrice)) * 100) / 100;
          higherProfit = Math.round((breakEven  - (0.20 * commissionIncludedPrice)) * 100) / 100;
          MaxProfit = Math.round((breakEven  - (0.30 * commissionIncludedPrice)) * 100) / 100;
        } 
        
        if (state.callOrPut === 'CALL') {
          breakEven = Math.round((entry + commissionIncludedPrice) * 100) / 100;
          stoploss = Math.round((entry - (0.10 * commissionIncludedPrice)) * 100) / 100;
          cutPosition = Math.round((breakEven + (0.5 * commissionIncludedPrice)) * 100) / 100;
          takeProfit = Math.round((breakEven  + (0.10 * commissionIncludedPrice)) * 100) / 100;
          higherProfit = Math.round((breakEven  + (0.20 * commissionIncludedPrice)) * 100) / 100;
          MaxProfit = Math.round((breakEven  + (0.30 * commissionIncludedPrice)) * 100) / 100;
        }

        return resolve(JSON.stringify({
          position: newPosition,
          callOrPut: state.callOrPut,
          entry: entry,
          breakEven: breakEven,
          stoploss: stoploss,
          cutPosition: cutPosition,
          takeProfit: takeProfit,
          higherProfit: higherProfit,
          MaxProfit: MaxProfit
        }));
      }
    };
  });
}

export async function waitToSignalCutPosition(
  order: string, 
  account_id: string
): Promise<string> {
  const symbol = await getOptionSymbol(order);
  const quantity = await isPositionFilled(symbol, account_id);
  const openPositonSignal: OpenPositionSignal = JSON.parse(order);
  const initialState: SignalCutPositionState = {
    openPositonSignal: openPositonSignal,
    principles: null,
    callOrPut: openPositonSignal.callOrPut,
    position: '',
    newPosition: '',
    skipCut: false,
    stoppedOut: false,
    cutFilled: 0,
  }
  
  const state: SignalCutPositionState = {...initialState};
  const entry = state.openPositonSignal.entry;
  const stoploss = state.openPositonSignal.stoploss;
  const breakEven = state.openPositonSignal.breakEven;
  const cut = state.openPositonSignal.cutPosition;
  const takeProfit = state.openPositonSignal.takeProfit;
  const higherProfit = state.openPositonSignal.higherProfit;
  const MaxProfit = state.openPositonSignal.MaxProfit;
  let client: WebSocket | null = null;

  if (quantity < 2) {
    return JSON.stringify({
      purchasedQuantity: quantity,
      cutQuantity: state.cutFilled,
      isCut: false,
      entry: entry,
      breakEven: breakEven,
      stoploss: stoploss,
      cutPosition: cut,
      takeProfit: takeProfit,
      higherProfit: higherProfit,
      MaxProfit: MaxProfit,
    });
  }

  try {
    state.principles = await getUserPrinciples(symbol);
  } catch (error) {
    throw new Error(error.message);
  }

  const wsUrl = `wss://${state.principles.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  const loginRequest = state.principles.loginRequest;
  const chartRequest = state.principles.chartRequest;


  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    }

    client.onopen = function () {
      if (getMarketClose()) {
        state.skipCut = true;
        client?.close();
      } else {
        client?.send(JSON.stringify(loginRequest));
      }
    };

    client.onmessage = function (event) {
      if (getMarketClose() || quantity < 2) {
        state.skipCut = true;
        client?.close();
      } else {
        const data = JSON.parse(event.data as string);

        if (data.response && data.response[0].command === "LOGIN") {
          client.send(JSON.stringify(chartRequest));
        } else if (data.data) {
          console.log('Cut Data Data: ', data.data);
          const content: Chart = data.data[0].content[0];
          const price = content["4"];

          if (state.callOrPut === 'CALL') {
            console.log('Cut Demand Data Data Content', data.data[0].content);

            if (price >= cut && price < takeProfit) {
              console.log(`Demand Position Cut at ${price}`);
              client?.close();
            } 
            
            if (price <= stoploss) {
              console.log(`Demand Position Cut Stopped at ${price}`);
              state.stoppedOut = true;
              client?.close();
            } 
            
            if (price >= takeProfit) {
              console.log(`Demand Position Cut Skipped at ${price}`);
              state.skipCut = true;
              client?.close();
            }

          } 
          
          if (state.callOrPut === 'PUT') {
            console.log('Cut Supply Data Data Content', data.data[0].content);

            if (price <= cut && price > takeProfit) {
              console.log(`Supply Position Cut at ${price}`);
              client?.close();
            } 
            
            if (price >= stoploss) {
              console.log(`Supply Position Cut Stopped at ${price}`);
              state.stoppedOut = true;
              client?.close();
            } 
            
            if (price <= takeProfit) {
              console.log(`Supply Position Cut Skipped at ${price}`);
              state.skipCut = true;
              client?.close();
            }
          }
        }
      }
    };
  }

  openClient();

  return new Promise<string>((resolve) => {
    let returnString = ''
    client.onclose = async function () {
      if (state.skipCut) {
        console.log('cut was skipped');
        returnString = JSON.stringify({
          position: state.openPositonSignal.position,
          purchasedQuantity: quantity,
          cutQuantity: state.cutFilled,
          isCut: false,
          entry: entry,
          breakEven: breakEven,
          stoploss: stoploss,
          cutPosition: cut,
          takeProfit: takeProfit,
          higherProfit: higherProfit,
          MaxProfit: MaxProfit
        })
        return resolve(returnString);
      }

      state.position = state.stoppedOut ? await closePosition(symbol, quantity, account_id) : await cutPosition(symbol, quantity, account_id);
      state.newPosition = JSON.parse(state.position);
      state.cutFilled = await isPositionFilled(symbol, account_id);
      returnString = state.stoppedOut ? 'Stopped out' : JSON.stringify({
        position: state.newPosition,
        purchasedQuantity: quantity,
        cutQuantity: state.cutFilled,
        isCut: true,
        entry: entry,
        breakEven: breakEven,
        stoploss: stoploss,
        cutPosition: cut,
        takeProfit: takeProfit,
        higherProfit: higherProfit,
        MaxProfit: MaxProfit
      });
      return resolve(returnString);
    };
  });
}

export async function waitToSignalClosePosition(
  cut_position_result: string,
  order: string,
  account_id: string
): Promise<string> {
  const cutPositionResult: CutPositionSignal = JSON.parse(cut_position_result);
  const openPositonSignal: OpenPositionSignal = JSON.parse(order);
  const symbol = await getOptionSymbol(order);
  const quantity = await isPositionFilled(symbol, account_id);
  const cutQuantity = cutPositionResult.isCut ? cutPositionResult.purchasedQuantity - quantity : cutPositionResult.purchasedQuantity;
  const initialState: SignalClosePositionState = {
    cutPositionResult: cutPositionResult,
    openPositonSignal: openPositonSignal,
    principles: null,
    callOrPut: cutPositionResult.callOrPut,
    position: '',
    newPosition: '',
    closeFilled: 0,
    remainingQuantity: cutQuantity,
    passedOriginalTakeProfit: false,
    passedSecondTakeProfit: false,
  }

  const state: SignalClosePositionState = {...initialState};
  let client: WebSocket | null = null;

  try {
    state.principles = await getUserPrinciples(symbol);
  } catch (error) {
    throw new Error(error.message);
  }

  const wsUrl = `wss://${state.principles.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  const loginRequest = state.principles.loginRequest;
  const chartRequest = state.principles.chartRequest;

  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    };

    client.onopen = function () {
      if (getMarketClose()) {
        client?.close();
      } else {
        client?.send(JSON.stringify(loginRequest));
      }
    };

    client.onmessage = function (event) {
      if (getMarketClose()) {
        client?.close();
      } else {
        const data = JSON.parse(event.data as string);
  
        if (data.response && data.response[0].command === 'LOGIN') {
          client?.send(JSON.stringify(chartRequest));
        } else if (data.data) {
          console.log('Close Data Data: ', data.data);
          const content: Chart = data.data[0].content[0];
          const price = content["4"];

          if (state.callOrPut === 'CALL') {
            console.log('Close Demand Data Data Content', data.data[0].content);
            
            if (price >= state.cutPositionResult.takeProfit && !state.passedOriginalTakeProfit) {
              state.cutPositionResult.stoploss = state.cutPositionResult.cutPosition;
              state.cutPositionResult.takeProfit = state.cutPositionResult.higherProfit;
              state.passedOriginalTakeProfit = true;
            } else if (price >= state.cutPositionResult.takeProfit && state.passedOriginalTakeProfit) {
              state.cutPositionResult.stoploss = state.cutPositionResult.takeProfit;
              state.cutPositionResult.takeProfit = state.cutPositionResult.MaxProfit;
              state.passedSecondTakeProfit = true;
            } else if (price >= state.cutPositionResult.takeProfit && state.passedSecondTakeProfit) {
              state.cutPositionResult.stoploss = state.cutPositionResult.higherProfit;
            }
  
            if (price >= state.cutPositionResult.takeProfit && state.passedSecondTakeProfit) {
              console.log(`Demand price hit ${price}, so we're taking profits!`);
              client?.close();
            } 
            
            if (price <= state.cutPositionResult.stoploss) {
              console.log(`Demand price hit ${price}, so we stopped out!`);
              client?.close();
            }

          } else if (state.callOrPut === 'PUT') {
            console.log('Close Supply Data Data Content', data.data[0].content);
            
            if (price <= state.cutPositionResult.takeProfit && !state.passedOriginalTakeProfit) {
              state.cutPositionResult.stoploss = state.cutPositionResult.cutPosition;
              state.cutPositionResult.takeProfit = state.cutPositionResult.higherProfit;
              state.passedOriginalTakeProfit = true;
            } else if (price <= state.cutPositionResult.takeProfit && state.passedOriginalTakeProfit) {
              state.cutPositionResult.stoploss = state.cutPositionResult.takeProfit;
              state.cutPositionResult.takeProfit = state.cutPositionResult.MaxProfit;
              state.passedSecondTakeProfit = true;
            } else if (price <= state.cutPositionResult.takeProfit && state.passedSecondTakeProfit) {
              state.cutPositionResult.stoploss = state.cutPositionResult.higherProfit;
            }
  
            if (price <= state.cutPositionResult.takeProfit && state.passedSecondTakeProfit) {
              console.log(`Supply price hit ${price}, so we're taking profits!`);
              client?.close();
            } 
            
            if (price >= state.cutPositionResult.stoploss) {
              console.log(`Supply price hit ${price}, so we stopped out!`);
              client?.close();
            }
          }
        }
      }
    };
  }

  openClient();

  return new Promise((resolve) => {
    client.onclose = async function () {
      state.position = await closePosition(symbol, state.remainingQuantity, account_id);
      state.closeFilled = await isPositionFilled(symbol, account_id);
      state.remainingQuantity =state.remainingQuantity - state.closeFilled;

      while (state.remainingQuantity !== 0) {
        state.closeFilled = await isPositionFilled(symbol, account_id);
        state.remainingQuantity = state.remainingQuantity - state.closeFilled;
      }

      return resolve('position fully closed!');
    };
  });
}
