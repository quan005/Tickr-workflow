import { WebSocket } from "ws";
import { ApplicationFailure, Context } from "@temporalio/activity";
import * as https from "https";
import * as dotenv from "dotenv";
import { tdCredentialsToString } from "../tda/middleware/tdCredentialToString";
import { CurrentPriceData } from "../interfaces/currentPriceData";
import { SurroundingKeyLevels } from "../interfaces/surroundingKeyLevels";
import { SupplyZone, DemandZone } from "../interfaces/supplyDemandZones";
import { PositionSetup } from "../interfaces/positionSetup";
import { OptionsSelection } from "../interfaces/optionsSelection";
import { OpenPositionSignal, CutPositionSignal } from "../interfaces/positionSignals";
import { UserPrinciples, PrinciplesAndParams } from "../interfaces/UserPrinciples";
import {
  GetOrderResponse,
  OrdersConfig,
  OrderDetails,
  AssetType,
  ComplexOrderStrategyType,
  DurationType,
  InstructionType,
  OrderLegType,
  OrderStrategyType,
  OrderType,
  PlaceOrdersResponse,
  PutCall,
  SessionType,
} from "../interfaces/orders";
import { Account } from "../interfaces/account";
import { ContractType, OptionChainConfig, OptionChainResponse, OptionDetails, OptionMap, QuoteOptionMap, RangeType } from "../interfaces/optionChain";
import { SocketResponse } from "../interfaces/websocketEvent";
import * as moment from "moment-timezone";
import Holidays, * as holidays from "date-holidays";

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



export async function timeUntilMarketOpen(is_holiday: boolean): Promise<number | string> {
  Context.current().heartbeat(JSON.stringify(is_holiday));

  if (is_holiday) {
    return 'Market is Currently closed!';
  }

  const marketOpen = moment().tz('America/New_York').set('hour', 10).set('minute', 10);
  const now = moment().tz('America/New_York');
  const diff = moment.duration(marketOpen.diff(now));

  const hoursRemaining = diff.hours();
  const hoursToMilliSeconds = ((hoursRemaining * 60) * 60) * 1000;

  const minutesRemaining = diff.minutes();
  const minutesToMilliSeconds = (minutesRemaining * 60) * 1000;

  let total = hoursToMilliSeconds + minutesToMilliSeconds;
  Context.current().heartbeat(total);

  if (total < 0) {
    total = 0
  }

  return total
}

export async function isHoliday(): Promise<boolean> {
  const today = moment().tz('America/New_York').format('MM-DD');
  if (today === '04-07' || today === '05-29' || today === '06-19' || today === '07-03' || today === '07-04') {
    return true
  }
  const hd = new (holidays as any)('US', { types: ['bank', 'public'] }) as Holidays;
  const date = new Date();
  const holiday = hd.isHoliday(date) === false ? false : true;
  Context.current().heartbeat(JSON.stringify(holiday));
  return holiday;
}

function isMarketClosed(
  day: string, 
  isHoliday: boolean
): boolean {
  const dateTime = moment().tz('America/New_York');
  const marketClose = parseInt(dateTime.format('Hmm'));

  return marketClose >= 1600 || day === 'Saturday' || day === 'Sunday' || isHoliday;
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

export async function isDemandZone(
  currentPrice: number, 
  demandZones: DemandZone[]
): Promise<number[][] | null> {
  for (let i = 0; i < demandZones.length; i++) {
    const { bottom, top } = demandZones[i];
    if (currentPrice > bottom && currentPrice < top) {
      return [[bottom, top]];
    }
  }
  return null;
}

export async function findDemandZone(
  currentPrice: number, 
  demandZones: DemandZone[]
): Promise<number[][] | null> {
  const demandZone = await isDemandZone(currentPrice, demandZones);

  if (demandZone !== null) {
    return demandZone;
  } else {
    const surroundingZones: number[][] = [];
    for (let i = 0; i < demandZones.length - 1; i++) {
      const { bottom, top } = demandZones[i];
      const { bottom: nextBottom, top: nextTop } = demandZones[i + 1];
      if (currentPrice < top && currentPrice > nextBottom) {
        surroundingZones.push([bottom, top], [nextBottom, nextTop]);
        return surroundingZones;
      }
    }
    return null;
  }
}

export async function isSupplyZone(
  currentPrice: number, 
  supplyZones: SupplyZone[]
): Promise<number[][] | null> {
  for (let i = 0; i < supplyZones.length; i++) {
    const { bottom, top } = supplyZones[i];
    if (currentPrice < top && currentPrice > bottom) {
      return [[top, bottom]];
    }
  }
  return null;
}

export async function findSupplyZone(
  currentPrice: number, 
  supplyZones: SupplyZone[]
): Promise<number[][] | null> {
  const supplyZone = await isSupplyZone(currentPrice, supplyZones);

  if (supplyZone !== null) {
    return supplyZone;
  } else {
    const surroundingZones: number[][] = [];
    for (let i = 0; i < supplyZones.length - 1; i++) {
      const { top, bottom } = supplyZones[i];
      const { top: nextTop, bottom: nextBottom } = supplyZones[i + 1];
      if (currentPrice < top && currentPrice > nextBottom) {
        surroundingZones.push([top, bottom], [nextTop, nextBottom]);
        return surroundingZones;
      }
    }
    return null;
  }
}

export async function getCurrentPrice(
  wsUrl: string,
  loginRequest: object,
  marketRequest: object,
  demandZones: DemandZone[],
  supplyZones: SupplyZone[],
  isHoliday: boolean
): Promise<string> {
  let closePrice = 0;
  let loggedIn = false;
  const currentPriceData = {
    closePrice,
    demandZone: [],
    supplyZone: [],
  };
  const dateTime = moment().tz('America/New_York');
  const day = dateTime.format('dddd');
  let messageCount = 0;
  const messages: SocketResponse[] = [];

  let client: WebSocket | null = null;

  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    };

    client.onopen = function () {
      if (isMarketClosed(day, isHoliday)) {
        client?.close();
      } else {
        client?.send(JSON.stringify(loginRequest));
      }
    };

    client.onmessage = function (event) {
      if (isMarketClosed(day, isHoliday) || messageCount >= 1) {
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
          console.log('message added');
          messages.push(data.data[0].content[0]);
          messageCount = messages.length;
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

        if (isMarketClosed(day, isHoliday)) {
          return resolve('Market is currently closed!');
        }

        closePrice = messages[0]['3'];

        const demandZone = await findDemandZone(closePrice, demandZones);
        const supplyZone = await findSupplyZone(closePrice, supplyZones);

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
  surroundingKeyLevels: string,
  currentPrice: string
): Promise<string> {
  const newSurroundingKeyLevels: SurroundingKeyLevels = JSON.parse(surroundingKeyLevels);
  const newCurrentPrice: CurrentPriceData = JSON.parse(currentPrice);
  const demandZone = newCurrentPrice.demandZone || [];
  const supplyZone = newCurrentPrice.supplyZone || [];

  if (demandZone.length > 0 && supplyZone.length > 0) {
    if (newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.support !== null) {
      if (newSurroundingKeyLevels.aboveResistance && newSurroundingKeyLevels.belowSupport) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.belowSupport * 100) / 100,
          },
        });
      } else if (newSurroundingKeyLevels.aboveResistance) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
        });
      } else if (newSurroundingKeyLevels.belowSupport) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.belowSupport * 100) / 100,
          },
        });
      } else {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
        });
      }
    } else if (newSurroundingKeyLevels.resistance === null && newSurroundingKeyLevels.support !== null) {
      if (newSurroundingKeyLevels.belowSupport) {
        return JSON.stringify({
          demand: null,
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.belowSupport * 100) / 100,
          },
        });
      } else {
        return JSON.stringify({
          demand: null,
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
        });
      }
    } else if (newSurroundingKeyLevels.support === null && newSurroundingKeyLevels.resistance !== null) {
      if (newSurroundingKeyLevels.aboveResistance) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: null,
        });
      } else {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: null,
        });
      }
    } else {
      return 'There are no good position setups!';
    }
  } else if (demandZone.length > 0) {
    if (newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.support !== null) {
      if (newSurroundingKeyLevels.aboveResistance && newSurroundingKeyLevels.belowSupport) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.belowSupport * 100) / 100,
          },
        });
      } else if (newSurroundingKeyLevels.aboveResistance) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
        });
      } else if (newSurroundingKeyLevels.belowSupport) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.belowSupport * 100) / 100,
          },
        });
      } else {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
        });
      }
    } else if (newSurroundingKeyLevels.support === null && newSurroundingKeyLevels.resistance !== null) {
      if (newSurroundingKeyLevels.aboveResistance) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: null,
        });
      } else {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: null,
        });
      }
    } else {
      return 'There are no good position setups!';
    }
  } else if (supplyZone.length > 0) {
    if (newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.support !== null) {
      if (newSurroundingKeyLevels.aboveResistance && newSurroundingKeyLevels.belowSupport) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.belowSupport * 100) / 100,
          },
        });
      } else if (newSurroundingKeyLevels.aboveResistance) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
        });
      } else if (newSurroundingKeyLevels.belowSupport) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.belowSupport * 100) / 100,
          },
        });
      } else {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: {
            entry: Math.round(newSurroundingKeyLevels.support * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
        });
      }
    } else if (newSurroundingKeyLevels.support === null && newSurroundingKeyLevels.resistance !== null) {
      if (newSurroundingKeyLevels.aboveResistance) {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: Math.round(newSurroundingKeyLevels.aboveResistance * 100) / 100,
          },
          supply: null,
        });
      } else {
        return JSON.stringify({
          demand: {
            entry: Math.round(newSurroundingKeyLevels.resistance * 100) / 100,
            stopLoss: 0,
            breakEven: 0,
            takeProfit: 0,
            cutPosition: 0,
            higherProfit: 0,
          },
          supply: null,
        });
      }
    } else {
      return 'There are no good position setups!';
    }
  } else {
    return 'There are no good position setups!';
  }
}

