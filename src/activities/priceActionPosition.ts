import { WebSocket } from "ws"
import { Context } from "@temporalio/activity"
import path from "path"
import fs from "fs"
import https from "https"
import url from "url"
import { tdLogin } from "../tda/middleware/tdLogin"
import { tdAuthUrl } from "../tda/middleware/tdAuthUrl"
import { CurrentPriceData } from "../interfaces/currentPriceData"
import { SupportKeyLevels } from "../interfaces/supportKeyLevels"
import { SupplyDemandZones } from "../interfaces/supplyDemandZones"
import { PositionSetup } from "../interfaces/positionSetup"
import { OptionsSelection } from "../interfaces/optionsSelection"
import { OpenPositionSignal } from "../interfaces/openPositionSignal"
import { UserPrinciples } from "../interfaces/UserPrinciples"
import { Token } from "../interfaces/token"
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
  SessionType 
} from "../interfaces/orders"
import { SecuritiesAccount } from "../interfaces/account"
import { OptionChainConfig, OptionChainResponse, ContractType  } from "../interfaces/optionChain"
import { SocketResponse } from "../interfaces/websocketEvent"
import moment from "moment-timezone"



export async function is_market_open(): Promise<boolean> {
  // waits for time to reach 9:50am newyork time then
  // returns true

  let marketOpen = moment().tz('America/New_York').format('H:mm')

  while (marketOpen !== '9:50') {
    marketOpen = moment().tz('America/New_York').format('H:mm')
    Context.current().heartbeat();
  }

  return true
}

export async function get_surrounding_key_levels(current_price: number, key_levels: number[]): Promise<SupportKeyLevels> {
  // 

  for (let i = 0; i < key_levels.length; i++){
    Context.current().heartbeat();
    if (i == 0){
      if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
        return {
          above_resistance: null,
          resistance: key_levels[i], 
          support: key_levels[i + 1],
          below_support: key_levels[i + 2]
        }
      } else if (current_price >= key_levels[i]) {
        return {
          above_resistance: null,
          resistance: null, 
          support: key_levels[i],
          below_support: key_levels[i + 1]
        }
      } else {
        continue
      }
    } else if (i === 1) {
      if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
        return {
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i], 
          support: key_levels[i + 1],
          below_support: key_levels[i + 2]
        }
      } else if (current_price > key_levels[i]) {
        return {
          above_resistance: null,
          resistance: key_levels[i - 1], 
          support: key_levels[i],
          below_support: key_levels[i + 1]
        }
      } else {
        continue
      }
    } else if ( i >= 2 && i <= key_levels.length - 3) {
      if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
        return {
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i], 
          support: key_levels[i + 1],
          below_support: key_levels[i + 2]
        }
      } else if (current_price > key_levels[i]) {
        return {
          above_resistance: key_levels[i - 2],
          resistance: key_levels[i - 1], 
          support: key_levels[i],
          below_support: key_levels[i + 1]
        }
      } else {
        continue
      }
    } else if (i === key_levels.length - 2) {
      if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
        return {
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i], 
          support: key_levels[i + 1],
          below_support: null
        }
      } else if (current_price > key_levels[i]) {
        return {
          above_resistance: key_levels[i + 2],
          resistance: key_levels[i + 1], 
          support: key_levels[i],
          below_support: key_levels[i - 1]
        }
      } else {
        continue
      }
    } else if (i === key_levels.length - 1) {
      if (current_price < key_levels[i]) {
        return {
          above_resistance: key_levels[i - 1],
          resistance: key_levels[i], 
          support: null,
          below_support: null
        }
      } else {
        continue
      }
    }
  }

  return {
    above_resistance: null,
    resistance: null, 
    support: null,
    below_support: null
  }
}

export async function is_demand_zone(current_price: number, demand_zones: SupplyDemandZones[][]): Promise<number[][] | null> {
  // finds the demand zone that the price currently resides in else return null
  for (let i = 0; i < 7; i++) {
    if (current_price > demand_zones[i][0].double && current_price < demand_zones[i][1].double) {
      const zone = [[demand_zones[i][0].double, demand_zones[i][1].double]]
      return zone
    } else {
      continue
    }
  }

  return null
}

