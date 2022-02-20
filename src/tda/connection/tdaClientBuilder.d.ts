import { TdaClientBuilderConfig, TdaClient } from "./tdaClient";
export declare class TdaClientBuilder {
  private config;
  constructor(config: TdaClientBuilderConfig);
  build(): TdaClient;
  private getAuthorizationInterceptor;
}