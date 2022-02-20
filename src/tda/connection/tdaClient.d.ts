import { Interceptor } from "./tdaInterceptor";
import { CredentialProvider } from "../providers/credentialsProvider";
import { AuthorizationTokenInterceptor } from "./authorizationTokenInterceptor";
import { SecuritiesAccount } from "../models/account";
import { OrdersConfig, PlaceOrdersResponse, CancelOrderConfig, GetOrderConfig, GetOrderResponse } from "../models/order";
import { OptionChainConfig, OptionChainResponse } from "../models/optionChain";

export interface TdaClientConfig {
  authorizationInterceptor: Interceptor;
}
export interface TdaClientBuilderConfig {
  access_token: string;
  refresh_token: string;
  client_id?: string;
  credentialProvider?: CredentialProvider;
  authorizationInterceptor?: AuthorizationTokenInterceptor;
}

export declare class TdaClient {
  private config;
  constructor(config: TdaClientConfig);
  static from(config: TdaClientBuilderConfig): TdaClient;
  getAccount(): Promise<SecuritiesAccount>;
  placeOrder(config: OrdersConfig): Promise<PlaceOrdersResponse>;
  cancelOrder(config: CancelOrderConfig): Promise<any>;
  getOrder(config: GetOrderConfig): Promise<GetOrderResponse>;
  getOptionChain(config: OptionChainConfig): Promise<OptionChainResponse>;
}