export async function find_demand_zone(current_price: number, demand_zones: SupplyDemandZones[][]): Promise<number[][] | null> {
  const demandZone = await is_demand_zone(current_price, demand_zones)
  const surroundingZones = []

  if (demandZone !== null) {
    return demandZone
  } else {
    for (let i = 0; i < demand_zones.length; i++) {
      if (i < demand_zones.length - 1 && (current_price < demand_zones[i][1].double && current_price > demand_zones[i+1][0].double)) {
        const zone1 = [demand_zones[i][0].double, demand_zones[i][1].double]
        const zone2 = [demand_zones[i+1][0].double, demand_zones[i+1][1].double]
        surroundingZones.push(zone1, zone2)
        return surroundingZones
      } else {
        continue
      }
    }

    return null
  }
}

export async function is_supply_zone(current_price: number, supply_zones: SupplyDemandZones[][]): Promise<number[][] | null> {
  // finds the supply zone that the price currently resides in or is closest too
  for (let i = 0; i < supply_zones.length; i++) {
    if (current_price < supply_zones[i][0].double && current_price > supply_zones[i][1].double) {
      const zone = [[supply_zones[i][0].double, supply_zones[i][1].double]]
      return zone
    } else {
      continue
    }
  }

  return null
}

export async function find_supply_zone(current_price: number, supply_zones: SupplyDemandZones[][]): Promise<number[][] | null> {
  const supplyZone = await is_supply_zone(current_price, supply_zones)
  const surroundingZones = []

  if (supplyZone !== null) {
    return supplyZone
  } else {
    for (let i = 0; i < supply_zones.length; i++) {
      if (i < supply_zones.length - 1 && (current_price < supply_zones[i][0].double && current_price > supply_zones[i+1][1].double)) {
        const zone1 = [supply_zones[i][0].double, supply_zones[i][1].double]
        const zone2 = [supply_zones[i+1][0].double, supply_zones[i+1][1].double]
        surroundingZones.push(zone1, zone2)
        return surroundingZones
      } else {
        continue
      }
    }

    return null
  }
}

export async function get_current_price(wsUri:string, request:object, demand_zones: SupplyDemandZones[][], supply_zones: SupplyDemandZones[][]): Promise<CurrentPriceData> {
  // makes a request to td ameritrade User Principals endpoint using the token
  // to get the info needed to make a ameritrade streaming request

  let closePrice = 0
  let currentPriceData: CurrentPriceData = {
    closePrice: closePrice,
    demandZone: [[0]],
    supplyZone: [[0]]
  }
  let marketClose = moment().tz('America/New_York').format('Hmm')
  let messageCount = 0
  const messages: SocketResponse[] | null = []

  return new Promise(async (resolve, reject) => {
    const websocket = new WebSocket(wsUri)

    websocket.onmessage = async function(event) {
      marketClose = moment().tz('America/New_York').format('Hmm')

      if (parseInt(marketClose) >= 1600 || messageCount >= 1) {
        websocket.close()
      }

      const data = JSON.parse(JSON.stringify(event.data))
      
      if (data[0].service === 'QUOTE') {
        messages.push(data[0])
        messageCount += 1
      }
    }

    websocket.onclose = async function() {
      closePrice = messages[0].content[0]["3"] 

      const demandZone = await find_demand_zone(closePrice, demand_zones)
      const supplyZone = await find_supply_zone(closePrice, supply_zones)

      if (demandZone?.length === 1 && supplyZone?.length === 1) {
        currentPriceData = {
          closePrice,
          demandZone,
          supplyZone
        }
      } else if (demandZone?.length === 1) {
        currentPriceData = {
          closePrice,
          demandZone,
          supplyZone: [[0]]
        }
      } else if (supplyZone?.length === 1) {
        currentPriceData = {
          closePrice,
          demandZone: [[0]],
          supplyZone
        }
      }

      return resolve(currentPriceData)
    }

    websocket.onerror = function(err) {
      return reject(err)
    }
    
    websocket.send(JSON.stringify(request))
  })
}

