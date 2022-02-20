import { PriceAction } from "../interfaces/workflows";
import { PremarketData } from "../interfaces/premarketData";
import { is_market_open, get_current_price, get_surrounding_key_levels, get_position_setup, getOptionsSelection, waitToSignalOpenPosition, checkIfPositionFilled, getOptionSymbol, waitToSignalClosePosition } from "../activities/priceActionPosition"
import { WebSocket } from "ws"

const querystring = require('querystring')

async function priceAction( premarketData: PremarketData ): Promise<string> {
  let limit = premarketData.limit
  let budget = premarketData.budget
  let clientId = premarketData.client_id
  let accountId = premarketData.account_id
  let keyLevels = premarketData.keyLevels
  let demandZones = premarketData.demandZones
  let supplyZones = premarketData.supplyZones
  let symbol = premarketData.symbol
  let token = premarketData.token
  let userPrinciples = premarketData.userPrinciples
  let tokenTimeStampAsDateObj = new Date(userPrinciples.streamerInfo.tokenTimestamp)
  let tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();
  let credentials = {
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
    "acl": userPrinciples.streamerInfo.acl
  }
  let request = {
    "requests": [
      {
        "service": "ADMIN",
        "requestid": "0",
        "account": userPrinciples.accounts[0].accountId,
        "source": userPrinciples.streamerInfo.appId,
        "parameters": {
          "credential": querystring.stringify(credentials),
          "token": userPrinciples.streamerInfo.token,
          "version": "1.0",
          "qoslevel": "2"
        }
      },
      {
        "service": "CHART_EQUITY",
        "requestid": "1",
        "command": "SUBS",
        "account": userPrinciples.accounts[0].accountId,
        "source": userPrinciples.streamerInfo.appId,
        "parameters": {
          "keys": premarketData.symbol,
          "fields": "0,1,2,3,4,5,6"
        }
      }
    ]
  }

  let wsUri = `wss://${userPrinciples.streamerInfo.streamerSocketUrl}/ws`

  let marketOpen = await is_market_open()

  if (marketOpen) {
    let currentPrice = await get_current_price(wsUri, request, demandZones, supplyZones)
    let surroundingKeyLevels =  await get_surrounding_key_levels(currentPrice.closePrice, keyLevels)
    let positionSetup = await get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone)
    let optionSelection = await getOptionsSelection(positionSetup, symbol, token.access_token, clientId, token.refresh_token)
    let signalOpenPosition = await waitToSignalOpenPosition(wsUri, request, positionSetup, optionSelection, budget, accountId, token.access_token, clientId, token.refresh_token)

    if (signalOpenPosition.position) {
      let quantity = await checkIfPositionFilled(signalOpenPosition.position, accountId, token.access_token, clientId, token.refresh_token)
      let optionSymbol = await getOptionSymbol(signalOpenPosition.position, accountId, token.access_token, clientId, token.refresh_token)
      let signalClosePosition = await waitToSignalClosePosition(wsUri, request, optionSymbol, quantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token, clientId, token.refresh_token)

      if (signalClosePosition.position) {
        return ''
      } else if (signalClosePosition.noGoodBuys) {
        return ''
      } else {
        return ''
      }
    } else if (signalOpenPosition.noGoodBuys) {
      return ''
    } else {
      return ''
    }
  } else {
    return ''
  }
}

//@ts-ignore
export const workflow: PriceAction = { priceAction }