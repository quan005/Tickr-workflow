"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const connect_1 = require("../models/connect");
const qs = require("qs");
class Client {
    constructor() {
        this.client = axios_1.default.create();
        if (Client.instance) {
            return Client.instance;
        }
        else {
            Client.instance = this;
            return this;
        }
    }
    static getInstance() {
        if (!Client.instance)
            return new Client();
        return Client.instance;
    }
    addInterceptor(interceptor) {
        this.client.interceptors.request.use(interceptor.onSuccessRequestHandler.bind(interceptor), interceptor.onErrorRequestHandler.bind(interceptor));
        this.client.interceptors.response.use(interceptor.onSuccessResponseHandler.bind(interceptor), interceptor.onErrorResponseHandler.bind(interceptor));
        return this;
    }
    async get(request) {
        const config = {
            ...request,
            method: connect_1.RestMethod.GET,
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: request.arrayFormat }),
        };
        return await this.connect(config);
    }
    async post(request) {
        const config = {
            ...request,
            method: connect_1.RestMethod.POST,
        };
        Client.handleResponseType(config);
        return await this.connect(config);
    }
    async del(request) {
        const config = {
            ...request,
            method: connect_1.RestMethod.DELETE,
        };
        Client.handleResponseType(config);
        return await this.connect(config);
    }
    async connect(config) {
        config = config || {};
        try {
            return await this.client(config);
        }
        catch (error) {
            let message = `Failed to ${config.method} ${config.url}.\n${error}.`;
            if (error && error.response && error.response.data)
                message += `\nResponse from server ${JSON.stringify(error.response.data, null, '\t')}`;
            message += `\nRequest config: ${JSON.stringify(config, null, '\t')}`;
            // @ts-ignore
            throw new Error(message, { cause: error });
        }
    }
    static handleResponseType(config) {
        const { responseType: requestType } = config;
        switch (requestType) {
            case connect_1.ResponseType.URL_FORM_ENCODED:
                const header = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                config.headers = config.headers || {};
                config.headers = {
                    ...config.headers,
                    ...header,
                };
                config.data = qs.stringify(config.data);
        }
    }
}
exports.default = Client.getInstance();