export function filterOptionResponse(optionMap: OptionMap, optionType: string, budget: number): OptionDetails | null {
  const optionsArray: OptionDetails[] = [];

  for (const option in optionMap) {
    console.log('option', option);
    Context.current().heartbeat(JSON.stringify('this is the option'));

    if (optionType === "CALL" && optionMap[option][0].delta > 0.5 && optionMap[option][0].delta < 0.8 && optionMap[option][0].ask * 100 <= budget) {
      optionsArray.push(optionMap[option][0]);
    }

    if (optionType === "PUT" && optionMap[option][0].delta < -0.7 && optionMap[option][0].delta > -0.95 && optionMap[option][0].ask * 100 <= budget) {
      optionsArray.push(optionMap[option][0]);
    }
  }

  console.log('optionsArray', optionsArray);

  optionsArray.sort((a, b) => (a.ask > b.ask) ? 1 : -1);
  Context.current().heartbeat(JSON.stringify('got the option array'));

  if (optionsArray.length > 2) {
    console.log(`option selected [${optionsArray.length - 1}]`, optionsArray[optionsArray.length - 1]);
    return optionsArray[2];
  } else if (optionsArray.length === 2) {
    console.log('option selected [1]', optionsArray[1]);
    return optionsArray[1];
  } else if (optionsArray.length === 1) {
    console.log('option selected [0]', optionsArray[0]);
    return optionsArray[0];
  }

  return null;
}

export async function getOptionChain(access_token: string, option_chain_config: OptionChainConfig): Promise<OptionChainResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = '';

  return await new Promise((resolve) => {
    const postData = { token: encodedtoken, optionChainConfig: option_chain_config };
    const postDataAsString = JSON.stringify(postData);
    Context.current().heartbeat(postDataAsString);

    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/td-option-chain',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postDataAsString)
      },
      rejectUnauthorized: false,
      timeout: 10000
    };

    const response = https.request(authOptions, (resp) => {
      resp.on('data', (chunk) => {
        data += chunk;
        console.log('option data', data);
      });

      resp.on('end', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson);
        console.log('option dataObject', dataObject);
        Context.current().heartbeat(JSON.stringify('dataObject'));
        return resolve(dataObject);
      });
    }).on('error', (e) => {
      throw new Error(e.message);
    });

    response.on('timeout', () => {
      throw new Error('Connection timed out');
    });

    response.write(postDataAsString);
    Context.current().heartbeat(JSON.stringify("response in motion"));
    response.end();
  });
}

