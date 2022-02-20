import { CredentialProvider, TdaCredential } from './credentialsProvider';
export declare class LocalCacheCredentialProvider extends CredentialProvider {
    private tdaCredential;
    constructor(tdaCredential: TdaCredential);
    getCredential(): Promise<TdaCredential>;
}
