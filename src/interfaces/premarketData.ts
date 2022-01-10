export interface PremarketData {
  token: {
    access_token: string,
    refresh_token: string,
    scope: string,
    expires_in: number
    refresh_token_expires_in: number
    token_type: string
    access_token_expires_at: number
    refresh_token_expires_at: number
    logged_in: boolean
    access_token_expires_at_date: string
    refresh_token_expires_at_date: string
  },
  symbol: string,
  score: number,
  sentiment: string,
  keyLevels: number[],
  supportResistance: {support: number, resistance: number},
  demandZones: [
    object[]
  ],
  supplyZones:[
    object[]
  ],
  userPrinciples: {
    userId: string,
    userCdDomainId: string,
    primaryAccountId: string,
    lastLoginTime: string,
    tokenExpirationTime: string,
    loginTime: string,
    accessLevel: string,
    stalePassword: boolean,
    streamerInfo: {
      streamerSocketUrl: string,
      accessLevel: string,
      streamerBinaryUrl: string,
      appId: string,
      acl: string,
      userGroup: string,
      tokenTimestamp: string,
      token: string
    },
    professionalStatus: string,
    quotes: {
      isForexDelayed: boolean,
      isOpraDelayed: boolean,
      isAmexDelayed: boolean,
      isNasdaqDelayed: boolean,
      isIceDelayed: boolean,
      isCmeDelayed: boolean,
      isNyseDelayed: boolean
    },
    streamerSubscriptionKeys: {
      keys: [
        {key: string}
      ]
    },
    exchangeAgreements: {
      OPRA_EXCHANGE_AGREEMENT: string,
      NASDAQ_EXCHANGE_AGREEMENT: string,
      NYSE_EXCHANGE_AGREEMENT: string
    },
    accounts: [
      {
        accountId: string,
        displayName: string,
        accountCdDomainId: string,
        company: string,
        segment: string,
        acl: string,
        authorizations: {
          levelTwoQuotes: {boolean: boolean},
          optionTradingLevel: {string: string},
          streamerAccess: {boolean: boolean},
          marginTrading: {boolean: boolean},
          streamingNews: {boolean: boolean},
          scottradeAccount: {boolean: boolean},
          advancedMargin: {boolean: boolean},
          apex: {boolean: boolean},
          stockTrading: {boolean: boolean}
        }
      }
    ]
  }
}