import { WebSocket } from "ws";
import { Context } from "@temporalio/activity";
import * as path from "path";
import * as fs from "fs";
import * as https from "https";
import * as url from "url";
import * as dotenv from "dotenv";
import { tdLogin } from "../tda/middleware/tdLogin";
import { tdAuthUrl } from "../tda/middleware/tdAuthUrl";
import { CurrentPriceData } from "../interfaces/currentPriceData";
import { SurroundingKeyLevels } from "../interfaces/surroundingKeyLevels";
import { SupplyZones, DemandZones } from "../interfaces/supplyDemandZones";
import { PositionSetup } from "../interfaces/positionSetup";
import { OptionsSelection } from "../interfaces/optionsSelection";
import { OpenPositionSignal } from "../interfaces/openPositionSignal";
import { UserPrinciples } from "../interfaces/UserPrinciples";
import { Token } from "../interfaces/token";
import {
  GetOrderResponse,
  OrdersConfig,
  PlaceOrdersResponse,
  AssetType,
  ComplexOrderStrategyType,
  DurationType,
  InstructionType,
  OrderLegType,
  OrderStrategyType,
  OrderType,
  PositionEffect,
  PutCall,
  SessionType,
} from "../interfaces/orders";
import { Account } from "../interfaces/account";
import { ContractType, OptionChainConfig, OptionChainResponse, OptionDetails, OptionMap, RangeType } from "../interfaces/optionChain";
import { SocketResponse } from "../interfaces/websocketEvent";
import * as moment from "moment-timezone";

dotenv.config()



export async function is_market_open(): Promise<boolean> {
  // waits for time to reach 9:50am newyork time then
  // returns true

  let marketOpen = moment().tz('America/New_York').format('H:mm')

  while (marketOpen !== '9:07') {
    marketOpen = moment().tz('America/New_York').format('H:mm')
    Context.current().heartbeat();
  }

  return true;
}

export async function get_surrounding_key_levels(current_price: number, key_levels: number[]): Promise<SurroundingKeyLevels> {
  for (let i = 0; i < key_levels.length; i++) {
    Context.current().heartbeat();
    if (i == 0) {
      if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
        return {
          above_resistance: null,
          resistance: key_levels[i],
          support: key_levels[i + 1],
          below_support: key_levels[i + 2],
        };
      } else if (current_price >= key_levels[i]) {
        return {
          above_resistance: null,
          resistance: null,
          support: key_levels[i],
          below_support: key_levels[i + 1],
        };
      } else {
        continue;
      }
    } else if (i === 1) {
      if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
        return {
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i],
          support: key_levels[i + 1],
          below_support: key_levels[i + 2],
        };
      } else if (current_price > key_levels[i]) {
        return {
          above_resistance: null,
          resistance: key_levels[i - 1],
          support: key_levels[i],
          below_support: key_levels[i + 1],
        };
      } else {
        continue;
      }
    } else if (i >= 2 && i <= key_levels.length - 3) {
      if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
        return {
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i],
          support: key_levels[i + 1],
          below_support: key_levels[i + 2],
        };
      } else if (current_price > key_levels[i]) {
        return {
          above_resistance: key_levels[i - 2],
          resistance: key_levels[i - 1],
          support: key_levels[i],
          below_support: key_levels[i + 1],
        };
      } else {
        continue;
      }
    } else if (i === key_levels.length - 2) {
      if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
        return {
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i],
          support: key_levels[i + 1],
          below_support: null,
        };
      } else if (current_price > key_levels[i]) {
        return {
          above_resistance: key_levels[i + 2],
          resistance: key_levels[i + 1],
          support: key_levels[i],
          below_support: key_levels[i - 1],
        };
      } else {
        continue;
      }
    } else if (i === key_levels.length - 1) {
      if (current_price < key_levels[i]) {
        return {
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i],
          support: null,
          below_support: null,
        };
      } else {
        continue;
      }
    }
  }

  return {
    above_resistance: null,
    resistance: null,
    support: null,
    below_support: null,
  };
}

