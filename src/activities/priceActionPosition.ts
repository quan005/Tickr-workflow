import { WebSocket } from "ws";
import { ApplicationFailure, Context } from "@temporalio/activity";
import * as https from "https";
import * as url from "url";
import * as dotenv from "dotenv";
import { tdCredentialsToString } from "../tda/middleware/tdCredentialToString";
import { CurrentPriceData } from "../interfaces/currentPriceData";
import { SurroundingKeyLevels } from "../interfaces/surroundingKeyLevels";
import { SupplyZones, DemandZones } from "../interfaces/supplyDemandZones";
import { PositionSetup } from "../interfaces/positionSetup";
import { OptionsSelection } from "../interfaces/optionsSelection";
import { OpenPositionSignal } from "../interfaces/openPositionSignal";
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
  PositionEffect,
  PutCall,
  SessionType,
} from "../interfaces/orders";
import { Account } from "../interfaces/account";
import { ContractType, OptionChainConfig, OptionChainResponse, OptionDetails, OptionMap, RangeType } from "../interfaces/optionChain";
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



export async function time_until_market_open(is_holiday: boolean): Promise<number | string> {
  Context.current().heartbeat(JSON.stringify(is_holiday));

  if (is_holiday) {
    return 'Market is Currently closed!';
  }

  const marketOpen = moment().tz('America/New_York').set('hour', 9).set('minute', 15);
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

export async function is_holiday(): Promise<boolean> {
  const hd = new (holidays as any)('US', { types: ['bank', 'public'] }) as Holidays;
  const date = new Date();
  const holiday = hd.isHoliday(date) === false ? false : true;
  Context.current().heartbeat(JSON.stringify(holiday));
  return holiday;
}

export async function get_surrounding_key_levels(current_price: string, key_levels: number[]): Promise<string> {
  const newCurrentPrice: CurrentPriceData = JSON.parse(current_price);
  for (let i = 0; i < key_levels.length; i++) {
    Context.current().heartbeat(JSON.stringify('looping'));
    if (i == 0) {
      if (newCurrentPrice.closePrice < key_levels[i] && newCurrentPrice.closePrice > key_levels[i + 1]) {
        return JSON.stringify({
          above_resistance: null,
          resistance: key_levels[i],
          support: key_levels[i + 1],
          below_support: key_levels[i + 2],
        });
      } else if (newCurrentPrice.closePrice >= key_levels[i]) {
        return JSON.stringify({
          above_resistance: null,
          resistance: null,
          support: key_levels[i],
          below_support: key_levels[i + 1],
        });
      } else {
        continue;
      }
    } else if (i === 1) {
      if (newCurrentPrice.closePrice < key_levels[i] && newCurrentPrice.closePrice > key_levels[i + 1]) {
        return JSON.stringify({
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i],
          support: key_levels[i + 1],
          below_support: key_levels[i + 2],
        });
      } else if (newCurrentPrice.closePrice > key_levels[i]) {
        return JSON.stringify({
          above_resistance: null,
          resistance: key_levels[i - 1],
          support: key_levels[i],
          below_support: key_levels[i + 1],
        });
      } else {
        continue;
      }
    } else if (i >= 2 && i <= key_levels.length - 3) {
      if (newCurrentPrice.closePrice < key_levels[i] && newCurrentPrice.closePrice > key_levels[i + 1]) {
        return JSON.stringify({
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i],
          support: key_levels[i + 1],
          below_support: key_levels[i + 2],
        });
      } else if (newCurrentPrice.closePrice > key_levels[i]) {
        return JSON.stringify({
          above_resistance: key_levels[i - 2],
          resistance: key_levels[i - 1],
          support: key_levels[i],
          below_support: key_levels[i + 1],
        });
      } else {
        continue;
      }
    } else if (i === key_levels.length - 2) {
      if (newCurrentPrice.closePrice < key_levels[i] && newCurrentPrice.closePrice > key_levels[i + 1]) {
        return JSON.stringify({
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i],
          support: key_levels[i + 1],
          below_support: null,
        });
      } else if (newCurrentPrice.closePrice > key_levels[i]) {
        return JSON.stringify({
          above_resistance: key_levels[i + 2],
          resistance: key_levels[i + 1],
          support: key_levels[i],
          below_support: key_levels[i - 1],
        });
      } else {
        continue;
      }
    } else if (i === key_levels.length - 1) {
      if (newCurrentPrice.closePrice < key_levels[i]) {
        return JSON.stringify({
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i],
          support: null,
          below_support: null,
        });
      } else {
        continue;
      }
    }
  }
  return 'There are no surrounding key levels!';
}

export async function is_demand_zone(current_price: number, demand_zones: DemandZones[]): Promise<number[][] | null> {
  // finds the demand zone that the price currently resides in else return null
  for (let i = 0; i < 7; i++) {
    Context.current().heartbeat(JSON.stringify('looping'));
    if (current_price > demand_zones[i].bottom && current_price < demand_zones[i].top) {
      const zone = [[demand_zones[i].bottom, demand_zones[i].top]];
      return zone;
    } else {
      continue;
    }
  }

  return null
}

export async function find_demand_zone(current_price: number, demand_zones: DemandZones[]): Promise<number[][] | null> {
  const demandZone = await is_demand_zone(current_price, demand_zones);
  Context.current().heartbeat(JSON.stringify('got the demand zone'));
  const surroundingZones: number[][] = [];

  if (demandZone !== null) {
    return demandZone;
  } else {
    for (let i = 0; i < demand_zones.length; i++) {
      Context.current().heartbeat(JSON.stringify('looping'));
      if (i < demand_zones.length - 1 && (current_price < demand_zones[i].top && current_price > demand_zones[i + 1].bottom)) {
        const zone1: number[] = [demand_zones[i].bottom, demand_zones[i].top];
        const zone2: number[] = [demand_zones[i + 1].bottom, demand_zones[i + 1].top];
        surroundingZones.push(zone1, zone2);
        return surroundingZones;
      } else {
        continue;
      }
    }
    return null;
  }
}

