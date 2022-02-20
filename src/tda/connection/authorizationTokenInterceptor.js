"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationTokenInterceptor = void 0;
const interceptor_1 = require("./tdaInterceptor");

class AuthorizationTokenInterceptor extends interceptor_1.Interceptor {
    constructor(credentialProvider) {
        super();
        this.credentialProvider = credentialProvider;
    }
    async getAccessToken() {
        const { access_token } = await this.credentialProvider.getCredential();
        return access_token;
    }
}
exports.AuthorizationTokenInterceptor = AuthorizationTokenInterceptor;