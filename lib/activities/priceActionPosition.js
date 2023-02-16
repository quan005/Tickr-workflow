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
exports.waitForClientLoginMessage = exports.waitForClientConnection = exports.sendClientRequest = exports.websocketClient = exports.filterOptionResponse = exports.getOptionChain = exports.getOrder = exports.placeOrder = exports.getAccount = exports.getUserPrinciples = exports.getLoginCredentials = exports.waitToSignalClosePosition = exports.waitToSignalCutPosition = exports.closePosition = exports.cutPosition = exports.getOptionSymbol = exports.waitToSignalOpenPosition = exports.checkIfPositionFilled = exports.openPosition = exports.checkAccountAvailableBalance = exports.getOptionsSelection = exports.get_position_setup = exports.get_current_price = exports.find_supply_zone = exports.is_supply_zone = exports.find_demand_zone = exports.is_demand_zone = exports.get_surrounding_key_levels = exports.is_market_open = void 0;
var ws_1 = require("ws");
var activity_1 = require("@temporalio/activity");
var path = require("path");
var fs = require("fs");
var https = require("https");
var url = require("url");
var dotenv = require("dotenv");
var tdLogin_1 = require("../tda/middleware/tdLogin");
var tdAuthUrl_1 = require("../tda/middleware/tdAuthUrl");
var tdCredentialToString_1 = require("../tda/middleware/tdCredentialToString");
var orders_1 = require("../interfaces/orders");
var optionChain_1 = require("../interfaces/optionChain");
var moment = require("moment-timezone");
dotenv.config();
function is_market_open() {
    return __awaiter(this, void 0, void 0, function () {
        var day, marketOpen, marketInt;
        return __generator(this, function (_a) {
            day = moment().tz('America/New_York').format('dddd');
            if (day === "Saturday" || day === "Sunday") {
                return [2 /*return*/, false];
            }
            marketOpen = moment().tz('America/New_York').format('Hmm');
            marketInt = parseInt(marketOpen);
            while (marketInt < 907 || marketInt > 1600) {
                marketOpen = moment().tz('America/New_York').format('H:mm');
                marketInt = parseInt(marketOpen);
                activity_1.Context.current().heartbeat();
            }
            return [2 /*return*/, true];
        });
    });
}
exports.is_market_open = is_market_open;
function get_surrounding_key_levels(current_price, key_levels) {
    return __awaiter(this, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            for (i = 0; i < key_levels.length; i++) {
                activity_1.Context.current().heartbeat();
                if (i == 0) {
                    if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
                        return [2 /*return*/, {
                                above_resistance: null,
                                resistance: key_levels[i],
                                support: key_levels[i + 1],
                                below_support: key_levels[i + 2]
                            }];
                    }
                    else if (current_price >= key_levels[i]) {
                        return [2 /*return*/, {
                                above_resistance: null,
                                resistance: null,
                                support: key_levels[i],
                                below_support: key_levels[i + 1]
                            }];
                    }
                    else {
                        continue;
                    }
                }
                else if (i === 1) {
                    if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
                        return [2 /*return*/, {
                                above_resistance: key_levels[i - 1],
                                resistance: key_levels[i],
                                support: key_levels[i + 1],
                                below_support: key_levels[i + 2]
                            }];
                    }
                    else if (current_price > key_levels[i]) {
                        return [2 /*return*/, {
                                above_resistance: null,
                                resistance: key_levels[i - 1],
                                support: key_levels[i],
                                below_support: key_levels[i + 1]
                            }];
                    }
                    else {
                        continue;
                    }
                }
                else if (i >= 2 && i <= key_levels.length - 3) {
                    if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
                        return [2 /*return*/, {
                                above_resistance: key_levels[i - 1],
                                resistance: key_levels[i],
                                support: key_levels[i + 1],
                                below_support: key_levels[i + 2]
                            }];
                    }
                    else if (current_price > key_levels[i]) {
                        return [2 /*return*/, {
                                above_resistance: key_levels[i - 2],
                                resistance: key_levels[i - 1],
                                support: key_levels[i],
                                below_support: key_levels[i + 1]
                            }];
                    }
                    else {
                        continue;
                    }
                }
                else if (i === key_levels.length - 2) {
                    if (current_price < key_levels[i] && current_price > key_levels[i + 1]) {
                        return [2 /*return*/, {
                                above_resistance: key_levels[i - 1],
                                resistance: key_levels[i],
                                support: key_levels[i + 1],
                                below_support: null
                            }];
                    }
                    else if (current_price > key_levels[i]) {
                        return [2 /*return*/, {
                                above_resistance: key_levels[i + 2],
                                resistance: key_levels[i + 1],
                                support: key_levels[i],
                                below_support: key_levels[i - 1]
                            }];
                    }
                    else {
                        continue;
                    }
                }
                else if (i === key_levels.length - 1) {
                    if (current_price < key_levels[i]) {
                        return [2 /*return*/, {
                                above_resistance: key_levels[i - 1],
                                resistance: key_levels[i],
                                support: null,
                                below_support: null
                            }];
                    }
                    else {
                        continue;
                    }
                }
            }
            return [2 /*return*/, {
                    above_resistance: null,
                    resistance: null,
                    support: null,
                    below_support: null
                }];
        });
    });
}
exports.get_surrounding_key_levels = get_surrounding_key_levels;
function is_demand_zone(current_price, demand_zones) {
    return __awaiter(this, void 0, void 0, function () {
        var i, zone;
        return __generator(this, function (_a) {
            // finds the demand zone that the price currently resides in else return null
            activity_1.Context.current().heartbeat();
            for (i = 0; i < 7; i++) {
                if (current_price > demand_zones[i].bottom && current_price < demand_zones[i].top) {
                    zone = [[demand_zones[i].bottom, demand_zones[i].top]];
                    return [2 /*return*/, zone];
                }
                else {
                    continue;
                }
            }
            return [2 /*return*/, null];
        });
    });
}
exports.is_demand_zone = is_demand_zone;
function find_demand_zone(current_price, demand_zones) {
    return __awaiter(this, void 0, void 0, function () {
        var demandZone, surroundingZones, i, zone1, zone2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    return [4 /*yield*/, is_demand_zone(current_price, demand_zones)];
                case 1:
                    demandZone = _a.sent();
                    surroundingZones = [];
                    if (demandZone !== null) {
                        return [2 /*return*/, demandZone];
                    }
                    else {
                        for (i = 0; i < demand_zones.length; i++) {
                            if (i < demand_zones.length - 1 && (current_price < demand_zones[i].top && current_price > demand_zones[i + 1].bottom)) {
                                zone1 = [demand_zones[i].bottom, demand_zones[i].top];
                                zone2 = [demand_zones[i + 1].bottom, demand_zones[i + 1].top];
                                surroundingZones.push(zone1, zone2);
                                return [2 /*return*/, surroundingZones];
                            }
                            else {
                                continue;
                            }
                        }
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.find_demand_zone = find_demand_zone;
function is_supply_zone(current_price, supply_zones) {
    return __awaiter(this, void 0, void 0, function () {
        var i, zone;
        return __generator(this, function (_a) {
            activity_1.Context.current().heartbeat();
            // finds the supply zone that the price currently resides in or is closest too
            for (i = 0; i < supply_zones.length; i++) {
                if (current_price < supply_zones[i].top && current_price > supply_zones[i].bottom) {
                    zone = [[supply_zones[i].top, supply_zones[i].bottom]];
                    return [2 /*return*/, zone];
                }
                else {
                    continue;
                }
            }
            return [2 /*return*/, null];
        });
    });
}
exports.is_supply_zone = is_supply_zone;
function find_supply_zone(current_price, supply_zones) {
    return __awaiter(this, void 0, void 0, function () {
        var supplyZone, surroundingZones, i, zone1, zone2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    return [4 /*yield*/, is_supply_zone(current_price, supply_zones)];
                case 1:
                    supplyZone = _a.sent();
                    surroundingZones = [];
                    if (supplyZone !== null) {
                        return [2 /*return*/, supplyZone];
                    }
                    else {
                        for (i = 0; i < supply_zones.length; i++) {
                            if (i < supply_zones.length - 1 && (current_price < supply_zones[i].top && current_price > supply_zones[i + 1].bottom)) {
                                zone1 = [supply_zones[i].top, supply_zones[i].bottom];
                                zone2 = [supply_zones[i + 1].top, supply_zones[i + 1].bottom];
                                surroundingZones.push(zone1, zone2);
                                return [2 /*return*/, surroundingZones];
                            }
                            else {
                                continue;
                            }
                        }
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.find_supply_zone = find_supply_zone;
function get_current_price(wsUri, login_request, market_request, demand_zones, supply_zones) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // makes a request to td ameritrade User Principals endpoint using the token
            // to get the info needed to make a ameritrade streaming request
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var closePrice, currentPriceData, marketClose, isMarketClosed, messageCount, messages, client;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                closePrice = 0;
                                currentPriceData = {
                                    closePrice: closePrice,
                                    demandZone: [],
                                    supplyZone: []
                                };
                                marketClose = moment().tz('America/New_York').format('Hmm');
                                isMarketClosed = false;
                                messageCount = 0;
                                messages = [];
                                client = websocketClient(wsUri);
                                return [4 /*yield*/, waitForClientConnection(client)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, sendClientRequest(client, login_request)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, waitForClientLoginMessage(client)];
                            case 3:
                                _a.sent();
                                client.send(JSON.stringify(market_request));
                                client.onmessage = function (event) {
                                    activity_1.Context.current().heartbeat();
                                    marketClose = moment().tz('America/New_York').format('Hmm');
                                    if (parseInt(marketClose) >= 1600 || messageCount >= 1) {
                                        isMarketClosed = true;
                                        client.close();
                                    }
                                    var data = JSON.parse(JSON.parse(JSON.stringify(event.data)));
                                    console.log('data', data);
                                    console.log('data.data', data.data);
                                    if (data.data !== undefined) {
                                        messages.push(data.data[0].content[0]);
                                        messageCount += 1;
                                        client.close();
                                    }
                                };
                                client.onclose = function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var demandZone, supplyZone;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (isMarketClosed) {
                                                        resolve(currentPriceData);
                                                    }
                                                    closePrice = messages[0]["3"];
                                                    return [4 /*yield*/, find_demand_zone(closePrice, demand_zones)];
                                                case 1:
                                                    demandZone = _a.sent();
                                                    return [4 /*yield*/, find_supply_zone(closePrice, supply_zones)];
                                                case 2:
                                                    supplyZone = _a.sent();
                                                    if ((demandZone === null || demandZone === void 0 ? void 0 : demandZone.length) >= 1 && (supplyZone === null || supplyZone === void 0 ? void 0 : supplyZone.length) >= 1) {
                                                        currentPriceData = {
                                                            closePrice: closePrice,
                                                            demandZone: demandZone,
                                                            supplyZone: supplyZone
                                                        };
                                                        resolve(currentPriceData);
                                                    }
                                                    else if ((demandZone === null || demandZone === void 0 ? void 0 : demandZone.length) >= 1) {
                                                        currentPriceData = {
                                                            closePrice: closePrice,
                                                            demandZone: demandZone,
                                                            supplyZone: []
                                                        };
                                                        resolve(currentPriceData);
                                                    }
                                                    else if ((supplyZone === null || supplyZone === void 0 ? void 0 : supplyZone.length) >= 1) {
                                                        currentPriceData = {
                                                            closePrice: closePrice,
                                                            demandZone: [],
                                                            supplyZone: supplyZone
                                                        };
                                                        resolve(currentPriceData);
                                                    }
                                                    else {
                                                        resolve(currentPriceData);
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                };
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.get_current_price = get_current_price;
function get_position_setup(surrounding_key_levels, demand_zone, supply_zone) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            activity_1.Context.current().heartbeat();
            if (demand_zone[0] && supply_zone[0]) {
                if (surrounding_key_levels.above_resistance !== null && surrounding_key_levels.resistance !== null && surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
                    return [2 /*return*/, {
                            demand: {
                                entry: surrounding_key_levels.resistance,
                                stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
                                takeProfit: surrounding_key_levels.above_resistance,
                                cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance)
                            },
                            supply: {
                                entry: surrounding_key_levels.support,
                                stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
                                takeProfit: surrounding_key_levels.below_support,
                                cutPosition: (surrounding_key_levels.below_support - ((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2))
                            }
                        }];
                }
                else if (surrounding_key_levels.resistance === null || surrounding_key_levels.above_resistance === null) {
                    if (surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
                        return [2 /*return*/, {
                                demand: null,
                                supply: {
                                    entry: surrounding_key_levels.support,
                                    stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
                                    takeProfit: surrounding_key_levels.below_support,
                                    cutPosition: (surrounding_key_levels.below_support - ((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2))
                                }
                            }];
                    }
                }
                else if (surrounding_key_levels.support === null || surrounding_key_levels.below_support === null) {
                    if (surrounding_key_levels.resistance !== null && surrounding_key_levels.above_resistance !== null) {
                        return [2 /*return*/, {
                                demand: {
                                    entry: surrounding_key_levels.resistance,
                                    stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
                                    takeProfit: surrounding_key_levels.above_resistance,
                                    cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance)
                                },
                                supply: null
                            }];
                    }
                }
                else {
                    return [2 /*return*/, {
                            demand: null,
                            supply: null
                        }];
                }
            }
            else if (demand_zone[0]) {
                if (surrounding_key_levels.above_resistance !== null && surrounding_key_levels.resistance !== null && surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
                    return [2 /*return*/, {
                            demand: {
                                entry: surrounding_key_levels.resistance,
                                stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
                                takeProfit: surrounding_key_levels.above_resistance,
                                cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance)
                            },
                            supply: null
                        }];
                }
                else if (surrounding_key_levels.support === null || surrounding_key_levels.below_support === null) {
                    if (surrounding_key_levels.resistance !== null && surrounding_key_levels.above_resistance !== null) {
                        return [2 /*return*/, {
                                demand: {
                                    entry: surrounding_key_levels.resistance,
                                    stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
                                    takeProfit: surrounding_key_levels.above_resistance,
                                    cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance)
                                },
                                supply: null
                            }];
                    }
                }
                else if (surrounding_key_levels.resistance === null || surrounding_key_levels.above_resistance === null) {
                    if (surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
                        return [2 /*return*/, {
                                demand: null,
                                supply: {
                                    entry: surrounding_key_levels.support,
                                    stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
                                    takeProfit: surrounding_key_levels.below_support,
                                    cutPosition: (surrounding_key_levels.below_support - ((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2))
                                }
                            }];
                    }
                }
                else {
                    return [2 /*return*/, {
                            demand: null,
                            supply: null
                        }];
                }
            }
            else if (supply_zone[0]) {
                if (surrounding_key_levels.above_resistance !== null && surrounding_key_levels.resistance !== null && surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
                    return [2 /*return*/, {
                            demand: null,
                            supply: {
                                entry: surrounding_key_levels.support,
                                stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
                                takeProfit: surrounding_key_levels.below_support,
                                cutPosition: (surrounding_key_levels.below_support - ((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2))
                            }
                        }];
                }
                else if (surrounding_key_levels.support === null || surrounding_key_levels.below_support === null) {
                    if (surrounding_key_levels.resistance !== null && surrounding_key_levels.above_resistance !== null) {
                        return [2 /*return*/, {
                                demand: {
                                    entry: surrounding_key_levels.resistance,
                                    stopLoss: surrounding_key_levels.resistance - (Math.round(((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 4) * 10) / 10),
                                    takeProfit: surrounding_key_levels.above_resistance,
                                    cutPosition: (((surrounding_key_levels.above_resistance - surrounding_key_levels.resistance) / 2) + surrounding_key_levels.resistance)
                                },
                                supply: null
                            }];
                    }
                }
                else if (surrounding_key_levels.resistance === null || surrounding_key_levels.above_resistance === null) {
                    if (surrounding_key_levels.support !== null && surrounding_key_levels.below_support !== null) {
                        return [2 /*return*/, {
                                demand: null,
                                supply: {
                                    entry: surrounding_key_levels.support,
                                    stopLoss: surrounding_key_levels.support + (Math.round(((surrounding_key_levels.support - surrounding_key_levels.below_support) / 4) * 10) / 10),
                                    takeProfit: surrounding_key_levels.below_support,
                                    cutPosition: (surrounding_key_levels.below_support - ((surrounding_key_levels.support - surrounding_key_levels.below_support) / 2))
                                }
                            }];
                    }
                }
                else {
                    return [2 /*return*/, {
                            demand: null,
                            supply: null
                        }];
                }
            }
            return [2 /*return*/, {
                    demand: null,
                    supply: null
                }];
        });
    });
}
exports.get_position_setup = get_position_setup;
function getOptionsSelection(position_setup, symbol, access_token) {
    return __awaiter(this, void 0, void 0, function () {
        var callOptionResponse, putOptionResponse, toDate, fromDate, numberOfDaysAway, optionString, call, put, call, put;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    callOptionResponse = null;
                    putOptionResponse = null;
                    toDate = moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD');
                    fromDate = moment().isoWeekday() !== 5 ? moment().add((moment().isoWeekday() % 5), 'day').subtract(1, 'day').format('YYYY-MM-DD') : moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD');
                    numberOfDaysAway = moment().isoWeekday() !== 5 ? ((moment().isoWeekday() % 5) - 1) : 0;
                    optionString = "".concat(fromDate, ":").concat(numberOfDaysAway);
                    if (!(position_setup.demand !== null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, getOptionChain(access_token, {
                            symbol: symbol,
                            contractType: optionChain_1.ContractType.CALL,
                            range: optionChain_1.RangeType.ITM,
                            fromDate: fromDate,
                            toDate: toDate,
                            strikeCount: 20
                        })];
                case 1:
                    callOptionResponse = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(position_setup.supply !== null)) return [3 /*break*/, 4];
                    return [4 /*yield*/, getOptionChain(access_token, {
                            symbol: symbol,
                            contractType: optionChain_1.ContractType.PUT,
                            range: optionChain_1.RangeType.ITM,
                            fromDate: fromDate,
                            toDate: toDate,
                            strikeCount: 20
                        })];
                case 3:
                    putOptionResponse = _a.sent();
                    _a.label = 4;
                case 4:
                    if (callOptionResponse !== null && putOptionResponse !== null) {
                        call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL");
                        put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT");
                        if (call && put) {
                            return [2 /*return*/, {
                                    CALL: {
                                        symbol: call.symbol,
                                        description: call.description,
                                        multiplier: call.multiplier,
                                        bid: call.bid,
                                        ask: call.ask,
                                        mark: call.mark,
                                        totalVolume: call.totalVolume,
                                        delta: call.delta,
                                        gamma: call.gamma,
                                        theta: call.theta,
                                        vega: call.vega,
                                        rho: call.rho
                                    },
                                    PUT: {
                                        symbol: put.symbol,
                                        description: put.description,
                                        multiplier: put.multiplier,
                                        bid: put.bid,
                                        ask: put.ask,
                                        mark: put.mark,
                                        totalVolume: put.totalVolume,
                                        delta: put.delta,
                                        gamma: put.gamma,
                                        theta: put.theta,
                                        vega: put.vega,
                                        rho: put.rho
                                    }
                                }];
                        }
                        else if (call) {
                            return [2 /*return*/, {
                                    CALL: {
                                        symbol: call.symbol,
                                        description: call.description,
                                        multiplier: call.multiplier,
                                        bid: call.bid,
                                        ask: call.ask,
                                        mark: call.mark,
                                        totalVolume: call.totalVolume,
                                        delta: call.delta,
                                        gamma: call.gamma,
                                        theta: call.theta,
                                        vega: call.vega,
                                        rho: call.rho
                                    },
                                    PUT: null
                                }];
                        }
                        else if (put) {
                            return [2 /*return*/, {
                                    CALL: null,
                                    PUT: {
                                        symbol: put.symbol,
                                        description: put.description,
                                        multiplier: put.multiplier,
                                        bid: put.bid,
                                        ask: put.ask,
                                        mark: put.mark,
                                        totalVolume: put.totalVolume,
                                        delta: put.delta,
                                        gamma: put.gamma,
                                        theta: put.theta,
                                        vega: put.vega,
                                        rho: put.rho
                                    }
                                }];
                        }
                    }
                    else if (callOptionResponse !== null) {
                        call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL");
                        return [2 /*return*/, {
                                CALL: {
                                    symbol: call.symbol,
                                    description: call.description,
                                    multiplier: call.multiplier,
                                    bid: call.bid,
                                    ask: call.ask,
                                    mark: call.mark,
                                    totalVolume: call.totalVolume,
                                    delta: call.delta,
                                    gamma: call.gamma,
                                    theta: call.theta,
                                    vega: call.vega,
                                    rho: call.rho
                                },
                                PUT: null
                            }];
                    }
                    else if (putOptionResponse !== null) {
                        put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT");
                        return [2 /*return*/, {
                                CALL: null,
                                PUT: {
                                    symbol: put.symbol,
                                    description: put.description,
                                    multiplier: put.multiplier,
                                    bid: put.bid,
                                    ask: put.ask,
                                    mark: put.mark,
                                    totalVolume: put.totalVolume,
                                    delta: put.delta,
                                    gamma: put.gamma,
                                    theta: put.theta,
                                    vega: put.vega,
                                    rho: put.rho
                                }
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                CALL: null,
                                PUT: null
                            }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getOptionsSelection = getOptionsSelection;
function checkAccountAvailableBalance(access_token, account_id) {
    return __awaiter(this, void 0, void 0, function () {
        var getAccountResponse, availableBalance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    return [4 /*yield*/, getAccount(access_token, account_id)];
                case 1:
                    getAccountResponse = _a.sent();
                    availableBalance = getAccountResponse.securitiesAccount.projectBalances.cashAvailableForTrading;
                    return [2 /*return*/, availableBalance];
            }
        });
    });
}
exports.checkAccountAvailableBalance = checkAccountAvailableBalance;
function openPosition(options, optionType, budget, account_id, access_token) {
    return __awaiter(this, void 0, void 0, function () {
        var price, quantity, symbol, quantityCall, quantityPut, quantityCall, quantityPut, accountBalance, openPositionResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    price = 0;
                    quantity = 0;
                    symbol = '';
                    if (options.CALL === null && options.PUT === null) {
                        return [2 /*return*/, null];
                    }
                    else if (options.CALL !== null && options.PUT !== null) {
                        quantityCall = Math.floor(budget / options.CALL.ask);
                        quantityPut = Math.floor(budget / options.PUT.ask);
                        price = optionType === 'CALL' ? options.CALL.ask : options.PUT.ask;
                        symbol = optionType === 'CALL' ? options.CALL.symbol : options.PUT.symbol;
                        quantity = optionType === 'CALL' ? quantityCall : quantityPut;
                    }
                    else if (options.CALL !== null) {
                        quantityCall = Math.floor(budget / options.CALL.ask);
                        price = options.CALL.ask;
                        symbol = options.CALL.symbol;
                        quantity = quantityCall;
                    }
                    else if (options.PUT !== null) {
                        quantityPut = Math.floor(budget / options.PUT.ask);
                        price = options.PUT.ask;
                        symbol = options.PUT.symbol;
                        quantity = quantityPut;
                    }
                    return [4 /*yield*/, checkAccountAvailableBalance(access_token, account_id)];
                case 1:
                    accountBalance = _a.sent();
                    if (accountBalance < price) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, placeOrder(access_token, account_id, {
                            accountId: account_id,
                            order: {
                                orderType: orders_1.OrderType.LIMIT,
                                price: price,
                                session: orders_1.SessionType.NORMAL,
                                duration: orders_1.DurationType.FILL_OR_KILL,
                                orderStrategyType: orders_1.OrderStrategyType.SINGLE,
                                orderLegCollection: {
                                    orderLegType: orders_1.OrderLegType.OPTION,
                                    instruction: orders_1.InstructionType.BUY_TO_OPEN,
                                    quantity: quantity,
                                    positionEffect: orders_1.PositionEffect.AUTOMATIC,
                                    instrument: {
                                        assetType: orders_1.AssetType.OPTION,
                                        symbol: symbol,
                                        putCall: optionType === 'CALL' ? orders_1.PutCall.CALL : orders_1.PutCall.PUT
                                    }
                                },
                                complexOrderStrategyType: orders_1.ComplexOrderStrategyType.NONE
                            }
                        })];
                case 2:
                    openPositionResponse = _a.sent();
                    return [2 /*return*/, openPositionResponse];
            }
        });
    });
}
exports.openPosition = openPosition;
function checkIfPositionFilled(order_id, account_id, access_token) {
    return __awaiter(this, void 0, void 0, function () {
        var position;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    return [4 /*yield*/, getOrder(access_token, account_id, order_id.orderId)];
                case 1:
                    position = _a.sent();
                    if (position.status === 'FILLED' && position.filledQuantity) {
                        return [2 /*return*/, position.filledQuantity];
                    }
                    else {
                        return [2 /*return*/, 0];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.checkIfPositionFilled = checkIfPositionFilled;
function waitToSignalOpenPosition(wsUri, login_request, book_request, time_sales_request, position_setup, options, budget, account_id, access_token) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var demandTimeSalesEntryPercentage, metDemandEntryPrice, demandForming, demandSize, demandConfirmation, supplyTimeSalesEntryPercentage, metSupplyEntryPrice, supplyForming, supplySize, supplyConfirmation, position, noGoodBuys, demandOrSupply, callOrPut, marketClose, timeSalesClient;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                demandTimeSalesEntryPercentage = 0;
                                metDemandEntryPrice = 0;
                                demandForming = 0;
                                demandSize = 0;
                                demandConfirmation = false;
                                supplyTimeSalesEntryPercentage = 0;
                                metSupplyEntryPrice = 0;
                                supplyForming = 0;
                                supplySize = 0;
                                supplyConfirmation = false;
                                position = null;
                                noGoodBuys = false;
                                demandOrSupply = '';
                                callOrPut = '';
                                marketClose = moment().tz('America/New_York').format('Hmm');
                                timeSalesClient = websocketClient(wsUri);
                                // await waitForClientConnection(bookClient);
                                return [4 /*yield*/, waitForClientConnection(timeSalesClient)];
                            case 1:
                                // await waitForClientConnection(bookClient);
                                _a.sent();
                                // await sendClientRequest(bookClient, login_request);
                                return [4 /*yield*/, sendClientRequest(timeSalesClient, login_request)];
                            case 2:
                                // await sendClientRequest(bookClient, login_request);
                                _a.sent();
                                // await waitForClientLoginMessage(bookClient);
                                return [4 /*yield*/, waitForClientLoginMessage(timeSalesClient)];
                            case 3:
                                // await waitForClientLoginMessage(bookClient);
                                _a.sent();
                                // await bookClient.send(JSON.stringify(book_request));
                                timeSalesClient.send(JSON.stringify(time_sales_request));
                                timeSalesClient.onmessage = function (event) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var data, i, i, i;
                                        return __generator(this, function (_a) {
                                            activity_1.Context.current().heartbeat();
                                            marketClose = moment().tz('America/New_York').format('Hmm');
                                            if (parseInt(marketClose) >= 1600) {
                                                noGoodBuys = true;
                                                timeSalesClient.close();
                                            }
                                            data = JSON.parse(JSON.parse(JSON.stringify(event.data)));
                                            if (data.data) {
                                                if (position_setup.demand && position_setup.supply) {
                                                    for (i = 0; i < data.data[0].content.length; i++) {
                                                        if (data.data[0].content[i]["2"] >= position_setup.demand.entry && data.data[0].content[i]["2"] < position_setup.demand.cutPosition) {
                                                            metDemandEntryPrice += 1;
                                                            demandSize += data.data[0].content[i]["3"];
                                                        }
                                                        else if (data.data[0].content[i]["2"] > position_setup.demand.entry && demandForming >= 2) {
                                                            demandConfirmation = true;
                                                        }
                                                        else if (data.data[0].content[i]["2"] <= position_setup.supply.entry && data.data[0].content[i]["2"] > position_setup.supply.cutPosition) {
                                                            metSupplyEntryPrice += 1;
                                                            supplySize += data.data[0].content[i]["3"];
                                                        }
                                                        else if (data.data[0].content[i]["2"] < position_setup.supply.entry && supplyForming >= 2) {
                                                            supplyConfirmation = true;
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    demandTimeSalesEntryPercentage = metDemandEntryPrice / data.data[0].content.length;
                                                    supplyTimeSalesEntryPercentage = metSupplyEntryPrice / data.data[0].content.length;
                                                    if (demandTimeSalesEntryPercentage >= .6) {
                                                        demandForming += 1;
                                                    }
                                                    else if (supplyTimeSalesEntryPercentage >= .6) {
                                                        supplyForming += 1;
                                                    }
                                                    if (demandForming >= 3 && demandSize > supplySize || demandForming > 1 && demandConfirmation) {
                                                        callOrPut = 'CALL';
                                                        demandOrSupply = 'DEMAND';
                                                        timeSalesClient.close();
                                                    }
                                                    else if (supplyForming >= 3 && supplySize > demandSize || supplyForming > 1 && supplyConfirmation) {
                                                        callOrPut = 'PUT';
                                                        demandOrSupply = 'SUPPLY';
                                                        timeSalesClient.close();
                                                    }
                                                }
                                                else if (position_setup.demand) {
                                                    for (i = 0; i < data.data[0].content.length; i++) {
                                                        if (data.data[0].content[i]["2"] >= position_setup.demand.entry && data.data[0].content[i]["2"] < position_setup.demand.cutPosition) {
                                                            metDemandEntryPrice += 1;
                                                            demandSize += data.data[0].content[i]["3"];
                                                        }
                                                        else if (data.data[0].content[i]["2"] > position_setup.demand.entry && demandForming >= 2) {
                                                            demandConfirmation = true;
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    demandTimeSalesEntryPercentage = metDemandEntryPrice / data.data[0].content.length;
                                                    if (demandTimeSalesEntryPercentage >= .6) {
                                                        demandForming += 1;
                                                    }
                                                    if (demandForming >= 3 && demandSize > supplySize || demandForming > 1 && demandConfirmation) {
                                                        callOrPut = 'CALL';
                                                        demandOrSupply = 'DEMAND';
                                                        timeSalesClient.close();
                                                    }
                                                }
                                                else if (position_setup.supply) {
                                                    for (i = 0; i < data.data[0].content.length; i++) {
                                                        if (data.data[0].content[i]["2"] <= position_setup.supply.entry && data.data[0].content[i]["2"] > position_setup.supply.cutPosition) {
                                                            metSupplyEntryPrice += 1;
                                                            supplySize += data.data[0].content[i]["3"];
                                                        }
                                                        else if (data.data[0].content[i]["2"] < position_setup.supply.entry && supplyForming >= 2) {
                                                            supplyConfirmation = true;
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    supplyTimeSalesEntryPercentage = metSupplyEntryPrice / data.data[0].content.length;
                                                    if (supplyTimeSalesEntryPercentage >= .6) {
                                                        supplyForming += 1;
                                                    }
                                                    if (supplyForming >= 3 && supplySize > demandSize || supplyForming > 1 && supplyConfirmation) {
                                                        callOrPut = 'PUT';
                                                        demandOrSupply = 'SUPPLY';
                                                        timeSalesClient.close();
                                                    }
                                                }
                                            }
                                            return [2 /*return*/];
                                        });
                                    });
                                };
                                timeSalesClient.onclose = function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    console.log('waitToSignalOpenPosition socket closed');
                                                    return [4 /*yield*/, openPosition(options, callOrPut, budget, account_id, access_token)];
                                                case 1:
                                                    position = _a.sent();
                                                    resolve({
                                                        position: position,
                                                        noGoodBuys: noGoodBuys,
                                                        demandOrSupply: demandOrSupply
                                                    });
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                };
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.waitToSignalOpenPosition = waitToSignalOpenPosition;
function getOptionSymbol(order_id, account_id, access_token) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var option;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    return [4 /*yield*/, getOrder(access_token, account_id, order_id.orderId)];
                case 1:
                    option = _c.sent();
                    if ((_a = option.orderLegCollection) === null || _a === void 0 ? void 0 : _a.instrument.symbol) {
                        return [2 /*return*/, (_b = option.orderLegCollection) === null || _b === void 0 ? void 0 : _b.instrument.symbol];
                    }
                    else {
                        return [2 /*return*/, ''];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getOptionSymbol = getOptionSymbol;
function cutPosition(symbol, quantity, account_id, access_token) {
    return __awaiter(this, void 0, void 0, function () {
        var newQuantity, cutPositionResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    newQuantity = Math.floor(quantity / 2);
                    return [4 /*yield*/, placeOrder(access_token, account_id, {
                            accountId: account_id,
                            order: {
                                orderType: orders_1.OrderType.MARKET,
                                session: orders_1.SessionType.NORMAL,
                                duration: orders_1.DurationType.FILL_OR_KILL,
                                orderStrategyType: orders_1.OrderStrategyType.SINGLE,
                                orderLegCollection: {
                                    orderLegType: orders_1.OrderLegType.OPTION,
                                    instruction: orders_1.InstructionType.SELL_TO_CLOSE,
                                    quantity: newQuantity,
                                    positionEffect: orders_1.PositionEffect.AUTOMATIC,
                                    instrument: {
                                        assetType: orders_1.AssetType.OPTION,
                                        symbol: symbol
                                    }
                                },
                                complexOrderStrategyType: orders_1.ComplexOrderStrategyType.NONE
                            }
                        })];
                case 1:
                    cutPositionResponse = _a.sent();
                    return [2 /*return*/, cutPositionResponse];
            }
        });
    });
}
exports.cutPosition = cutPosition;
function closePosition(symbol, quantity, account_id, access_token) {
    return __awaiter(this, void 0, void 0, function () {
        var closePositionResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    activity_1.Context.current().heartbeat();
                    return [4 /*yield*/, placeOrder(access_token, account_id, {
                            accountId: account_id,
                            order: {
                                orderType: orders_1.OrderType.MARKET,
                                session: orders_1.SessionType.NORMAL,
                                duration: orders_1.DurationType.FILL_OR_KILL,
                                orderStrategyType: orders_1.OrderStrategyType.SINGLE,
                                orderLegCollection: {
                                    orderLegType: orders_1.OrderLegType.OPTION,
                                    instruction: orders_1.InstructionType.SELL_TO_CLOSE,
                                    quantity: quantity,
                                    positionEffect: orders_1.PositionEffect.AUTOMATIC,
                                    instrument: {
                                        assetType: orders_1.AssetType.OPTION,
                                        symbol: symbol
                                    }
                                },
                                complexOrderStrategyType: orders_1.ComplexOrderStrategyType.NONE
                            }
                        })];
                case 1:
                    closePositionResponse = _a.sent();
                    return [2 /*return*/, closePositionResponse];
            }
        });
    });
}
exports.closePosition = closePosition;
function waitToSignalCutPosition(wsUri, login_request, book_request, time_sales_request, symbol, quantity, demandOrSupply, position_setup, account_id, access_token) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var demandTimeSalesCutPercentage, demandTimeSalesStopLossPercentage, demandTimeSalesTakeProfitPercentage, metDemandCutPrice, metDemandStopLossPrice, metDemandTakeProfitPrice, supplyTimeSalesCutPercentage, supplyTimeSalesStopLossPercentage, supplyTimeSalesTakeProfitPercentage, metSupplyCutPrice, metSupplyStopLossPrice, metSupplyTakeProfitPrice, position, skipCut, stoppedOut, marketClose, cutFilled, timeSalesClient;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                demandTimeSalesCutPercentage = 0;
                                demandTimeSalesStopLossPercentage = 0;
                                demandTimeSalesTakeProfitPercentage = 0;
                                metDemandCutPrice = 0;
                                metDemandStopLossPrice = 0;
                                metDemandTakeProfitPrice = 0;
                                supplyTimeSalesCutPercentage = 0;
                                supplyTimeSalesStopLossPercentage = 0;
                                supplyTimeSalesTakeProfitPercentage = 0;
                                metSupplyCutPrice = 0;
                                metSupplyStopLossPrice = 0;
                                metSupplyTakeProfitPrice = 0;
                                position = null;
                                skipCut = false;
                                stoppedOut = false;
                                marketClose = moment().tz('America/New_York').format('Hmm');
                                cutFilled = 0;
                                timeSalesClient = websocketClient(wsUri);
                                // await waitForClientConnection(bookClient);
                                return [4 /*yield*/, waitForClientConnection(timeSalesClient)];
                            case 1:
                                // await waitForClientConnection(bookClient);
                                _a.sent();
                                // await sendClientRequest(bookClient, login_request);
                                return [4 /*yield*/, sendClientRequest(timeSalesClient, login_request)];
                            case 2:
                                // await sendClientRequest(bookClient, login_request);
                                _a.sent();
                                // await waitForClientLoginMessage(bookClient);
                                return [4 /*yield*/, waitForClientLoginMessage(timeSalesClient)];
                            case 3:
                                // await waitForClientLoginMessage(bookClient);
                                _a.sent();
                                // await bookClient.send(JSON.stringify(book_request));
                                timeSalesClient.send(JSON.stringify(time_sales_request));
                                timeSalesClient.onmessage = function (event) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var data, i, i;
                                        return __generator(this, function (_a) {
                                            activity_1.Context.current().heartbeat();
                                            marketClose = moment().tz('America/New_York').format('Hmm');
                                            if (parseInt(marketClose) >= 1600 || quantity < 2) {
                                                skipCut = true;
                                                timeSalesClient.close();
                                            }
                                            data = JSON.parse(JSON.stringify(event.data));
                                            if (data.data) {
                                                if (demandOrSupply === 'DEMAND' && position_setup.demand) {
                                                    for (i = 0; i < data.data[0].content.length; i++) {
                                                        if (data.data[0].content[i]["2"] >= position_setup.demand.cutPosition && data.data[0].content[i]["2"] < position_setup.demand.takeProfit) {
                                                            metDemandCutPrice += 1;
                                                        }
                                                        else if (data.data[0].content[i]["2"] <= position_setup.demand.stopLoss) {
                                                            metDemandStopLossPrice += 1;
                                                        }
                                                        else if (data.data[0].content[i]["2"] >= position_setup.demand.takeProfit) {
                                                            metDemandTakeProfitPrice += 1;
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    demandTimeSalesCutPercentage = metDemandCutPrice / data.data[0].content.length;
                                                    demandTimeSalesStopLossPercentage = metDemandStopLossPrice / data.data[0].content.length;
                                                    demandTimeSalesTakeProfitPercentage = metDemandTakeProfitPrice / data.data[0].content.length;
                                                    if (demandTimeSalesCutPercentage >= .6) {
                                                        timeSalesClient.close();
                                                    }
                                                    else if (demandTimeSalesStopLossPercentage >= .4) {
                                                        stoppedOut = true;
                                                        timeSalesClient.close();
                                                    }
                                                    else if (demandTimeSalesTakeProfitPercentage >= .6) {
                                                        skipCut = true;
                                                        timeSalesClient.close();
                                                    }
                                                }
                                                else if (demandOrSupply === 'SUPPLY' && position_setup.supply) {
                                                    for (i = 0; i < data.data[0].content.length; i++) {
                                                        if (data.data[0].content[i]["2"] <= position_setup.supply.cutPosition && data.data[0].content[i]["2"] > position_setup.supply.takeProfit) {
                                                            metSupplyCutPrice += 1;
                                                        }
                                                        else if (data.data[0].content[i]["2"] >= position_setup.supply.stopLoss) {
                                                            metSupplyStopLossPrice += 1;
                                                        }
                                                        else if (data.data[0].content[i]["2"] <= position_setup.supply.takeProfit) {
                                                            metSupplyTakeProfitPrice += 1;
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    supplyTimeSalesCutPercentage = metSupplyCutPrice / data.data[0].content.length;
                                                    supplyTimeSalesStopLossPercentage = metSupplyStopLossPrice / data.data[0].content.length;
                                                    supplyTimeSalesTakeProfitPercentage = metSupplyTakeProfitPrice / data.data[0].content.length;
                                                    if (supplyTimeSalesCutPercentage >= .6) {
                                                        timeSalesClient.close();
                                                    }
                                                    else if (supplyTimeSalesStopLossPercentage >= .4) {
                                                        stoppedOut = true;
                                                        timeSalesClient.close();
                                                    }
                                                    else if (supplyTimeSalesTakeProfitPercentage >= .6) {
                                                        skipCut = true;
                                                        timeSalesClient.close();
                                                    }
                                                }
                                            }
                                            return [2 /*return*/];
                                        });
                                    });
                                };
                                timeSalesClient.onclose = function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    console.log('waitToSignalClosePosition socket closed');
                                                    if (!skipCut) return [3 /*break*/, 1];
                                                    resolve(cutFilled);
                                                    return [3 /*break*/, 7];
                                                case 1:
                                                    if (!stoppedOut) return [3 /*break*/, 4];
                                                    return [4 /*yield*/, closePosition(symbol, quantity * 2, account_id, access_token)];
                                                case 2:
                                                    position = _a.sent();
                                                    return [4 /*yield*/, checkIfPositionFilled(position, account_id, access_token)];
                                                case 3:
                                                    cutFilled = _a.sent();
                                                    resolve(cutFilled);
                                                    return [3 /*break*/, 7];
                                                case 4: return [4 /*yield*/, cutPosition(symbol, quantity, account_id, access_token)];
                                                case 5:
                                                    position = _a.sent();
                                                    return [4 /*yield*/, checkIfPositionFilled(position, account_id, access_token)];
                                                case 6:
                                                    cutFilled = _a.sent();
                                                    resolve(cutFilled);
                                                    _a.label = 7;
                                                case 7: return [2 /*return*/];
                                            }
                                        });
                                    });
                                };
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.waitToSignalCutPosition = waitToSignalCutPosition;
function waitToSignalClosePosition(wsUri, login_request, book_request, time_sales_request, symbol, quantity, demandOrSupply, position_setup, account_id, access_token) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var demandTimeSalesCutPercentage, demandTimeSalesStopLossPercentage, demandTimeSalesTakeProfitPercentage, metDemandCutPrice, metDemandStopLossPrice, metDemandTakeProfitPrice, supplyTimeSalesCutPercentage, supplyTimeSalesStopLossPercentage, supplyTimeSalesTakeProfitPercentage, metSupplyCutPrice, metSupplyStopLossPrice, metSupplyTakeProfitPrice, position, marketClose, closeFilled, remainingQuantity, waited, timeSalesClient;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                demandTimeSalesCutPercentage = 0;
                                demandTimeSalesStopLossPercentage = 0;
                                demandTimeSalesTakeProfitPercentage = 0;
                                metDemandCutPrice = 0;
                                metDemandStopLossPrice = 0;
                                metDemandTakeProfitPrice = 0;
                                supplyTimeSalesCutPercentage = 0;
                                supplyTimeSalesStopLossPercentage = 0;
                                supplyTimeSalesTakeProfitPercentage = 0;
                                metSupplyCutPrice = 0;
                                metSupplyStopLossPrice = 0;
                                metSupplyTakeProfitPrice = 0;
                                marketClose = moment().tz('America/New_York').format('Hmm');
                                closeFilled = 0;
                                remainingQuantity = quantity;
                                waited = 0;
                                timeSalesClient = websocketClient(wsUri);
                                // await waitForClientConnection(bookClient);
                                return [4 /*yield*/, waitForClientConnection(timeSalesClient)];
                            case 1:
                                // await waitForClientConnection(bookClient);
                                _a.sent();
                                // await sendClientRequest(bookClient, login_request);
                                return [4 /*yield*/, sendClientRequest(timeSalesClient, login_request)];
                            case 2:
                                // await sendClientRequest(bookClient, login_request);
                                _a.sent();
                                // await waitForClientLoginMessage(bookClient);
                                return [4 /*yield*/, waitForClientLoginMessage(timeSalesClient)];
                            case 3:
                                // await waitForClientLoginMessage(bookClient);
                                _a.sent();
                                // await bookClient.send(JSON.stringify(book_request));
                                timeSalesClient.send(JSON.stringify(time_sales_request));
                                timeSalesClient.onmessage = function (event) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var data, i, i;
                                        return __generator(this, function (_a) {
                                            activity_1.Context.current().heartbeat();
                                            marketClose = moment().tz('America/New_York').format('Hmm');
                                            if (parseInt(marketClose) >= 1600) {
                                                timeSalesClient.close();
                                            }
                                            data = JSON.parse(JSON.stringify(event.data));
                                            if (data.data) {
                                                if (demandOrSupply === 'DEMAND' && position_setup.demand) {
                                                    for (i = 0; i < data.data[0].content.length; i++) {
                                                        if (data.data[0].content[i]["2"] >= position_setup.demand.cutPosition && data.data[0].content[i]["2"] < position_setup.demand.takeProfit || data.data[0].content[i]["2"] < position_setup.demand.cutPosition && data.data[0].content[i]["2"] >= position_setup.demand.entry) {
                                                            metDemandCutPrice += 1;
                                                        }
                                                        else if (data.data[0].content[i]["2"] >= position_setup.demand.takeProfit) {
                                                            metDemandTakeProfitPrice += 1;
                                                        }
                                                        else if (data.data[0].content[i]["2"] <= position_setup.demand.stopLoss) {
                                                            metDemandStopLossPrice += 1;
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    demandTimeSalesCutPercentage = metDemandCutPrice / data.data[0].content.length;
                                                    demandTimeSalesStopLossPercentage = metDemandStopLossPrice / data.data[0].content.length;
                                                    demandTimeSalesTakeProfitPercentage = metDemandTakeProfitPrice / data.data[0].content.length;
                                                    if (demandTimeSalesCutPercentage >= .6) {
                                                        waited += 1;
                                                    }
                                                    else if (demandTimeSalesCutPercentage >= .6 && waited >= 2) {
                                                        timeSalesClient.close();
                                                    }
                                                    else if (demandTimeSalesTakeProfitPercentage >= .6) {
                                                        timeSalesClient.close();
                                                    }
                                                    else if (demandTimeSalesStopLossPercentage >= .4) {
                                                        timeSalesClient.close();
                                                    }
                                                }
                                                else if (demandOrSupply === 'SUPPLY' && position_setup.supply) {
                                                    for (i = 0; i < data.data[0].content.length; i++) {
                                                        if (data.data[0].content[i]["2"] <= position_setup.supply.cutPosition && data.data[0].content[i]["2"] > position_setup.supply.takeProfit || data.data[0].content[i]["2"] > position_setup.supply.cutPosition && data.data[0].content[i]["2"] <= position_setup.supply.entry) {
                                                            metSupplyCutPrice += 1;
                                                        }
                                                        else if (data.data[0].content[i]["2"] <= position_setup.supply.takeProfit) {
                                                            metSupplyTakeProfitPrice += 1;
                                                        }
                                                        else if (data.data[0].content[i]["2"] >= position_setup.supply.stopLoss) {
                                                            metSupplyStopLossPrice += 1;
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    supplyTimeSalesCutPercentage = metSupplyCutPrice / data.data[0].content.length;
                                                    supplyTimeSalesStopLossPercentage = metSupplyStopLossPrice / data.data[0].content.length;
                                                    supplyTimeSalesTakeProfitPercentage = metSupplyTakeProfitPrice / data.data[0].content.length;
                                                    if (supplyTimeSalesCutPercentage >= .6) {
                                                        waited += 1;
                                                    }
                                                    else if (supplyTimeSalesCutPercentage >= .6 && waited >= 2) {
                                                        timeSalesClient.close();
                                                    }
                                                    else if (supplyTimeSalesTakeProfitPercentage >= .6) {
                                                        timeSalesClient.close();
                                                    }
                                                    else if (supplyTimeSalesStopLossPercentage >= .4) {
                                                        timeSalesClient.close();
                                                    }
                                                }
                                            }
                                            return [2 /*return*/];
                                        });
                                    });
                                };
                                timeSalesClient.onclose = function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    console.log('waitToSignalClosePosition socket closed');
                                                    _a.label = 1;
                                                case 1:
                                                    if (!(remainingQuantity > 0)) return [3 /*break*/, 4];
                                                    return [4 /*yield*/, closePosition(symbol, quantity, account_id, access_token)];
                                                case 2:
                                                    position = _a.sent();
                                                    return [4 /*yield*/, checkIfPositionFilled(position, account_id, access_token)];
                                                case 3:
                                                    closeFilled = _a.sent();
                                                    remainingQuantity = quantity - closeFilled;
                                                    return [3 /*break*/, 1];
                                                case 4:
                                                    resolve(position);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                };
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.waitToSignalClosePosition = waitToSignalClosePosition;
function getLoginCredentials(client_id) {
    return __awaiter(this, void 0, void 0, function () {
        var address, urlCode, parseUrl, code, postData, encodedPassword, token, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, tdAuthUrl_1.tdAuthUrl)(client_id)];
                case 1:
                    address = _a.sent();
                    return [4 /*yield*/, (0, tdLogin_1.tdLogin)(address)];
                case 2:
                    urlCode = _a.sent();
                    parseUrl = url.parse(urlCode, true).query;
                    code = parseUrl.code;
                    postData = JSON.stringify(code);
                    encodedPassword = encodeURIComponent(postData);
                    data = '';
                    activity_1.Context.current().heartbeat();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var authOptions = {
                                host: "".concat(process.env.API_HOSTNAME),
                                path: '/api/auth',
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Content-Length': Buffer.byteLength(encodedPassword)
                                },
                                rejectUnauthorized: false
                            };
                            var response = https.request(authOptions, function (resp) {
                                resp.on('data', function (chunk) {
                                    data += chunk;
                                });
                                resp.on('close', function () {
                                    var parseJson = JSON.parse(data);
                                    token = JSON.parse(parseJson);
                                    var access_token_expire = Date.now() + token.expires_in;
                                    var refresh_token_expire = Date.now() + token.refresh_token_expires_in;
                                    var tokenJSON = {
                                        access_token: token.access_token,
                                        refresh_token: token.refresh_token,
                                        access_token_expires_at: access_token_expire,
                                        refresh_token_expires_at: refresh_token_expire,
                                        logged_in: true,
                                        access_token_expires_at_date: moment(access_token_expire).toISOString(),
                                        refresh_token_expires_at_date: moment(refresh_token_expire).toISOString()
                                    };
                                    fs.writeFile(path.resolve(__dirname, "../tda/token.json"), JSON.stringify(tokenJSON, null, 1), function (err) {
                                        if (err)
                                            console.log(err);
                                    });
                                    return resolve(tokenJSON);
                                });
                            }).on('error', function (e) {
                                console.error('error', e);
                                return reject(e);
                            });
                            response.write(encodedPassword);
                            response.end();
                        })];
            }
        });
    });
}
exports.getLoginCredentials = getLoginCredentials;
function getUserPrinciples(access_token) {
    var _this = this;
    var encodedtoken = encodeURIComponent(access_token);
    var data = '';
    activity_1.Context.current().heartbeat();
    return new Promise(function (resolve, reject) {
        var authOptions = {
            host: "".concat(process.env.API_HOSTNAME),
            path: '/api/streamer-auth',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(encodedtoken)
            },
            rejectUnauthorized: false,
            timeout: 100000
        };
        var response = https.request(authOptions, function (resp) {
            resp.on('data', function (chunk) {
                data += chunk;
            });
            resp.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
                var parseJson, userPrinciples, dataObject, tokenTimeStampAsDateObj, tokenTimeStampAsMs, credentials, param;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            parseJson = JSON.parse(data);
                            userPrinciples = JSON.parse(parseJson);
                            dataObject = {
                                userPrinciples: null,
                                params: null
                            };
                            if (!!userPrinciples.error) return [3 /*break*/, 2];
                            tokenTimeStampAsDateObj = new Date(userPrinciples.streamerInfo.tokenTimestamp);
                            tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();
                            credentials = {
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
                            };
                            return [4 /*yield*/, (0, tdCredentialToString_1.tdCredentialsToString)(credentials)];
                        case 1:
                            param = _a.sent();
                            dataObject = {
                                userPrinciples: userPrinciples,
                                params: param
                            };
                            return [3 /*break*/, 3];
                        case 2:
                            dataObject = {
                                userPrinciples: userPrinciples,
                                params: null
                            };
                            _a.label = 3;
                        case 3: return [2 /*return*/, resolve(dataObject)];
                    }
                });
            }); });
        }).on('error', function (e) {
            console.error('error', e);
            return reject(e);
        });
        response.on('timeout', function () {
            console.log('connection timedout');
        });
        response.write(encodedtoken);
        response.end();
    });
}
exports.getUserPrinciples = getUserPrinciples;
function getAccount(access_token, account_id) {
    var encodedtoken = encodeURIComponent(access_token);
    var data = '';
    activity_1.Context.current().heartbeat();
    return new Promise(function (resolve, reject) {
        var postData = {
            token: encodedtoken,
            accountId: account_id
        };
        var postDataAsString = JSON.stringify(postData);
        var authOptions = {
            host: "".concat(process.env.API_HOSTNAME),
            path: '/api/td-account',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postDataAsString)
            },
            rejectUnauthorized: false,
            timeout: 10000
        };
        var response = https.request(authOptions, function (resp) {
            resp.on('data', function (chunk) {
                data += chunk;
            });
            resp.on('close', function () {
                var parseJson = JSON.parse(data);
                var dataObject = JSON.parse(parseJson);
                return resolve(dataObject);
            });
        }).on('error', function (e) {
            console.error('error', e);
            return reject(e);
        });
        response.on('timeout', function () {
            console.log('connection timedout');
        });
        response.write(postDataAsString);
        response.end();
    });
}
exports.getAccount = getAccount;
function placeOrder(access_token, account_id, order_data) {
    var encodedtoken = encodeURIComponent(access_token);
    var data = '';
    activity_1.Context.current().heartbeat();
    return new Promise(function (resolve, reject) {
        var postData = {
            token: encodedtoken,
            accountId: account_id,
            orderData: order_data
        };
        var postDataAsString = JSON.stringify(postData);
        var authOptions = {
            host: "".concat(process.env.API_HOSTNAME),
            path: '/api/td-place-order',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postDataAsString)
            },
            rejectUnauthorized: false,
            timeout: 10000
        };
        var response = https.request(authOptions, function (resp) {
            resp.on('data', function (chunk) {
                data += chunk;
            });
            resp.on('close', function () {
                var parseJson = JSON.parse(data);
                var dataObject = JSON.parse(parseJson);
                resolve(dataObject);
            });
        }).on('error', function (e) {
            console.error('error', e);
            reject(e);
        });
        response.on('timeout', function () {
            console.log('connection timedout');
        });
        response.write(postDataAsString);
        response.end();
    });
}
exports.placeOrder = placeOrder;
function getOrder(access_token, account_id, order_id) {
    var encodedtoken = encodeURIComponent(access_token);
    var data = '';
    activity_1.Context.current().heartbeat();
    return new Promise(function (resolve, reject) {
        var postData = {
            token: encodedtoken,
            accountId: account_id,
            orderId: order_id
        };
        var postDataAsString = JSON.stringify(postData);
        var authOptions = {
            host: "".concat(process.env.API_HOSTNAME),
            path: '/api/td-get-order',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postDataAsString)
            },
            rejectUnauthorized: false,
            timeout: 10000
        };
        var response = https.request(authOptions, function (resp) {
            resp.on('data', function (chunk) {
                data += chunk;
            });
            resp.on('close', function () {
                var parseJson = JSON.parse(data);
                var dataObject = JSON.parse(parseJson);
                resolve(dataObject);
            });
        }).on('error', function (e) {
            console.error('error', e);
            reject(e);
        });
        response.on('timeout', function () {
            console.log('connection timedout');
        });
        response.write(postDataAsString);
        response.end();
    });
}
exports.getOrder = getOrder;
function getOptionChain(access_token, option_chain_config) {
    var encodedtoken = encodeURIComponent(access_token);
    var data = '';
    activity_1.Context.current().heartbeat();
    return new Promise(function (resolve, reject) {
        var postData = {
            token: encodedtoken,
            optionChainConfig: option_chain_config
        };
        var postDataAsString = JSON.stringify(postData);
        var authOptions = {
            host: "".concat(process.env.API_HOSTNAME),
            path: '/api/td-option-chain',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postDataAsString)
            },
            rejectUnauthorized: false,
            timeout: 10000
        };
        var response = https.request(authOptions, function (resp) {
            resp.on('data', function (chunk) {
                data += chunk;
            });
            resp.on('close', function () {
                var parseJson = JSON.parse(data);
                var dataObject = JSON.parse(parseJson);
                resolve(dataObject);
            });
        }).on('error', function (e) {
            console.error('error', e);
            reject(e);
        });
        response.on('timeout', function () {
            console.log('connection timedout');
        });
        response.write(postDataAsString);
        response.end();
    });
}
exports.getOptionChain = getOptionChain;
function filterOptionResponse(optionMap, optionType) {
    activity_1.Context.current().heartbeat();
    var optionsArray = [];
    for (var option in optionMap) {
        if (optionType === "CALL" && optionMap[option][0].delta > .500 && optionMap[option][0].delta < .700) {
            optionsArray.push(optionMap[option][0]);
        }
        if (optionType === "PUT" && optionMap[option][0].delta > -.500 && optionMap[option][0].delta < -.700) {
            optionsArray.push(optionMap[option][0]);
        }
    }
    optionsArray.sort(function (a, b) { return (a.ask > b.ask) ? 1 : -1; });
    if (optionsArray.length > 1) {
        return optionsArray[1];
    }
    else if (optionsArray.length === 1) {
        return optionsArray[0];
    }
    return null;
}
exports.filterOptionResponse = filterOptionResponse;
function websocketClient(url) {
    var client = new ws_1.WebSocket(url);
    client.onopen = function () {
        console.log('client connection created');
    };
    client.onerror = function (err) {
        console.error(err);
    };
    return (client);
}
exports.websocketClient = websocketClient;
function sendClientRequest(client, request) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                client.send(JSON.stringify(request));
            }
            catch (err) {
                console.log(err);
            }
            return [2 /*return*/];
        });
    });
}
exports.sendClientRequest = sendClientRequest;
function waitForClientConnection(client) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    if (client.readyState !== client.OPEN) {
                        client.addEventListener("open", function () {
                            resolve();
                        });
                    }
                    else {
                        resolve();
                    }
                })];
        });
    });
}
exports.waitForClientConnection = waitForClientConnection;
function waitForClientLoginMessage(client) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var message = {
                        response: [
                            {
                                service: '',
                                requestid: '',
                                command: '',
                                timestamp: 0,
                                content: {}
                            }
                        ]
                    };
                    if (!message.response || message.response[0].command !== "LOGIN") {
                        client.addEventListener("message", function (event) {
                            message = JSON.parse(JSON.parse(JSON.stringify(event.data)));
                            resolve();
                        });
                    }
                    else {
                        resolve();
                    }
                })];
        });
    });
}
exports.waitForClientLoginMessage = waitForClientLoginMessage;
//# sourceMappingURL=priceActionPosition.js.map