export async function is_supply_zone(current_price: number, supply_zones: SupplyZones[]): Promise<number[][] | null> {
  // finds the supply zone that the price currently resides in or is closest too
  for (let i = 0; i < supply_zones.length; i++) {
    Context.current().heartbeat(JSON.stringify('looping'));
    if (current_price < supply_zones[i].top && current_price > supply_zones[i].bottom) {
      const zone = [[supply_zones[i].top, supply_zones[i].bottom]];
      return zone;
    } else {
      continue;
    }
  }
  return null;
}

export async function find_supply_zone(current_price: number, supply_zones: SupplyZones[]): Promise<number[][] | null> {
  const supplyZone = await is_supply_zone(current_price, supply_zones);
  Context.current().heartbeat(JSON.stringify('got the supply zone'));
  const surroundingZones: number[][] = [];

  if (supplyZone !== null) {
    return supplyZone;
  } else {
    for (let i = 0; i < supply_zones.length; i++) {
      Context.current().heartbeat(JSON.stringify('looping'));
      if (i < supply_zones.length - 1 && (current_price < supply_zones[i].top && current_price > supply_zones[i + 1].bottom)) {
        const zone1: number[] = [supply_zones[i].top, supply_zones[i].bottom];
        const zone2: number[] = [supply_zones[i + 1].top, supply_zones[i + 1].bottom];
        surroundingZones.push(zone1, zone2);
        return surroundingZones;
      } else {
        continue;
      }
    }
    return null;
  }
}

export async function get_current_price(wsUrl: string, login_request: object, market_request: object, demand_zones: DemandZones[], supply_zones: SupplyZones[], is_holiday: boolean): Promise<string> {
  let closePrice = 0;
  let currentPriceData: CurrentPriceData = {
    closePrice: closePrice,
    demandZone: [],
    supplyZone: [],
  };
  const dateTime = moment().tz('America/New_York');
  let marketClose = dateTime.format('Hmm');
  const day = dateTime.format('dddd');
  let isMarketClosed = false;
  let messageCount = 0;
  let loggedIn = false;
  const messages: SocketResponse[] | null = [];

  return await new Promise(async (resolve) => {
    const client = new WebSocket(wsUrl);

    client.onerror = (err) => {
      throw new Error(err.message);
    }

    client.onopen = () => {
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600 || day === 'Saturday' || day === 'Sunday' || is_holiday) {
        isMarketClosed = true;
        client.close();
      }

      client.send(JSON.stringify(login_request));
    };

    client.onmessage = event => {
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600 || messageCount >= 1) {
        isMarketClosed = true;
        client.close();
      }

      if (loggedIn) {
        client.send(JSON.stringify(market_request));
        loggedIn = false;
      }

      const data = JSON.parse(JSON.parse(JSON.stringify(event.data)));
      Context.current().heartbeat(JSON.stringify('recieved data'));

      if (data.response && data.response[0].command === "LOGIN") {
        loggedIn = true;
      }

      if (data.data !== undefined) {
        Context.current().heartbeat(JSON.stringify('recieved data'));

        messages.push(data.data[0].content[0]);
        messageCount += 1;
        client.close();
      }
    };

    client.onclose = async function () {
      if (isMarketClosed) {
        resolve('Market is currently closed!');
      }

      closePrice = messages[0]["3"];

      const demandZone = await find_demand_zone(closePrice, demand_zones);
      const supplyZone = await find_supply_zone(closePrice, supply_zones);

      if (demandZone?.length >= 1 && supplyZone?.length >= 1) {
        currentPriceData = {
          closePrice,
          demandZone,
          supplyZone,
        };
        Context.current().heartbeat(JSON.stringify('got current price'));
        resolve(JSON.stringify(currentPriceData));
      } else if (demandZone?.length >= 1) {
        currentPriceData = {
          closePrice,
          demandZone,
          supplyZone: [],
        };
        Context.current().heartbeat(JSON.stringify('got current price'));
        resolve(JSON.stringify(currentPriceData));
      } else if (supplyZone?.length >= 1) {
        currentPriceData = {
          closePrice,
          demandZone: [],
          supplyZone,
        };
        Context.current().heartbeat(JSON.stringify('got current price'));
        resolve(JSON.stringify(currentPriceData));
      } else {
        resolve('There are no demand or supply zones!');
      }
    }
  })
}

