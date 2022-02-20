import { WebSocket } from "ws"
import { CurrentPriceData } from "../interfaces/currentPriceData"
import { SupportKeyLevels } from "../interfaces/supportKeyLevels"
import { SupplyDemandZones } from "../interfaces/supplyDemandZones"
import { PositionSetup } from "../interfaces/positionSetup"
import { OptionsSelection } from "../interfaces/optionsSelection"
import { OpenPositionSignal } from "../interfaces/openPositionSignal"
import { ClosePositionSignal } from "../interfaces/closePositionSignal"
import { TdaClient } from "../tda/connection/tdaClient"
import { ContractType, OptionType } from "../tda/models/optionChain"
import { AssetType, ComplexOrderStrategyType, CurrencyType, DurationType, InstructionType, OptionInstrument, OptionInstrumentType, OrderLegType, OrderStrategyType, OrderType, PositionEffect, PutCall, SessionType, PlaceOrdersResponse } from "../tda/models/order"
let moment = require('moment-timezone')



// let data = {
//   "access_token":"De5IoN1Y5xCGA2mfLREl14IoTud9cAaVc4CQuoOhhYAl932zeJ3FY7apAFE0l8SAW3i8ulmzJ7RgIq9lRFPS+a/fF2aSW4HXLkc9GJZXlPd6V57SlFzfGYHhQ0WJJSEZv8+cYr8PtaYlM80ea0rf4a9svviMkQpn3o0wY7FwOUl0t6yEno1PeJ3goi/g8hy/pJ0IKjLFJAfTamVg9lHs6AQ+ktuCagWTgWnl5ixj3wSd0jkFSWDJZDFp/IcWi5RQpBFHsgbFdoaOOE/w2ZepEQiSY8bVFyv1t/6eGEjQXBoYVyQviYFZ3Y7jASMLnl+NupSMweucHO0KMvpfve/DSzLyUFDwJCtSlhSd/LNpGcbqlKLTvmiprSIlhosCPvnzOWB39IGWXfZj2Id4W3oi/882Vfpab8uxEXqH7dLbJImBXseLaHfqQiOpiRxTD+IaonvrMZtCkxGth6g0s05+kTT5+vxj9+zxgEMvtgIA0sKhVQdUiM6xKeBVs/IEYOEZgl/AR06cMaJQNS6bnkz1Ddqgfx0vlb5ty87s0bbuA+s0yByCR100MQuG4LYrgoVi/JHHvl2bVnGHF4m3p7JzpgqOlAXOvCfzuOug6Dg6XsAU2M07mxi+QxN5YUFveYn4GZf49/W5HHStYpoObRak/eVs215eo72ScC/2hEjWm8fGdUpOEG0e9YpRWDa08pzsUTBce+a30KFk4mJ2wvrlvsHs/dPwpIZLAKnW7ObzUuJJoskolxkfwE72grjVtJal83g2nBGpEJVLsVTylLq1zGN3e7wPxRMkLASOvKBJHJeznQUhAu8gSxBNf6RPKdK3q4CT/Dw6LfmSq4ERbiCZxhQC9tjzGCzfAOsI0qnmUb4Wbp7UNkQRVEp4s2hVh1J5P8wpMj203WVt7L4NxZ7rVLmac2F38mNk8BGO0PdsbQqTP2LFwq2l9OMNm7cuYHthKDBSzD3FnH0VacDTVoLq+bi7bjb2COUOgGk6dRIVeSipTnA7wuEgeCSDRf03MBMSLQCezC3TjjWI2odARtggaIg2yPFajjzxiZ9qZrcS0AnAmXQ/UsJjNidaD8N4XNEhwFaphHOMVAeMOD/pzEuMvHew0jupJf7RrnWkJEZsAhYwIQpeZLkWJQ==212FD3x19z9sWBHDJACbC00B75E",
//   "symbol":"PFE",
//   "score":7,
//   "sentiment":"Negative",
//   "keyLevels":[61.71,61.17,60.52,59.58,58.49,57.6,55.46,40.94,33.36],
//   "supportResistance":{"support":59.58,"resistance":60.52},
//   "demandZones":[
//     [{"double":58.87},{"double":59.515},{"string":"2021-12-17 20:55:00"}],
//     [{"double":59.7101},{"double":60.41},{"string":"2021-12-17 18:50:00"}],
//     [{"double":59.19},{"double":60.1},{"string":"2021-12-17 15:10:00"}],
//     [{"double":59.19},{"double":60.73},{"string":"2021-12-17 14:40:00"}],
//     [{"double":59.095},{"double":59.82},{"string":"2021-12-16 15:50:00"}],
//     [{"double":57.8},{"double":58.54},{"string":"2021-12-16 14:45:00"}],
//     [{"double":58.17},{"double":58.735},{"string":"2021-12-15 20:05:00"}],
//     [{"double":57.266},{"double":57.81},{"string":"2021-12-15 15:50:00"}],
//     [{"double":55.47},{"double":56.61},{"string":"2021-12-15 14:30:00"}],
//     [{"double":54.44},{"double":55.32},{"string":"2021-12-13 15:00:00"}],
//     [{"double":52.7},{"double":53.94},{"string":"2021-12-13 14:30:00"}],
//     [{"double":51.97},{"double":52.7699},{"string":"2021-12-09 15:05:00"}],
//     [{"double":51.145},{"double":51.905},{"string":"2021-12-07 20:30:00"}],
//     [{"double":51.47},{"double":52.225},{"string":"2021-12-07 15:05:00"}],
//     [{"double":50.4},{"double":51.32},{"string":"2021-12-07 14:35:00"}]
//   ],
//   "supplyZones":[
//     [{"double":60.71},{"double":60.28},{"string":"2021-12-17 14:45:00"}],
//     [{"double":61.0},{"double":60.49},{"string":"2021-12-16 18:35:00"}],
//     [{"double":55.46},{"double":54.8999},{"string":"2021-12-14 15:00:00"}],
//     [{"double":51.5},{"double":50.9605},{"string":"2021-12-08 14:55:00"}],
//     [{"double":51.74},{"double":52.25},{"string":"2021-12-08 14:30:00"}],
//     [{"double":54.55},{"double":54.04},{"string":"2021-12-02 15:35:00"}],
//     [{"double":54.205},{"double":53.705},{"string":"2021-11-30 19:05:00"}],
//     [{"double":53.82},{"double":53.315},{"string":"2021-11-30 15:45:00"}],
//     [{"double":53.99},{"double":53.6},{"string":"2021-11-26 17:10:00"}],
//     [{"double":54.63},{"double":54.22},{"string":"2021-11-26 15:30:00"}],
//     [{"double":50.93},{"double":53.535},{"string":"2021-11-26 14:30:00"}],
//     [{"double":51.05},{"double":50.545},{"string":"2021-11-22 14:50:00"}],
//     [{"double":51.49},{"double":50.96},{"string":"2021-11-18 15:05:00"}],
//     [{"double":50.71},{"double":50.205},{"string":"2021-11-17 15:45:00"}],
//     [{"double":48.38},{"double":47.83},{"string":"2021-11-09 14:30:00"}]
//   ],
//   "userPrinciples": {
//     "userId":"quan0005",
//     "userCdDomainId":"A000000084163920",
//     "primaryAccountId":"277420951",
//     "lastLoginTime":"2021-12-20T14:46:42+0000",
//     "tokenExpirationTime":"2021-12-20T15:16:43+0000",
//     "loginTime":"2021-12-20T14:46:43+0000",
//     "accessLevel":"CUS",
//     "stalePassword":false,
//     "streamerInfo": {
//       "streamerSocketUrl":"streamer-ws.tdameritrade.com",
//       "accessLevel":"ACCT",
//       "streamerBinaryUrl":"streamer-bin.tdameritrade.com",
//       "appId":"Quan0005",
//       "acl":"AKBOBPCNCVDRDTDWESF7G1G3G5G7GKGLH1H3H5LTM1MROLPNQ2QSRFSDTETFTOTTUAURXBXNXOD2D4D6D8E2E4E6E8F2F4F6H7I1",
//       "userGroup":"ACCT",
//       "tokenTimestamp":"2021-12-20T14:46:44+0000",
//       "token":"7bca36bce8568d3192d719c2db16c2971bd27135"
//     },
//     "professionalStatus":"NON_PROFESSIONAL",
//     "quotes": {
//       "isForexDelayed":true,
//       "isOpraDelayed":false,
//       "isAmexDelayed":false,
//       "isNasdaqDelayed":false,
//       "isIceDelayed":true,
//       "isCmeDelayed":true,
//       "isNyseDelayed":false
//     },
//     "streamerSubscriptionKeys": {
//       "keys": [
//         {"key":"b511cde4c261eaff0030aa0ca7de27498eb27e3881de3f9680ac89fcab93a68429b6abf2149599a9a3aac1681f24b7994"}
//       ]
//     },
//     "exchangeAgreements": {
//       "OPRA_EXCHANGE_AGREEMENT":"ACCEPTED",
//       "NASDAQ_EXCHANGE_AGREEMENT":"ACCEPTED",
//       "NYSE_EXCHANGE_AGREEMENT":"ACCEPTED"
//     },
//     "accounts": [
//       {
//         "accountId":"277420951",
//         "displayName":"quan0005",
//         "accountCdDomainId":"A000000084163919",
//         "company":"AMER",
//         "segment":"AMER",
//         "acl":"AKBOBPCNCVDRDTDWESF7G1G3G5G7GKGLH1H3H5LTM1MROLPNQ2QSRFSDTETFTOTTUAURXBXNXO",
//         "authorizations": {
//           "levelTwoQuotes": {"boolean":true},
//           "optionTradingLevel": {"string":"LONG"},
//           "streamerAccess": {"boolean":true},
//           "marginTrading": {"boolean":false},
//           "streamingNews": {"boolean":false},
//           "scottradeAccount": {"boolean":false},
//           "advancedMargin": {"boolean":false},
//           "apex": {"boolean":false},
//           "stockTrading": {"boolean":true}
//         }
//       }
//     ]
//   }
// }