export async function is_demand_zone(current_price: number, demand_zones: DemandZones[]): Promise<number[][] | null> {
  // finds the demand zone that the price currently resides in else return null
  for (let i = 0; i < 7; i++) {
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
  const surroundingZones: number[][] = [];

  if (demandZone !== null) {
    return demandZone;
  } else {
    for (let i = 0; i < demand_zones.length; i++) {
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
  const surroundingZones: number[][] = [];

  if (supplyZone !== null) {
    return supplyZone;
  } else {
    for (let i = 0; i < supply_zones.length; i++) {
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

export async function get_current_price(wsUri: string, login_request: object, market_request: object, demand_zones: DemandZones[], supply_zones: SupplyZones[]): Promise<CurrentPriceData> {
  // makes a request to td ameritrade User Principals endpoint using the token
  // to get the info needed to make a ameritrade streaming request

  return new Promise(async (resolve) => {
    let closePrice = 0;
    let currentPriceData: CurrentPriceData = {
      closePrice: closePrice,
      demandZone: [],
      supplyZone: [],
    };
    let marketClose = moment().tz('America/New_York').format('Hmm');
    let isMarketClosed = false;
    let messageCount = 0;
    const messages: SocketResponse[] | null = [];

    const client = await websocketClient(wsUri);

    await waitForClientConnection(client);

    await sendClientRequest(client, login_request)

    await waitForClientLoginMessage(client);

    await client.send(JSON.stringify(market_request));

    client.onmessage = event => {
      Context.current().heartbeat();
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600 || messageCount >= 1) {
        isMarketClosed = true;
        client.close();
      }

      const data = JSON.parse(JSON.parse(JSON.stringify(event.data)));

      if (data.data) {
        messages.push(data.data[0].content[0]);
        messageCount += 1;
        client.close();
      }
    };

    client.onclose = async function () {
      if (isMarketClosed) {
        resolve(currentPriceData);
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
        resolve(currentPriceData);
      } else if (demandZone?.length >= 1) {
        currentPriceData = {
          closePrice,
          demandZone,
          supplyZone: [],
        };
        resolve(currentPriceData);
      } else if (supplyZone?.length >= 1) {
        currentPriceData = {
          closePrice,
          demandZone: [],
          supplyZone,
        };
        resolve(currentPriceData);
      } else {
        resolve(currentPriceData);
      }
    }
  });
}

export async function get_position_setup(surrounding_key_levels: SurroundingKeyLevels, demand_zone: number[][], supply_zone: number[][]): Promise<PositionSetup> {
  if (demand_zone[0] && supply_zone[0]) {
    if (surrounding_key_levels.above_resistance !== null && surrounding_key_levels.resistance !== null && surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
      return {
        demand: {
          entry: surrounding_key_levels.resistance,
          stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
          takeProfit: surrounding_key_levels.above_resistance,
          cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance),
        },
        supply: {
          entry: surrounding_key_levels.support,
          stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
          takeProfit: surrounding_key_levels.below_support,
          cutPosition: (((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2) - surrounding_key_levels.below_support),
        },
      };
    } else if (surrounding_key_levels.resistance === null || surrounding_key_levels.above_resistance === null) {
      if (surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
        return {
          demand: null,
          supply: {
            entry: surrounding_key_levels.support,
            stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
            takeProfit: surrounding_key_levels.below_support,
            cutPosition: (((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2) - surrounding_key_levels.below_support)
          },
        };
      }
    } else if (surrounding_key_levels.support === null || surrounding_key_levels.below_support === null) {
      if (surrounding_key_levels.resistance !== null && surrounding_key_levels.above_resistance !== null) {
        return {
          demand: {
            entry: surrounding_key_levels.resistance,
            stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
            takeProfit: surrounding_key_levels.above_resistance,
            cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance),
          },
          supply: null,
        };
      }
    } else {
      return {
        demand: null,
        supply: null,
      };
    }
  } else if (demand_zone[0]) {
    if (surrounding_key_levels.above_resistance !== null && surrounding_key_levels.resistance !== null && surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
      return {
        demand: {
          entry: surrounding_key_levels.resistance,
          stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
          takeProfit: surrounding_key_levels.above_resistance,
          cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance),
        },
        supply: null,
      }
    } else if (surrounding_key_levels.support === null || surrounding_key_levels.below_support === null) {
      if (surrounding_key_levels.resistance !== null && surrounding_key_levels.above_resistance !== null) {
        return {
          demand: {
            entry: surrounding_key_levels.resistance,
            stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
            takeProfit: surrounding_key_levels.above_resistance,
            cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance),
          },
          supply: null,
        };
      }
    } else if (surrounding_key_levels.resistance === null || surrounding_key_levels.above_resistance === null) {
      if (surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
        return {
          demand: null,
          supply: {
            entry: surrounding_key_levels.support,
            stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
            takeProfit: surrounding_key_levels.below_support,
            cutPosition: (((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2) - surrounding_key_levels.below_support),
          },
        };
      }
    } else {
      return {
        demand: null,
        supply: null,
      };
    }
  } else if (supply_zone[0]) {
    if (surrounding_key_levels.above_resistance !== null && surrounding_key_levels.resistance !== null && surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
      return {
        demand: null,
        supply: {
          entry: surrounding_key_levels.support,
          stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
          takeProfit: surrounding_key_levels.below_support,
          cutPosition: (((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2) - surrounding_key_levels.below_support),
        },
      }
    } else if (surrounding_key_levels.support === null || surrounding_key_levels.below_support === null) {
      if (surrounding_key_levels.resistance !== null && surrounding_key_levels.above_resistance !== null) {
        return {
          demand: {
            entry: surrounding_key_levels.resistance,
            stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
            takeProfit: surrounding_key_levels.above_resistance,
            cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance),
          },
          supply: null,
        };
      }
    } else if (surrounding_key_levels.resistance === null || surrounding_key_levels.above_resistance === null) {
      if (surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
        return {
          demand: null,
          supply: {
            entry: surrounding_key_levels.support,
            stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
            takeProfit: surrounding_key_levels.below_support,
            cutPosition: (((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2) - surrounding_key_levels.below_support)
          },
        };
      }
    } else {
      return {
        demand: null,
        supply: null,
      };
    }
  }
  return {
    demand: null,
    supply: null,
  };
}

export async function getOptionsSelection(position_setup: PositionSetup, symbol: string, access_token: string): Promise<OptionsSelection | null> {

  let callOptionResponse: OptionChainResponse | null = null;
  let putOptionResponse: OptionChainResponse | null = null;
  const toDate = moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD');
  const fromDate = moment().isoWeekday() !== 5 ? moment().add((moment().isoWeekday() % 5), 'day').subtract(1, 'day').format('YYYY-MM-DD') : moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD');
  const numberOfDaysAway = moment().isoWeekday() !== 5 ? ((moment().isoWeekday() % 5) - 1) : 0;
  const optionString = `${fromDate}:${numberOfDaysAway}`;

  if (position_setup.demand !== null) {
    callOptionResponse = await getOptionChain(access_token, {
      symbol: symbol,
      contractType: ContractType.CALL,
      range: RangeType.ITM,
      fromDate: fromDate,
      toDate: toDate,
      strikeCount: 20,
    });
  }

  if (position_setup.supply !== null) {
    putOptionResponse = await getOptionChain(access_token, {
      symbol: symbol,
      contractType: ContractType.PUT,
      range: RangeType.ITM,
      fromDate: fromDate,
      toDate: toDate,
      strikeCount: 20,
    });
  }

  if (callOptionResponse !== null && putOptionResponse !== null) {
    const call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL");
    const put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT");

    if (call && put) {
      return {
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
      };
    } else if (call) {
      return {
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
      };
    } else if (put) {
      return {
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
      };
    }


  } else if (callOptionResponse !== null) {
    const call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL");

    return {
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
    };
  } else if (putOptionResponse !== null) {
    const put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT");

    return {
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
    };
  } else {
    return {
      CALL: null,
      PUT: null,
    };
  }
}

export async function checkAccountAvailableBalance(access_token: string, account_id: string): Promise<number> {
  const getAccountResponse = await getAccount(access_token, account_id);
  const availableBalance = getAccountResponse.securitiesAccount.projectBalances.cashAvailableForTrading;

  return availableBalance;
}

export async function openPosition(options: OptionsSelection, optionType: string, budget: number, account_id: string, access_token: string): Promise<PlaceOrdersResponse | null> {
  let price = 0;
  let quantity = 0;
  let symbol = '';

  if (options.CALL === null && options.PUT === null) {
    return null;
  } else if (options.CALL !== null && options.PUT !== null) {
    const quantityCall = Math.floor(budget / options.CALL.ask);
    const quantityPut = Math.floor(budget / options.PUT.ask);
    price = optionType === 'CALL' ? options.CALL.ask : options.PUT.ask;
    symbol = optionType === 'CALL' ? options.CALL.symbol : options.PUT.symbol;
    quantity = optionType === 'CALL' ? quantityCall : quantityPut;
  } else if (options.CALL !== null) {
    const quantityCall = Math.floor(budget / options.CALL.ask);
    price = options.CALL.ask;
    symbol = options.CALL.symbol;
    quantity = quantityCall;
  } else if (options.PUT !== null) {
    const quantityPut = Math.floor(budget / options.PUT.ask);
    price = options.PUT.ask;
    symbol = options.PUT.symbol;
    quantity = quantityPut;
  }

  const accountBalance = await checkAccountAvailableBalance(access_token, account_id);

  if (accountBalance < price) {
    return null;
  }

  const openPositionResponse = await placeOrder(access_token, account_id, {
    accountId: account_id,
    order: {
      orderType: OrderType.LIMIT,
      price: price,
      session: SessionType.NORMAL,
      duration: DurationType.FILL_OR_KILL,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: {
        orderLegType: OrderLegType.OPTION,
        instruction: InstructionType.BUY_TO_OPEN,
        quantity: quantity,
        positionEffect: PositionEffect.AUTOMATIC,
        instrument: {
          assetType: AssetType.OPTION,
          symbol: symbol,
          putCall: optionType === 'CALL' ? PutCall.CALL : PutCall.PUT,
        },
      },
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  });

  return openPositionResponse;
}

export async function checkIfPositionFilled(order_id: PlaceOrdersResponse, account_id: string, access_token: string): Promise<number> {
  const position = await getOrder(access_token, account_id, order_id.orderId);

  if (position.status === 'FILLED' && position.filledQuantity) {
    return position.filledQuantity;
  } else {
    return 0;
  }
}

export async function waitToSignalOpenPosition(wsUri: string, login_request: object, book_request: object, time_sales_request: object, position_setup: PositionSetup, options: OptionsSelection, budget: number, account_id: string, access_token: string): Promise<OpenPositionSignal> {
  return new Promise(async (resolve) => {
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
    let position: PlaceOrdersResponse | null = null;
    let noGoodBuys = false;
    let demandOrSupply = '';
    let callOrPut = '';
    let marketClose = moment().tz('America/New_York').format('Hmm');

    // const bookClient = await websocketClient(wsUri);
    const timeSalesClient = await websocketClient(wsUri);

    // await waitForClientConnection(bookClient);
    await waitForClientConnection(timeSalesClient);

    // await sendClientRequest(bookClient, login_request);
    await sendClientRequest(timeSalesClient, login_request);

    // await waitForClientLoginMessage(bookClient);
    await waitForClientLoginMessage(timeSalesClient);

    // await bookClient.send(JSON.stringify(book_request));
    await timeSalesClient.send(JSON.stringify(time_sales_request));

    timeSalesClient.onmessage = async function (event) {
      Context.current().heartbeat();
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600) {
        noGoodBuys = true;
        timeSalesClient.close();
      }

      const data = JSON.parse(JSON.parse(JSON.stringify(event.data)));

      if (data.data) {
        if (position_setup.demand && position_setup.supply) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            if (data.data[0].content[i]["2"] >= position_setup.demand.entry && data.data[0].content[i]["2"] < position_setup.demand.cutPosition) {
              metDemandEntryPrice += 1;
              demandSize += data.data[0].content[i]["3"];
            } else if (data.data[0].content[i]["2"] > position_setup.demand.entry && demandForming >= 2) {
              demandConfirmation = true;
            } else if (data.data[0].content[i]["2"] <= position_setup.supply.entry && data.data[0].content[i]["2"] > position_setup.supply.cutPosition) {
              metSupplyEntryPrice += 1;
              supplySize += data.data[0].content[i]["3"];
            } else if (data.data[0].content[i]["2"] < position_setup.supply.entry && supplyForming >= 2) {
              supplyConfirmation = true;
            } else {
              continue;
            }
          }

          demandTimeSalesEntryPercentage = metDemandEntryPrice / data.data[0].content.length;
          supplyTimeSalesEntryPercentage = metSupplyEntryPrice / data.data[0].content.length;

          if (demandTimeSalesEntryPercentage >= .6) {
            demandForming += 1;
          } else if (supplyTimeSalesEntryPercentage >= .6) {
            supplyForming += 1;
          }

          if (demandForming >= 3 && demandSize > supplySize || demandForming > 1 && demandConfirmation) {
            callOrPut = 'CALL';
            demandOrSupply = 'DEMAND';
            timeSalesClient.close();
          } else if (supplyForming >= 3 && supplySize > demandSize || supplyForming > 1 && supplyConfirmation) {
            callOrPut = 'PUT';
            demandOrSupply = 'SUPPLY';
            timeSalesClient.close();
          }
        } else if (position_setup.demand) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            if (data.data[0].content[i]["2"] >= position_setup.demand.entry && data.data[0].content[i]["2"] < position_setup.demand.cutPosition) {
              metDemandEntryPrice += 1;
              demandSize += data.data[0].content[i]["3"];
            } else if (data.data[0].content[i]["2"] > position_setup.demand.entry && demandForming >= 2) {
              demandConfirmation = true;
            } else {
              continue;
            }
          }

          demandTimeSalesEntryPercentage = metDemandEntryPrice / data.data[0].content.length;

          if (demandTimeSalesEntryPercentage >= .6) {
            demandForming += 1;
          }

          if (demandForming >= 3 && demandSize > supplySize || demandForming > 1 && demandConfirmation) {
            callOrPut = 'CALL';
            demandOrSupply = 'DEMAND';
            timeSalesClient.close();
          }
        } else if (position_setup.supply) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            if (data.data[0].content[i]["2"] <= position_setup.supply.entry && data.data[0].content[i]["2"] > position_setup.supply.cutPosition) {
              metSupplyEntryPrice += 1;
              supplySize += data.data[0].content[i]["3"];
            } else if (data.data[0].content[i]["2"] < position_setup.supply.entry && supplyForming >= 2) {
              supplyConfirmation = true;
            } else {
              continue;
            }
          }

          supplyTimeSalesEntryPercentage = metSupplyEntryPrice / data.data[0].content.length;

          if (supplyTimeSalesEntryPercentage >= .6) {
            supplyForming += 1;
          }

          if (supplyForming >= 3 && supplySize > demandSize || supplyForming > 1 && supplyConfirmation) {
            callOrPut = 'PUT';
            demandOrSupply = 'SUPPLY';
            timeSalesClient.close();
          }
        }
      }
    }

    timeSalesClient.onclose = async function () {
      console.log('waitToSignalOpenPosition socket closed');
      position = await openPosition(options, callOrPut, budget, account_id, access_token);

      resolve({
        position,
        noGoodBuys,
        demandOrSupply,
      });
    }
  })
}