export async function get_position_setup(surrounding_key_levels: string, current_price: string): Promise<string> {
  const newSurroundingKeyLevels: SurroundingKeyLevels = JSON.parse(surrounding_key_levels);
  const newCurrentPrice: CurrentPriceData = JSON.parse(current_price);
  const demand_zone = newCurrentPrice.demandZone;
  const supply_zone = newCurrentPrice.supplyZone;

  if (demand_zone[0] && supply_zone[0]) {
    if (newSurroundingKeyLevels.above_resistance !== null && newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.support !== null && newSurroundingKeyLevels.below_support !== null) {
      return JSON.stringify({
        demand: {
          entry: newSurroundingKeyLevels.resistance,
          stopLoss: newSurroundingKeyLevels.resistance - (Math.round(((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 4) * 10) / 10),
          takeProfit: newSurroundingKeyLevels.above_resistance,
          cutPosition: (((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 2) + newSurroundingKeyLevels.resistance),
        },
        supply: {
          entry: newSurroundingKeyLevels.support,
          stopLoss: newSurroundingKeyLevels.support + (Math.round(((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 4) * 10) / 10),
          takeProfit: newSurroundingKeyLevels.below_support,
          cutPosition: (newSurroundingKeyLevels.below_support - ((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 2)),
        },
      });
    } else if (newSurroundingKeyLevels.resistance === null || newSurroundingKeyLevels.above_resistance === null) {
      if (newSurroundingKeyLevels.support !== null && newSurroundingKeyLevels.below_support !== null) {
        return JSON.stringify({
          demand: null,
          supply: {
            entry: newSurroundingKeyLevels.support,
            stopLoss: newSurroundingKeyLevels.support + (Math.round(((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 4) * 10) / 10),
            takeProfit: newSurroundingKeyLevels.below_support,
            cutPosition: (newSurroundingKeyLevels.below_support - ((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 2)),
          },
        });
      }
    } else if (newSurroundingKeyLevels.support === null || newSurroundingKeyLevels.below_support === null) {
      if (newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.above_resistance !== null) {
        return JSON.stringify({
          demand: {
            entry: newSurroundingKeyLevels.resistance,
            stopLoss: newSurroundingKeyLevels.resistance - (Math.round(((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 4) * 10) / 10),
            takeProfit: newSurroundingKeyLevels.above_resistance,
            cutPosition: (((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 2) + newSurroundingKeyLevels.resistance),
          },
          supply: null,
        });
      }
    } else {
      return 'There are no good position setups!';
    }
  } else if (demand_zone[0]) {
    if (newSurroundingKeyLevels.above_resistance !== null && newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.support !== null && newSurroundingKeyLevels.below_support !== null) {
      return JSON.stringify({
        demand: {
          entry: newSurroundingKeyLevels.resistance,
          stopLoss: newSurroundingKeyLevels.resistance - (Math.round(((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 4) * 10) / 10),
          takeProfit: newSurroundingKeyLevels.above_resistance,
          cutPosition: (((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 2) + newSurroundingKeyLevels.resistance),
        },
        supply: null,
      })
    } else if (newSurroundingKeyLevels.support === null || newSurroundingKeyLevels.below_support === null) {
      if (newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.above_resistance !== null) {
        return JSON.stringify({
          demand: {
            entry: newSurroundingKeyLevels.resistance,
            stopLoss: newSurroundingKeyLevels.resistance - (Math.round(((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 4) * 10) / 10),
            takeProfit: newSurroundingKeyLevels.above_resistance,
            cutPosition: (((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 2) + newSurroundingKeyLevels.resistance),
          },
          supply: null,
        });
      }
    } else if (newSurroundingKeyLevels.resistance === null || newSurroundingKeyLevels.above_resistance === null) {
      if (newSurroundingKeyLevels.support !== null && newSurroundingKeyLevels.below_support !== null) {
        return JSON.stringify({
          demand: null,
          supply: {
            entry: newSurroundingKeyLevels.support,
            stopLoss: newSurroundingKeyLevels.support + (Math.round(((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 4) * 10) / 10),
            takeProfit: newSurroundingKeyLevels.below_support,
            cutPosition: (newSurroundingKeyLevels.below_support - ((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 2)),
          },
        });
      }
    } else {
      return 'There are no good position setups!';
    }
  } else if (supply_zone[0]) {
    if (newSurroundingKeyLevels.above_resistance !== null && newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.support !== null && newSurroundingKeyLevels.below_support !== null) {
      return JSON.stringify({
        demand: null,
        supply: {
          entry: newSurroundingKeyLevels.support,
          stopLoss: newSurroundingKeyLevels.support + (Math.round(((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 4) * 10) / 10),
          takeProfit: newSurroundingKeyLevels.below_support,
          cutPosition: (newSurroundingKeyLevels.below_support - ((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 2)),
        },
      })
    } else if (newSurroundingKeyLevels.support === null || newSurroundingKeyLevels.below_support === null) {
      if (newSurroundingKeyLevels.resistance !== null && newSurroundingKeyLevels.above_resistance !== null) {
        return JSON.stringify({
          demand: {
            entry: newSurroundingKeyLevels.resistance,
            stopLoss: newSurroundingKeyLevels.resistance - (Math.round(((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 4) * 10) / 10),
            takeProfit: newSurroundingKeyLevels.above_resistance,
            cutPosition: (((newSurroundingKeyLevels.above_resistance - newSurroundingKeyLevels.resistance) / 2) + newSurroundingKeyLevels.resistance),
          },
          supply: null,
        });
      }
    } else if (newSurroundingKeyLevels.resistance === null || newSurroundingKeyLevels.above_resistance === null) {
      if (newSurroundingKeyLevels.support !== null && newSurroundingKeyLevels.below_support !== null) {
        return JSON.stringify({
          demand: null,
          supply: {
            entry: newSurroundingKeyLevels.support,
            stopLoss: newSurroundingKeyLevels.support + (Math.round(((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 4) * 10) / 10),
            takeProfit: newSurroundingKeyLevels.below_support,
            cutPosition: (newSurroundingKeyLevels.below_support - ((newSurroundingKeyLevels.support - newSurroundingKeyLevels.below_support) / 2)),
          },
        });
      }
    } else {
      return 'There are no good position setups!';
    }
  }
  return 'There are no good position setups!';
}

export async function getOptionsSelection(position_setup: string, symbol: string, access_token: string): Promise<string> {

  let callOptionResponse: OptionChainResponse | null = null;
  let putOptionResponse: OptionChainResponse | null = null;
  Context.current().heartbeat(JSON.stringify("getting option chain"));
  const toDate = moment().add((5 - moment().isoWeekday()), 'day').format('YYYY-MM-DD');
  const fromDate = moment().isoWeekday() !== 5 ? moment().add((moment().isoWeekday() % 5), 'day').subtract(1, 'day').format('YYYY-MM-DD') : moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD');
  const numberOfDaysAway = moment().isoWeekday() !== 5 ? (5 - moment().isoWeekday()) : 0;
  const optionString = `${fromDate}:${numberOfDaysAway}`;
  const newPositionSetup: PositionSetup = JSON.parse(position_setup);

  if (newPositionSetup.demand !== null) {
    callOptionResponse = await getOptionChain(access_token, {
      symbol: symbol,
      contractType: ContractType.CALL,
      range: RangeType.ITM,
      fromDate: fromDate,
      toDate: toDate,
      strikeCount: 20,
    });
  }

  if (newPositionSetup.supply !== null) {
    putOptionResponse = await getOptionChain(access_token, {
      symbol: symbol,
      contractType: ContractType.PUT,
      range: RangeType.ITM,
      fromDate: fromDate,
      toDate: toDate,
      strikeCount: 20,
    });
  }

  Context.current().heartbeat(JSON.stringify("recieved options"));

  if (callOptionResponse !== null && putOptionResponse !== null) {
    const call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL");
    const put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT");

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
        },
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
        },
        PUT: null,
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
        },
      });
    } else {
      return 'There are no call or put options that meets the requirements!';
    }
  } else if (callOptionResponse !== null) {
    const call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL");

    if (call === null) {
      return 'There are no call or put options that meets the requirements!';
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
      },
      PUT: null,
    });
  } else if (putOptionResponse !== null) {
    const put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT");

    if (put === null) {
      return 'There are no call or put options that meets the requirements!';
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
      },
    });
  } else {
    return 'There are no call or put options that meets the requirements!';
  }
}

export async function checkAccountAvailableBalance(access_token: string, account_id: string): Promise<number> {
  const getAccountResponse = await getAccount(access_token, account_id);
  Context.current().heartbeat(JSON.stringify(getAccountResponse));
  const availableBalance = getAccountResponse.securitiesAccount.projectedBalances.cashAvailableForTrading;

  return availableBalance;
}

export async function openPosition(options: OptionsSelection, optionType: string, budget: number, account_id: string, access_token: string): Promise<string> {
  let price = 0;
  let optionPrice = 0;
  let quantity = 0;
  let symbol = '';
  Context.current().heartbeat(JSON.stringify(price));

  if (options.CALL === null && options.PUT === null) {
    return 'There are no call or put options selected for purchase!';
  } else if (options.CALL !== null && options.PUT !== null) {
    const quantityCall = Math.floor(budget / (options.CALL.ask * 100));
    const quantityPut = Math.floor(budget / (options.PUT.ask * 100));
    optionPrice = optionType === 'CALL' ? options.CALL.ask : options.PUT.ask;
    price = optionType === 'CALL' ? (options.CALL.ask * 100) * quantityCall : (options.PUT.ask * 100) * quantityPut;
    symbol = optionType === 'CALL' ? options.CALL.symbol : options.PUT.symbol;
    quantity = optionType === 'CALL' ? quantityCall : quantityPut;
  } else if (options.CALL !== null) {
    const quantityCall = Math.floor(budget / (options.CALL.ask * 100));
    optionPrice = options.CALL.ask;
    price = (options.CALL.ask * 100) * quantityCall;
    symbol = options.CALL.symbol;
    quantity = quantityCall;
  } else if (options.PUT !== null) {
    const quantityPut = Math.floor(budget / (options.PUT.ask * 100));
    optionPrice = options.PUT.ask;
    price = (options.PUT.ask * 100) * quantityPut;
    symbol = options.PUT.symbol;
    quantity = quantityPut;
  }

  Context.current().heartbeat(JSON.stringify(price));

  const accountBalance = await checkAccountAvailableBalance(access_token, account_id);

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
      orderLegCollection: [{
        orderLegType: OrderLegType.OPTION,
        instruction: InstructionType.BUY_TO_OPEN,
        quantity: quantity,
        instrument: {
          assetType: AssetType.OPTION,
          symbol: symbol,
          putCall: optionType === 'CALL' ? PutCall.CALL : PutCall.PUT,
        },
      }],
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  });

  if (openPositionResponse.error) {
    throw new Error(openPositionResponse.error);
  }

  Context.current().heartbeat(JSON.stringify(price));

  return JSON.stringify({
    orderResponse: openPositionResponse,
    price,
    quantity,
    optionSymbol: symbol
  });
}

export async function checkIfPositionFilled(order: string, account_id: string, access_token: string): Promise<number> {
  const openPositon: OpenPositionSignal = JSON.parse(order);
  const orderID: PlaceOrdersResponse = openPositon.position.orderResponse;
  const position = await getOrder(access_token, account_id, orderID.orderId);
  Context.current().heartbeat(JSON.stringify("recieved position"));

  if (position.status === 'FILLED' && position.filledQuantity) {
    return position.filledQuantity;
  } else {
    return 0;
  }
}

export async function waitToSignalOpenPosition(wsUrl: string, login_request: object, book_request: object, time_sales_request: object, position_setup: string, options: string, budget: number, account_id: string, access_token: string, is_holiday: boolean): Promise<string> {
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
  const dateTime = moment().tz('America/New_York');
  let marketClose = dateTime.format('Hmm');
  const day = dateTime.format('dddd');
  const newPositionSetup: PositionSetup = JSON.parse(position_setup);

  return await new Promise(async (resolve) => {
    const client = new WebSocket(wsUrl);

    client.onerror = (err) => {
      throw new Error(err.message);
    }

    client.onopen = () => {
      if (parseInt(marketClose) >= 1600 || day === 'Saturday' || day === 'Sunday' || is_holiday) {
        noGoodBuys = true;
        client.close();
      }

      client.send(JSON.stringify(login_request));

      Context.current().heartbeat('login sent');

    };

    client.onmessage = async function (event) {
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600) {
        noGoodBuys = true;
        client.close();
      }

      if (loggedIn) {
        client.send(JSON.stringify(time_sales_request));
        loggedIn = false;
      }

      const data = JSON.parse(JSON.parse(JSON.stringify(event.data)));
      Context.current().heartbeat(JSON.stringify('recieved data'));

      if (data.response && data.response[0].command === "LOGIN") {
        loggedIn = true;
      }

      if (data.data) {
        if (newPositionSetup.demand && newPositionSetup.supply) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            Context.current().heartbeat(JSON.stringify(i));
            if (data.data[0].content[i]["2"] >= newPositionSetup.demand.entry && data.data[0].content[i]["2"] < newPositionSetup.demand.cutPosition) {
              metDemandEntryPrice += 1;
              demandSize += data.data[0].content[i]["3"];
            } else if (data.data[0].content[i]["2"] > newPositionSetup.demand.entry && demandForming >= 2) {
              demandConfirmation = true;
            } else if (data.data[0].content[i]["2"] <= newPositionSetup.supply.entry && data.data[0].content[i]["2"] > newPositionSetup.supply.cutPosition) {
              metSupplyEntryPrice += 1;
              supplySize += data.data[0].content[i]["3"];
            } else if (data.data[0].content[i]["2"] < newPositionSetup.supply.entry && supplyForming >= 2) {
              supplyConfirmation = true;
            } else {
              continue;
            }
          }

          demandTimeSalesEntryPercentage = metDemandEntryPrice / data.data[0].content.length;
          supplyTimeSalesEntryPercentage = metSupplyEntryPrice / data.data[0].content.length;
          Context.current().heartbeat(JSON.stringify("recieved supply and demand"));

          if (demandTimeSalesEntryPercentage >= .6) {
            demandForming += 1;
          } else if (supplyTimeSalesEntryPercentage >= .6) {
            supplyForming += 1;
          }

          Context.current().heartbeat(JSON.stringify("supply or demand forming"));

          if (demandForming >= 3 && demandSize > supplySize || demandForming > 1 && demandConfirmation) {
            callOrPut = 'CALL';
            demandOrSupply = 'DEMAND';
            client.close();
          } else if (supplyForming >= 3 && supplySize > demandSize || supplyForming > 1 && supplyConfirmation) {
            callOrPut = 'PUT';
            demandOrSupply = 'SUPPLY';
            client.close();
          }
        } else if (newPositionSetup.demand) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            Context.current().heartbeat(JSON.stringify(i));
            if (data.data[0].content[i]["2"] >= newPositionSetup.demand.entry && data.data[0].content[i]["2"] < newPositionSetup.demand.cutPosition) {
              metDemandEntryPrice += 1;
              demandSize += data.data[0].content[i]["3"];
            } else if (data.data[0].content[i]["2"] > newPositionSetup.demand.entry && demandForming >= 2) {
              demandConfirmation = true;
            } else {
              continue;
            }
          }

          demandTimeSalesEntryPercentage = metDemandEntryPrice / data.data[0].content.length;
          Context.current().heartbeat(JSON.stringify('demand entry percentage'));

          if (demandTimeSalesEntryPercentage >= .6) {
            demandForming += 1;
          }

          Context.current().heartbeat(demandForming);

          if (demandForming >= 3 && demandSize > supplySize || demandForming > 1 && demandConfirmation) {
            callOrPut = 'CALL';
            demandOrSupply = 'DEMAND';
            client.close();
          }
        } else if (newPositionSetup.supply) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            Context.current().heartbeat(JSON.stringify(i));
            if (data.data[0].content[i]["2"] <= newPositionSetup.supply.entry && data.data[0].content[i]["2"] > newPositionSetup.supply.cutPosition) {
              metSupplyEntryPrice += 1;
              supplySize += data.data[0].content[i]["3"];
            } else if (data.data[0].content[i]["2"] < newPositionSetup.supply.entry && supplyForming >= 2) {
              supplyConfirmation = true;
            } else {
              continue;
            }
          }

          supplyTimeSalesEntryPercentage = metSupplyEntryPrice / data.data[0].content.length;
          Context.current().heartbeat(JSON.stringify('supply entry percentage'));

          if (supplyTimeSalesEntryPercentage >= .6) {
            supplyForming += 1;
          }
          Context.current().heartbeat(JSON.stringify(supplyForming));

          if (supplyForming >= 3 && supplySize > demandSize || supplyForming > 1 && supplyConfirmation) {
            callOrPut = 'PUT';
            demandOrSupply = 'SUPPLY';
            client.close();
          }
        }
      }
    }

    client.onclose = async function () {
      Context.current().heartbeat(JSON.stringify(noGoodBuys));
      if (noGoodBuys) {
        resolve('Could not find any good buying opportunities!')
      }

      const newOptions: OptionsSelection = JSON.parse(options)

      position = await openPosition(newOptions, callOrPut, budget, account_id, access_token);

      if (position === "Account balance is too low!" || position === "There are no call or put options selected for purchase") {
        resolve(position)
      } else {
        Context.current().heartbeat(JSON.stringify(demandOrSupply));
        const newPosition: OrderDetails = JSON.parse(position);
        resolve(JSON.stringify({
          position: newPosition,
          demandOrSupply,
        }));
      }
    }
  })
}

