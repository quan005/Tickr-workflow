import axios from "axios";
import * as dotenv from 'dotenv';
import { tdCredentialsToString } from "@src/tda/middleware/tdCredentialToString";
import { UserPrinciples, PrinciplesAndParams } from "@src/interfaces/UserPrinciples";

dotenv.config();

const USER_PRINCIPLES_URL = `https://${process.env.API_HOSTNAME}/api/streamer-auth`;

export async function getUserPrinciples(symbol: string): Promise<PrinciplesAndParams> {
    try {
      const response = await axios.get(USER_PRINCIPLES_URL);

      if (response.status !== 200) {
        throw new Error(`Received a non-OK status code: ${response.status}`);
      }

      const userPrinciples: UserPrinciples = response.data;

      let dataObject: PrinciplesAndParams = {
        userPrinciples: userPrinciples,
        params: null,
        loginRequest: null,
        marketRequest: null,
        chartRequest: null,
        bookRequest: null,
        timeSalesRequest: null,
      };
      
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
          "fields": "0,1,2,3,4,5,12,13",
        },
      };
      const chartConfig = {
        "service": "CHART_EQUITY",
        "requestid": "2",
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
      const chartRequest = {
        "requests": [
          chartConfig,
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
        chartRequest,
        bookRequest,
        timeSalesRequest
      }

      return dataObject;
      
    } catch(e) {
      console.log(e);
      throw new Error(e);
    }
}