"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var activities = require("../priceActionPosition");
var mockPremarketData = require("../mocks/premarketData.mock");
var dotenv = require("dotenv");
dotenv.config();
// it("returns an object with userid equal to TD_USERNAME env variable", async () => {
//   const userId = process.env.TD_USERNAME;
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
//   expect(gettingUserPrinciples.userPrinciples.streamerInfo.appId).toEqual(userId);
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
it("returns an object with current price, and surrounding demand and supply zones", function () { return __awaiter(void 0, void 0, void 0, function () {
    var demandZones, supplyZones, token, gettingUserPrinciples, clientId, params, adminConfig, quoteConfig, loginRequest, marketRequest, wsUri, currentPrice;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                demandZones = mockPremarketData.premarketData.demandZones;
                supplyZones = mockPremarketData.premarketData.supplyZones;
                token = {
                    access_token: null,
                    refresh_token: null,
                    access_token_expires_at: null,
                    refresh_token_expires_at: null,
                    logged_in: null,
                    access_token_expires_at_date: null,
                    refresh_token_expires_at_date: null
                };
                gettingUserPrinciples = {
                    userPrinciples: null,
                    params: null
                };
                clientId = process.env.TD_CLIENT_ID;
                _a.label = 1;
            case 1:
                if (!(gettingUserPrinciples.params === null)) return [3 /*break*/, 4];
                return [4 /*yield*/, activities.getLoginCredentials(clientId)];
            case 2:
                token = _a.sent();
                return [4 /*yield*/, activities.getUserPrinciples(token.access_token)];
            case 3:
                gettingUserPrinciples = _a.sent();
                return [3 /*break*/, 1];
            case 4:
                params = gettingUserPrinciples.params;
                adminConfig = {
                    "service": "ADMIN",
                    "command": "LOGIN",
                    "requestid": "0",
                    "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                    "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                    "parameters": {
                        "credential": params,
                        "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
                        "version": "1.0",
                        "qoslevel": "0"
                    }
                };
                quoteConfig = {
                    "service": "QUOTE",
                    "requestid": "1",
                    "command": "SUBS",
                    "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                    "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                    "parameters": {
                        "keys": mockPremarketData.premarketData.symbol,
                        "fields": "0,1,2,3,4,5"
                    }
                };
                loginRequest = {
                    "requests": [
                        adminConfig,
                    ]
                };
                marketRequest = {
                    "requests": [
                        quoteConfig,
                    ]
                };
                wsUri = "wss://".concat(gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl, "/ws");
                return [4 /*yield*/, activities.get_current_price(wsUri, loginRequest, marketRequest, demandZones, supplyZones)];
            case 5:
                currentPrice = _a.sent();
                expect(typeof currentPrice).toBe("object");
                return [2 /*return*/];
        }
    });
}); });
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
//# sourceMappingURL=priceActionPosition.test.js.map