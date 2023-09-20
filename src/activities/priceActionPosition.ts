require('module-alias/register');
import { WebSocket } from "ws";
import { Context } from "@temporalio/activity";
import * as dotenv from "dotenv";
import { CurrentPriceData } from "@src/interfaces/currentPriceData";
import { Zone } from "@src/interfaces/supplyDemandZones";
import { SignalClosePositionState, SignalCutPositionState, SignalOpenPositionState } from "@src/interfaces/state";
import { OpenPositionSignal, CutPositionSignal } from "@src/interfaces/positionSignals";
import { PrinciplesAndParams } from "@src/interfaces/UserPrinciples";
import { SocketResponse, Chart, Quote } from "@src/interfaces/websocketEvent";

import {
  findZones,
  getAverage,
  getMarketClose,
  getOptionsSelection,
  getOptionSymbol,
  isOrderVelocityIncreasing,
  isPositionFilled,
  timeUntilMarketOpen,
} from "./utilities";
import { closePosition, cutPosition, openPosition, processChartData, processTimeSalesData } from "./helpers";
import { getUserPrinciples } from "./api_request";
import { OptionsSelection } from "@src/interfaces/optionsSelection";
import { OrderDetails } from "@src/interfaces/orders";
import { PositionSetup } from "@src/interfaces/positionSetup";
import { FixedSizeQueue } from "./utilities/classes";
import { DeltaMetrics } from "@src/interfaces/delta";

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

