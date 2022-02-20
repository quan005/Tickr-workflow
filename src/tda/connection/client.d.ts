import { Request } from '../models/connect';
import { Interceptor } from './interceptor';
declare class Client {
    private readonly client;
    private static instance;
    constructor();
    static getInstance(): Client;
    addInterceptor(interceptor: Interceptor): this;
    get(request: Request): Promise<import("axios").AxiosResponse<any, any>>;
    post(request: Request): Promise<import("axios").AxiosResponse<any, any>>;
    del(request: Request): Promise<import("axios").AxiosResponse<any, any>>;
    connect(config: any): Promise<import("axios").AxiosResponse<any, any>>;
    private static handleResponseType;
}
declare const _default: Client;
export default _default;