export async function get_position_setup(support_key_levels: SupportKeyLevels, demand_zone: number[][], supply_zone: number[][]): Promise<PositionSetup> {
  if (demand_zone[0].length === 2 && supply_zone[0].length === 2) {
    if(support_key_levels.above_resistance !== null && support_key_levels.resistance !== null && support_key_levels.support !== null && support_key_levels.below_support !== null) {
      return {
        demand: {
          entry: support_key_levels.resistance,
          stopLoss: demand_zone[0][0],
          takeProfit: support_key_levels.above_resistance,
          cutPosition: (((support_key_levels.above_resistance - support_key_levels.resistance) / 2) + support_key_levels.resistance)
        },
        supply: {
          entry: support_key_levels.support,
          stopLoss: supply_zone[0][0],
          takeProfit: support_key_levels.below_support,
          cutPosition: (((support_key_levels.support - support_key_levels.below_support) / 2) - support_key_levels.below_support)
        }
      }
    } else if(support_key_levels.resistance === null || support_key_levels.above_resistance === null) {
      if (support_key_levels.support !== null && support_key_levels.below_support !== null) {
        return {
          demand: null,
          supply: {
            entry: support_key_levels.support,
            stopLoss: supply_zone[0][0],
            takeProfit: support_key_levels.below_support,
            cutPosition: (((support_key_levels.support - support_key_levels.below_support) / 2) - support_key_levels.below_support)
          }
        }
      }
    } else if (support_key_levels.support === null || support_key_levels.below_support === null) {
      if (support_key_levels.resistance !== null && support_key_levels.above_resistance !== null) {
        return {
          demand: {
            entry: support_key_levels.resistance,
            stopLoss: demand_zone[0][0],
            takeProfit: support_key_levels.above_resistance,
            cutPosition: (((support_key_levels.above_resistance - support_key_levels.resistance) / 2) + support_key_levels.resistance)
          },
          supply: null
        }
      }
    } else {
      return {
        demand:null,
        supply: null
      }
    }
  } else if (demand_zone[0].length === 2) {
    if (support_key_levels.support === null || support_key_levels.below_support === null) {
      if (support_key_levels.resistance !== null && support_key_levels.above_resistance !== null) {
        return {
          demand: {
            entry: support_key_levels.resistance,
            stopLoss: demand_zone[0][0],
            takeProfit: support_key_levels.above_resistance,
            cutPosition: (((support_key_levels.above_resistance - support_key_levels.resistance) / 2) + support_key_levels.resistance)
          },
          supply: null
        }
      }
    } else if(support_key_levels.resistance === null || support_key_levels.above_resistance === null) {
      if (support_key_levels.support !== null && support_key_levels.below_support !== null) {
        return {
          demand: null,
          supply: {
            entry: support_key_levels.support,
            stopLoss: supply_zone[0][0],
            takeProfit: support_key_levels.below_support,
            cutPosition: (((support_key_levels.support - support_key_levels.below_support) / 2) - support_key_levels.below_support)
          }
        }
      }
    } else {
      return {
        demand:null,
        supply: null
      }
    }
  } else if (supply_zone[0].length === 2) {
    if (support_key_levels.support === null || support_key_levels.below_support === null) {
      if (support_key_levels.resistance !== null && support_key_levels.above_resistance !== null) {
        return {
          demand: {
            entry: support_key_levels.resistance,
            stopLoss: demand_zone[0][0],
            takeProfit: support_key_levels.above_resistance,
            cutPosition: (((support_key_levels.above_resistance - support_key_levels.resistance) / 2) + support_key_levels.resistance)
          },
          supply: null
        }
      }
    } else if(support_key_levels.resistance === null || support_key_levels.above_resistance === null) {
      if (support_key_levels.support !== null && support_key_levels.below_support !== null) {
        return {
          demand: null,
          supply: {
            entry: support_key_levels.support,
            stopLoss: supply_zone[0][0],
            takeProfit: support_key_levels.below_support,
            cutPosition: (((support_key_levels.support - support_key_levels.below_support) / 2) - support_key_levels.below_support)
          }
        }
      }
    } else {
      return {
          demand: null,
          supply: null
        }
    }
  }

  return {
    demand: null,
    supply: null
  }
}