export async function getPremarketData(symbol: string): Promise<string> {
  let principles: PrinciplesAndParams;
  let loggedIn = false;
  const prices = [];
  let client: WebSocket | null = null;

  try {
      principles = await getUserPrinciples(symbol);
  } catch (error) {
      throw new Error(error.message);
  }

  const wsUrl = `wss://${principles.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  const loginRequest = principles.loginRequest;
  const chartRequest = principles.chartRequest;

  return new Promise((resolve, reject) => {
      function openClient() {
          client = new WebSocket(wsUrl);

          client.onerror = function (err) {
              reject(`WebSocket error: ${err.message}`);
          };

          client.onopen = async function () {
              const timeLeft = await timeUntilMarketOpen();
              if (typeof timeLeft === "string") {
                  client?.close();
                  resolve(timeLeft);
              } else {
                  client?.send(JSON.stringify(loginRequest));
              }
          };

          client.onmessage = async function (event) {
              const timeLeft = await timeUntilMarketOpen();

              if (typeof timeLeft === 'number' && timeLeft <= 0 || typeof timeLeft === "string") {
                  client?.close();
              } else if (loggedIn) {
                  client?.send(JSON.stringify(chartRequest));
                  loggedIn = false;
              } else {
                  const data = JSON.parse(event.data as string);

                  if (data.response && data.response[0].command === 'LOGIN') {
                      loggedIn = true;
                  } else if (data.data !== undefined) {
                      const content = data.data[0].content[0];
                      prices.push(content['1'], content['2'], content['3'], content['4']);
                  }
              }
          };

          client.onclose = function () {
              client = null;
              resolve(JSON.stringify(prices));
          };
      }

      openClient();
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
  let loggedIn = false;
  const currentPriceData = {
    closePrice,
    demandZone: [],
    supplyZone: [],
  };
  let messageCount = 0;
  const messages: SocketResponse[] = [];
  let client: WebSocket | null = null;

  try {
    principles = await getUserPrinciples(symbol);
  } catch (error) {
    throw new Error(error.message);
  }

  const wsUrl = `wss://${principles.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
  const loginRequest = principles.loginRequest;
  const marketRequest= principles.marketRequest;

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
        if (loggedIn) {
          client?.send(JSON.stringify(marketRequest));
          loggedIn = false;
        }
  
        const data = JSON.parse(event.data as string);
  
        if (data.response && data.response[0].command === 'LOGIN') {
          loggedIn = true;
        } else if (data.data !== undefined) {
          messages.push(data.data[0].content[0]);
          messageCount = messages.length;

          if (messageCount >= 1) {
            client?.close();
          }
        }
      }
    };
  }

  openClient();

  return await new Promise((resolve) => {
    if (client) {
      client.onclose = async function () {
        client.terminate();
        client = null;

        if (getMarketClose()) {
          return resolve('Market is currently closed!');
        }

        console.log('messages', messages);

        if (messages.length == 0) {
          return resolve('There are no demand or supply zones!');
        }

        closePrice = messages[0]['3'];

        const zones = await findZones(closePrice, supplyZones, demandZones);

        const demandZone = zones.demandZones;
        const supplyZone = zones.supplyZones;

        if (demandZone?.length >= 1 && supplyZone?.length >= 1) {
          currentPriceData.closePrice = closePrice;
          currentPriceData.demandZone = demandZone;
          currentPriceData.supplyZone = supplyZone;
          return resolve(JSON.stringify(currentPriceData));
        } else if (demandZone?.length >= 1) {
          currentPriceData.closePrice = closePrice;
          currentPriceData.demandZone = demandZone;
          return resolve(JSON.stringify(currentPriceData));
        } else if (supplyZone?.length >= 1) {
          currentPriceData.closePrice = closePrice;
          currentPriceData.supplyZone = supplyZone;
          return resolve(JSON.stringify(currentPriceData));
        } else {
          return resolve('There are no demand or supply zones!');
        }
      };
    }
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
    position.supply.primary.targetedEntry = supplyZone[0].top;
    position.supply.primary.reversalEntry = supplyZone[0].bottom;
  }

  if (supplyZone.length > 1) {
    position.supply.secondary.targetedEntry = supplyZone[1].top;
    position.supply.secondary.reversalEntry = supplyZone[1].bottom;
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
    loggedIn: false,
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
    orderVelocityArray: new FixedSizeQueue<number>(7),
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
      now = new Date();
      orderVelocityNow = now;

      utcTime = now.toUTCString().slice(17,22);

      orderVelocityNow.setSeconds(orderVelocityNow.getSeconds() + orderVelocityTimerDuration);
      orderVelocityTime = orderVelocityNow.toUTCString().slice(17,25);

      if (getMarketClose()) {
        state.noGoodBuys = true;
        client?.close();
      } else {
        if (state.loggedIn) {
          client?.send(JSON.stringify(timeSalesRequest));
          client?.send(JSON.stringify(chartRequest));
          client?.send(JSON.stringify(marketRequest));
          state.loggedIn = false;
        }

        const data = JSON.parse(event.data as string);

        if (data.response && data.response[0].command === "LOGIN") {
          state.loggedIn = true;
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

            const content: Chart = data.data[0].content[0];
            const updatedState = processChartData(content, state);

            state = updatedState;
          }

          if (service === "TIMESALE_EQUITY") {
            state.orderVelocity ++
            const content:SocketResponse["content"] = data.data[0].content;

            state = processTimeSalesData(content, state, utcTime);

            // Todo: Figure out how to use the delta footprint to confirm entry.
            //       This can be done by:
            //       1. Tracking the trend using delta, whether buyers are strong or sellers are strong
            //          over a certain period of time along with order velocity and supply and demand zones.
            //          If price is in a zone either supply or demand and as it approaches the entry level,
            //          the past couple deltas supports the price's direction by getting bigger and bigger
            //          and order velocity picks up to confirm the prices movement.
            //       2. Using delta and order velocity to spot reversals, this can be done using key levels and
            //          supply and demand zones as well. If price hits a key level whether its a previous/current
            //          day high/low or a supply/demand reversal level and denys it and the past couple deltas
            //          confirms that price is getting ready to reverse by getting smaller and smaller in terms
            //          of the dirction the opposite of the reversal and order velocity and delta starts to pick 
            //          up in the direction of the reversal.

            //      ## Breakdown

            //      1. The code establishes a WebSocket connection to stream market data.
            //      2. This market data is processed in the `onmessage` event, which appears to involve order velocity and delta calculation.
            //      3. The `processTimeSalesData` function computes additional metrics from the received time-sales data, such as deltas, demand/supply metrics, etc.
            //      4. The `getDeltaFootprint` function computes a so-called "delta footprint" for each price level based on the time-sales data, which calculates the buy and sell volume deltas.

            //      ## Strategy

            //      ### 1. Track Trend

            //      To determine if buyers or sellers are in control, one must look at the "delta" over a certain period. A positive delta means more buying, and a negative delta indicates more selling. Alongside, if the velocity of orders is increasing, it suggests strong market interest in the direction of the trend.

            //      **Approach**:
            //      - Look at the running average of delta over a given period, say the last 10 or 20 deltas (or any suitable period). 
            //      - If this average is consistently positive, it indicates a trend upwards. If consistently negative, it indicates a trend downwards.
            //      - Simultaneously, look at the order velocity. If it's increasing and aligns with the trend direction, it provides confirmation.

            //      This information can be combined with supply and demand zones. For instance:
            //      - If the price is in a demand zone, and both delta and order velocity indicate strong buying, it's a positive confirmation.
            //      - If the price is in a supply zone, and both delta and order velocity indicate strong selling, it's a negative confirmation.

            //      ### 2. Spot Reversals

            //      For reversals, deltas getting smaller and smaller suggest that the prevailing trend (be it up or down) is weakening.

            //      **Approach**:
            //      - Keep an array or buffer of recent deltas.
            //      - If you observe that the absolute values of the deltas are reducing over a given period (suggesting weakening momentum) and they then start increasing in the opposite direction, it might be an indication of a trend reversal.
            //      - Combine this with order velocity. If, at key reversal levels, you see delta change direction and order velocity pick up in that opposite direction, that's another confirmation of a potential reversal.

            //      Incorporating supply/demand zones:
            //      - If the price hits a supply zone, and the deltas are getting smaller (indicating less buying or even increased selling) followed by a shift in the delta and order velocity indicating selling, it's a potential reversal to the downside.
            //      - Similarly, if the price is at a demand zone, and the deltas are getting smaller (indicating less selling or more buying) followed by a shift in delta and order velocity indicating buying, it's a potential reversal to the upside.

            //      ## Implementation

            //      Given the existing codebase, you would need to extend or modify certain sections to achieve the above:

            //      1. **Tracking Trend**:
            //          - Maintain a buffer of recent deltas and compute their running average.
            //          - Similarly, track the order velocity over the same duration.
            //          - Use these to check for the trend and confirm it with supply/demand zones.

            //      2. **Spot Reversals**:
            //          - Maintain a buffer of recent deltas to observe if the trend is weakening.
            //          - If a weakening trend is spotted, look for deltas in the opposite direction and increasing order velocity for confirmation.
            //          - Use supply/demand zones for additional confirmation.
  
            if (state.demandForming >= 30 || content[content.length - 1]["2"] > state.vwap) { // in a demand zone
              if (state.marketTrend === 'uptrend' && isOrderVelocityIncreasing(state.orderVelocityArray)) {
                console.log('Open Demand confirmed due to uptrend and increasing order velocity.');
                state.demandConfirmation = true;
              }
            } else if (state.demandReversalForming >= 30 || content[content.length - 1]["2"] < state.vwap) { // in a demand zone reversal
              if (state.marketTrend === 'downtrend' && isOrderVelocityIncreasing(state.orderVelocityArray) || state.marketTrend === 'potential pullback in downtrend' && isOrderVelocityIncreasing(state.orderVelocityArray)) {
                console.log('Potential reversal to the downside detected.');
                state.demandReversalConfirmation = true;
              }
            } else if (state.supplyForming >= 30 || content[content.length - 1]["2"] < state.vwap) { // in a supply zone
              if (state.marketTrend === 'downtrend' && isOrderVelocityIncreasing(state.orderVelocityArray)) {
                console.log('Open Supply confirmed due to downtrend and increasing order velocity.');
                state.supplyConfirmation = true;
              }
            } else if (state.supplyReversalForming >= 30 || content[content.length - 1]["2"] > state.vwap) { // in a supply zone reversal
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

  // return await new Promise((resolve) => {
  //   if (client) {
  //     client.onclose = async function () {
  //       client.terminate();
  //       client = null;
  //     }
  //   }
  // })

  return await new Promise((resolve) => {
    if (client) {
      client.onclose = async function () {
        client.terminate();
        client = null;

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
            breakEven = Math.round(entry + commissionIncludedPrice * 100) / 100;
            stoploss = Math.round((breakEven + (0.10 * commissionIncludedPrice)) * 100) / 100;
            cutPosition = Math.round((breakEven - (0.14 * commissionIncludedPrice)) * 100) / 100;
            takeProfit = Math.round((breakEven  - (0.21 * commissionIncludedPrice)) * 100) / 100;
            higherProfit = Math.round((breakEven  - (0.28 * commissionIncludedPrice)) * 100) / 100;
            MaxProfit = Math.round((breakEven  - (0.35 * commissionIncludedPrice)) * 100) / 100;
          } 
          
          if (state.callOrPut === 'CALL') {
            breakEven = Math.round((entry - commissionIncludedPrice) * 100) / 100;
            stoploss = Math.round((breakEven - (0.10 * commissionIncludedPrice)) * 100) / 100;
            cutPosition = Math.round((breakEven + (0.14 * commissionIncludedPrice)) * 100) / 100;
            takeProfit = Math.round((breakEven  + (0.21 * commissionIncludedPrice)) * 100) / 100;
            higherProfit = Math.round((breakEven  + (0.28 * commissionIncludedPrice)) * 100) / 100;
            MaxProfit = Math.round((breakEven  + (0.35 * commissionIncludedPrice)) * 100) / 100;
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
    }
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
    loggedIn: false,
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
  const marketRequest = state.principles.marketRequest;


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
        if (state.loggedIn) {
          client.send(JSON.stringify(marketRequest));
          state.loggedIn = false;
        }

        const data = JSON.parse(event.data as string);

        if (data.response && data.response[0].command === "LOGIN") {
          state.loggedIn = true;
        } else if (data.data) {
          console.log('Cut Data Data: ', data.data);
          const content: Quote = data.data[0].content[0];
          const price = content["3"];

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
    if (client) {
      client.onclose = async function () {
        client.terminate();
        client = null;
  
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
    }
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
    loggedIn: false,
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
  const marketRequest = state.principles.marketRequest;

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
        if (state.loggedIn) {
          client?.send(JSON.stringify(marketRequest));
          state.loggedIn = false;
        }
  
        const data = JSON.parse(event.data as string);
  
        if (data.response && data.response[0].command === 'LOGIN') {
          state.loggedIn = true;
        } else if (data.data) {
          console.log('Close Data Data: ', data.data);
          const price = data.data[0].content[0]['3'];

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

  return await new Promise((resolve) => {
    if (client) {
      client.onclose = async function () {
        client.terminate();
        client = null;

        state.position = await closePosition(symbol, state.remainingQuantity, account_id);
        state.closeFilled = await isPositionFilled(symbol, account_id);
        state.remainingQuantity =state.remainingQuantity - state.closeFilled;

        while (state.remainingQuantity !== 0) {
          state.closeFilled = await isPositionFilled(symbol, account_id);
          state.remainingQuantity = state.remainingQuantity - state.closeFilled;
        }

        return resolve('position fully closed!');
      };
    }
  });
}
