import { CredentialProvider } from '../providers/credentialsProvider';
import { AxiosError } from 'axios';
import { Interceptor } from './interceptor';
export declare class AuthorizationTokenInterceptor extends Interceptor {
    private readonly credentialProvider;
    constructor(credentialProvider: CredentialProvider);
    private getAccessToken;
}