export async function getOptionsSelection(position_setup: PositionSetup, symbol: string, access_token: string): Promise<OptionsSelection> {

  let callOptionResponse = null
  let callStrike = ''
  let putOptionResponse = null
  let putStrike = ''
  const toDate = moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD')
  const fromDate = moment().add((moment().isoWeekday() % 5), 'day').subtract(1, 'day').format('YYYY-MM-DD')
  const numberOfDaysAway = (moment().isoWeekday() % 5 ) - 1
  const optionString = `${fromDate}:${numberOfDaysAway}`

  if (position_setup.demand !== null) {
    callStrike = (Math.ceil(position_setup.demand.takeProfit / 5) * 5).toFixed(1)
    callOptionResponse = await getOptionChain(access_token, {
      symbol: symbol,
      contractType: ContractType.CALL,
      strike: parseFloat(callStrike),
      fromDate: fromDate,
      toDate: toDate,
      strikeCount: 20
    })
  }

  if (position_setup.supply !== null) {
    putStrike = (Math.floor(position_setup.supply.takeProfit / 5) * 5).toFixed(1)
    putOptionResponse = await getOptionChain(access_token, {
      symbol: symbol,
      contractType: ContractType.PUT,
      strike: parseFloat(putStrike),
      fromDate: fromDate,
      toDate: toDate,
      strikeCount: 20
    })
  }

  if (callOptionResponse !== null && putOptionResponse !== null) {
    const callInfo = callOptionResponse.callExpDateMap[optionString]
    const call = callInfo[callStrike][0]
    const putInfo = putOptionResponse.putExpDateMap[optionString]
    const put = putInfo[putStrike][0]

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
        rho: call.rho
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
        rho: put.rho
      }
    }
  } else if (callOptionResponse !== null) {
    const callInfo = callOptionResponse.callExpDateMap[optionString]
    const call = callInfo[callStrike][0]

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
        rho: call.rho
      },
      PUT: null
    }
  } else if (putOptionResponse !== null) {
    const putInfo = putOptionResponse.putExpDateMap[optionString]
    const put = putInfo[putStrike][0]

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
        rho: put.rho
      }
    }
  } else {
    return {
      CALL: null,
      PUT: null
    }
  }
}

export async function checkAccountAvailableBalance(access_token: string, account_id: string): Promise<number> {
  const getAccountResponse = await getAccount(access_token, account_id)
  const availableBalance = getAccountResponse.projectBalances.cashAvailableForTrading

  return availableBalance
}

export async function openPosition(options: OptionsSelection, optionType: string, budget: number, account_id: string, access_token: string): Promise<PlaceOrdersResponse | null> {
  let price = 0
  let quantity = 0
  let symbol = ''

  if (options.CALL !== null && options.PUT !== null) {
    const quantityCall = Math.floor(budget / options.CALL.ask)
    const quantityPut = Math.floor(budget / options.PUT.ask)
    price = optionType === 'CALL' ? options.CALL.ask : options.PUT.ask
    symbol = optionType === 'CALL' ? options.CALL.symbol : options.PUT.symbol
    quantity = optionType === 'CALL' ? quantityCall : quantityPut
  } else if (options.CALL !== null) {
    const quantityCall = Math.floor(budget / options.CALL.ask)
    price = options.CALL.ask
    symbol = options.CALL.symbol
    quantity = quantityCall
  } else if (options.PUT !== null) {
    const quantityPut = Math.floor(budget / options.PUT.ask)
    price = options.PUT.ask
    symbol = options.PUT.symbol
    quantity = quantityPut
  }

  const accountBalance = await checkAccountAvailableBalance(access_token, account_id)

  if (accountBalance < price) {
    return null
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
          putCall: optionType === 'CALL' ? PutCall.CALL : PutCall.PUT
        }
      },
      complexOrderStrategyType: ComplexOrderStrategyType.NONE
    }
  })

  return openPositionResponse
}

export async function checkIfPositionFilled(order_id: PlaceOrdersResponse, account_id: string, access_token: string): Promise<number> {
  const position = await getOrder(access_token, account_id, order_id.orderId)

  if(position.status === 'FILLED' && position.filledQuantity) {
    return position.filledQuantity
  } else {
    return 0
  }
}

