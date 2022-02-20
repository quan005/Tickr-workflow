"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTION_CHAIN = exports.ORDERS = exports.ACCOUNTS = void 0;
const ROUTES = {
    hostname: 'https://api.tdameritrade.com',
    endpoints: {
        accounts: '/v1/accounts',
        orders: '/v1/orders',
        optionChain: '/v1/marketdata/chains'
    },
};

exports.ACCOUNTS = `${ROUTES.hostname}${ROUTES.endpoints.accounts}`;
exports.ORDERS = `${ROUTES.hostname}${ROUTES.endpoints.orders}`;
exports.OPTION_CHAIN = `${ROUTES.hostname}${ROUTES.endpoints.optionChain}`;
