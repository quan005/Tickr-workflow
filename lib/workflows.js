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
exports.priceAction = void 0;
var workflow_1 = require("@temporalio/workflow");
var _a = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: 28800000
}), is_market_open = _a.is_market_open, get_current_price = _a.get_current_price, get_surrounding_key_levels = _a.get_surrounding_key_levels, get_position_setup = _a.get_position_setup, getOptionsSelection = _a.getOptionsSelection, waitToSignalOpenPosition = _a.waitToSignalOpenPosition, checkIfPositionFilled = _a.checkIfPositionFilled, getOptionSymbol = _a.getOptionSymbol, waitToSignalCutPosition = _a.waitToSignalCutPosition, waitToSignalClosePosition = _a.waitToSignalClosePosition, getLoginCredentials = _a.getLoginCredentials, getUserPrinciples = _a.getUserPrinciples;
function priceAction(premarketData) {
    return __awaiter(this, void 0, void 0, function () {
        var budget, clientId, accountId, keyLevels, demandZones, supplyZones, symbol, token, gettingUserPrinciples, marketOpen, params, adminConfig, quoteConfig, bookConfig, timeSaleConfig, loginRequest, marketRequest, bookRequest, timeSalesRequest, wsUri, currentPrice, surroundingKeyLevels, positionSetup, optionSelection, signalOpenPosition, quantity, optionSymbol, cutFilled, remainingQuantity, signalClosePosition;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (premarketData === undefined || premarketData === null) {
                        return [2 /*return*/, 'No Opportunities'];
                    }
                    budget = premarketData.budget;
                    clientId = premarketData.client_id;
                    accountId = premarketData.account_id;
                    keyLevels = premarketData.keyLevels;
                    demandZones = premarketData.demandZones;
                    supplyZones = premarketData.supplyZones;
                    symbol = premarketData.symbol;
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
                    return [4 /*yield*/, is_market_open()];
                case 1:
                    marketOpen = _a.sent();
                    if (!marketOpen) return [3 /*break*/, 29];
                    _a.label = 2;
                case 2:
                    if (!(gettingUserPrinciples.params === null)) return [3 /*break*/, 5];
                    return [4 /*yield*/, getLoginCredentials(clientId)];
                case 3:
                    token = _a.sent();
                    return [4 /*yield*/, getUserPrinciples(token.access_token)];
                case 4:
                    gettingUserPrinciples = _a.sent();
                    return [3 /*break*/, 2];
                case 5:
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
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3,4,5"
                        }
                    };
                    bookConfig = {
                        "service": "NASDAQ_BOOK",
                        "requestid": "3",
                        "command": "SUBS",
                        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                        "parameters": {
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3"
                        }
                    };
                    timeSaleConfig = {
                        "service": "TIMESALE_EQUITY",
                        "requestid": "4",
                        "command": "SUBS",
                        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                        "parameters": {
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3"
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
                    bookRequest = {
                        "requests": [
                            bookConfig,
                        ]
                    };
                    timeSalesRequest = {
                        "requests": [
                            timeSaleConfig,
                        ]
                    };
                    wsUri = "wss://".concat(gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl, "/ws");
                    return [4 /*yield*/, get_current_price(wsUri, loginRequest, marketRequest, demandZones, supplyZones)];
                case 6:
                    currentPrice = _a.sent();
                    return [4 /*yield*/, get_surrounding_key_levels(currentPrice.closePrice, keyLevels)];
                case 7:
                    surroundingKeyLevels = _a.sent();
                    return [4 /*yield*/, get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone)];
                case 8:
                    positionSetup = _a.sent();
                    return [4 /*yield*/, getOptionsSelection(positionSetup, symbol, token.access_token)];
                case 9:
                    optionSelection = _a.sent();
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
                    _a.label = 10;
                case 10:
                    if (!(gettingUserPrinciples.params === null)) return [3 /*break*/, 13];
                    return [4 /*yield*/, getLoginCredentials(clientId)];
                case 11:
                    token = _a.sent();
                    return [4 /*yield*/, getUserPrinciples(token.access_token)];
                case 12:
                    gettingUserPrinciples = _a.sent();
                    return [3 /*break*/, 10];
                case 13:
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
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3,4,5"
                        }
                    };
                    bookConfig = {
                        "service": "NASDAQ_BOOK",
                        "requestid": "3",
                        "command": "SUBS",
                        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                        "parameters": {
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3"
                        }
                    };
                    timeSaleConfig = {
                        "service": "TIMESALE_EQUITY",
                        "requestid": "4",
                        "command": "SUBS",
                        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                        "parameters": {
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3"
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
                    bookRequest = {
                        "requests": [
                            bookConfig,
                        ]
                    };
                    timeSalesRequest = {
                        "requests": [
                            timeSaleConfig,
                        ]
                    };
                    wsUri = "wss://".concat(gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl, "/ws");
                    return [4 /*yield*/, waitToSignalOpenPosition(wsUri, loginRequest, bookRequest, timeSalesRequest, positionSetup, optionSelection, budget, accountId, token.access_token)];
                case 14:
                    signalOpenPosition = _a.sent();
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
                    if (!signalOpenPosition.position) return [3 /*break*/, 27];
                    return [4 /*yield*/, checkIfPositionFilled(signalOpenPosition.position, accountId, token.access_token)];
                case 15:
                    quantity = _a.sent();
                    return [4 /*yield*/, getOptionSymbol(signalOpenPosition.position, accountId, token.access_token)];
                case 16:
                    optionSymbol = _a.sent();
                    _a.label = 17;
                case 17:
                    if (!(gettingUserPrinciples.params === null)) return [3 /*break*/, 20];
                    return [4 /*yield*/, getLoginCredentials(clientId)];
                case 18:
                    token = _a.sent();
                    return [4 /*yield*/, getUserPrinciples(token.access_token)];
                case 19:
                    gettingUserPrinciples = _a.sent();
                    return [3 /*break*/, 17];
                case 20:
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
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3,4,5"
                        }
                    };
                    bookConfig = {
                        "service": "NASDAQ_BOOK",
                        "requestid": "3",
                        "command": "SUBS",
                        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                        "parameters": {
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3"
                        }
                    };
                    timeSaleConfig = {
                        "service": "TIMESALE_EQUITY",
                        "requestid": "4",
                        "command": "SUBS",
                        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                        "parameters": {
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3"
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
                    bookRequest = {
                        "requests": [
                            bookConfig,
                        ]
                    };
                    timeSalesRequest = {
                        "requests": [
                            timeSaleConfig,
                        ]
                    };
                    wsUri = "wss://".concat(gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl, "/ws");
                    return [4 /*yield*/, waitToSignalCutPosition(wsUri, loginRequest, bookRequest, timeSalesRequest, optionSymbol, quantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token)];
                case 21:
                    cutFilled = _a.sent();
                    remainingQuantity = quantity - cutFilled;
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
                    _a.label = 22;
                case 22:
                    if (!(gettingUserPrinciples.params === null)) return [3 /*break*/, 25];
                    return [4 /*yield*/, getLoginCredentials(clientId)];
                case 23:
                    token = _a.sent();
                    return [4 /*yield*/, getUserPrinciples(token.access_token)];
                case 24:
                    gettingUserPrinciples = _a.sent();
                    return [3 /*break*/, 22];
                case 25:
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
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3,4,5"
                        }
                    };
                    bookConfig = {
                        "service": "NASDAQ_BOOK",
                        "requestid": "3",
                        "command": "SUBS",
                        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                        "parameters": {
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3"
                        }
                    };
                    timeSaleConfig = {
                        "service": "TIMESALE_EQUITY",
                        "requestid": "4",
                        "command": "SUBS",
                        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                        "parameters": {
                            "keys": premarketData.symbol,
                            "fields": "0,1,2,3"
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
                    bookRequest = {
                        "requests": [
                            bookConfig,
                        ]
                    };
                    timeSalesRequest = {
                        "requests": [
                            timeSaleConfig,
                        ]
                    };
                    wsUri = "wss://".concat(gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl, "/ws");
                    return [4 /*yield*/, waitToSignalClosePosition(wsUri, loginRequest, bookRequest, timeSalesRequest, optionSymbol, remainingQuantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token)];
                case 26:
                    signalClosePosition = _a.sent();
                    return [2 /*return*/, signalClosePosition.orderId];
                case 27: return [2 /*return*/, 'NOGOODPOSITIONS'];
                case 28: return [3 /*break*/, 30];
                case 29: return [2 /*return*/, 'MARKETCLOSED'];
                case 30: return [2 /*return*/];
            }
        });
    });
}
exports.priceAction = priceAction;
//# sourceMappingURL=workflows.js.map