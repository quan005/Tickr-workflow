"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalCacheCredentialProvider = void 0;
const credentialsProvider_1 = require("./credentialsProvider");
class LocalCacheCredentialProvider extends credentialsProvider_1.CredentialProvider {
    constructor(tdaCredential) {
        super();
        this.tdaCredential = tdaCredential;
    }
    async getCredential() {
        return this.tdaCredential;
    }
}
exports.LocalCacheCredentialProvider = LocalCacheCredentialProvider;