export async function getOptionSymbol(order_id: PlaceOrdersResponse, account_id: string, access_token: string): Promise<string> {
  const option = await getOrder(access_token, account_id, order_id.orderId);

  if (option.orderLegCollection?.instrument.symbol) {
    return option.orderLegCollection?.instrument.symbol;
  } else {
    return '';
  }

}

export async function cutPosition(symbol: string, quantity: number, account_id: string, access_token: string): Promise<PlaceOrdersResponse> {
  const newQuantity = Math.floor(quantity / 2);

  const cutPositionResponse = await placeOrder(access_token, account_id, {
    accountId: account_id,
    order: {
      orderType: OrderType.MARKET,
      session: SessionType.NORMAL,
      duration: DurationType.FILL_OR_KILL,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: {
        orderLegType: OrderLegType.OPTION,
        instruction: InstructionType.SELL_TO_CLOSE,
        quantity: newQuantity,
        positionEffect: PositionEffect.AUTOMATIC,
        instrument: {
          assetType: AssetType.OPTION,
          symbol: symbol,
        },
      },
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  });

  return cutPositionResponse;
}

export async function closePosition(symbol: string, quantity: number, account_id: string, access_token: string): Promise<PlaceOrdersResponse> {
  const closePositionResponse = await placeOrder(access_token, account_id, {
    accountId: account_id,
    order: {
      orderType: OrderType.MARKET,
      session: SessionType.NORMAL,
      duration: DurationType.FILL_OR_KILL,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: {
        orderLegType: OrderLegType.OPTION,
        instruction: InstructionType.SELL_TO_CLOSE,
        quantity: quantity,
        positionEffect: PositionEffect.AUTOMATIC,
        instrument: {
          assetType: AssetType.OPTION,
          symbol: symbol,
        },
      },
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  });

  return closePositionResponse;
}

export async function waitToSignalCutPosition(wsUri: string, login_request: object, book_request: object, time_sales_request: object, symbol: string, quantity: number, demandOrSupply: string, position_setup: PositionSetup, account_id: string, access_token: string): Promise<number> {
  return new Promise(async (resolve) => {
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
    let position: PlaceOrdersResponse | null = null;
    let skipCut = false;
    let stoppedOut = false;
    let marketClose = moment().tz('America/New_York').format('Hmm');
    let cutFilled = 0;

    // const bookClient = await websocketClient(wsUri);
    const timeSalesClient = await websocketClient(wsUri);

    // await waitForClientConnection(bookClient);
    await waitForClientConnection(timeSalesClient);

    // await sendClientRequest(bookClient, login_request);
    await sendClientRequest(timeSalesClient, login_request);

    // await waitForClientLoginMessage(bookClient);
    await waitForClientLoginMessage(timeSalesClient);

    // await bookClient.send(JSON.stringify(book_request));
    await timeSalesClient.send(JSON.stringify(time_sales_request));

    timeSalesClient.onmessage = async function (event) {
      Context.current().heartbeat();
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600 || quantity < 2) {
        skipCut = true;
        timeSalesClient.close();
      }

      const data = JSON.parse(JSON.stringify(event.data));

      if (data.data) {
        if (demandOrSupply === 'DEMAND' && position_setup.demand) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            if (data.data[0].content[i]["2"] >= position_setup.demand.cutPosition && data.data[0].content[i]["2"] < position_setup.demand.takeProfit) {
              metDemandCutPrice += 1;
            } else if (data.data[0].content[i]["2"] <= position_setup.demand.stopLoss) {
              metDemandStopLossPrice += 1;
            } else if (data.data[0].content[i]["2"] >= position_setup.demand.takeProfit) {
              metDemandTakeProfitPrice += 1;
            } else {
              continue;
            }
          }

          demandTimeSalesCutPercentage = metDemandCutPrice / data.data[0].content.length;
          demandTimeSalesStopLossPercentage = metDemandStopLossPrice / data.data[0].content.length;
          demandTimeSalesTakeProfitPercentage = metDemandTakeProfitPrice / data.data[0].content.length;

          if (demandTimeSalesCutPercentage >= .6) {
            timeSalesClient.close();
          } else if (demandTimeSalesStopLossPercentage >= .4) {
            stoppedOut = true;
            timeSalesClient.close();
          } else if (demandTimeSalesTakeProfitPercentage >= .6) {
            skipCut = true;
            timeSalesClient.close();
          }

        } else if (demandOrSupply === 'SUPPLY' && position_setup.supply) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            if (data.data[0].content[i]["2"] <= position_setup.supply.cutPosition && data.data[0].content[i]["2"] > position_setup.supply.takeProfit) {
              metSupplyCutPrice += 1;
            } else if (data.data[0].content[i]["2"] >= position_setup.supply.stopLoss) {
              metSupplyStopLossPrice += 1;
            } else if (data.data[0].content[i]["2"] <= position_setup.supply.takeProfit) {
              metSupplyTakeProfitPrice += 1;
            } else {
              continue;
            }
          }

          supplyTimeSalesCutPercentage = metSupplyCutPrice / data.data[0].content.length;
          supplyTimeSalesStopLossPercentage = metSupplyStopLossPrice / data.data[0].content.length;
          supplyTimeSalesTakeProfitPercentage = metSupplyTakeProfitPrice / data.data[0].content.length;

          if (supplyTimeSalesCutPercentage >= .6) {
            timeSalesClient.close();
          } else if (supplyTimeSalesStopLossPercentage >= .4) {
            stoppedOut = true;
            timeSalesClient.close();
          } else if (supplyTimeSalesTakeProfitPercentage >= .6) {
            skipCut = true;
            timeSalesClient.close();
          }
        }
      }
    };

    timeSalesClient.onclose = async function () {
      console.log('waitToSignalClosePosition socket closed');
      if (skipCut) {
        resolve(cutFilled);
      } else if (stoppedOut) {
        position = await closePosition(symbol, quantity * 2, account_id, access_token);
        cutFilled = await checkIfPositionFilled(position, account_id, access_token);
        resolve(cutFilled);
      } else {
        position = await cutPosition(symbol, quantity, account_id, access_token);
        cutFilled = await checkIfPositionFilled(position, account_id, access_token);
        resolve(cutFilled);
      }
    }
  })
}