export async function getOptionsSelection(position_setup: string, symbol: string, access_token: string, budget: number): Promise<string> {
  let callOptionResponse: OptionChainResponse | null = null;
  let putOptionResponse: OptionChainResponse | null = null;
  Context.current().heartbeat(JSON.stringify("getting option chain"));

  const friday = moment().add((5 - moment().isoWeekday()), 'day').format('MM-DD');
  let holiday: boolean;

  if (friday === '04-07' || friday === '05-29' || friday === '06-19' || friday === '07-03' || friday === '07-04' || friday === '09-04') {
    holiday = true;
  }

  const endOfWeek = holiday ? 4 : 5;
  const toDate = moment().add((endOfWeek - moment().isoWeekday()), 'day').format('YYYY-MM-DD');
  const fromDate = moment().format('YYYY-MM-DD');
  const numberOfDaysAway = moment().isoWeekday() !== endOfWeek ? (endOfWeek - moment().isoWeekday()) : 0;
  const optionString = `${toDate}:${numberOfDaysAway}`;

  console.log('endOfWeek', endOfWeek);
  console.log('optionString', optionString);

  const newPositionSetup: PositionSetup = JSON.parse(position_setup);

  if (newPositionSetup.demand !== null) {
    callOptionResponse = await getOptionChain(access_token, { symbol: symbol, contractType: ContractType.CALL, range: RangeType.ITM, fromDate: fromDate, toDate: toDate, strikeCount: 20 });
  }

  if (newPositionSetup.supply !== null) {
    putOptionResponse = await getOptionChain(access_token, { symbol: symbol, contractType: ContractType.PUT, range: RangeType.ITM, fromDate: fromDate, toDate: toDate, strikeCount: 20 });
  }

  Context.current().heartbeat(JSON.stringify("received options"));

  if (callOptionResponse !== null && putOptionResponse !== null) {
    const call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL", budget);
    const put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT", budget);

    if (call && put) {
      return JSON.stringify({
        CALL: {
          symbol: call.symbol,
          description: call.description,
          multiplier: call.multiplier,
          bid: call.bid,
          ask: call.ask,
          mark: call.mark,
          totalVolume: call.totalVolume,
          delta: call.delta,
          gamma: call.gamma,
          theta: call.theta,
          vega: call.vega,
          rho: call.rho,
          strikePrice: call.strikePrice
        },
        PUT: {
          symbol: put.symbol,
          description: put.description,
          multiplier: put.multiplier,
          bid: put.bid,
          ask: put.ask,
          mark: put.mark,
          totalVolume: put.totalVolume,
          delta: put.delta,
          gamma: put.gamma,
          theta: put.theta,
          vega: put.vega,
          rho: put.rho,
          strikePrice: put.strikePrice
        }
      });
    } else if (call) {
      return JSON.stringify({
        CALL: {
          symbol: call.symbol,
          description: call.description,
          multiplier: call.multiplier,
          bid: call.bid,
          ask: call.ask,
          mark: call.mark,
          totalVolume: call.totalVolume,
          delta: call.delta,
          gamma: call.gamma,
          theta: call.theta,
          vega: call.vega,
          rho: call.rho,
          strikePrice: call.strikePrice
        },
        PUT: null
      });
    } else if (put) {
      return JSON.stringify({
        CALL: null,
        PUT: {
          symbol: put.symbol,
          description: put.description,
          multiplier: put.multiplier,
          bid: put.bid,
          ask: put.ask,
          mark: put.mark,
          totalVolume: put.totalVolume,
          delta: put.delta,
          gamma: put.gamma,
          theta: put.theta,
          vega: put.vega,
          rho: put.rho,
          strikePrice: put.strikePrice
        }
      });
    } else {
      return 'There are no call or put options that meet the requirements!';
    }
  } else if (callOptionResponse !== null) {
    const call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL", budget);

    if (call === null) {
      return 'There are no call options that meet the requirements!';
    }

    return JSON.stringify({
      CALL: {
        symbol: call.symbol,
        description: call.description,
        multiplier: call.multiplier,
        bid: call.bid,
        ask: call.ask,
        mark: call.mark,
        totalVolume: call.totalVolume,
        delta: call.delta,
        gamma: call.gamma,
        theta: call.theta,
        vega: call.vega,
        rho: call.rho,
        strikePrice: call.strikePrice
      },
      PUT: null
    });
  } else if (putOptionResponse !== null) {
    const put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT", budget);

    if (put === null) {
      return 'There are no put options that meet the requirements!';
    }

    return JSON.stringify({
      CALL: null,
      PUT: {
        symbol: put.symbol,
        description: put.description,
        multiplier: put.multiplier,
        bid: put.bid,
        ask: put.ask,
        mark: put.mark,
        totalVolume: put.totalVolume,
        delta: put.delta,
        gamma: put.gamma,
        theta: put.theta,
        vega: put.vega,
        rho: put.rho,
        strikePrice: put.strikePrice
      }
    });
  } else {
    return 'Both call and put responses were null!';
  }
}

export async function getAccount(access_token: string, account_id: string): Promise<Account> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));

  const postData = {
    token: encodedtoken,
    accountId: account_id
  };

  const postDataAsString = JSON.stringify(postData);
  Context.current().heartbeat(postDataAsString);

  const authOptions = {
    host: process.env.API_HOSTNAME,
    path: '/api/td-account',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postDataAsString)
    },
    rejectUnauthorized: false,
    timeout: 10000
  };

  let data = '';

  return new Promise((resolve, reject) => {
    const request = https.request(authOptions, (response) => {
      response.on('data', (chunk) => {
        data += chunk;
        Context.current().heartbeat(JSON.stringify(data));
      });

      response.on('end', () => {
        try {
          const parseJson = JSON.parse(data);
          const dataObject = JSON.parse(parseJson);
          Context.current().heartbeat(JSON.stringify('dataObject'));
          resolve(dataObject);
        } catch (error) {
          reject(new Error('Error parsing response data'));
        }
      });
    });

    request.on('error', (e) => {
      reject(new Error(e.message));
    });

    request.on('timeout', () => {
      reject(new Error('Connection timed out'));
    });

    request.write(postDataAsString);
    Context.current().heartbeat(JSON.stringify('response in motion'));
    request.end();
  });
}

export async function checkAccountAvailableBalance(access_token: string, account_id: string): Promise<number> {
  const getAccountResponse: Account = await getAccount(access_token, account_id);
  Context.current().heartbeat(JSON.stringify('got account info'));

  const availableBalance = getAccountResponse.securitiesAccount.projectedBalances.cashAvailableForTrading;
  return availableBalance;
}

