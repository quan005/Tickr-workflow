"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TdaClient = void 0;
const client_1 = require("./client");
const accounts_1 = require("../api/accounts");
const tdaClientBuilder_1 = require("./tdaClientBuilder");
const orders_1 = require("../api/orders");
const optionChain_1 = require("../api/optionChain");
class TdaClient {
    constructor(config) {
        this.config = config;
        client_1.default.addInterceptor(config.authorizationInterceptor);
    }
    static from(config) {
        return new tdaClientBuilder_1.TdaClientBuilder(config).build();
    }
    async getAccount() {
        return await (0, accounts_1.getAccount)();
    }
    async placeOrder(config) {
        return await (0, orders_1.placeOrder)(config);
    }
    async cancelOrder(config) {
        return await (0, orders_1.cancelOrder)(config);
    }
    async getOrder(config) {
        return await (0, orders_1.getOrder)(config);
    }
    async getOptionChain(config) {
        return await (0, optionChain_1.getOptionChain)(config);
    }
}
exports.TdaClient = TdaClient;