export async function waitToSignalClosePosition(wsUri: string, login_request: object, book_request: object, time_sales_request: object, symbol: string, quantity: number, demandOrSupply: string, position_setup: PositionSetup, account_id: string, access_token: string): Promise<PlaceOrdersResponse> {
  return new Promise(async (resolve) => {
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
    let position: PlaceOrdersResponse;
    let marketClose = moment().tz('America/New_York').format('Hmm');
    let closeFilled = 0;
    let remainingQuantity = quantity;
    let waited = 0;

    // const bookClient = await websocketClient(wsUri);
    const timeSalesClient = await websocketClient(wsUri);

    // await waitForClientConnection(bookClient);
    await waitForClientConnection(timeSalesClient);

    // await sendClientRequest(bookClient, login_request);
    await sendClientRequest(timeSalesClient, login_request);

    // await waitForClientLoginMessage(bookClient);
    await waitForClientLoginMessage(timeSalesClient);

    // await bookClient.send(JSON.stringify(book_request));
    await timeSalesClient.send(JSON.stringify(time_sales_request));

    timeSalesClient.onmessage = async function (event) {
      Context.current().heartbeat();
      marketClose = moment().tz('America/New_York').format('Hmm');

      if (parseInt(marketClose) >= 1600) {
        timeSalesClient.close();
      }

      const data = JSON.parse(JSON.stringify(event.data));

      if (data.data) {
        if (demandOrSupply === 'DEMAND' && position_setup.demand) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            if (data.data[0].content[i]["2"] >= position_setup.demand.cutPosition && data.data[0].content[i]["2"] < position_setup.demand.takeProfit || data.data[0].content[i]["2"] < position_setup.demand.cutPosition && data.data[0].content[i]["2"] >= position_setup.demand.entry) {
              metDemandCutPrice += 1;
            } else if (data.data[0].content[i]["2"] >= position_setup.demand.takeProfit) {
              metDemandTakeProfitPrice += 1;
            } else if (data.data[0].content[i]["2"] <= position_setup.demand.stopLoss) {
              metDemandStopLossPrice += 1;
            } else {
              continue;
            }
          }

          demandTimeSalesCutPercentage = metDemandCutPrice / data.data[0].content.length;
          demandTimeSalesStopLossPercentage = metDemandStopLossPrice / data.data[0].content.length;
          demandTimeSalesTakeProfitPercentage = metDemandTakeProfitPrice / data.data[0].content.length;

          if (demandTimeSalesCutPercentage >= .6) {
            waited += 1;
          } else if (demandTimeSalesCutPercentage >= .6 && waited >= 2) {
            timeSalesClient.close();
          } else if (demandTimeSalesTakeProfitPercentage >= .6) {
            timeSalesClient.close();
          } else if (demandTimeSalesStopLossPercentage >= .4) {
            timeSalesClient.close();
          }

        } else if (demandOrSupply === 'SUPPLY' && position_setup.supply) {
          for (let i = 0; i < data.data[0].content.length; i++) {
            if (data.data[0].content[i]["2"] <= position_setup.supply.cutPosition && data.data[0].content[i]["2"] > position_setup.supply.takeProfit || data.data[0].content[i]["2"] > position_setup.supply.cutPosition && data.data[0].content[i]["2"] <= position_setup.supply.entry) {
              metSupplyCutPrice += 1;
            } else if (data.data[0].content[i]["2"] <= position_setup.supply.takeProfit) {
              metSupplyTakeProfitPrice += 1;
            } else if (data.data[0].content[i]["2"] >= position_setup.supply.stopLoss) {
              metSupplyStopLossPrice += 1;
            } else {
              continue;
            }
          }

          supplyTimeSalesCutPercentage = metSupplyCutPrice / data.data[0].content.length;
          supplyTimeSalesStopLossPercentage = metSupplyStopLossPrice / data.data[0].content.length;
          supplyTimeSalesTakeProfitPercentage = metSupplyTakeProfitPrice / data.data[0].content.length;

          if (supplyTimeSalesCutPercentage >= .6) {
            waited += 1;
          } else if (supplyTimeSalesCutPercentage >= .6 && waited >= 2) {
            timeSalesClient.close();
          } else if (supplyTimeSalesTakeProfitPercentage >= .6) {
            timeSalesClient.close();
          } else if (supplyTimeSalesStopLossPercentage >= .4) {
            timeSalesClient.close();
          }
        }
      }
    }

    timeSalesClient.onclose = async function () {
      console.log('waitToSignalClosePosition socket closed');

      while (remainingQuantity > 0) {
        position = await closePosition(symbol, quantity, account_id, access_token);
        closeFilled = await checkIfPositionFilled(position, account_id, access_token);
        remainingQuantity = quantity - closeFilled;
      }

      resolve(position);
    }
  });
}