export async function getQuote(
  access_token: string,
  quote_symbol: string
): Promise<QuoteOptionMap> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = "";
  return await new Promise((resolve) => {
    const postData = { token: encodedtoken, quoteSymbol: quote_symbol };
    const postDataAsString = JSON.stringify(postData);
    Context.current().heartbeat(postDataAsString);
    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: "/api/td-quotes",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postDataAsString),
      },
      rejectUnauthorized: false,
      timeout: 10000,
    };
    const response = https.request(authOptions, (resp) => {
      resp.on("data", (chunk) => {
        data += chunk;
        Context.current().heartbeat(JSON.stringify(data));
      });
      resp.on("close", () => {
        console.log(data);
        const parseJson = JSON.parse(data);
        if (parseJson.error) {
          throw new Error(`Get order error: ${parseJson.error}`);
        }
        return resolve(parseJson);
      });
    }).on("error", (e) => {
      throw new Error(`Get quote error: ${e.message}`);
    });
    response.on("timeout", () => {
      throw new Error("Connection timed out");
    });
    response.write(postDataAsString);
    Context.current().heartbeat(JSON.stringify("response in motion"));
    response.end();
  });
}

export async function placeOrder(
  access_token: string,
  account_id: string,
  order_data: OrdersConfig
): Promise<PlaceOrdersResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = "";
  return await new Promise((resolve) => {
    const postData = {
      token: encodedtoken,
      accountId: account_id,
      orderData: order_data,
    };
    const postDataAsString = JSON.stringify(postData);
    Context.current().heartbeat(postDataAsString);
    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: "/api/td-place-order",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postDataAsString),
      },
      rejectUnauthorized: false,
      timeout: 10000,
    };
    const response = https.request(authOptions, (resp) => {
      resp.on("data", (chunk) => {
        data += chunk;
        console.log("place order data", data);
        Context.current().heartbeat(JSON.stringify(data));
      });
      resp.on("close", () => {
        const parseJson = JSON.parse(data);
        if (parseJson.error) {
          throw new Error("Place order error: order did not fill");
        }
        const dataObject = { orderSymbol: order_data.order.orderLegCollection[0].instrument.symbol };
        Context.current().heartbeat(JSON.stringify("dataObject"));
        return resolve(dataObject);
      });
    }).on("error", (e) => {
      throw new Error(`Place order error: ${e.message}`);
    });
    response.on("timeout", () => {
      throw new Error("Connection timed out");
    });
    response.write(postDataAsString);
    Context.current().heartbeat(JSON.stringify("response in motion"));
    response.end();
  });
}

export async function getOrder(
  access_token: string, 
  account_id: string, 
  order_symbol: string
): Promise<GetOrderResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = '';

  return await new Promise((resolve) => {
    const postData = {
      token: encodedtoken,
      accountId: account_id,
      orderSymbol: order_symbol,
    };

    const postDataAsString = JSON.stringify(postData);
    Context.current().heartbeat(postDataAsString);

    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/td-get-order',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postDataAsString),
      },
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const response = https.request(authOptions, (resp) => {
      resp.on('data', (chunk) => {
        data += chunk;
        Context.current().heartbeat(JSON.stringify(data));
      });

      resp.on('end', () => {
        const parseJson = JSON.parse(data);
        if (parseJson.error) {
          throw new Error(`Get order error: ${parseJson.error}`);
        }
        return resolve(parseJson);
      });
    }).on('error', (e) => {
      throw new Error(`Get order error: ${e.message}`);
    });

    response.on('timeout', () => {
      throw new Error('Connection timed out');
    });

    response.write(postDataAsString);
    Context.current().heartbeat(JSON.stringify("response in motion"));
    response.end();
  });
}

export async function checkIfPositionFilled(
  optionSymbol: string,
  account_id: string,
  access_token: string
): Promise<number> {
  const position = await getOrder(access_token, account_id, optionSymbol);
  if (position.status === "FILLED" && position.filledQuantity) {
    return position.filledQuantity;
  } else {
    return 0;
  }
}

