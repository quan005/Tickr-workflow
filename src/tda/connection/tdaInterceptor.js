"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interceptor = void 0;
class Interceptor {
    async onSuccessRequestHandler(config) {
        return config;
    }
    async onErrorRequestHandler(error) {
        return error;
    }
    async onSuccessResponseHandler(response) {
        return response;
    }
    async onErrorResponseHandler(error) {
        return error;
    }
}
exports.Interceptor = Interceptor;