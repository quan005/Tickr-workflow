import * as https from "https";
import { getLoginCredentials } from "./getLoginCreds";
import { tdCredentialsToString } from "@src/tda/middleware/tdCredentialToString";
import { UserPrinciples, PrinciplesAndParams } from "@src/interfaces/UserPrinciples";

export async function getUserPrinciples(symbol: string): Promise<PrinciplesAndParams> {
    let token: string;

    try {
        token = await getLoginCredentials();
    } catch (error) {
        throw new Error(error.message)
    }

    console.log('token', token);
    
    const encodedtoken = encodeURIComponent(token);
    console.log('encodedToken', encodedtoken);
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
        });
  
        resp.on('end', async () => {
          const parseJson = JSON.parse(data);
          const userPrinciples: UserPrinciples = JSON.parse(parseJson);
          console.log('userPrinciples', userPrinciples);
          console.log('typeof', typeof userPrinciples);
          let dataObject: PrinciplesAndParams = {
            userPrinciples: userPrinciples,
            params: null,
            loginRequest: null,
            marketRequest: null,
            chartRequest: null,
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
      response.end();
    });
  }