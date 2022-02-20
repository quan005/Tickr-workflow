"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccount = void 0;
const connect_1 = require("../models/connect");
const routes_config_1 = require("../connection/routes.config");
const client_1 = require("../connection/client");
async function getAccount(config = {}) {
    const url = generateAccountUrl({ accountId: config.accountId });
    const response = await client_1.default.get({
        url,
        params: {
            fields: config.fields,
        },
        responseType: connect_1.ResponseType.JSON,
        arrayFormat: connect_1.ArrayFormatType.COMMA,
    });
    return response.data.map((d) => d.securitiesAccount);
}
exports.getAccount = getAccount;
function generateAccountUrl({ accountId }) {
    const accountUIdUrlString = accountId ? '/' + accountId : '';
    return `${routes_config_1.ACCOUNTS}${accountUIdUrlString}`;
}