export async function waitToSignalOpenPosition(wsUri:string, request:object, position_setup: PositionSetup, options: OptionsSelection, budget: number, account_id: string, access_token: string): Promise<OpenPositionSignal> {
  let closePrice
  let position: PlaceOrdersResponse | null = null
  let noGoodBuys = false
  let demandOrSupply = ''
  let callOrPut = ''
  let marketClose = moment().tz('America/New_York').format('Hmm')

  return new Promise(async (resolve, reject) => {
    const websocket = new WebSocket(wsUri)

    websocket.onmessage = async function(event) {
      Context.current().heartbeat();
      marketClose = moment().tz('America/New_York').format('Hmm')

      if (parseInt(marketClose) >= 1600) {
        noGoodBuys = true
        websocket.close()
      }

      const data = JSON.parse(JSON.stringify(event.data))

      if (data[0].service === 'QUOTE') {
        closePrice = data[0].content[0]["3"] 

        if (position_setup.demand && position_setup.supply) {
          if (closePrice >= position_setup.demand.entry) {
            callOrPut = 'CALL'
            demandOrSupply = 'DEMAND'
            websocket.close()
          } else if (closePrice <= position_setup.supply.entry) {
            callOrPut = 'PUT'
            demandOrSupply = 'SUPPLY'
            websocket.close()
          }
        } else if (position_setup.demand) {
          if (closePrice >= position_setup.demand.entry) {
            callOrPut = 'CALL'
            demandOrSupply = 'DEMAND'
            websocket.close()
          }
        } else if (position_setup.supply) {
          if (closePrice <= position_setup.supply.entry) {
            callOrPut = 'PUT' 
            demandOrSupply = 'SUPPLY'
            websocket.close()
          }
        }
      }
    }

    websocket.onclose = async function() {
      console.log('waitToSignalOpenPosition socket closed')
      position = await openPosition(options, callOrPut , budget, account_id, access_token)

      return resolve({
        position,
        noGoodBuys,
        demandOrSupply
      })
    }

    websocket.onerror = function(err) {
      return reject(err)
    }

    websocket.send(JSON.stringify(request))
  })
}

export async function getOptionSymbol(order_id:PlaceOrdersResponse, account_id: string, access_token: string): Promise<string> {
  const option = await getOrder(access_token, account_id, order_id.orderId)

  if (option.orderLegCollection?.instrument.symbol) {
    return option.orderLegCollection?.instrument.symbol
  } else {
    return ''
  }

}

export async function cutPosition(symbol:string, quantity:number, account_id: string, access_token: string): Promise<PlaceOrdersResponse> {
  const newQuantity = Math.floor(quantity / 2)

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
          symbol: symbol
        }
      },
      complexOrderStrategyType: ComplexOrderStrategyType.NONE
    }
  })

  return cutPositionResponse
}

export async function closePosition(symbol:string, quantity:number, account_id: string, access_token: string): Promise<PlaceOrdersResponse> {
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
          symbol: symbol
        }
      },
      complexOrderStrategyType: ComplexOrderStrategyType.NONE
    }
  })

  return closePositionResponse
} 

export async function waitToSignalCutPosition(wsUri:string, request:object, symbol:string, quantity:number, demandOrSupply:string, position_setup: PositionSetup, account_id: string, access_token: string): Promise<number> {
  let cutPrice
  let position: PlaceOrdersResponse | null = null
  let skipCut = false
  let marketClose = moment().tz('America/New_York').format('Hmm')
  let cutFilled = 0

  return new Promise(async (resolve, reject) => {
    const websocket = new WebSocket(wsUri)

    websocket.onmessage = async function(event) {
      Context.current().heartbeat();
      marketClose = moment().tz('America/New_York').format('Hmm')

      if (parseInt(marketClose) >= 1600 || quantity < 2) {
        skipCut = true
        websocket.close()
      }

      const data = JSON.parse(JSON.stringify(event.data))

      if (data[0].service === 'QUOTE') {
        cutPrice = data[0].content[0]["3"]  

        if (demandOrSupply === 'DEMAND' && position_setup.demand) {
          if (cutPrice < position_setup.demand.cutPosition && cutPrice >= position_setup.demand.entry) {
            console.log('waiting to cut position')
          } else if (cutPrice >= position_setup.demand.cutPosition && cutPrice < position_setup.demand.takeProfit) {
            websocket.close()
          } else if (cutPrice >= position_setup.demand.takeProfit) {
            skipCut = true
            websocket.close()
          } else if (cutPrice <= position_setup.demand.stopLoss) {
            skipCut = true
            websocket.close()
          }
        } else if (demandOrSupply === 'SUPPLY' && position_setup.supply) {
          if (cutPrice > position_setup.supply.cutPosition && cutPrice <= position_setup.supply.entry) {
            console.log('waiting to cut position')
          } else if (cutPrice <= position_setup.supply.cutPosition && cutPrice > position_setup.supply.takeProfit) {
            websocket.close()
          } else if (cutPrice <= position_setup.supply.takeProfit) {
            skipCut = true
            websocket.close()
          } else if (cutPrice >= position_setup.supply.stopLoss) {
            skipCut = true
            websocket.close()
          }
        }
      }
    }

    websocket.onclose = async function() {
      console.log('waitToSignalClosePosition socket closed')
      if (skipCut) {
        return resolve(cutFilled)
      }

      position = await cutPosition(symbol, quantity, account_id, access_token)
      cutFilled = await checkIfPositionFilled(position, account_id, access_token)

      return resolve(cutFilled)
    }

    websocket.onerror = function(err) {
      return reject(err)
    }

    websocket.send(JSON.stringify(request))
  })
}