export async function openPosition(
  options: OptionsSelection,
  optionType: string,
  budget: number,
  account_id: string,
  access_token: string
): Promise<string> {
  let price = 0;
  let optionPrice = 0;
  let quantity = 0;
  let symbol = '';
  let strikePrice = 0;

  Context.current().heartbeat(JSON.stringify('default option price'));

  if (optionType === 'CALL' && options.CALL !== null) {
    const { symbol: callSymbol, strikePrice: callStrikePrice } = options.CALL;
    symbol = callSymbol;
    strikePrice = callStrikePrice;
  } else if (optionType === 'PUT' && options.PUT !== null) {
    const { symbol: putSymbol, strikePrice: putStrikePrice } = options.PUT;
    symbol = putSymbol;
    strikePrice = putStrikePrice;
  } else {
    return 'There are no call or put options selected for purchase!';
  }

  const accountBalance = await checkAccountAvailableBalance(
    access_token,
    account_id
  );
  const quoteOptionMap = await getQuote(access_token, symbol);
  console.log('Opening Option Details', quoteOptionMap);
  const optionDetails = quoteOptionMap[symbol];
  optionPrice = optionDetails.askPrice;

  quantity = Math.floor(budget / (optionPrice * 100));
  price = Math.floor(optionPrice * 100 * quantity);

  if (accountBalance < price) {
    return 'Account balance is too low!';
  }

  const openPositionResponse = await placeOrder(access_token, account_id, {
    accountId: account_id,
    order: {
      orderType: OrderType.LIMIT,
      price: optionPrice,
      session: SessionType.NORMAL,
      duration: DurationType.FILL_OR_KILL,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: [
        {
          orderLegType: OrderLegType.OPTION,
          instruction: InstructionType.BUY_TO_OPEN,
          quantity,
          instrument: {
            assetType: AssetType.OPTION,
            symbol,
            putCall: optionType === 'CALL' ? PutCall.CALL : PutCall.PUT,
          },
        },
      ],
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  });

  Context.current().heartbeat(JSON.stringify('got option price'));

  if (openPositionResponse.error) {
    throw new Error(`Open position error: ${openPositionResponse.error}`);
  }

  Context.current().heartbeat(JSON.stringify('option price again'));

  return JSON.stringify({
    orderResponse: openPositionResponse,
    price: optionPrice,
    strikePrice,
    quantity,
    optionSymbol: symbol,
  });
}


export async function waitToSignalOpenPosition(
  wsUrl: string, 
  login_request: object,
  time_sales_request: object, 
  position_setup: string, 
  symbol: string, 
  budget: number, 
  account_id: string, 
  isHoliday: boolean
): Promise<string> {
  let demandTimeSalesEntryPercentage = 0;
  let metDemandEntryPrice = 0;
  let demandForming = 0;
  let demandSize = 0;
  let demandConfirmation = false;
  let supplyTimeSalesEntryPercentage = 0;
  let metSupplyEntryPrice = 0;
  let supplyForming = 0;
  let supplySize = 0;
  let supplyConfirmation = false;
  let position: OrderDetails | string;
  let noGoodBuys = false;
  let loggedIn = false;
  let demandOrSupply = '';
  let callOrPut = '';
  let dateTime = moment().tz('America/New_York');
  const day = dateTime.format('dddd');
  let newPositionSetup: PositionSetup = JSON.parse(position_setup);

  let client: WebSocket | null = null;

  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    };

    client.onopen = function () {
      if (isMarketClosed(day, isHoliday)) {
        noGoodBuys = true;
        client?.close();
      } else {
        client?.send(JSON.stringify(login_request));
      }
    };

    client.onmessage = function (event) {
      if (isMarketClosed(day, isHoliday)) {
        noGoodBuys = true;
        client?.close();
      } else {
        if (loggedIn) {
          client?.send(JSON.stringify(time_sales_request));
          loggedIn = false;
        }

        const data = JSON.parse(event.data as string);

        if (data.response && data.response[0].command === "LOGIN") {
          loggedIn = true;
        } else if (data.data) {
          console.log('Open Data Data: ', data.data);
          if (newPositionSetup.demand && newPositionSetup.supply) {
            for (let i = 0; i < data.data[0].content.length; i++) {
              const content = data.data[0].content[i];

              if (content["2"] >= newPositionSetup.demand.entry) {
                console.log('Open Demand Met');
                metDemandEntryPrice += 1;
                demandSize += content["3"];
              } else if (content["2"] <= newPositionSetup.supply.entry) {
                console.log('Open Supply Met');
                metSupplyEntryPrice += 1;
                supplySize += content["3"];
              }
            }

            demandTimeSalesEntryPercentage = metDemandEntryPrice / data.data[0].content.length;
            supplyTimeSalesEntryPercentage = metSupplyEntryPrice / data.data[0].content.length;

            if (demandTimeSalesEntryPercentage >= 0.9) {
              demandForming += 1;
            } else if (supplyTimeSalesEntryPercentage >= 0.9) {
              supplyForming += 1;
            }

            if (demandForming >= 50) {
              console.log('Open Demand confirmed');
              demandConfirmation = true;
            } else if (supplyForming >= 50) {
              console.log('Open Supply confirmed');
              supplyConfirmation = true;
            }

            if (demandConfirmation) {
              console.log('Opening a Call');
              callOrPut = 'CALL';
              demandOrSupply = 'DEMAND';
              client?.close();
            } else if (supplyConfirmation) {
              console.log('Opening a Put');
              callOrPut = 'PUT';
              demandOrSupply = 'SUPPLY';
              client?.close();
            }
          } else if (newPositionSetup.demand) {
            for (let i = 0; i < data.data[0].content.length; i++) {
              const content = data.data[0].content[i];

              if (content["2"] >= newPositionSetup.demand.entry) {
                metDemandEntryPrice += 1;
                demandSize += content["3"];
              }
            }

            demandTimeSalesEntryPercentage = metDemandEntryPrice / data.data[0].content.length;

            if (demandTimeSalesEntryPercentage >= 0.9) {
              demandForming += 1;
            }

            if (demandForming >= 50) {
              demandConfirmation = true;
            }

            if (demandConfirmation) {
              callOrPut = 'CALL';
              demandOrSupply = 'DEMAND';
              client?.close();
            }
          } else if (newPositionSetup.supply) {
            for (let i = 0; i < data.data[0].content.length; i++) {
              const content = data.data[0].content[i];

              if (content["2"] <= newPositionSetup.supply.entry && content["2"] > newPositionSetup.supply.cutPosition) {
                metSupplyEntryPrice += 1;
                supplySize += content["3"];
              }
            }

            supplyTimeSalesEntryPercentage = metSupplyEntryPrice / data.data[0].content.length;

            if (supplyTimeSalesEntryPercentage >= 0.9) {
              supplyForming += 1;
            }

            if (supplyForming >= 50) {
              supplyConfirmation = true;
            }

            if (supplyConfirmation) {
              callOrPut = 'PUT';
              demandOrSupply = 'SUPPLY';
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

        if (noGoodBuys) {
          return resolve('Could not find any good buying opportunities!');
        }
  
        const token = await getLoginCredentials();
        const optionSelection = await getOptionsSelection(position_setup, symbol, token, budget);
  
        if (
          optionSelection === "There are no call or put options that meet the requirements!" || 
          optionSelection === 'There are no call options that meet the requirements!' || 
          optionSelection === 'There are no put options that meet the requirements!' || 
          optionSelection === "Both call and put responses were null!"
        ) {
          return resolve(optionSelection);
        }
  
        const newOptions: OptionsSelection = JSON.parse(optionSelection);
        position = await openPosition(newOptions, callOrPut, budget, account_id, token);
  
        if (
          position === "Account balance is too low!" || 
          position === "There are no call or put options selected for purchase"
        ) {
          return resolve(position);
        } else {
          const newPosition: OrderDetails = JSON.parse(position);
          if (callOrPut === 'CALL') {
            newPositionSetup = {
              ...newPositionSetup,
              demand: {
                ...newPositionSetup.demand,
                stopLoss: Math.round((newPositionSetup.demand.entry - (0.10 * newPosition.price)) * 100) / 100,
                breakEven: Math.round((newPosition.price + newPosition.strikePrice) * 100) / 100,
                cutPosition: Math.round((newPositionSetup.demand.entry + (0.14 * newPosition.price)) * 100) / 100,
                takeProfit: Math.round((newPositionSetup.demand.entry + (0.21 * newPosition.price)) * 100) / 100,
              }
            };
          } else if (callOrPut === 'PUT') {
            newPositionSetup = {
              ...newPositionSetup,
              supply: {
                ...newPositionSetup.supply,
                stopLoss: Math.round((newPositionSetup.supply.entry + (0.10 * newPosition.price)) * 100) / 100,
                breakEven: Math.round((newPositionSetup.supply.entry - newPosition.price) * 100) / 100,
                cutPosition: Math.round((newPositionSetup.supply.entry - (0.14 * newPosition.price)) * 100) / 100,
                takeProfit: Math.round((newPositionSetup.supply.entry - (0.21 * newPosition.price)) * 100) / 100,
              }
            };
          }
  
          return resolve(JSON.stringify({
            position: newPosition,
            positionSetup: newPositionSetup,
            demandOrSupply,
          }));
        }
      };
    }
  });
}

export async function getOptionSymbol(order: string): Promise<string> {
  const parsedOrder = JSON.parse(order);
  let orderSymbol: PlaceOrdersResponse;

  if (parsedOrder.position) {
    orderSymbol = parsedOrder.position.orderResponse;
  } else {
    orderSymbol = parsedOrder.orderResponse;
  }

  Context.current().heartbeat(JSON.stringify("option signal"));

  if (orderSymbol.orderSymbol) {
    return orderSymbol.orderSymbol;
  } else {
    throw ApplicationFailure.create({ nonRetryable: true, message: 'There is not an order to get!' });
  }
}

export async function cutPosition(
  symbol: string, 
  quantity: number, 
  account_id: string, 
  access_token: string
): Promise<string> {
  const newQuantity = Math.floor(quantity / 2);
  Context.current().heartbeat(JSON.stringify("added quantity"));

  const cutPositionResponse = await placeOrder(access_token, account_id, createOrderRequest(symbol, newQuantity, account_id, InstructionType.SELL_TO_CLOSE));

  Context.current().heartbeat(JSON.stringify("cut position"));

  return JSON.stringify({
    orderResponse: cutPositionResponse
  });
}

export async function closePosition(
  symbol: string, 
  quantity: number, 
  account_id: string, 
  access_token: string
): Promise<string> {
  const closePositionResponse = await placeOrder(access_token, account_id, createOrderRequest(symbol, quantity, account_id, InstructionType.SELL_TO_CLOSE));

  Context.current().heartbeat(JSON.stringify("close position"));

  return JSON.stringify({
    orderResponse: closePositionResponse
  });
}

function createOrderRequest(
  symbol: string, 
  quantity: number, 
  account_id: string, 
  instruction: InstructionType
): OrdersConfig {
  return {
    accountId: account_id,
    order: {
      orderType: OrderType.MARKET,
      session: SessionType.NORMAL,
      duration: DurationType.DAY,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: [{
        orderLegType: OrderLegType.OPTION,
        instruction,
        quantity,
        instrument: {
          assetType: AssetType.OPTION,
          symbol,
        },
      }],
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  };
}

export async function waitToSignalCutPosition(
  wsUrl: string, 
  login_request: object, 
  market_request: object, 
  symbol: string, 
  quantity: number, 
  order: string, 
  account_id: string, 
  isHoliday: boolean
): Promise<string> {
  const openPositonSignal: OpenPositionSignal = JSON.parse(order);
  const demandOrSupply = openPositonSignal.demandOrSupply;
  let position: string;
  let newPosition: OrderDetails;
  let skipCut = false;
  let stoppedOut = false;
  let loggedIn = false;
  const dateTime = moment().tz('America/New_York');
  const day = dateTime.format('dddd');
  let cutFilled = 0;
  const newPositionSetup: PositionSetup = openPositonSignal.positionSetup;

  if (quantity < 2) {
    return JSON.stringify({
      positionSetup: newPositionSetup,
      quantity: cutFilled,
      isCut: true
    });
  }

  let client: WebSocket | null = null;

  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    }

    client.onopen = function () {
      if (isMarketClosed(day, isHoliday)) {
        skipCut = true;
        client?.close();
      } else {
        client?.send(JSON.stringify(login_request));
      }
    };

    client.onmessage = function (event) {
      if (isMarketClosed(day, isHoliday) || quantity < 2) {
        skipCut = true;
        client?.close();
      } else {
        if (loggedIn) {
          client.send(JSON.stringify(market_request));
          loggedIn = false;
        }

        const data = JSON.parse(event.data as string);

        if (data.response && data.response[0].command === "LOGIN") {
          loggedIn = true;
        } else if (data.data) {
          console.log('Cut Data Data: ', data.data);
          if (demandOrSupply === 'DEMAND' && newPositionSetup.demand) {
            console.log('Cut Demand Data Data Content', data.data[0].content);
            const demandCutPosition = newPositionSetup.demand.cutPosition;
            const demandTakeProfit = newPositionSetup.demand.takeProfit;
            const demandStopLoss = newPositionSetup.demand.stopLoss;
            const demandContent = data.data[0].content[0]["3"];

            if (demandContent >= demandCutPosition && demandContent < demandTakeProfit) {
              console.log(`Demand Position Cut at ${demandContent}`);
              client?.close();
            } else if (demandContent <= demandStopLoss) {
              console.log(`Demand Position Cut Stopped at ${demandContent}`);
              stoppedOut = true;
              client?.close();
            } else if (demandContent >= demandTakeProfit) {
              console.log(`Demand Position Cut Skipped at ${demandContent}`);
              skipCut = true;
              client?.close();
            }

          } else if (demandOrSupply === 'SUPPLY' && newPositionSetup.supply) {
            console.log('Cut Supply Data Data Content', data.data[0].content);
            const supplyCutPosition = newPositionSetup.supply.cutPosition;
            const supplyTakeProfit = newPositionSetup.supply.takeProfit;
            const supplyStopLoss = newPositionSetup.supply.stopLoss;
            const supplyContent = data.data[0].content[0]["3"];

            if (supplyContent <= supplyCutPosition && supplyContent > supplyTakeProfit) {
              console.log(`Supply Position Cut at ${supplyContent}`);
              client?.close();
            } else if (supplyContent >= supplyStopLoss) {
              console.log(`Supply Position Cut Stopped at ${supplyContent}`);
              stoppedOut = true;
              client?.close();
            } else if (supplyContent <= supplyTakeProfit) {
              console.log(`Supply Position Cut Skipped at ${supplyContent}`);
              skipCut = true;
              client?.close();
            }
          }
        }
      }
    };
  };

  openClient();

  return new Promise<string>((resolve) => {
    if (client) {
      client.onclose = async function () {
        const token = await getLoginCredentials();
        client = null;
  
        if (skipCut) {
          console.log('cut was skipped');
          return resolve(
            JSON.stringify({
              position: openPositonSignal.position,
              positionSetup: newPositionSetup,
              quantity: cutFilled,
              isCut: !skipCut
            })
          );
        } else if (stoppedOut) {
          console.log('cut was stopped out');
          position = await closePosition(symbol, quantity, account_id, token);
          newPosition = JSON.parse(position);
          cutFilled = await checkIfPositionFilled(symbol, account_id, token);
          return resolve('Stopped out');
        } else {
          console.log('cut went through');
          position = await cutPosition(symbol, quantity, account_id, token);
          newPosition = JSON.parse(position);
          cutFilled = await checkIfPositionFilled(symbol, account_id, token);
          return resolve(
            JSON.stringify({
              position: newPosition,
              positionSetup: newPositionSetup,
              quantity: cutFilled,
              isCut: !skipCut
            })
          );
        }
      };
    }
  });
}

