export interface TdaCredential {
  access_token: string;
  refresh_token: string;
  scope?: string;
  expires_in: number;
  refresh_token_expires_in: number;
  token_type?: string;
  client_id: string;
  redirect_uri?: string;
}
export declare abstract class CredentialProvider {
  private cachedCredential?;
  getCredential(): Promise<TdaCredential>;
}
