import * as activities from "../priceActionPosition";
import * as mockPremarketData from "../mocks/premarketData.mock";
import * as moment from "moment-timezone";
import { tdCredentialsToString } from "../../tda/middleware/tdCredentialToString";
import { TokenJSON } from '../../interfaces/token';
import * as dotenv from "dotenv";
dotenv.config();


// it("returns an object with userid equal to TD_USERNAME env variable", async () => {
//   const startTime = new Date().getTime();
//   let token: TokenJSON = {
//     access_token: null,
//     refresh_token: null,
//     access_token_expires_at: null,
//     refresh_token_expires_at: null,
//     logged_in: null,
//     access_token_expires_at_date: null,
//     refresh_token_expires_at_date: null
//   };

//   const code = await activities.getUrlCode();
//   console.log('code', code);
//   token = await activities.getLoginCredentials(code);
//   console.log('token', token);
//   const endTime = new Date().getTime();
//   // const refresh = await activities.getRefreshToken(token.refresh_token);
//   console.log('it took', `${endTime - startTime} ms`);

//   expect(typeof code).toEqual('');
// });

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
//   let token = ""
//   let gettingUserPrinciples = {
//     userPrinciples: null,
//     params: null,
//     loginRequest: null,
//     marketRequest: null,
//     bookRequest: null,
//     timeSalesRequest: null
//   };
//   const demandZones = mockPremarketData.premarketData.demandZones;
//   const supplyZones = mockPremarketData.premarketData.supplyZones;
//   const urlCode = await activities.getUrlCode();
//   token = await activities.getLoginCredentials(urlCode);
//   console.log('token', token)

//   gettingUserPrinciples = await activities.getUserPrinciples(token, mockPremarketData.premarketData.symbol);
//   console.log('gettingUserPrinciples', gettingUserPrinciples);
//   const wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

//   const currentPrice = await activities.get_current_price(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, demandZones, supplyZones, false);
//   console.log(currentPrice);
//   expect(typeof token).toBe("string");
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