export async function getLoginCredentials(client_id: string): Promise<string> {
  const address = await tdAuthUrl(client_id);
  const urlCode = await tdLogin(address);
  const parseUrl = url.parse(urlCode, true).query;
  const code = parseUrl.code;
  const postData = JSON.stringify(code);
  const encodedPassword = encodeURIComponent(postData);
  let token: Token;
  let data = '';

  return new Promise((resolve, reject) => {
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
      });

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        token = JSON.parse(parseJson);
        const access_token_expire = Date.now() + token.expires_in;
        const refresh_token_expire = Date.now() + token.refresh_token_expires_in;
        const tokenJSON = {
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          access_token_expires_at: access_token_expire,
          refresh_token_expires_at: refresh_token_expire,
          logged_in: true,
          access_token_expires_at_date: moment(access_token_expire).toISOString(),
          refresh_token_expires_at_date: moment(refresh_token_expire).toISOString(),
        };

        fs.writeFile(path.resolve(__dirname, "../tda/token.json"), JSON.stringify(tokenJSON, null, 1), function (err) {
          if (err) console.log(err);
        });

        return resolve(tokenJSON.access_token);
      })
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e);
    });

    response.write(encodedPassword);
    response.end();
  });
}

export function getUserPrinciples(access_token: string): Promise<UserPrinciples> {
  const encodedtoken = encodeURIComponent(access_token);
  let data = '';

  return new Promise((resolve, reject) => {
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
      });

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson)
        return resolve(dataObject)
      });
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e);
    });

    response.on('timeout', () => {
      console.log('connection timedout');
    });

    response.write(encodedtoken);
    response.end();
  });
}

