import { proxyActivities } from '@temporalio/workflow'
import * as activities from "./activities/priceActionPosition"
import { PremarketData } from "./interfaces/premarketData";
import { tdValidateTokens } from "./tda/middleware/tdValidateTokens";
import TokenJSON from "./tda/token.json"

const { 
  is_market_open, 
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
  startToCloseTimeout: ' 480minutes'
})

export async function priceAction( premarketData: PremarketData ): Promise<string> {
  // const limit = premarketData.limit
  const budget = premarketData.budget
  const clientId = premarketData.client_id
  const accountId = premarketData.account_id
  const keyLevels = premarketData.keyLevels
  const demandZones = premarketData.demandZones
  const supplyZones = premarketData.supplyZones
  const symbol = premarketData.symbol
  const compareTokens = await tdValidateTokens(TokenJSON.access_token_expires_at_date, TokenJSON.refresh_token_expires_at_date);
  if (compareTokens) {
    await getLoginCredentials(clientId)
  }
  const token = TokenJSON
  const userPrinciples = await getUserPrinciples(token.access_token)
  const tokenTimeStampAsDateObj = new Date(userPrinciples.streamerInfo.tokenTimestamp)
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
    "acl": userPrinciples.streamerInfo.acl
  }
  const params = new URLSearchParams(JSON.stringify(credentials));
  const paramsString = params.toString()
  const request = {
    "requests": [
      {
        "service": "ADMIN",
        "requestid": "0",
        "account": userPrinciples.accounts[0].accountId,
        "source": userPrinciples.streamerInfo.appId,
        "parameters": {
          "credential": paramsString,
          "token": userPrinciples.streamerInfo.token,
          "version": "1.0",
          "qoslevel": "0"
        }
      },
      {
        "service": "QUOTE",
        "requestid": "1",
        "command": "SUBS",
        "account": userPrinciples.accounts[0].accountId,
        "source": userPrinciples.streamerInfo.appId,
        "parameters": {
          "keys": premarketData.symbol,
          "fields": "0,1,2,3,4,5"
        }
      }
    ]
  }

  const wsUri = `wss://${userPrinciples.streamerInfo.streamerSocketUrl}/ws`

  const marketOpen = await is_market_open()

  if (marketOpen) {
    const currentPrice = await get_current_price(wsUri, request, demandZones, supplyZones)
    const surroundingKeyLevels =  await get_surrounding_key_levels(currentPrice.closePrice, keyLevels)
    const positionSetup = await get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone)
    const optionSelection = await getOptionsSelection(positionSetup, symbol, token.access_token)
    const signalOpenPosition = await waitToSignalOpenPosition(wsUri, request, positionSetup, optionSelection, budget, accountId, token.access_token)

    if (signalOpenPosition.position) {
      const quantity = await checkIfPositionFilled(signalOpenPosition.position, accountId, token.access_token)
      const optionSymbol = await getOptionSymbol(signalOpenPosition.position, accountId, token.access_token)
      const cutFilled = await waitToSignalCutPosition(wsUri, request, optionSymbol, quantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token)
      const remainingQuantity = quantity - cutFilled
      const signalClosePosition = await waitToSignalClosePosition(wsUri, request, optionSymbol, remainingQuantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token)

      // if (signalClosePosition.orderId) {
      //   return ''
      // } else {
      //   return 'SWING' // send message to kafka to swing position
      // }

      return signalClosePosition.orderId
    } else {
      return 'NOGOODPOSITIONS'
    }
  } else {
    return 'MARKETCLOSED'
  }
}