export async function getOptionSymbol(order: string, account_id: string, access_token: string): Promise<string> {
  const parsedOrder = JSON.parse(order);
  let orderID: PlaceOrdersResponse;

  if (parsedOrder.position) {
    orderID = parsedOrder.position.orderResponse;
  } else {
    orderID = parsedOrder.orderResponse;
  }

  const option = await getOrder(access_token, account_id, orderID.orderId);
  Context.current().heartbeat(JSON.stringify("option signal"));

  if (option.orderLegCollection?.instrument.symbol) {
    return option.orderLegCollection?.instrument.symbol;
  } else {
    throw ApplicationFailure.create({ nonRetryable: true, message: 'There is not an order to get!' });
  }

}

export async function cutPosition(symbol: string, quantity: number, account_id: string, access_token: string): Promise<string> {
  const newQuantity = Math.floor(quantity / 2);
  Context.current().heartbeat(JSON.stringify(newQuantity));

  const cutPositionResponse = await placeOrder(access_token, account_id, {
    accountId: account_id,
    order: {
      orderType: OrderType.MARKET,
      session: SessionType.NORMAL,
      duration: DurationType.FILL_OR_KILL,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: [{
        orderLegType: OrderLegType.OPTION,
        instruction: InstructionType.SELL_TO_CLOSE,
        quantity: newQuantity,
        instrument: {
          assetType: AssetType.OPTION,
          symbol: symbol,
        },
      }],
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  });

  Context.current().heartbeat(JSON.stringify("cut position"));

  return JSON.stringify({
    orderResponse: cutPositionResponse
  });
}

export async function closePosition(symbol: string, quantity: number, account_id: string, access_token: string): Promise<string> {
  const closePositionResponse = await placeOrder(access_token, account_id, {
    accountId: account_id,
    order: {
      orderType: OrderType.MARKET,
      session: SessionType.NORMAL,
      duration: DurationType.FILL_OR_KILL,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: [{
        orderLegType: OrderLegType.OPTION,
        instruction: InstructionType.SELL_TO_CLOSE,
        quantity: quantity,
        instrument: {
          assetType: AssetType.OPTION,
          symbol: symbol,
        },
      }],
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  });

  Context.current().heartbeat(JSON.stringify("close position"));

  return JSON.stringify({
    orderResponse: closePositionResponse
  })
}

export async function waitToSignalCutPosition(wsUrl: string, login_request: object, book_request: object, time_sales_request: object, symbol: string, quantity: number, order: string, position_setup: string, account_id: string, access_token: string, is_holiday: boolean): Promise<number> {
  const openPositon: OpenPositionSignal = JSON.parse(order);
  const demandOrSupply = openPositon.demandOrSupply;
  let demandTimeSalesCutPercentage = 0;
  let demandTimeSalesStopLossPercentage = 0;
  let demandTimeSalesTakeProfitPercentage = 0;
  let metDemandCutPrice = 0;
  let metDemandStopLossPrice = 0;
  let metDemandTakeProfitPrice = 0;
  let supplyTimeSalesCutPercentage = 0;
  let supplyTimeSalesStopLossPercentage = 0;
  let supplyTimeSalesTakeProfitPercentage = 0;
  let metSupplyCutPrice = 0;
  let metSupplyStopLossPrice = 0;
  let metSupplyTakeProfitPrice = 0;
  let position: string;
  let skipCut = false;
  let stoppedOut = false;
  let loggedIn = false;
  const dateTime = moment().tz('America/New_York');
  let marketClose = dateTime.format('Hmm');
  const day = dateTime.format('dddd');
  let cutFilled = 0;
  const newPositionSetup: PositionSetup = JSON.parse(position_setup);

  return await new Promise(async (resolve) => {
    const client = new WebSocket(wsUrl);

    client.onerror = (err) => {
      throw new Error(err.message);
    }

    client.onopen = () => {
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600 || day === 'Saturday' || day === 'Sunday' || is_holiday) {
        skipCut = true;
        client.close();
      }

      client.send(JSON.stringify(login_request));

      Context.current().heartbeat(JSON.stringify('login sent'));

    };

    client.onmessage = async function (event) {
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600 || quantity < 2) {
        skipCut = true;
        client.close();
      }

      if (loggedIn) {
        client.send(JSON.stringify(time_sales_request));
        loggedIn = false;
      }

      const data = JSON.parse(JSON.stringify(event.data));
      Context.current().heartbeat(JSON.stringify(data));

      if (data.response && data.response[0].command === "LOGIN") {
        loggedIn = true;
      }

      if (data.data) {
        if (demandOrSupply === 'DEMAND' && newPositionSetup.demand) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            Context.current().heartbeat(JSON.stringify(i));
            if (data.data[0].content[i]["2"] >= newPositionSetup.demand.cutPosition && data.data[0].content[i]["2"] < newPositionSetup.demand.takeProfit) {
              metDemandCutPrice += 1;
            } else if (data.data[0].content[i]["2"] <= newPositionSetup.demand.stopLoss) {
              metDemandStopLossPrice += 1;
            } else if (data.data[0].content[i]["2"] >= newPositionSetup.demand.takeProfit) {
              metDemandTakeProfitPrice += 1;
            } else {
              continue;
            }
          }

          demandTimeSalesCutPercentage = metDemandCutPrice / data.data[0].content.length;
          demandTimeSalesStopLossPercentage = metDemandStopLossPrice / data.data[0].content.length;
          demandTimeSalesTakeProfitPercentage = metDemandTakeProfitPrice / data.data[0].content.length;
          Context.current().heartbeat(JSON.stringify(demandTimeSalesCutPercentage));

          if (demandTimeSalesCutPercentage >= .6) {
            client.close();
          } else if (demandTimeSalesStopLossPercentage >= .4) {
            stoppedOut = true;
            client.close();
          } else if (demandTimeSalesTakeProfitPercentage >= .6) {
            skipCut = true;
            client.close();
          }

        } else if (demandOrSupply === 'SUPPLY' && newPositionSetup.supply) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            Context.current().heartbeat(JSON.stringify(i));
            if (data.data[0].content[i]["2"] <= newPositionSetup.supply.cutPosition && data.data[0].content[i]["2"] > newPositionSetup.supply.takeProfit) {
              metSupplyCutPrice += 1;
            } else if (data.data[0].content[i]["2"] >= newPositionSetup.supply.stopLoss) {
              metSupplyStopLossPrice += 1;
            } else if (data.data[0].content[i]["2"] <= newPositionSetup.supply.takeProfit) {
              metSupplyTakeProfitPrice += 1;
            } else {
              continue;
            }
          }

          supplyTimeSalesCutPercentage = metSupplyCutPrice / data.data[0].content.length;
          supplyTimeSalesStopLossPercentage = metSupplyStopLossPrice / data.data[0].content.length;
          supplyTimeSalesTakeProfitPercentage = metSupplyTakeProfitPrice / data.data[0].content.length;
          Context.current().heartbeat(JSON.stringify(supplyTimeSalesCutPercentage));

          if (supplyTimeSalesCutPercentage >= .6) {
            client.close();
          } else if (supplyTimeSalesStopLossPercentage >= .4) {
            stoppedOut = true;
            client.close();
          } else if (supplyTimeSalesTakeProfitPercentage >= .6) {
            skipCut = true;
            client.close();
          }
        }
      }
    };

    client.onclose = async function () {
      if (skipCut) {
        Context.current().heartbeat(JSON.stringify(cutFilled));
        resolve(cutFilled);
      } else if (stoppedOut) {
        position = await closePosition(symbol, quantity * 2, account_id, access_token);
        Context.current().heartbeat(JSON.stringify("recieved position"));
        cutFilled = await checkIfPositionFilled(position, account_id, access_token);
        Context.current().heartbeat(JSON.stringify("cut filled"));
        resolve(cutFilled);
      } else {
        position = await cutPosition(symbol, quantity, account_id, access_token);
        Context.current().heartbeat(JSON.stringify("recieved position"));
        cutFilled = await checkIfPositionFilled(position, account_id, access_token);
        Context.current().heartbeat(JSON.stringify("cut filled"));
        resolve(cutFilled);
      }
    }
  });
}

