"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TdaClientBuilder = void 0;
const authorizationTokenInterceptor_1 = require("./authorizationTokenInterceptor");
const localCacheCrendentialProvider_1 = require("../providers/localCacheCrendentialProvider");
const tdaClient_1 = require("./tdaClient");
class TdaClientBuilder {
    constructor(config) {
        this.config = config;
    }
    build() {
        const authorizationInterceptor = this.getAuthorizationInterceptor();
        return new tdaClient_1.TdaClient({
            authorizationInterceptor,
        });
    }
    getAuthorizationInterceptor() {
        if (this.config.authorizationInterceptor)
            return this.config.authorizationInterceptor;
        let provider;
        const { access_token, refresh_token } = this.config;
        provider = new localCacheCrendentialProvider_1.LocalCacheCredentialProvider({
            access_token,
            refresh_token
        });
        return new authorizationTokenInterceptor_1.AuthorizationTokenInterceptor(provider);
    }
}
exports.TdaClientBuilder = TdaClientBuilder;
