import * as activities from "../priceActionPosition";
import * as mockPremarketData from "../mocks/premarketData.mock";
import * as moment from "moment-timezone";
import { tdCredentialsToString } from "../../tda/middleware/tdCredentialToString";
import { TokenJSON } from '../../interfaces/token';
import {
  AssetType,
  ComplexOrderStrategyType,
  DurationType,
  InstructionType,
  OrderLegType,
  OrderStrategyType,
  OrderType,
  PutCall,
  SessionType,
} from "../../interfaces/orders";
import * as dotenv from "dotenv";
dotenv.config();


// // it("returns an object with userid equal to TD_USERNAME env variable", async () => {
// //   const startTime = new Date().getTime();
// //   let token: TokenJSON = {
// //     access_token: null,
// //     refresh_token: null,
// //     access_token_expires_at: null,
// //     refresh_token_expires_at: null,
// //     logged_in: null,
// //     access_token_expires_at_date: null,
// //     refresh_token_expires_at_date: null
// //   };

// //   const code = await activities.getUrlCode();
// //   console.log('code', code);
// //   token = await activities.getLoginCredentials(code);
// //   console.log('token', token);
// //   const endTime = new Date().getTime();
// //   // const refresh = await activities.getRefreshToken(token.refresh_token);
// //   console.log('it took', `${endTime - startTime} ms`);

// //   expect(typeof code).toEqual('');
// // });

// // it("returns an object with the account info", async () => {
// //   let token: TokenJSON = {
// //     access_token: null,
// //     refresh_token: null,
// //     access_token_expires_at: null,
// //     refresh_token_expires_at: null,
// //     logged_in: null,
// //     access_token_expires_at_date: null,
// //     refresh_token_expires_at_date: null
// //   };
// //   let gettingUserPrinciples = {
// //     userPrinciples: null,
// //     params: null,
// //   };
// //   const clientId = process.env.TD_CLIENT_ID;

// //   while (gettingUserPrinciples.params === null) {
// //     token = await activities.getLoginCredentials(clientId);
// //     gettingUserPrinciples = await activities.getUserPrinciples(token.access_token);
// //   }
// //   const accountId = process.env.TD_ACCOUNT_ID;
// //   const getAccount = await activities.getAccount(token.access_token, accountId);
// //   expect(getAccount.securitiesAccount.accountId).toEqual(accountId);
// // });

// // it("returns an object with current price, and surrounding demand and supply zones", async () => {
// //   let token = ""
// //   let gettingUserPrinciples = {
// //     userPrinciples: null,
// //     params: null,
// //     loginRequest: null,
// //     marketRequest: null,
// //     bookRequest: null,
// //     timeSalesRequest: null
// //   };
// //   const demandZones = mockPremarketData.premarketData.demandZones;
// //   const supplyZones = mockPremarketData.premarketData.supplyZones;
// //   const urlCode = await activities.getUrlCode();
// //   token = await activities.getLoginCredentials(urlCode);
// //   console.log('token', token)

// //   gettingUserPrinciples = await activities.getUserPrinciples(token, mockPremarketData.premarketData.symbol);
// //   console.log('gettingUserPrinciples', gettingUserPrinciples);
// //   const wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

// //   const currentPrice = await activities.get_current_price(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, demandZones, supplyZones, false);
// //   console.log(currentPrice);
// //   expect(typeof token).toBe("string");
// // });

it("returns an object with current price, and surrounding demand and supply zones", async () => {
  let token = ""
  const account_id = process.env.TD_ACCOUNT_ID;
  const price = 0.02;
  const quantity = 1;
  const symbol = "AAPL_032423C180";
  const orderData = {
    accountId: account_id,
    order: {
      orderType: OrderType.LIMIT,
      price: price,
      session: SessionType.NORMAL,
      duration: DurationType.FILL_OR_KILL,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: [{
        orderLegType: OrderLegType.OPTION,
        instruction: InstructionType.BUY_TO_OPEN,
        quantity: quantity,
        instrument: {
          assetType: AssetType.OPTION,
          symbol: symbol,
          putCall: PutCall.CALL,
        },
      }],
      complexOrderStrategyType: ComplexOrderStrategyType.NONE,
    },
  };
  const urlCode = await activities.getUrlCode();
  token = await activities.getLoginCredentials(urlCode);
  console.log('token', token);
  const openPositionResponse = await activities.placeOrder(token, account_id, orderData);
  console.log(openPositionResponse);
  expect(typeof token).toBe("string");
});

// // it("returns the current price surrounding key levels", async () => {
// //   const currentPrice = 132.31;
// //   const keyLevels = mockPremarketData.premarketData.keyLevels;
// //   const surroundingKeyLevels = await activities.get_surrounding_key_levels(currentPrice, keyLevels);
// //   expect(surroundingKeyLevels).toEqual({
// //     above_resistance: 133.94,
// //     resistance: 132.46,
// //     support: 131,
// //     below_support: 129.66
// //   });
// // });

// // it("returns an object of demand and supply, with an entry, takeProfit, stoploss, and cutPosition", async () => {
// //   const toDate = moment().add((5 - moment().isoWeekday()), 'day').format('YYYY-MM-DD');
// //   const fromDate = moment().isoWeekday() !== 5 ? moment().add((moment().isoWeekday() % 5), 'day').subtract(1, 'day').format('YYYY-MM-DD') : moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD');
// //   const numberOfDaysAway = moment().isoWeekday() !== 5 ? (5 - moment().isoWeekday()) : 0;
// //   const optionString = `${fromDate}:${numberOfDaysAway}`;

// //   const parseJson = JSON.parse(JSON.stringify(currentPrice));
// //   console.log('parseJson', parseJson.putExpDateMap[optionString]);

// //   const positionSetup = await activities.filterOptionResponse(parseJson.putExpDateMap[optionString], "PUT");
// //   console.log('positionSetup', positionSetup);
// //   expect(positionSetup).toEqual({
// //     demand: {
// //       entry: 132.46,
// //       stopLoss: 132.06,
// //       takeProfit: 133.94,
// //       cutPosition: 133.2
// //     },
// //     supply: null
// //   });
// // });

// // it("returns an object with a call selection", async () => {
// //   const positionSetup = {
// //     demand: {
// //       entry: 132.46,
// //       stopLoss: 132.06,
// //       takeProfit: 133.94,
// //       cutPosition: 133.2
// //     },
// //     supply: null
// //   };
// //   let token = {
// //     access_token: null,
// //     refresh_token: null,
// //     access_token_expires_at: null,
// //     refresh_token_expires_at: null,
// //     logged_in: null,
// //     access_token_expires_at_date: null,
// //     refresh_token_expires_at_date: null
// //   };
// //   let gettingUserPrinciples = {
// //     userPrinciples: null,
// //     params: null,
// //   };
// //   const accessToken = TokenJSON.access_token;
// //   const symbol = mockPremarketData.premarketData.symbol;
// //   const optionSelection = await activities.getOptionsSelection(positionSetup, symbol, accessToken);
// //   console.log('optionSelection', optionSelection);
// // });