export async function is_market_open(): Promise<boolean> {
  // waits for time to reach 9:50am newyork time then
  // returns true

  let marketOpen = await moment().tz('America/New_York').format('H:mm')

  while (marketOpen !== '9:50') {
    marketOpen = await moment().tz('America/New_York').format('H:mm')
  }

  return true
}

export async function get_surrounding_key_levels(current_price: number, key_levels: number[]): Promise<SupportKeyLevels> {
  // 

  for (let i = 0; i < key_levels.length; i++){
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
      let zone = [[demand_zones[i][0].double, demand_zones[i][1].double]]
      return zone
    } else {
      continue
    }
  }

  return null
}

export async function find_demand_zone(current_price: number, demand_zones: SupplyDemandZones[][]): Promise<number[][] | null> {
  let demandZone = await is_demand_zone(current_price, demand_zones)
  let surroundingZones = []

  if (demandZone !== null) {
    return demandZone
  } else {
    for (let i = 0; i < demand_zones.length; i++) {
      if (i < demand_zones.length - 1 && (current_price < demand_zones[i][1].double && current_price > demand_zones[i+1][0].double)) {
        let zone1 = [demand_zones[i][0].double, demand_zones[i][1].double]
        let zone2 = [demand_zones[i+1][0].double, demand_zones[i+1][1].double]
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
      let zone = [[supply_zones[i][0].double, supply_zones[i][1].double]]
      return zone
    } else {
      continue
    }
  }

  return null
}

export async function find_supply_zone(current_price: number, supply_zones: SupplyDemandZones[][]): Promise<number[][] | null> {
  let supplyZone = await is_supply_zone(current_price, supply_zones)
  let surroundingZones = []

  if (supplyZone !== null) {
    return supplyZone
  } else {
    for (let i = 0; i < supply_zones.length; i++) {
      if (i < supply_zones.length - 1 && (current_price < supply_zones[i][0].double && current_price > supply_zones[i+1][1].double)) {
        let zone1 = [supply_zones[i][0].double, supply_zones[i][1].double]
        let zone2 = [supply_zones[i+1][0].double, supply_zones[i+1][1].double]
        surroundingZones.push(zone1, zone2)
        return surroundingZones
      } else {
        continue
      }
    }

    return null
  }
}

//@ts-ignore
export async function get_current_price(wsUri:string, request:object, demand_zones: SupplyDemandZones[][], supply_zones: SupplyDemandZones[][]): Promise<CurrentPriceData> {
  // makes a request to td ameritrade User Principals endpoint using the token
  // to get the info needed to make a ameritrade streaming request

  const websocket = new WebSocket(wsUri)
  let closePrice = 0
  let currentPriceData: CurrentPriceData = {
    closePrice: closePrice,
    demandZone: [[0]],
    supplyZone: [[0]]
  }
  let marketClose = await moment().tz('America/New_York').format('Hmm')

  websocket.onmessage = async function(event) {
    marketClose = await moment().tz('America/New_York').format('Hmm')

    //@ts-ignore
    if (event.data[0].service === 'CHART_EQUITY') {
      //@ts-ignore
      closePrice = event.data[0].content[0]["4"] 

      let demandZone = await find_demand_zone(closePrice, demand_zones)
      let supplyZone = await find_supply_zone(closePrice, supply_zones)

      if (demandZone?.length === 1 && supplyZone?.length === 1) {
        currentPriceData = {
          closePrice,
          demandZone,
          supplyZone
        }
        websocket.close()
      } else if (demandZone?.length === 1) {
        currentPriceData = {
          closePrice,
          demandZone,
          supplyZone: [[0]]
        }
        websocket.close()
      } else if (supplyZone?.length === 1) {
        currentPriceData = {
          closePrice,
          demandZone: [[0]],
          supplyZone
        }
        websocket.close()
      } else if (parseInt(marketClose) >= 1600) {
        websocket.close()
      }
    }
  }

  websocket.onclose = function(event) {
    return currentPriceData
  }
  
  websocket.send(JSON.stringify(request))

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

export async function getOptionsSelection(position_setup: PositionSetup, symbol: string, access_token: string, client_id: string, refresh_token: string): Promise<OptionsSelection> {
  const tdaclient = await TdaClient.from({
    access_token,
    client_id,
    refresh_token
  })

  let callOptionResponse = null
  let callStrike = ''
  let putOptionResponse = null
  let putStrike = ''
  let toDate = moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD')
  let fromDate = moment().add((moment().isoWeekday() % 5), 'day').subtract(1, 'day').format('YYYY-MM-DD')
  let numberOfDaysAway = (moment().isoWeekday() % 5 ) - 1
  let optionString = `${fromDate}:${numberOfDaysAway}`

  if (position_setup.demand !== null) {
    callStrike = (Math.ceil(position_setup.demand.takeProfit / 5) * 5).toFixed(1)
    callOptionResponse = await tdaclient.getOptionChain({
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
    putOptionResponse = await tdaclient.getOptionChain({
      symbol: symbol,
      contractType: ContractType.PUT,
      strike: parseFloat(putStrike),
      fromDate: fromDate,
      toDate: toDate,
      strikeCount: 20
    })
  }

  if (callOptionResponse !== null && putOptionResponse !== null) {
    let callInfo = callOptionResponse.callExpDateMap[optionString]
    let call = callInfo[callStrike][0]
    let putInfo = putOptionResponse.putExpDateMap[optionString]
    let put = putInfo[putStrike][0]

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
    let callInfo = callOptionResponse.callExpDateMap[optionString]
    let call = callInfo[callStrike][0]

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
    let putInfo = putOptionResponse.putExpDateMap[optionString]
    let put = putInfo[putStrike][0]

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

export async function checkAccountAvailableBalance(access_token: string, client_id: string, refresh_token: string): Promise<number> {
  const tdaclient = await TdaClient.from({
    access_token,
    client_id,
    refresh_token
  })

  let getAccountResponse = await tdaclient.getAccount()
  let availableBalance = getAccountResponse.projectBalances.cashAvailableForTrading

  return availableBalance
}

export async function openPosition(options: OptionsSelection, optionType: string, budget: number, account_id: string, access_token: string, client_id: string, refresh_token: string): Promise<PlaceOrdersResponse | null> {
  const tdaclient = await TdaClient.from({
    access_token,
    client_id,
    refresh_token
  })

  let price = 0
  let quantity = 0
  let symbol = ''

  if (options.CALL !== null && options.PUT !== null) {
    let quantityCall = Math.floor(budget / options.CALL.ask)
    let quantityPut = Math.floor(budget / options.PUT.ask)
    price = optionType === 'CALL' ? options.CALL.ask : options.PUT.ask
    symbol = optionType === 'CALL' ? options.CALL.symbol : options.PUT.symbol
    quantity = optionType === 'CALL' ? quantityCall : quantityPut
  } else if (options.CALL !== null) {
    let quantityCall = Math.floor(budget / options.CALL.ask)
    price = options.CALL.ask
    symbol = options.CALL.symbol
    quantity = quantityCall
  } else if (options.PUT !== null) {
    let quantityPut = Math.floor(budget / options.PUT.ask)
    price = options.PUT.ask
    symbol = options.PUT.symbol
    quantity = quantityPut
  }

  let accountBalance = await checkAccountAvailableBalance(access_token, client_id, refresh_token)

  if (accountBalance < price) {
    return null
  }

  let openPositionResponse = await tdaclient.placeOrder({
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

export async function checkIfPositionFilled(order_id:PlaceOrdersResponse, account_id: string, access_token: string, client_id: string, refresh_token: string): Promise<number> {
  const tdaclient = await TdaClient.from({
    access_token,
    client_id,
    refresh_token
  })

  let position = await tdaclient.getOrder({
    accountId: account_id,
    orderId: order_id.orderId
  })

  if(position.status === 'FILLED' && position.filledQuantity) {
    return position.filledQuantity
  } else {
    return 0
  }
}

export async function waitToSignalOpenPosition(wsUri:string, request:object, position_setup: PositionSetup, options: OptionsSelection, budget: number, account_id: string, access_token: string, client_id: string, refresh_token: string): Promise<OpenPositionSignal> {
  const websocket = new WebSocket(wsUri)
  let closePrice
  let position: PlaceOrdersResponse | null = null
  let noGoodBuys: boolean = false
  let demandOrSupply: string = ''
  let marketClose = await moment().tz('America/New_York').format('Hmm')

  websocket.onmessage = async function(event) {
    marketClose = await moment().tz('America/New_York').format('Hmm')

    if (parseInt(marketClose) >= 1600) {
      noGoodBuys = true
      websocket.close()
    }

    //@ts-ignore
    if (event.data[0].service === 'CHART_EQUITY') {
      //@ts-ignore
      closePrice = event.data[0].content[0]["4"] 

      if (position_setup.demand && position_setup.supply) {
        if (closePrice >= position_setup.demand.entry) {
          position = await openPosition(options, 'CALL', budget, account_id, access_token, client_id, refresh_token)
          demandOrSupply = 'DEMAND'
          websocket.close()
        } else if (closePrice <= position_setup.supply.entry) {
          position = await openPosition(options, 'PUT', budget, account_id, access_token, client_id, refresh_token)
          demandOrSupply = 'SUPPLY'
          websocket.close()
        }
      } else if (position_setup.demand) {
        if (closePrice >= position_setup.demand.entry) {
          position = await openPosition(options, 'CALL', budget, account_id, access_token, client_id, refresh_token)
          demandOrSupply = 'DEMAND'
          websocket.close()
        }
      } else if (position_setup.supply) {
        if (closePrice <= position_setup.supply.entry) {
          position = await openPosition(options, 'PUT', budget, account_id, access_token,  client_id, refresh_token)
          demandOrSupply = 'SUPPLY'
          websocket.close()
        }
      }
    }
  }

  websocket.onclose = function(event) {
    console.log('waitToSignalOpenPosition socket closed')
  }

  websocket.send(JSON.stringify(request))

  return {
    position,
    noGoodBuys,
    demandOrSupply
  }
}

export async function getOptionSymbol(order_id:PlaceOrdersResponse, account_id: string, access_token: string, client_id: string, refresh_token: string): Promise<string> {
  const tdaclient = await TdaClient.from({
    access_token,
    client_id,
    refresh_token
  })

  let option = await tdaclient.getOrder({
    accountId: account_id,
    orderId: order_id.orderId
  })

  if (option.orderLegCollection?.instrument.symbol) {
    return option.orderLegCollection?.instrument.symbol
  } else {
    return ''
  }

}

export async function cutPosition(symbol:string, quantity:number, account_id: string, access_token: string, client_id: string, refresh_token: string): Promise<PlaceOrdersResponse> {
  const tdaclient = await TdaClient.from({
    access_token,
    client_id,
    refresh_token
  })

  let newQuantity = Math.floor(quantity / 2)

  let cutPositionResponse = await tdaclient.placeOrder({
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

export async function closePosition(symbol:string, quantity:number, account_id: string, access_token: string, client_id: string, refresh_token: string): Promise<PlaceOrdersResponse> {
  const tdaclient = await TdaClient.from({
    access_token,
    client_id,
    refresh_token
  })

  let closePositionResponse = await tdaclient.placeOrder({
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

export async function waitToSignalClosePosition(wsUri:string, request:object, symbol:string, quantity:number, demandOrSupply:string, position_setup: PositionSetup, account_id: string, access_token: string, client_id: string, refresh_token: string): Promise<ClosePositionSignal> {
  const websocket = new WebSocket(wsUri)
  let closePrice
  let position: PlaceOrdersResponse | null = null
  let noGoodBuys: boolean = false
  let marketClose = await moment().tz('America/New_York').format('Hmm')
  let cut = false
  let remainingQuantity = quantity - Math.floor(quantity / 2)
  let cutFilled: number | null
  let closeFilled: number | null
  let waited: number = 0

  websocket.onmessage = async function(event) {
    marketClose = await moment().tz('America/New_York').format('Hmm')

    if (parseInt(marketClose) >= 1600) {
      noGoodBuys = true
      websocket.close()
    }

    //@ts-ignore
    if (event.data[0].service === 'CHART_EQUITY') {
      //@ts-ignore
      closePrice = event.data[0].content[0]["4"]  

      if (demandOrSupply === 'DEMAND' && position_setup.demand) {
        if (cut === false && quantity > 1) {
          if (closePrice < position_setup.demand.cutPosition && closePrice >= position_setup.demand.entry) {
            console.log('waiting to cut position')
          } else if (closePrice >= position_setup.demand.cutPosition && closePrice < position_setup.demand.takeProfit) {
            position = await cutPosition(symbol, quantity, account_id, access_token, client_id, refresh_token)
            cutFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)
  
            if (cutFilled > 0) {
              cut = true
            } else {
              cut = false
            }
  
          } else if (closePrice >= position_setup.demand.takeProfit) {
            position = await closePosition(symbol, quantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          } else if (closePrice <= position_setup.demand.stopLoss) {
            position = await closePosition(symbol, quantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          }
        } else if (cut === true || quantity === 1) {
          if (closePrice >= position_setup.demand.cutPosition && closePrice < position_setup.demand.takeProfit || closePrice < position_setup.demand.cutPosition && closePrice > position_setup.demand.entry) {
            console.log('waiting to take profit')
            waited ++
          } else if (closePrice >= position_setup.demand.takeProfit) {
            position = await closePosition(symbol, remainingQuantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          } else if (closePrice >= position_setup.demand.cutPosition && closePrice < position_setup.demand.takeProfit && waited > 5) {
            position = await closePosition(symbol, remainingQuantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          } else if (closePrice <= position_setup.demand.stopLoss) {
            position = await closePosition(symbol, quantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          }
        }
      } else if (demandOrSupply === 'SUPPLY' && position_setup.supply) {
        if (cut === false && quantity > 1) {
          if (closePrice > position_setup.supply.cutPosition && closePrice <= position_setup.supply.entry) {
            console.log('waiting to cut position')
          } else if (closePrice <= position_setup.supply.cutPosition && closePrice > position_setup.supply.takeProfit) {
            position = await cutPosition(symbol, quantity, account_id, access_token, client_id, refresh_token)
            cutFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)
  
            if (cutFilled > 0) {
              cut = true
            } else {
              cut = false
            }
          } else if (closePrice <= position_setup.supply.takeProfit) {
            position = await closePosition(symbol, quantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          } else if (closePrice >= position_setup.supply.stopLoss) {
            position = await closePosition(symbol, quantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          }
        } else if (cut === true  || quantity === 1) {
          if (closePrice <= position_setup.supply.cutPosition && closePrice > position_setup.supply.takeProfit || closePrice > position_setup.supply.cutPosition && closePrice < position_setup.supply.entry) {
            console.log('waiting to take profit')
            waited ++
          } else if (closePrice <= position_setup.supply.takeProfit) {
            position = await closePosition(symbol, remainingQuantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          } else if (closePrice <= position_setup.supply.cutPosition && closePrice > position_setup.supply.takeProfit && waited > 5) {
            position = await closePosition(symbol, remainingQuantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          } else if (closePrice >= position_setup.supply.stopLoss) {
            position = await closePosition(symbol, quantity, account_id, access_token, client_id, refresh_token)
            closeFilled = await checkIfPositionFilled(position, account_id, access_token, client_id, refresh_token)

            if (closeFilled > 0) {
              websocket.close()
            }
          }
        }
      }
    }
  }

  websocket.onclose = function(event) {
    console.log('waitToSignalClosePosition socket closed')
  }

  websocket.send(JSON.stringify(request))

  return {
    position,
    noGoodBuys
  }
}