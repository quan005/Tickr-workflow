import { FindPosition } from "./interfaces/workflows";
import { PremarketData } from "./interfaces/premarketData";
import { WebSocket } from "ws"

const querystring = require('querystring')

async function findPosition(
  premarketData: PremarketData
): Promise<string> {
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
  

  return ''
}