it("returns an object of demand and supply, with an entry, takeProfit, stoploss, and cutPosition", async () => {
  const toDate = moment().add((5 - moment().isoWeekday()), 'day').format('YYYY-MM-DD');
  const fromDate = moment().isoWeekday() !== 5 ? moment().add((moment().isoWeekday() % 5), 'day').subtract(1, 'day').format('YYYY-MM-DD') : moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD');
  const numberOfDaysAway = moment().isoWeekday() !== 5 ? (5 - moment().isoWeekday()) : 0;
  const optionString = `${fromDate}:${numberOfDaysAway}`;
  const currentPrice = { "symbol": "AAPL", "status": "SUCCESS", "underlying": null, "strategy": "SINGLE", "interval": 0.0, "isDelayed": false, "isIndex": false, "interestRate": 5.008, "underlyingPrice": 152.94, "volatility": 29.0, "daysToExpiration": 0.0, "numberOfContracts": 20, "putExpDateMap": { "2023-03-10:2": { "142.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P142", "description": "AAPL Mar 10 2023 142 Put (Weekly)", "exchangeName": "OPR", "bid": 0.02, "ask": 0.03, "last": 0.02, "mark": 0.03, "bidSize": 1, "askSize": 1478, "bidAskSize": "1X1478", "lastSize": 0, "highPrice": 0.05, "lowPrice": 0.02, "openPrice": 0.0, "closePrice": 0.05, "totalVolume": 900, "tradeDate": null, "tradeTimeInLong": 1678309121263, "quoteTimeInLong": 1678309199954, "netChange": -0.03, "volatility": "NaN", "delta": "NaN", "gamma": "NaN", "theta": "NaN", "vega": 0.005, "rho": "NaN", "openInterest": 4567, "timeValue": 0.02, "theoreticalOptionValue": "NaN", "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 142.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -55.56, "markChange": -0.02, "markPercentChange": -44.44, "intrinsicValue": -10.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "143.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P143", "description": "AAPL Mar 10 2023 143 Put (Weekly)", "exchangeName": "OPR", "bid": 0.02, "ask": 0.03, "last": 0.03, "mark": 0.03, "bidSize": 319, "askSize": 356, "bidAskSize": "319X356", "lastSize": 0, "highPrice": 0.07, "lowPrice": 0.01, "openPrice": 0.0, "closePrice": 0.06, "totalVolume": 6844, "tradeDate": null, "tradeTimeInLong": 1678308949176, "quoteTimeInLong": 1678309199443, "netChange": -0.04, "volatility": "NaN", "delta": "NaN", "gamma": "NaN", "theta": "NaN", "vega": 0.005, "rho": "NaN", "openInterest": 4924, "timeValue": 0.03, "theoreticalOptionValue": "NaN", "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 143.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -53.85, "markChange": -0.04, "markPercentChange": -61.54, "intrinsicValue": -9.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "144.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P144", "description": "AAPL Mar 10 2023 144 Put (Weekly)", "exchangeName": "OPR", "bid": 0.03, "ask": 0.04, "last": 0.04, "mark": 0.04, "bidSize": 2, "askSize": 1318, "bidAskSize": "2X1318", "lastSize": 0, "highPrice": 0.09, "lowPrice": 0.03, "openPrice": 0.0, "closePrice": 0.09, "totalVolume": 2006, "tradeDate": null, "tradeTimeInLong": 1678309179670, "quoteTimeInLong": 1678309199954, "netChange": -0.05, "volatility": "NaN", "delta": "NaN", "gamma": "NaN", "theta": "NaN", "vega": 0.008, "rho": "NaN", "openInterest": 5692, "timeValue": 0.04, "theoreticalOptionValue": "NaN", "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 144.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -57.89, "markChange": -0.06, "markPercentChange": -63.16, "intrinsicValue": -8.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "145.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P145", "description": "AAPL Mar 10 2023 145 Put (Weekly)", "exchangeName": "OPR", "bid": 0.04, "ask": 0.05, "last": 0.05, "mark": 0.05, "bidSize": 161, "askSize": 318, "bidAskSize": "161X318", "lastSize": 0, "highPrice": 0.14, "lowPrice": 0.04, "openPrice": 0.0, "closePrice": 0.14, "totalVolume": 17473, "tradeDate": null, "tradeTimeInLong": 1678309191582, "quoteTimeInLong": 1678309199806, "netChange": -0.09, "volatility": "NaN", "delta": "NaN", "gamma": "NaN", "theta": "NaN", "vega": 0.008, "rho": "NaN", "openInterest": 13336, "timeValue": 0.05, "theoreticalOptionValue": "NaN", "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 145.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -62.96, "markChange": -0.09, "markPercentChange": -66.67, "intrinsicValue": -7.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "146.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P146", "description": "AAPL Mar 10 2023 146 Put (Weekly)", "exchangeName": "OPR", "bid": 0.07, "ask": 0.08, "last": 0.08, "mark": 0.08, "bidSize": 18, "askSize": 1019, "bidAskSize": "18X1019", "lastSize": 0, "highPrice": 0.2, "lowPrice": 0.07, "openPrice": 0.0, "closePrice": 0.21, "totalVolume": 3177, "tradeDate": null, "tradeTimeInLong": 1678309188748, "quoteTimeInLong": 1678309199995, "netChange": -0.13, "volatility": 32.066, "delta": -0.043, "gamma": 0.022, "theta": -0.07, "vega": 0.012, "rho": 0.0, "openInterest": 15856, "timeValue": 0.08, "theoreticalOptionValue": 0.075, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 146.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -61.9, "markChange": -0.13, "markPercentChange": -64.29, "intrinsicValue": -6.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "147.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P147", "description": "AAPL Mar 10 2023 147 Put (Weekly)", "exchangeName": "OPR", "bid": 0.1, "ask": 0.12, "last": 0.11, "mark": 0.11, "bidSize": 47, "askSize": 620, "bidAskSize": "47X620", "lastSize": 0, "highPrice": 0.3, "lowPrice": 0.1, "openPrice": 0.0, "closePrice": 0.32, "totalVolume": 10840, "tradeDate": null, "tradeTimeInLong": 1678309188603, "quoteTimeInLong": 1678309199985, "netChange": -0.21, "volatility": 30.617, "delta": -0.063, "gamma": 0.031, "theta": -0.09, "vega": 0.016, "rho": -0.001, "openInterest": 6151, "timeValue": 0.11, "theoreticalOptionValue": 0.11, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 147.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -65.62, "markChange": -0.21, "markPercentChange": -65.62, "intrinsicValue": -5.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "148.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P148", "description": "AAPL Mar 10 2023 148 Put (Weekly)", "exchangeName": "OPR", "bid": 0.18, "ask": 0.19, "last": 0.18, "mark": 0.19, "bidSize": 1, "askSize": 479, "bidAskSize": "1X479", "lastSize": 0, "highPrice": 0.44, "lowPrice": 0.15, "openPrice": 0.0, "closePrice": 0.49, "totalVolume": 11413, "tradeDate": null, "tradeTimeInLong": 1678309195725, "quoteTimeInLong": 1678309199975, "netChange": -0.31, "volatility": 30.191, "delta": -0.098, "gamma": 0.044, "theta": -0.124, "vega": 0.023, "rho": -0.001, "openInterest": 13046, "timeValue": 0.18, "theoreticalOptionValue": 0.185, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 148.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -63.27, "markChange": -0.31, "markPercentChange": -62.24, "intrinsicValue": -4.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "149.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P149", "description": "AAPL Mar 10 2023 149 Put (Weekly)", "exchangeName": "OPR", "bid": 0.29, "ask": 0.3, "last": 0.29, "mark": 0.3, "bidSize": 50, "askSize": 40, "bidAskSize": "50X40", "lastSize": 0, "highPrice": 0.63, "lowPrice": 0.24, "openPrice": 0.0, "closePrice": 0.7, "totalVolume": 13161, "tradeDate": null, "tradeTimeInLong": 1678309188603, "quoteTimeInLong": 1678309199954, "netChange": -0.41, "volatility": 29.576, "delta": -0.146, "gamma": 0.059, "theta": -0.16, "vega": 0.03, "rho": -0.002, "openInterest": 9888, "timeValue": 0.29, "theoreticalOptionValue": 0.295, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 149.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -58.87, "markChange": -0.41, "markPercentChange": -58.16, "intrinsicValue": -3.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "150.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P150", "description": "AAPL Mar 10 2023 150 Put (Weekly)", "exchangeName": "OPR", "bid": 0.44, "ask": 0.47, "last": 0.44, "mark": 0.45, "bidSize": 547, "askSize": 30, "bidAskSize": "547X30", "lastSize": 0, "highPrice": 0.9, "lowPrice": 0.39, "openPrice": 0.0, "closePrice": 1.01, "totalVolume": 52447, "tradeDate": null, "tradeTimeInLong": 1678309199927, "quoteTimeInLong": 1678309199986, "netChange": -0.57, "volatility": 28.888, "delta": -0.21, "gamma": 0.076, "theta": -0.195, "vega": 0.038, "rho": -0.002, "openInterest": 28092, "timeValue": 0.44, "theoreticalOptionValue": 0.455, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 150.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -56.41, "markChange": -0.55, "markPercentChange": -54.93, "intrinsicValue": -2.87, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "152.5": [{ "putCall": "PUT", "symbol": "AAPL_031023P152.5", "description": "AAPL Mar 10 2023 152.5 Put (Weekly)", "exchangeName": "OPR", "bid": 1.22, "ask": 1.26, "last": 1.25, "mark": 1.24, "bidSize": 38, "askSize": 30, "bidAskSize": "38X30", "lastSize": 0, "highPrice": 1.93, "lowPrice": 1.1, "openPrice": 0.0, "closePrice": 2.13, "totalVolume": 41206, "tradeDate": null, "tradeTimeInLong": 1678309199750, "quoteTimeInLong": 1678309199871, "netChange": -0.88, "volatility": 28.073, "delta": -0.445, "gamma": 0.108, "theta": -0.254, "vega": 0.052, "rho": -0.005, "openInterest": 13368, "timeValue": 1.25, "theoreticalOptionValue": 1.24, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 152.5, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -41.31, "markChange": -0.89, "markPercentChange": -41.78, "intrinsicValue": -0.37, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": false }], "155.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P155", "description": "AAPL Mar 10 2023 155 Put (Weekly)", "exchangeName": "OPR", "bid": 2.66, "ask": 2.73, "last": 2.77, "mark": 2.7, "bidSize": 1, "askSize": 56, "bidAskSize": "1X56", "lastSize": 0, "highPrice": 3.6, "lowPrice": 2.37, "openPrice": 0.0, "closePrice": 3.84, "totalVolume": 7547, "tradeDate": null, "tradeTimeInLong": 1678309180433, "quoteTimeInLong": 1678309199845, "netChange": -1.07, "volatility": 27.088, "delta": -0.716, "gamma": 0.099, "theta": -0.2, "vega": 0.044, "rho": -0.007, "openInterest": 15096, "timeValue": 0.64, "theoreticalOptionValue": 2.667, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 155.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -27.93, "markChange": -1.15, "markPercentChange": -29.88, "intrinsicValue": 2.13, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "157.5": [{ "putCall": "PUT", "symbol": "AAPL_031023P157.5", "description": "AAPL Mar 10 2023 157.5 Put (Weekly)", "exchangeName": "OPR", "bid": 3.95, "ask": 4.9, "last": 4.85, "mark": 4.43, "bidSize": 488, "askSize": 308, "bidAskSize": "488X308", "lastSize": 0, "highPrice": 5.5, "lowPrice": 4.3, "openPrice": 0.0, "closePrice": 6.03, "totalVolume": 730, "tradeDate": null, "tradeTimeInLong": 1678309170697, "quoteTimeInLong": 1678309199954, "netChange": -1.18, "volatility": 26.905, "delta": -0.908, "gamma": 0.055, "theta": -0.086, "vega": 0.021, "rho": -0.006, "openInterest": 4316, "timeValue": 0.22, "theoreticalOptionValue": 4.728, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 157.5, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -19.61, "markChange": -1.61, "markPercentChange": -26.66, "intrinsicValue": 4.63, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "160.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P160", "description": "AAPL Mar 10 2023 160 Put (Weekly)", "exchangeName": "OPR", "bid": 6.6, "ask": 7.85, "last": 7.1, "mark": 7.23, "bidSize": 111, "askSize": 124, "bidAskSize": "111X124", "lastSize": 0, "highPrice": 7.85, "lowPrice": 6.58, "openPrice": 0.0, "closePrice": 8.44, "totalVolume": 267, "tradeDate": null, "tradeTimeInLong": 1678304241911, "quoteTimeInLong": 1678309197962, "netChange": -1.34, "volatility": 29.071, "delta": -0.973, "gamma": 0.015, "theta": -0.023, "vega": 0.007, "rho": -0.002, "openInterest": 4096, "timeValue": -0.03, "theoreticalOptionValue": 7.131, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 160.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -15.87, "markChange": -1.21, "markPercentChange": -14.39, "intrinsicValue": 7.13, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "162.5": [{ "putCall": "PUT", "symbol": "AAPL_031023P162.5", "description": "AAPL Mar 10 2023 162.5 Put (Weekly)", "exchangeName": "OPR", "bid": 8.8, "ask": 10.7, "last": 10.15, "mark": 9.75, "bidSize": 132, "askSize": 120, "bidAskSize": "132X120", "lastSize": 0, "highPrice": 10.2, "lowPrice": 9.65, "openPrice": 0.0, "closePrice": 10.91, "totalVolume": 51, "tradeDate": null, "tradeTimeInLong": 1678307637451, "quoteTimeInLong": 1678309199762, "netChange": -0.76, "volatility": 32.831, "delta": -1.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0, "openInterest": 85, "timeValue": 0.52, "theoreticalOptionValue": 9.63, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 162.5, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -7.0, "markChange": -1.16, "markPercentChange": -10.67, "intrinsicValue": 9.63, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "165.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P165", "description": "AAPL Mar 10 2023 165 Put (Weekly)", "exchangeName": "OPR", "bid": 11.4, "ask": 13.1, "last": 12.4, "mark": 12.25, "bidSize": 120, "askSize": 132, "bidAskSize": "120X132", "lastSize": 0, "highPrice": 12.85, "lowPrice": 12.3, "openPrice": 0.0, "closePrice": 13.4, "totalVolume": 785, "tradeDate": null, "tradeTimeInLong": 1678303635266, "quoteTimeInLong": 1678309199725, "netChange": -1.0, "volatility": 32.931, "delta": -1.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0, "openInterest": 132, "timeValue": 0.27, "theoreticalOptionValue": 12.13, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 165.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -7.47, "markChange": -1.15, "markPercentChange": -8.59, "intrinsicValue": 12.13, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "167.5": [{ "putCall": "PUT", "symbol": "AAPL_031023P167.5", "description": "AAPL Mar 10 2023 167.5 Put (Weekly)", "exchangeName": "OPR", "bid": 13.95, "ask": 15.6, "last": 14.7, "mark": 14.77, "bidSize": 123, "askSize": 120, "bidAskSize": "123X120", "lastSize": 0, "highPrice": 14.95, "lowPrice": 14.7, "openPrice": 0.0, "closePrice": 15.9, "totalVolume": 12, "tradeDate": null, "tradeTimeInLong": 1678303999890, "quoteTimeInLong": 1678309199699, "netChange": -1.2, "volatility": 38.728, "delta": -1.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0, "openInterest": 9, "timeValue": 0.07, "theoreticalOptionValue": 14.63, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 167.5, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -7.55, "markChange": -1.12, "markPercentChange": -7.08, "intrinsicValue": 14.63, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "170.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P170", "description": "AAPL Mar 10 2023 170 Put (Weekly)", "exchangeName": "OPR", "bid": 16.4, "ask": 18.05, "last": 17.7, "mark": 17.23, "bidSize": 84, "askSize": 120, "bidAskSize": "84X120", "lastSize": 0, "highPrice": 17.7, "lowPrice": 17.7, "openPrice": 0.0, "closePrice": 18.4, "totalVolume": 6, "tradeDate": null, "tradeTimeInLong": 1678307012288, "quoteTimeInLong": 1678309199699, "netChange": -0.7, "volatility": 44.355, "delta": -1.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0, "openInterest": 4, "timeValue": 0.57, "theoreticalOptionValue": 17.13, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 170.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -3.8, "markChange": -1.17, "markPercentChange": -6.39, "intrinsicValue": 17.13, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "172.5": [{ "putCall": "PUT", "symbol": "AAPL_031023P172.5", "description": "AAPL Mar 10 2023 172.5 Put (Weekly)", "exchangeName": "OPR", "bid": 18.9, "ask": 20.55, "last": 20.05, "mark": 19.73, "bidSize": 123, "askSize": 120, "bidAskSize": "123X120", "lastSize": 0, "highPrice": 20.1, "lowPrice": 19.3, "openPrice": 0.0, "closePrice": 20.9, "totalVolume": 4, "tradeDate": null, "tradeTimeInLong": 1678300019622, "quoteTimeInLong": 1678309199699, "netChange": -0.85, "volatility": 49.831, "delta": -1.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0, "openInterest": 0, "timeValue": 0.42, "theoreticalOptionValue": 19.63, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 172.5, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -4.07, "markChange": -1.17, "markPercentChange": -5.62, "intrinsicValue": 19.63, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "175.0": [{ "putCall": "PUT", "symbol": "AAPL_031023P175", "description": "AAPL Mar 10 2023 175 Put (Weekly)", "exchangeName": "OPR", "bid": 21.4, "ask": 23.1, "last": 22.3, "mark": 22.25, "bidSize": 120, "askSize": 132, "bidAskSize": "120X132", "lastSize": 0, "highPrice": 22.3, "lowPrice": 22.3, "openPrice": 0.0, "closePrice": 23.4, "totalVolume": 25, "tradeDate": null, "tradeTimeInLong": 1678304628532, "quoteTimeInLong": 1678309199725, "netChange": -1.1, "volatility": 55.169, "delta": -1.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0, "openInterest": 20, "timeValue": 0.17, "theoreticalOptionValue": 22.13, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 175.0, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -4.7, "markChange": -1.15, "markPercentChange": -4.91, "intrinsicValue": 22.13, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }], "177.5": [{ "putCall": "PUT", "symbol": "AAPL_031023P177.5", "description": "AAPL Mar 10 2023 177.5 Put (Weekly)", "exchangeName": "OPR", "bid": 23.9, "ask": 25.45, "last": 24.95, "mark": 24.67, "bidSize": 120, "askSize": 120, "bidAskSize": "120X120", "lastSize": 0, "highPrice": 0.0, "lowPrice": 0.0, "openPrice": 0.0, "closePrice": 25.9, "totalVolume": 0, "tradeDate": null, "tradeTimeInLong": 1678209751473, "quoteTimeInLong": 1678309199699, "netChange": -0.95, "volatility": 60.382, "delta": -1.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0, "openInterest": 0, "timeValue": 0.32, "theoreticalOptionValue": 24.63, "theoreticalVolatility": 29.0, "optionDeliverablesList": null, "strikePrice": 177.5, "expirationDate": 1678482000000, "daysToExpiration": 2, "expirationType": "S", "lastTradingDay": 1678496400000, "multiplier": 100.0, "settlementType": " ", "deliverableNote": "", "isIndexOption": null, "percentChange": -3.67, "markChange": -1.22, "markPercentChange": -4.73, "intrinsicValue": 24.63, "pennyPilot": true, "nonStandard": false, "mini": false, "inTheMoney": true }] } }, "callExpDateMap": {} };


  const parseJson = JSON.parse(JSON.stringify(currentPrice));
  console.log('parseJson', parseJson.putExpDateMap[optionString]);

  const positionSetup = await activities.filterOptionResponse(parseJson.putExpDateMap[optionString], "PUT");
  console.log('positionSetup', positionSetup);
  expect(positionSetup).toEqual({
    demand: {
      entry: 132.46,
      stopLoss: 132.06,
      takeProfit: 133.94,
      cutPosition: 133.2
    },
    supply: null
  });
});

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