export function getAccount(access_token: string, account_id: string): Promise<Account> {
  const encodedtoken = encodeURIComponent(access_token);
  let data = '';

  return new Promise((resolve, reject) => {
    const postData = {
      token: encodedtoken,
      accountId: account_id,
    };

    const postDataAsString = JSON.stringify(postData);

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
      });

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson)
        return resolve(dataObject);
      });
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e);
    });

    response.on('timeout', () => {
      console.log('connection timedout');
    });

    response.write(postDataAsString);
    response.end();
  });
}

export function placeOrder(access_token: string, account_id: string, order_data: OrdersConfig): Promise<PlaceOrdersResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  let data = '';

  return new Promise((resolve, reject) => {
    const postData = {
      token: encodedtoken,
      accountId: account_id,
      orderData: order_data
    };

    const postDataAsString = JSON.stringify(postData);

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
      });

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson)
        resolve(dataObject);
      });
    }).on('error', (e) => {
      console.error('error', e);
      reject(e);
    });

    response.on('timeout', () => {
      console.log('connection timedout');
    });

    response.write(postDataAsString);
    response.end();
  });
}

export function getOrder(access_token: string, account_id: string, order_id: string): Promise<GetOrderResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  let data = '';

  return new Promise((resolve, reject) => {
    const postData = {
      token: encodedtoken,
      accountId: account_id,
      orderId: order_id,
    };

    const postDataAsString = JSON.stringify(postData);

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
      });

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson);
        resolve(dataObject);
      });
    }).on('error', (e) => {
      console.error('error', e);
      reject(e);
    });

    response.on('timeout', () => {
      console.log('connection timedout');
    });

    response.write(postDataAsString);
    response.end();
  });
}

