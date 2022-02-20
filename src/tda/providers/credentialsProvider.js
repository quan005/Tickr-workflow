"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialProvider = void 0;
class CredentialProvider {
    async getCredential() {
        return this.cachedCredential;
    }
}
exports.CredentialProvider = CredentialProvider;
