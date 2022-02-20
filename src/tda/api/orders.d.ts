/// <reference types="jest" />
import { CancelOrderConfig, GetOrderResponse, GetOrderConfig, OrdersConfig, PlaceOrdersResponse } from '../models/order';
import Any = jasmine.Any;
export declare function getOrder(config?: GetOrderConfig): Promise<GetOrderResponse>;
export declare function placeOrder(config: OrdersConfig): Promise<PlaceOrdersResponse>;
export declare function cancelOrder(config: CancelOrderConfig): Promise<Any>;
