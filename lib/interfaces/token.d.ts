export interface Token {
    access_token: string;
    refresh_token: string;
    scope: string;
    expires_in: number;
    refresh_token_expires_in: number;
    token_type: string;
}
export interface TokenJSON {
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    expires_in?: number;
    refresh_token_expires_in?: number;
    token_type?: string;
    access_token_expires_at?: number;
    refresh_token_expires_at?: number;
    logged_in?: boolean;
    access_token_expires_at_date?: string;
    refresh_token_expires_at_date?: string;
}
//# sourceMappingURL=token.d.ts.map