export async function waitToSignalClosePosition(wsUri:string, request:object, symbol:string, quantity:number, demandOrSupply:string, position_setup: PositionSetup, account_id: string, access_token: string): Promise<PlaceOrdersResponse> {
  let closePrice
  let position: PlaceOrdersResponse
  let marketClose = moment().tz('America/New_York').format('Hmm')
  let closeFilled = 0
  let remainingQuantity = 0
  let waited = 0

  return new Promise(async (resolve, reject) => {
    const websocket = new WebSocket(wsUri)

    websocket.onmessage = async function(event) {
      Context.current().heartbeat();
      marketClose = moment().tz('America/New_York').format('Hmm')

      if (parseInt(marketClose) >= 1600) {
        websocket.close()
      }

      const data = JSON.parse(JSON.stringify(event.data))

      if (data[0].service === 'QUOTE') {
        closePrice = data[0].content[0]["3"]  

        if (demandOrSupply === 'DEMAND' && position_setup.demand) {
          if (closePrice >= position_setup.demand.cutPosition && closePrice < position_setup.demand.takeProfit || closePrice < position_setup.demand.cutPosition && closePrice > position_setup.demand.entry) {
            console.log('waiting to take profit')
            waited ++
          } else if (closePrice >= position_setup.demand.takeProfit) {
            websocket.close()
          } else if (closePrice >= position_setup.demand.cutPosition && closePrice < position_setup.demand.takeProfit && waited > 5) {
            websocket.close()
          } else if (closePrice <= position_setup.demand.stopLoss) {
            websocket.close()
          }
        } else if (demandOrSupply === 'SUPPLY' && position_setup.supply) {
          if (closePrice <= position_setup.supply.cutPosition && closePrice > position_setup.supply.takeProfit || closePrice > position_setup.supply.cutPosition && closePrice < position_setup.supply.entry) {
            console.log('waiting to take profit')
            waited ++
          } else if (closePrice <= position_setup.supply.takeProfit) {
            websocket.close()
          } else if (closePrice <= position_setup.supply.cutPosition && closePrice > position_setup.supply.takeProfit && waited > 5) {
            websocket.close()
          } else if (closePrice >= position_setup.supply.stopLoss) {
            websocket.close()
          }
        }
      }
    }

    websocket.onclose = async function() {
      console.log('waitToSignalClosePosition socket closed')

      while (remainingQuantity > 0 ) {
        position = await closePosition(symbol, quantity, account_id, access_token)
        closeFilled = await checkIfPositionFilled(position, account_id, access_token)
        remainingQuantity = quantity - closeFilled        
      }

      return resolve(position)
    }

    websocket.onerror = function(err) {
      return reject(err)
    }

    websocket.send(JSON.stringify(request))
  })
}

export async function getLoginCredentials (client_id: string): Promise<string> {
  const address = await tdAuthUrl(client_id)

  const urlCode = await tdLogin(address)
  const parseUrl = url.parse(urlCode, true).query
  const code = parseUrl.code
  const postData = JSON.stringify(code);
  const encodedPassword = encodeURIComponent(postData)
  const authOptions = {
    hostname: `${process.env.API_HOSTNAME}`,
    port: process.env.API_PORT,
    path: '/api/auth',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length':  Buffer.byteLength(encodedPassword)
    },
    rejectUnauthorized: false
  }

  let token: Token

  return new Promise( async (resolve, reject) => {
    const response = https.request(authOptions, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
  
      resp.on('end', async () => {
        const parseJson = await JSON.parse(data)
        token = await JSON.parse(parseJson)
        const access_token_expire = Date.now() + token.expires_in
        const refresh_token_expire = Date.now() + token.refresh_token_expires_in
        const tokenJSON = {
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          access_token_expires_at: access_token_expire,
          refresh_token_expires_at: refresh_token_expire,
          logged_in: true,
          access_token_expires_at_date: moment(access_token_expire).toISOString(),
          refresh_token_expires_at_date: moment(refresh_token_expire).toISOString()
        }
  
        fs.writeFile(path.resolve(__dirname, "../tda/token.json"), JSON.stringify(tokenJSON, null, 1), function (err) {
          if (err) console.log(err)
        })

        return resolve(token.access_token)
      })
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e)
    });

    response.write(encodedPassword);
    response.end();
  })
}