export async function waitToSignalClosePosition(wsUrl: string, login_request: object, book_request: object, time_sales_request: object, symbol: string, quantity: number, order: string, position_setup: string, account_id: string, access_token: string, is_holiday: boolean): Promise<string> {
  const openPositon: OpenPositionSignal = JSON.parse(order);
  const demandOrSupply = openPositon.demandOrSupply;
  let demandTimeSalesCutPercentage = 0;
  let demandTimeSalesStopLossPercentage = 0;
  let demandTimeSalesTakeProfitPercentage = 0;
  let metDemandCutPrice = 0;
  let metDemandStopLossPrice = 0;
  let metDemandTakeProfitPrice = 0;
  let supplyTimeSalesCutPercentage = 0;
  let supplyTimeSalesStopLossPercentage = 0;
  let supplyTimeSalesTakeProfitPercentage = 0;
  let metSupplyCutPrice = 0;
  let metSupplyStopLossPrice = 0;
  let metSupplyTakeProfitPrice = 0;
  let position: string;
  const dateTime = moment().tz('America/New_York');
  let marketClose = dateTime.format('Hmm');
  const day = dateTime.format('dddd');
  let closeFilled = 0;
  let remainingQuantity = quantity;
  let waited = 0;
  let loggedIn = false;
  const newPositionSetup: PositionSetup = JSON.parse(position_setup);

  return await new Promise(async (resolve) => {
    const client = new WebSocket(wsUrl);

    client.onerror = (err) => {
      throw new Error(err.message);
    }

    client.onopen = () => {
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600 || day === 'Saturday' || day === 'Sunday' || is_holiday) {
        client.close();
      }

      client.send(JSON.stringify(login_request));

      Context.current().heartbeat(JSON.stringify("login sent"));

    };

    client.onmessage = async function (event) {
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600) {
        client.close();
      }

      if (loggedIn) {
        client.send(JSON.stringify(time_sales_request));
        loggedIn = false;
      }

      const data = JSON.parse(JSON.stringify(event.data));
      Context.current().heartbeat(JSON.stringify('recieved data'));

      if (data.response && data.response[0].command === "LOGIN") {
        loggedIn = true;
      }

      if (data.data) {
        if (demandOrSupply === 'DEMAND' && newPositionSetup.demand) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            Context.current().heartbeat(JSON.stringify(i));
            if (data.data[0].content[i]["2"] >= newPositionSetup.demand.cutPosition && data.data[0].content[i]["2"] < newPositionSetup.demand.takeProfit || data.data[0].content[i]["2"] < newPositionSetup.demand.cutPosition && data.data[0].content[i]["2"] >= newPositionSetup.demand.entry) {
              metDemandCutPrice += 1;
            } else if (data.data[0].content[i]["2"] >= newPositionSetup.demand.takeProfit) {
              metDemandTakeProfitPrice += 1;
            } else if (data.data[0].content[i]["2"] <= newPositionSetup.demand.stopLoss) {
              metDemandStopLossPrice += 1;
            } else {
              continue;
            }
          }

          demandTimeSalesCutPercentage = metDemandCutPrice / data.data[0].content.length;
          demandTimeSalesStopLossPercentage = metDemandStopLossPrice / data.data[0].content.length;
          demandTimeSalesTakeProfitPercentage = metDemandTakeProfitPrice / data.data[0].content.length;
          Context.current().heartbeat(JSON.stringify(demandTimeSalesCutPercentage));

          if (demandTimeSalesCutPercentage >= .6) {
            waited += 1;
          } else if (demandTimeSalesCutPercentage >= .6 && waited >= 2) {
            client.close();
          } else if (demandTimeSalesTakeProfitPercentage >= .6) {
            client.close();
          } else if (demandTimeSalesStopLossPercentage >= .4) {
            client.close();
          }

        } else if (demandOrSupply === 'SUPPLY' && newPositionSetup.supply) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            Context.current().heartbeat(JSON.stringify(i));
            if (data.data[0].content[i]["2"] <= newPositionSetup.supply.cutPosition && data.data[0].content[i]["2"] > newPositionSetup.supply.takeProfit || data.data[0].content[i]["2"] > newPositionSetup.supply.cutPosition && data.data[0].content[i]["2"] <= newPositionSetup.supply.entry) {
              metSupplyCutPrice += 1;
            } else if (data.data[0].content[i]["2"] <= newPositionSetup.supply.takeProfit) {
              metSupplyTakeProfitPrice += 1;
            } else if (data.data[0].content[i]["2"] >= newPositionSetup.supply.stopLoss) {
              metSupplyStopLossPrice += 1;
            } else {
              continue;
            }
          }

          supplyTimeSalesCutPercentage = metSupplyCutPrice / data.data[0].content.length;
          supplyTimeSalesStopLossPercentage = metSupplyStopLossPrice / data.data[0].content.length;
          supplyTimeSalesTakeProfitPercentage = metSupplyTakeProfitPrice / data.data[0].content.length;
          Context.current().heartbeat(JSON.stringify(supplyTimeSalesCutPercentage));

          if (supplyTimeSalesCutPercentage >= .6) {
            waited += 1;
          } else if (supplyTimeSalesCutPercentage >= .6 && waited >= 2) {
            client.close();
          } else if (supplyTimeSalesTakeProfitPercentage >= .6) {
            client.close();
          } else if (supplyTimeSalesStopLossPercentage >= .4) {
            client.close();
          }
        }
      }
    }

    client.onclose = async function () {
      while (remainingQuantity > 0) {
        Context.current().heartbeat(JSON.stringify(remainingQuantity));
        position = await closePosition(symbol, quantity, account_id, access_token);
        Context.current().heartbeat(JSON.stringify("recieved position"));
        closeFilled = await checkIfPositionFilled(position, account_id, access_token);
        Context.current().heartbeat(JSON.stringify("close filled"));
        remainingQuantity = quantity - closeFilled;
        Context.current().heartbeat(JSON.stringify(remainingQuantity));
      }

      resolve('position fully closed!');
    }
  });
}

