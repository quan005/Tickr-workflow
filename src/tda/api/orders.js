"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.placeOrder = exports.getOrder = void 0;
const connect_1 = require("../models/connect");
const routes_config_1 = require("../connection/routes.config");
const client_1 = require("../connection/client");
const round_1 = require("../utils/round");
/*
returns a specific order.
 */
async function getOrder(config) {
    const url = generateOrderUrl(config.accountId, config.orderId)
    const response = await client_1.default.get({
        url,
        params: config,
        responseType: connect_1.ResponseType.JSON,
        arrayFormat: connect_1.ArrayFormatType.COMMA,
    });
    return response.data;
}
exports.getOrder = getOrder;
/*
Place an order for a specific account.
Order throttle limits may apply.
Click here [https://developer.tdameritrade.com/content/place-order-samples]
for to see our Place Order Samples Guide for more information around order
throttles and examples of orders.
 */
async function placeOrder(config) {
    const url = generateOrderUrl(config.accountId);
    const order = processOrder(config.order);
    const response = await client_1.default.post({
        url,
        data: order,
        responseType: connect_1.ResponseType.JSON,
        arrayFormat: connect_1.ArrayFormatType.COMMA,
    });
    const orderId = extractOrderIdFromUrl(response.headers.location);
    return {
        orderId,
    };
}
exports.placeOrder = placeOrder;
/*
cancels a specific order.
 */
async function cancelOrder(config) {
  if (!config.accountId)
      throw new Error('accountId is required');
  const url = generateOrderUrl(config.accountId, config.orderId);
  const response = await client_1.default.del({
      url,
      responseType: connect_1.ResponseType.JSON,
      arrayFormat: connect_1.ArrayFormatType.COMMA,
  });
  return response.data;
}
exports.cancelOrder = cancelOrder;
/*
helper functions
 */
function processOrder(order) {
    if (!order.price)
        return order;
    const price = Number(order.price.toFixed(2)) * 100;
    order.price = (0, round_1.round)(price, 5) / 100;
    return order;
}
function generateOrderUrl(accountId, orderId) {
    return `${routes_config_1.ACCOUNTS}/${accountId}/orders${generateOrderIdUrl(orderId)}`;
}
function generateOrderIdUrl(orderId) {
    return orderId ? `/${orderId}` : '';
}
function extractOrderIdFromUrl(url) {
    const orderId = url.split('/').pop();
    if (!orderId || orderId.trim().length === 0)
        throw new Error('Unable to extract order Id');
    return orderId;
}