export function getOptionChain(access_token: string, option_chain_config: OptionChainConfig): Promise<OptionChainResponse> {
  const encodedtoken = encodeURIComponent(access_token);
  let data = '';

  return new Promise((resolve, reject) => {
    const postData = {
      token: encodedtoken,
      optionChainConfig: option_chain_config,
    };

    const postDataAsString = JSON.stringify(postData);

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
      });

      resp.on('close', () => {
        const parseJson = JSON.parse(data);
        const dataObject = JSON.parse(parseJson);
        resolve(dataObject);
      });
    }).on('error', (e) => {
      console.error('error', e);
      reject(e);
    });

    response.on('timeout', () => {
      console.log('connection timedout');
    });

    response.write(postDataAsString);
    response.end();
  });
}

export function filterOptionResponse(optionMap: OptionMap, optionType: string): OptionDetails | null {
  const optionsArray: OptionDetails[] = [];

  for (const option in optionMap) {
    if (optionType === "CALL" && optionMap[option][0].delta > .500 && optionMap[option][0].delta < .700) {
      optionsArray.push(optionMap[option][0]);
    }
    if (optionType === "PUT" && optionMap[option][0].delta > -.500 && optionMap[option][0].delta < -.700) {
      optionsArray.push(optionMap[option][0]);
    }
  }

  optionsArray.sort((a, b) => (a.ask > b.ask) ? 1 : -1);

  if (optionsArray.length > 1) {
    return optionsArray[1];
  } else if (optionsArray.length === 1) {
    return optionsArray[0];
  }

  return null;
}

export function websocketClient(url: string): WebSocket {
  const client = new WebSocket(url);

  client.onopen = () => {
    console.log('client connection created');
  };

  client.onerror = (err) => {
    console.error(err);
  }

  return (client);
}

export async function sendClientRequest(client: WebSocket, request: object): Promise<void> {
  try {
    client.send(JSON.stringify(request));
  } catch (err) {
    console.log(err)
  }
}

export async function waitForClientConnection(client): Promise<void> {
  return new Promise((resolve) => {
    if (client.readyState !== client.OPEN) {
      client.addEventListener("open", () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export async function waitForClientLoginMessage(client): Promise<void> {
  return new Promise((resolve) => {
    let message = {
      response: [
        {
          service: '',
          requestid: '',
          command: '',
          timestamp: 0,
          content: {}
        }
      ]
    }

    if (!message.response || message.response[0].command !== "LOGIN") {
      client.addEventListener("message", (event) => {
        message = JSON.parse(JSON.parse(JSON.stringify(event.data)));
        resolve();
      });
    } else {
      resolve();
    }
  });
}