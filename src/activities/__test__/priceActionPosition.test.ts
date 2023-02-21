import * as activities from "../priceActionPosition";
import * as mockPremarketData from "../mocks/premarketData.mock";
import { tdCredentialsToString } from "../../tda/middleware/tdCredentialToString";
import { TokenJSON } from '../../interfaces/token';
import * as dotenv from "dotenv";
dotenv.config();


it("returns an object with userid equal to TD_USERNAME env variable", async () => {
  const startTime = new Date().getTime();
  // let token: TokenJSON = {
  //   access_token: null,
  //   refresh_token: null,
  //   access_token_expires_at: null,
  //   refresh_token_expires_at: null,
  //   logged_in: null,
  //   access_token_expires_at_date: null,
  //   refresh_token_expires_at_date: null
  // };
  const clientId = process.env.TD_CLIENT_ID;

  const code = await activities.getUrlCode(clientId);
  console.log('code', code);
  // token = await activities.getLoginCredentials(code);
  const endTime = new Date().getTime();
  // const refresh = await activities.getRefreshToken(token.refresh_token);
  console.log('it took', `${endTime - startTime} ms`);

  expect(typeof code).toEqual('');
});

// it("returns an object with the account info", async () => {
//   let token: TokenJSON = {
//     access_token: null,
//     refresh_token: null,
//     access_token_expires_at: null,
//     refresh_token_expires_at: null,
//     logged_in: null,
//     access_token_expires_at_date: null,
//     refresh_token_expires_at_date: null
//   };
//   let gettingUserPrinciples = {
//     userPrinciples: null,
//     params: null,
//   };
//   const clientId = process.env.TD_CLIENT_ID;

//   while (gettingUserPrinciples.params === null) {
//     token = await activities.getLoginCredentials(clientId);
//     gettingUserPrinciples = await activities.getUserPrinciples(token.access_token);
//   }
//   const accountId = process.env.TD_ACCOUNT_ID;
//   const getAccount = await activities.getAccount(token.access_token, accountId);
//   expect(getAccount.securitiesAccount.accountId).toEqual(accountId);
// });

// it("returns an object with current price, and surrounding demand and supply zones", async () => {
//   const demandZones = mockPremarketData.premarketData.demandZones;
//   const supplyZones = mockPremarketData.premarketData.supplyZones;
//   let token: TokenJSON = {
//     access_token: null,
//     refresh_token: null,
//     access_token_expires_at: null,
//     refresh_token_expires_at: null,
//     logged_in: null,
//     access_token_expires_at_date: null,
//     refresh_token_expires_at_date: null
//   };
//   let gettingUserPrinciples = {
//     userPrinciples: null,
//     params: null,
//   };
//   const clientId = process.env.TD_CLIENT_ID;

//   while (gettingUserPrinciples.params === null) {
//     token = await activities.getLoginCredentials(clientId);
//     gettingUserPrinciples = await activities.getUserPrinciples(token.access_token);
//   }

//   const params = gettingUserPrinciples.params

//   const adminConfig = {
//     "service": "ADMIN",
//     "command": "LOGIN",
//     "requestid": "0",
//     "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
//     "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
//     "parameters": {
//       "credential": params,
//       "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
//       "version": "1.0",
//       "qoslevel": "0",
//     },
//   }
//   const quoteConfig = {
//     "service": "QUOTE",
//     "requestid": "1",
//     "command": "SUBS",
//     "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
//     "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
//     "parameters": {
//       "keys": mockPremarketData.premarketData.symbol,
//       "fields": "0,1,2,3,4,5",
//     },
//   }
//   const loginRequest = {
//     "requests": [
//       adminConfig,
//     ],
//   }
//   const marketRequest = {
//     "requests": [
//       quoteConfig,
//     ],
//   }

//   const wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
//   const currentPrice = await activities.get_current_price(wsUri, loginRequest, marketRequest, demandZones, supplyZones);
//   expect(typeof currentPrice).toBe("object");
// });

// it("returns the current price surrounding key levels", async () => {
//   const currentPrice = 132.31;
//   const keyLevels = mockPremarketData.premarketData.keyLevels;
//   const surroundingKeyLevels = await activities.get_surrounding_key_levels(currentPrice, keyLevels);
//   expect(surroundingKeyLevels).toEqual({
//     above_resistance: 133.94,
//     resistance: 132.46,
//     support: 131,
//     below_support: 129.66
//   });
// });

// it("returns an object of demand and supply, with an entry, takeProfit, stoploss, and cutPosition", async () => {
//   const currentPrice = {
//     closePrice: 132.31,
//     demandZone: [[132.8, 133.39], [129.31, 130.1]],
//     supplyZone: []
//   };

//   const surroundingKeyLevels = {
//     above_resistance: 133.94,
//     resistance: 132.46,
//     support: 131,
//     below_support: 129.66
//   };

//   const positionSetup = await activities.get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone);
//   expect(positionSetup).toEqual({
//     demand: {
//       entry: 132.46,
//       stopLoss: 132.06,
//       takeProfit: 133.94,
//       cutPosition: 133.2
//     },
//     supply: null
//   });
// });

// it("returns an object with a call selection", async () => {
//   const positionSetup = {
//     demand: {
//       entry: 132.46,
//       stopLoss: 132.06,
//       takeProfit: 133.94,
//       cutPosition: 133.2
//     },
//     supply: null
//   };
//   let token = {
//     access_token: null,
//     refresh_token: null,
//     access_token_expires_at: null,
//     refresh_token_expires_at: null,
//     logged_in: null,
//     access_token_expires_at_date: null,
//     refresh_token_expires_at_date: null
//   };
//   let gettingUserPrinciples = {
//     userPrinciples: null,
//     params: null,
//   };
//   const accessToken = TokenJSON.access_token;
//   const symbol = mockPremarketData.premarketData.symbol;
//   const optionSelection = await activities.getOptionsSelection(positionSetup, symbol, accessToken);
//   console.log('optionSelection', optionSelection);
// });