export async function getUrlCode(): Promise<string> {
  let data = '';
  Context.current().heartbeat(JSON.stringify(data));
  return await new Promise((resolve) => {
    const urlOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/url-code',
      method: 'GET',
      rejectUnauthorized: false,
    }

    const response = https.request(urlOptions, (resp) => {
      resp.on('data', (chunk) => {
        data += chunk;
        Context.current().heartbeat(JSON.stringify(data));
      });

      resp.on('close', () => {
        if (data === null || data === undefined || typeof data !== "string") {
          throw new Error('Url code is not available.');
        }
        if (data[0] === "<") {
          throw new Error('Url code is not available.');
        }
        const parseUrl = url.parse(data, true).query;
        const code = parseUrl.code;
        const postData = JSON.stringify(code);

        Context.current().heartbeat(postData);

        return resolve(postData);
      })
    }).on('error', (e) => {
      throw new Error(e.message);
    });

    Context.current().heartbeat(JSON.stringify("response in motion"));

    response.end();
  });
}

export async function getLoginCredentials(urlCode: string): Promise<string> {
  const encodedPassword = encodeURIComponent(urlCode);
  Context.current().heartbeat(JSON.stringify(encodedPassword));
  let token: string;
  let data = '';

  return await new Promise((resolve) => {
    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/auth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(encodedPassword),
      },
      rejectUnauthorized: false,
    };

    const response = https.request(authOptions, (resp) => {
      resp.on('data', (chunk) => {
        data += chunk;
        Context.current().heartbeat(JSON.stringify(data));
      });

      resp.on('close', () => {
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

    response.write(encodedPassword);
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

      resp.on('close', async () => {
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

export async function getAccount(access_token: string, account_id: string): Promise<Account> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = '';

  return await new Promise((resolve) => {
    const postData = {
      token: encodedtoken,
      accountId: account_id,
    };

    const postDataAsString = JSON.stringify(postData);
    Context.current().heartbeat(postDataAsString);

    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/td-account',
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

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson);
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

export async function placeOrder(access_token: string, account_id: string, order_data: OrdersConfig): Promise<PlaceOrdersResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = '';

  return await new Promise((resolve) => {
    const postData = {
      token: encodedtoken,
      accountId: account_id,
      orderData: order_data
    };

    const postDataAsString = JSON.stringify(postData);
    Context.current().heartbeat(postDataAsString);

    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/td-place-order',
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
        console.log('place order data', data);
        Context.current().heartbeat(JSON.stringify(data));
      });

      resp.on('close', () => {
        if (data === null || data === undefined || data === "") {
          throw new Error('order did not fill');
        }
        const parseJson = JSON.parse(data);
        console.log('parseJson', parseJson);
        try {
          const dataObject = JSON.parse(parseJson);
          return resolve(dataObject);
        } catch (err) { }
        Context.current().heartbeat(JSON.stringify('dataObject'));
        return resolve(parseJson)

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

export async function getOrder(access_token: string, account_id: string, order_id: string): Promise<GetOrderResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = '';

  return await new Promise((resolve) => {
    const postData = {
      token: encodedtoken,
      accountId: account_id,
      orderId: order_id,
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

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson);
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

export async function getOptionChain(access_token: string, option_chain_config: OptionChainConfig): Promise<OptionChainResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  Context.current().heartbeat(JSON.stringify(encodedtoken));
  let data = '';

  return await new Promise((resolve) => {
    const postData = {
      token: encodedtoken,
      optionChainConfig: option_chain_config,
    };

    const postDataAsString = JSON.stringify(postData);
    Context.current().heartbeat(postDataAsString);

    const authOptions = {
      host: `${process.env.API_HOSTNAME}`,
      path: '/api/td-option-chain',
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

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson);
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

export function filterOptionResponse(optionMap: OptionMap, optionType: string): OptionDetails | null {
  const optionsArray: OptionDetails[] = [];

  for (const option in optionMap) {
    Context.current().heartbeat(JSON.stringify('this is the option'));
    if (optionType === "CALL" && optionMap[option][0].delta > .500 && optionMap[option][0].delta < .700) {
      optionsArray.push(optionMap[option][0]);
    }
    if (optionType === "PUT" && optionMap[option][0].delta < -0.400 && optionMap[option][0].delta > -0.800) {
      optionsArray.push(optionMap[option][0]);
    }
  }

  optionsArray.sort((a, b) => (a.ask > b.ask) ? 1 : -1);
  Context.current().heartbeat(JSON.stringify('got the option array'));

  if (optionsArray.length > 1) {
    return optionsArray[1];
  } else if (optionsArray.length === 1) {
    return optionsArray[0];
  }

  return null;
}
