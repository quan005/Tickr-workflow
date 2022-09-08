export interface UserPrinciples {
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