import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
export declare abstract class Interceptor {
    onSuccessRequestHandler(config: AxiosRequestConfig): Promise<any>;
    onErrorRequestHandler(error: AxiosError): Promise<any>;
    onSuccessResponseHandler(response: AxiosResponse): Promise<any>;
    onErrorResponseHandler(error: AxiosError): Promise<any>;
}