export async function getUserPrinciples (access_token: string): Promise<UserPrinciples> {
  const encodedtoken = encodeURIComponent(access_token)

  const authOptions = {
    hostname: `${process.env.API_HOSTNAME}`,
    port: process.env.API_PORT,
    path: '/api/streamer-auth',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length':  Buffer.byteLength(encodedtoken)
    },
    rejectUnauthorized: false
  }

  return new Promise( async (resolve, reject) => {
    const response = https.request(authOptions, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
  
      resp.on('end', async () => {
        const parseJson = await JSON.parse(data)
        return resolve(parseJson)
      })
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e)
    });

    response.write(encodedtoken);
    response.end();
  })
}

export async function getAccount (access_token: string, account_id: string): Promise<SecuritiesAccount> {
  const encodedtoken = encodeURIComponent(access_token)

  const postData = {
    token: encodedtoken,
    accountId: account_id,
  }

  const postDataAsString = JSON.stringify(postData)

  const authOptions = {
    hostname: `${process.env.API_HOSTNAME}`,
    port: process.env.API_PORT,
    path: '/api/td-account',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length':  Buffer.byteLength(postDataAsString)
    },
    rejectUnauthorized: false
  }

  return new Promise( async (resolve, reject) => {
    const response = https.request(authOptions, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
  
      resp.on('end', async () => {
        const parseJson = await JSON.parse(data)
        return resolve(parseJson)
      })
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e)
    });

    response.write(postDataAsString);
    response.end();
  })
}

export async function placeOrder (access_token: string, account_id: string, order_data: OrdersConfig): Promise<PlaceOrdersResponse> {
  const encodedtoken = encodeURIComponent(access_token)

  const postData = {
    token: encodedtoken,
    accountId: account_id,
    orderData: order_data
  }

  const postDataAsString = JSON.stringify(postData)

  const authOptions = {
    hostname: `${process.env.API_HOSTNAME}`,
    port: process.env.API_PORT,
    path: '/api/td-place-order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length':  Buffer.byteLength(postDataAsString)
    },
    rejectUnauthorized: false
  }

  return new Promise( async (resolve, reject) => {
    const response = https.request(authOptions, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
  
      resp.on('end', async () => {
        const parseJson = await JSON.parse(data)
        return resolve(parseJson)
      })
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e)
    });

    response.write(postDataAsString);
    response.end();
  })
}

export async function getOrder (access_token: string, account_id: string, order_id: string): Promise<GetOrderResponse> {
  const encodedtoken = encodeURIComponent(access_token)

  const postData = {
    token: encodedtoken,
    accountId: account_id,
    orderId: order_id
  }

  const postDataAsString = JSON.stringify(postData)

  const authOptions = {
    hostname: `${process.env.API_HOSTNAME}`,
    port: process.env.API_PORT,
    path: '/api/td-get-order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length':  Buffer.byteLength(postDataAsString)
    },
    rejectUnauthorized: false
  }

  return new Promise( async (resolve, reject) => {
    const response = https.request(authOptions, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
  
      resp.on('end', async () => {
        const parseJson = await JSON.parse(data)
        return resolve(parseJson)
      })
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e)
    });

    response.write(postDataAsString);
    response.end();
  })
}

export async function getOptionChain (access_token: string, option_chain_config: OptionChainConfig): Promise<OptionChainResponse> {
  const encodedtoken = encodeURIComponent(access_token)

  const postData = {
    token: encodedtoken,
    optionChainConfig: option_chain_config,
  }

  const postDataAsString = JSON.stringify(postData)

  const authOptions = {
    hostname: `${process.env.API_HOSTNAME}`,
    port: process.env.API_PORT,
    path: '/api/td-option-chain',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length':  Buffer.byteLength(postDataAsString)
    },
    rejectUnauthorized: false
  }

  return new Promise( async (resolve, reject) => {
    const response = https.request(authOptions, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
  
      resp.on('end', async () => {
        const parseJson = await JSON.parse(data)
        return resolve(parseJson)
      })
    }).on('error', (e) => {
      console.error('error', e);
      return reject(e)
    });

    response.write(postDataAsString);
    response.end();
  })
}