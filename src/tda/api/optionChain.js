"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionChain = void 0;
const connect_1 = require("../models/connect");
const routes_config_1 = require("../connection/routes.config");
const client_1 = require("../connection/client");
const symbol_1 = require("../utils/symbol");
const round_1 = require("../utils/round");
/*
All orders for a specific account or, if account ID isn't specified, orders will be returned for all linked accounts.
 */
async function getOptionChain(config) {
    processConfig(config);
    const url = routes_config_1.OPTION_CHAIN;
    const response = await client_1.default.get({
        url,
        params: config,
        responseType: connect_1.ResponseType.JSON,
        arrayFormat: connect_1.ArrayFormatType.COMMA,
    });
    return processResponse(response.data);
}
exports.getOptionChain = getOptionChain;
function processConfig(config) {
    if (!config)
        return;
    const { symbol } = config;
    config.symbol = (0, symbol_1.convertToValidSymbol)(symbol);
    if (config.interval) {
        // @ts-ignore
        config.strike = (0, round_1.round)(config.strike, config.interval);
    }
}
function processResponse(response) {
    if (response.status === 'FAILED') {
        throw new Error('Unable to get option chain. This is usually caused by an incorrect OptionChainConfig property');
    }
    else {
        return response;
    }
}
