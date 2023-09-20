export interface PrinciplesAndParams {
  userPrinciples: UserPrinciples | null,
  params: string | null,
  loginRequest: WSRequestConfig | null,
  marketRequest: WSRequestConfig | null,
  chartRequest: WSRequestConfig | null,
  bookRequest: WSRequestConfig | null,
  timeSalesRequest: WSRequestConfig | null,
}

export interface WSRequestConfig {
  requests: WSConfig[]
}

export interface WSConfig {
  service?: string,
  command?: string,
  requestid?: string,
  account?: string,
  source?: string,
  parameters?: {
    credential?: string,
    token?: string,
    version?: string,
    qoslevel?: string,
    keys?: string,
    fields?: string,
  },
}

export interface UserPrinciples {
  error?: string,
  userId?: string,
  userCdDomainId?: string,
  primaryAccountId?: string,
  lastLoginTime?: string,
  tokenExpirationTime?: string,
  loginTime?: string,
  accessLevel?: string,
  stalePassword?: boolean,
  streamerInfo?: {
    streamerSocketUrl: string,
    accessLevel: string,
    streamerBinaryUrl: string,
    appId: string,
    acl: string,
    userGroup: string,
    tokenTimestamp: string,
    token: string,
  },
  professionalStatus?: string,
  quotes?: {
    isForexDelayed: boolean,
    isOpraDelayed: boolean,
    isAmexDelayed: boolean,
    isNasdaqDelayed: boolean,
    isIceDelayed: boolean,
    isCmeDelayed: boolean,
    isNyseDelayed: boolean,
  },
  streamerSubscriptionKeys?: {
    keys: [
      { key: string }
    ],
  },
  exchangeAgreements?: {
    OPRA_EXCHANGE_AGREEMENT: string,
    NASDAQ_EXCHANGE_AGREEMENT: string,
    NYSE_EXCHANGE_AGREEMENT: string,
  },
  accounts?: [
    {
      accountId: string,
      displayName: string,
      accountCdDomainId: string,
      company: string,
      segment: string,
      acl: string,
      authorizations: {
        levelTwoQuotes: { boolean: boolean },
        optionTradingLevel: { string: string },
        streamerAccess: { boolean: boolean },
        marginTrading: { boolean: boolean },
        streamingNews: { boolean: boolean },
        scottradeAccount: { boolean: boolean },
        advancedMargin: { boolean: boolean },
        apex: { boolean: boolean },
        stockTrading: { boolean: boolean }
      },
    }
  ]
}