export async function waitToSignalClosePosition(
  wsUrl: string,
  login_request: object,
  market_request: object,
  symbol: string,
  quantity: number,
  cutQuantity: number,
  cut_position_result: string,
  order: string,
  account_id: string,
  isHoliday: boolean
): Promise<string> {
  const cutPositionResult: CutPositionSignal = JSON.parse(cut_position_result);
  const openPositonSignal: OpenPositionSignal = JSON.parse(order);
  const demandOrSupply = openPositonSignal.demandOrSupply;
  let position: string;
  let newPosition: OrderDetails;
  const dateTime = moment().tz('America/New_York');
  const day = dateTime.format('dddd');
  let closeFilled = 0;
  let remainingQuantity = cutPositionResult.isCut ? quantity - cutQuantity : quantity;
  let loggedIn = false;
  const newPositionSetup: PositionSetup = cutPositionResult.positionSetup;
  const isDemandBreakEvenGreater = newPositionSetup.demand.breakEven > newPositionSetup.demand.stopLoss;
  const isSupplyBreakEvenLess = newPositionSetup.supply.breakEven < newPositionSetup.supply.stopLoss;
  let passedOriginalTakeProfit = false;
  let passedSecondTakeProfit = false;

  let client: WebSocket | null = null;

  function openClient() {
    client = new WebSocket(wsUrl);

    client.onerror = function (err) {
      throw new Error(`WebSocket error: ${err.message}`);
    };

    client.onopen = function () {
      if (isMarketClosed(day, isHoliday)) {
        client?.close();
      } else {
        client?.send(JSON.stringify(login_request));
      }
    };

    client.onmessage = function (event) {
      if (isMarketClosed(day, isHoliday)) {
        client?.close();
      } else {
        if (loggedIn) {
          client?.send(JSON.stringify(market_request));
          loggedIn = false;
        }
  
        const data = JSON.parse(event.data as string);
  
        if (data.response && data.response[0].command === 'LOGIN') {
          loggedIn = true;
        } else if (data.data) {
          console.log('Close Data Data: ', data.data);
          if (demandOrSupply === 'DEMAND' && newPositionSetup.demand) {
            console.log('Close Demand Data Data Content', data.data[0].content);
            const demandContent = data.data[0].content[0]['3'];
  
            if (isDemandBreakEvenGreater) {
              if (demandContent > newPositionSetup.demand.takeProfit && !passedOriginalTakeProfit) {
                newPositionSetup.demand.stopLoss = newPositionSetup.demand.entry;
                newPositionSetup.demand.takeProfit = newPositionSetup.demand.breakEven;
                passedOriginalTakeProfit = true;
              } else if (demandContent > newPositionSetup.demand.takeProfit && passedOriginalTakeProfit && !passedSecondTakeProfit) {
                newPositionSetup.demand.stopLoss = newPositionSetup.demand.cutPosition;
                newPositionSetup.demand.takeProfit = newPositionSetup.demand.higherProfit;
                passedSecondTakeProfit = true;
              } else if (demandContent > newPositionSetup.demand.takeProfit && passedSecondTakeProfit) {
                newPositionSetup.demand.stopLoss = newPositionSetup.demand.higherProfit;
              }
            } else {
              if (demandContent > newPositionSetup.demand.breakEven && demandContent < newPositionSetup.demand.takeProfit && !passedOriginalTakeProfit) {
                newPositionSetup.demand.stopLoss = newPositionSetup.demand.entry;
              } else if (demandContent > newPositionSetup.demand.takeProfit && !passedOriginalTakeProfit) {
                newPositionSetup.demand.stopLoss = newPositionSetup.demand.breakEven;
                newPositionSetup.demand.takeProfit = newPositionSetup.demand.higherProfit;
                passedOriginalTakeProfit = true;
              } else if (demandContent > newPositionSetup.demand.takeProfit && passedOriginalTakeProfit) {
                newPositionSetup.demand.stopLoss = newPositionSetup.demand.higherProfit;
              }
            }
  
            if (
              demandContent >= newPositionSetup.demand.takeProfit &&
              isDemandBreakEvenGreater &&
              passedSecondTakeProfit
            ) {
              console.log(`Demand price hit ${demandContent}, so we're taking profits!`);
              client?.close();
            } else if (
              demandContent >= newPositionSetup.demand.takeProfit &&
              !isDemandBreakEvenGreater &&
              passedOriginalTakeProfit
            ) {
              console.log(`Demand price hit ${demandContent}, so we're taking profits!`);
              client?.close();
            } else if (demandContent <= newPositionSetup.demand.stopLoss) {
              console.log(`Demand price hit ${demandContent}, so we stopped out!`);
              client?.close();
            }
          } else if (demandOrSupply === 'SUPPLY' && newPositionSetup.supply) {
            console.log('Close Supply Data Data Content', data.data[0].content);
            const supplyContent = data.data[0].content[0]['3'];
  
            if (isSupplyBreakEvenLess) {
              if (supplyContent < newPositionSetup.supply.takeProfit && !passedOriginalTakeProfit) {
                newPositionSetup.supply.stopLoss = newPositionSetup.supply.entry;
                newPositionSetup.supply.takeProfit = newPositionSetup.supply.breakEven;
                passedOriginalTakeProfit = true;
              } else if (supplyContent < newPositionSetup.supply.takeProfit && passedOriginalTakeProfit && !passedSecondTakeProfit) {
                newPositionSetup.supply.stopLoss = newPositionSetup.supply.cutPosition;
                newPositionSetup.supply.takeProfit = newPositionSetup.supply.higherProfit;
                passedSecondTakeProfit = true;
              } else if (supplyContent < newPositionSetup.supply.takeProfit && passedSecondTakeProfit) {
                newPositionSetup.supply.stopLoss = newPositionSetup.supply.higherProfit;
              }
            } else {
              if (
                supplyContent < newPositionSetup.supply.breakEven &&
                supplyContent > newPositionSetup.supply.takeProfit &&
                !passedOriginalTakeProfit
              ) {
                newPositionSetup.supply.stopLoss = newPositionSetup.supply.entry;
              } else if (supplyContent < newPositionSetup.supply.takeProfit && !passedOriginalTakeProfit) {
                newPositionSetup.supply.stopLoss = newPositionSetup.supply.breakEven;
                newPositionSetup.supply.takeProfit = newPositionSetup.supply.higherProfit;
                passedOriginalTakeProfit = true;
              } else if (supplyContent < newPositionSetup.supply.takeProfit && passedSecondTakeProfit) {
                newPositionSetup.supply.stopLoss = newPositionSetup.supply.higherProfit;
              }
            }
  
            if (
              supplyContent <= newPositionSetup.supply.takeProfit &&
              isSupplyBreakEvenLess &&
              passedSecondTakeProfit
            ) {
              console.log(`Supply price hit ${supplyContent}, so we're taking profits!`);
              client?.close();
            } else if (
              supplyContent <= newPositionSetup.supply.takeProfit &&
              !isSupplyBreakEvenLess &&
              passedOriginalTakeProfit
            ) {
              console.log(`Supply price hit ${supplyContent}, so we're taking profits!`);
              client?.close();
            } else if (supplyContent >= newPositionSetup.supply.stopLoss) {
              console.log(`Supply price hit ${supplyContent}, so we stopped out!`);
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
        const token = await getLoginCredentials();
        position = await closePosition(symbol, remainingQuantity, account_id, token);
        closeFilled = await checkIfPositionFilled(symbol, account_id, token);
        remainingQuantity = remainingQuantity - closeFilled;

        while (remainingQuantity !== 0) {
          closeFilled = await checkIfPositionFilled(symbol, account_id, token);
          remainingQuantity = remainingQuantity - closeFilled;
        }

        return resolve('position fully closed!');
      };
    }
  });
}


export async function getLoginCredentials(): Promise<string> {
  let token: string;
  let data = '';

  return await new Promise((resolve) => {
    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/auth',
      method: 'GET',
      rejectUnauthorized: false,
    };

    const response = https.request(authOptions, (resp) => {
      resp.on('data', (chunk) => {
        data += chunk;
        Context.current().heartbeat(JSON.stringify(data));
      });

      resp.on('end', () => {
        if (data === null || data === undefined) {
          throw new Error('Url code is not available.');
        }
        if (data[0] === "<") {
          throw new Error('Url code is not available.');
        }
        const parseJson = JSON.parse(data);
        token = JSON.stringify(parseJson);

        Context.current().heartbeat(token);

        if (!token) {
          throw new Error('Access token not available!')
        }

        return resolve(token);
      })
    }).on('error', (e) => {
      throw new Error(e.message);
    });

    response.end();
  });
}

export async function getUserPrinciples(access_token: string, symbol: string): Promise<PrinciplesAndParams> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = '';

  return await new Promise((resolve) => {
    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/streamer-auth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(encodedtoken),
      },
      rejectUnauthorized: false,
      timeout: 100000,
    };

    const response = https.request(authOptions, (resp) => {

      resp.on('data', (chunk) => {
        data += chunk;
        Context.current().heartbeat(JSON.stringify(data));
      });

      resp.on('end', async () => {
        Context.current().heartbeat(JSON.stringify(data));
        const parseJson = JSON.parse(data);
        const userPrinciples: UserPrinciples = JSON.parse(parseJson);
        let dataObject: PrinciplesAndParams = {
          userPrinciples: userPrinciples,
          params: null,
          loginRequest: null,
          marketRequest: null,
          bookRequest: null,
          timeSalesRequest: null,
        }
        if (!userPrinciples.error) {
          const tokenTimeStampAsDateObj = new Date(userPrinciples.streamerInfo.tokenTimestamp);
          const tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();
          const credentials = {
            "userid": userPrinciples.accounts[0].accountId,
            "token": userPrinciples.streamerInfo.token,
            "company": userPrinciples.accounts[0].company,
            "segment": userPrinciples.accounts[0].segment,
            "cddomain": userPrinciples.accounts[0].accountCdDomainId,
            "usergroup": userPrinciples.streamerInfo.userGroup,
            "accesslevel": userPrinciples.streamerInfo.accessLevel,
            "authorized": "Y",
            "timestamp": tokenTimeStampAsMs,
            "appid": userPrinciples.streamerInfo.appId,
            "acl": userPrinciples.streamerInfo.acl,
          }
          const param = await tdCredentialsToString(credentials);
          const adminConfig = {
            "service": "ADMIN",
            "command": "LOGIN",
            "requestid": "0",
            "account": userPrinciples.accounts[0].accountId,
            "source": userPrinciples.streamerInfo.appId,
            "parameters": {
              "credential": param,
              "token": userPrinciples.streamerInfo.token,
              "version": "1.0",
              "qoslevel": "0",
            },
          }
          const quoteConfig = {
            "service": "QUOTE",
            "requestid": "1",
            "command": "SUBS",
            "account": userPrinciples.accounts[0].accountId,
            "source": userPrinciples.streamerInfo.appId,
            "parameters": {
              "keys": symbol,
              "fields": "0,1,2,3,4,5",
            },
          };
          const bookConfig = {
            "service": "NASDAQ_BOOK",
            "requestid": "3",
            "command": "SUBS",
            "account": userPrinciples.accounts[0].accountId,
            "source": userPrinciples.streamerInfo.appId,
            "parameters": {
              "keys": symbol,
              "fields": "0,1,2,3",
            },
          };
          const timeSaleConfig = {
            "service": "TIMESALE_EQUITY",
            "requestid": "4",
            "command": "SUBS",
            "account": userPrinciples.accounts[0].accountId,
            "source": userPrinciples.streamerInfo.appId,
            "parameters": {
              "keys": symbol,
              "fields": "0,1,2,3",
            },
          };
          const loginRequest = {
            "requests": [
              adminConfig,
            ],
          };
          const marketRequest = {
            "requests": [
              quoteConfig,
            ],
          };
          const bookRequest = {
            "requests": [
              bookConfig,
            ],
          };
          const timeSalesRequest = {
            "requests": [
              timeSaleConfig,
            ],
          };
          dataObject = {
            ...dataObject,
            params: param,
            loginRequest,
            marketRequest,
            bookRequest,
            timeSalesRequest
          }
        } else {
          throw new Error(userPrinciples.error)
        }

        return resolve(dataObject)
      });
    }).on('error', (e) => {
      throw new Error(e.message);
    });

    response.on('timeout', () => {
      throw new Error('Connection timed out');
    });

    response.write(encodedtoken);
    Context.current().heartbeat(JSON.stringify("response in motion"));
    response.end();
  });
}
