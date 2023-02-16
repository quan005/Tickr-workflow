export interface OptionChainConfig {
    symbol: string;
    contractType?: ContractType;
    strikeCount?: number;
    includeQuotes?: boolean;
    strategy?: OptionStrategyType;
    interval?: number;
    strike?: number;
    range?: RangeType;
    fromDate?: string;
    toDate?: string;
    volatility?: number;
    underlyingPrice?: number;
    interestRate?: number;
    daysToExpiration?: number;
    expMonth?: Month;
    optionType?: OptionType;
}
export declare enum ContractType {
    CALL = "CALL",
    PUT = "PUT",
    ALL = "ALL"
}
export declare enum OptionStrategyType {
    SINGLE = "SINGLE",
    ANALYTICAL = "ANALYTICAL",
    COVERED = "COVERED",
    VERTICAL = "VERTICAL",
    CALENDER = "CALENDER",
    STRANGLE = "STRANGLE",
    STRADDLE = "STRADDLE",
    BUTTERFLY = "BUTTERFLY",
    CONDOR = "CONDOR",
    DIAGONAL = "DIAGONAL",
    COLLAR = "COLLAR",
    ROLL = "ROLL"
}
export declare enum RangeType {
    ITM = "ITM",
    NTM = "NTM",
    OTM = "OTM",
    SAK = "SAK",
    SBK = "SBK",
    SNK = "SNK",
    ALL = "ALL"
}
export declare enum Month {
    JAN = "JAN",
    FEB = "FEB",
    MAR = "MAR",
    APR = "APR",
    MAY = "MAY",
    JUN = "JUN",
    JUL = "JUL",
    AUG = "AUG",
    SEP = "SEP",
    OCT = "OCT",
    NOV = "NOV",
    DEC = "DEC"
}
export declare enum OptionType {
    S = "S",
    NS = "NS",
    ALL = "ALL"
}
export interface optionDeliverables {
    symbol: string;
    assetType: string;
    deliverableUnits: string;
    currencyType: string;
}
export interface OptionDetails {
    putCall: string;
    symbol: string;
    description: string;
    exchangeName: string;
    bid: number;
    ask: number;
    last: number;
    mark: number;
    bidSize: number;
    askSize: number;
    bidAskSize: string;
    lastSize: number;
    highPrice: number;
    lowPrice: number;
    openPrice: number;
    closePrice: number;
    totalVolume: number;
    tradeDate: string | null;
    tradeTimeInLong: number;
    quoteTimeInLong: number;
    netChange: number;
    volatility: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
    openInterest: number;
    timeValue: number;
    theoreticalOptionValue: number;
    theoreticalVolatility: number;
    optionDeliverablesList: optionDeliverables[] | null;
    strikePrice: number;
    expirationDate: number;
    daysToExpiration: number;
    expirationType: string;
    lastTradingDay: number;
    multiplier: number;
    settlementType: string;
    deliverableNote: string;
    isIndexOption: boolean | null;
    percentChange: number;
    markChange: number;
    markPercentChange: number;
    intrinsicValue: number;
    nonStandard: boolean;
    pennyPilot: boolean;
    inTheMoney: boolean;
    mini: boolean;
}
export interface OptionMap {
    [key: string]: OptionDetails[];
}
export interface ExpDateMap {
    [key: string]: OptionMap;
}
export interface OptionChainResponse {
    error?: string;
    symbol?: string;
    status?: string;
    underlying?: Underlying;
    strategy?: OptionStrategyType;
    interval?: number;
    isDelayed?: boolean;
    isIndex?: boolean;
    daysToExpiration?: number;
    interestRate?: number;
    underlyingPrice?: number;
    volatility?: number;
    callExpDateMap?: ExpDateMap;
    putExpDateMap?: ExpDateMap;
    monthlyStrategyList?: MonthlyStrategy[];
}
export interface Underlying {
    ask: number;
    askSize: number;
    bid: number;
    bidSize: number;
    change: number;
    close: number;
    delayed: boolean;
    description: string;
    exchangeName: 'IND' | 'ASE' | 'NYS' | 'NAS' | 'NAP' | 'PAC' | 'OPR' | 'BATS';
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    highPrice: number;
    last: number;
    lowPrice: number;
    mark: number;
    markChange: number;
    markPercentChange: number;
    openPrice: number;
    percentChange: number;
    quoteTime: number;
    symbol: string;
    totalVolume: number;
    tradeTime: number;
}
export interface MonthlyStrategy {
    month: string;
    year: number;
    day: number;
    daysToExp: number;
    secondaryMonth: string;
    secondaryYear: number;
    secondaryDay: number;
    secondaryDaysToExp: number;
    type: string;
    secondaryType: string;
    leap: boolean;
    secondaryLeap: boolean;
    optionStrategyList: OptionStrategy[];
}
export interface OptionStrategy {
    primaryLeg: Option;
    secondaryLeg: Option;
    strategyStrike: string;
    strategyBid: number;
    strategyAsk: number;
}
export interface Option {
    symbol: string;
    putCallInd: string;
    description: string;
    bid: number;
    ask: number;
    range: string;
    strikePrice: number;
    totalVolume: string;
}
//# sourceMappingURL=optionChain.d.ts.map